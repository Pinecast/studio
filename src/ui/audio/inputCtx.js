import {Buffer} from 'external:buffer';
import {EventEmitter} from 'external:events';
import fs from 'external:fs';
import {ipcRenderer} from 'electron';
import path from 'external:path';

import {getAudioStream} from './getUserMedia';


const BUFFER_SIZE = 2048;
const tempDir = ipcRenderer.sendSync('electron-app-getPath', 'temp');
console.log('Got temp dir ' + tempDir);


let ctx = null;
export function getContext() {
    if (ctx) {
        return ctx;
    }
    ctx = new AudioContext();
    return ctx;
};

export function getSampleRate() {
    return getContext().sampleRate;
};

function getInputNode(deviceId = null) {
    return new Promise((resolve, reject) => {
        const ctx = getContext();
        getAudioStream(deviceId).then(stream => {
            resolve(ctx.createMediaStreamSource(stream));
        }, reject);
    });
};


let buffId = 0;

export class Recorder {
    constructor() {
        this.audioSourceStream = null;
        this.recorder = null;
        this.inputNode = null;
        this.analyzer = null;

        this.setupInputNode();

        this.streamLength = 0;
        this.channelCount = 0;

        this.deviceId = null;

        this.buffId = `${Date.now()}_${buffId++}`;
        this.streamPaths = null;
        this.streams = null;

        this.bufferSize = BUFFER_SIZE;
        this.sampleRate = getContext().sampleRate;

        this.startedRecording = null;
        this.stoppedRecording = null;
        this.isStopped = true;

        this.events = new EventEmitter();
    }

    setDeviceId(deviceId) {
        this.deviceId = deviceId;
        this.setupInputNode();
    }

    setupInputNode() {
        if (this.inputNode) {
            if (this.analyzer) {
                this.analyzer.disconnect();
                this.analyzer = null;
            }
            this.inputNode.disconnect();
            this.inputNode = null;
        }

        const ctx = getContext();
        return new Promise((resolve, reject) => {
            getAudioStream(this.deviceId).then(stream => {
                this.audioSourceStream = stream;
                this.inputNode = ctx.createMediaStreamSource(stream);
                resolve(this.inputNode);
            }, reject);
        });
    }

    getAnalyzer() {
        if (this.analyzer) {
            return Promise.resolve(this.analyzer);
        }
        if (!this.inputNode) {
            return this.setupInputNode().then(() => this.getAnalyzer());
        }
        const analyzer = getContext().createAnalyser();
        analyzer.fftSize = 512;
        this.inputNode.connect(analyzer);
        this.analyzer = analyzer;
        return Promise.resolve(analyzer);
    }

    startListening(inputChannels = 1, outputChannels = inputChannels, bufferSize = BUFFER_SIZE) {
        if (this.recorder) {
            throw new Error('Already listening');
        }

        if (!this.inputNode) {
            this.setupInputNode().then(() => this.startListening(inputChannels, outputChannels));
            return;
        }

        this.channelCount = outputChannels;
        this.isStopped = false;

        this.recorder = getContext().createScriptProcessor(bufferSize, inputChannels, outputChannels);
        this.recorder.onaudioprocess = ({inputBuffer}) => {
            if (this.isStopped) {
                return;
            }
            const samples = new Array(outputChannels);
            for (let i = 0; i < outputChannels; i++) {
                samples[i] = inputBuffer.getChannelData(i);
            }
            this.events.emit('samples', this.streamLength, ...samples);
            this.streamLength += bufferSize / 2; // Divide by two because float32 -> int16 cuts size in half
        };

        this.inputNode.connect(this.recorder);
        this.recorder.connect(getContext().destination);
    }

    start(channelCount = 1) {
        if (this.recorder) {
            throw new Error('Already recording');
        }

        this.bufferDir = path.join(
            tempDir,
            `ps_audiobuffer_${this.buffId}`
        );
        fs.mkdirSync(this.bufferDir);

        console.log(`Writing audio data to ${this.bufferDir}`);

        this.streamPaths = [];
        for (let i = 0; i < channelCount; i++) {
            const streamPath = path.join(this.bufferDir, `channel${i}.pcm`);
            this.streamPaths.push(streamPath);
        }
        this.streams = this.getWriteStreams();

        this.startListening(channelCount);
        this.events.on('samples', (_, ...samples) => {
            samples.forEach((buffer, i) => {
                const intChunk = new Int16Array(buffer.length);
                for (let i = 0; i < buffer.length; i++) {
                    const val = +Math.max(-1.0, +Math.min(1.0, +buffer[i]));
                    intChunk[i] = val < 0 ? val * 32768 : val * 32767;
                }
                this.streams[i].write(Buffer.from(intChunk.buffer));
            });
        });

        this.startedRecording = Date.now();
        this.isStopped = false;
        this.events.emit('start');
    }
    stop() {
        if (this.isStopped) {
            return;
        }

        for (let track of this.audioSourceStream.getTracks()) {
            this.audioSourceStream.removeTrack(track);
        }

        this.inputNode.disconnect();
        this.recorder.disconnect();
        this.inputNode = null;
        this.recorder = null;
        this.stoppedRecording = Date.now();

        this.events.emit('stopping');
        this.isStopped = true;

        if (!this.streams) {
            this.events.emit('stopped');
            return Promise.resolve([]);
        }

        const output = Promise.all(
            this.streams.map(s => new Promise(res => s.once('finish', res)))
        );
        this.streams.forEach(s => s.end());
        this.streams = null;
        output.then(() => this.events.emit('stopped'));
        return output;
    }

    getWriteStreams() {
        return this.streamPaths.map(p => fs.createWriteStream(p));
    }

    getReadStreams() {
        return this.streamPaths.map(p => fs.createReadStream(p));
    }
};
