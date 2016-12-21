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

let input = null;
let inputDeviceId = null;
export function getInputNode(deviceId = null) {
    if (input) {
        if (inputDeviceId !== deviceId) {
            input.then(n => n.disconnect);
            input = null;
            inputDeviceId = null;
        } else {
            return input;
        }
    }
    inputDeviceId = deviceId;
    return input = new Promise((resolve, reject) => {
        const ctx = getContext();
        getAudioStream(deviceId).then(stream => {
            resolve(ctx.createMediaStreamSource(stream));
        }, reject);
    });
};


let buffId = 0;

export class Recorder {
    constructor() {
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

        this.startedRecording = -1;
        this.isRecording = false;

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
        return getInputNode(this.deviceId).then(node => {
            this.inputNode = node;
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

    start(channelCount = 1) {
        if (this.recorder) {
            throw new Error('Already recording');
        }
        if (!this.inputNode) {
            this.setupInputNode().then(() => this.start(channelCount));
            return;
        }

        this.channelCount = channelCount;
        this.bufferDir = path.join(
            tempDir,
            `ps_audiobuffer_${this.buffId}`
        );
        fs.mkdirSync(this.bufferDir);

        this.streamPaths = [];
        for (let i = 0; i < channelCount; i++) {
            const streamPath = path.join(this.bufferDir, `channel${i}.pcm`);
            this.streamPaths.push(streamPath);
        }
        this.streams = this.streamPaths.map(p => fs.createWriteStream(p));

        this.recorder = getContext().createScriptProcessor(BUFFER_SIZE, this.channelCount, this.channelCount);
        this.recorder.onaudioprocess = e => {
            if (!this.isRecording) {
                return;
            }
            const samples = [];
            for (let i = 0; i < this.channelCount; i++) {
                samples[i] = Buffer.from(e.inputBuffer.getChannelData(i));
            }

            samples.forEach((s, i) => this.streams[i].write(s));
            this.events.emit('samples', this.streamLength, ...samples);
            this.streamLength += BUFFER_SIZE;
        };

        this.inputNode.connect(this.recorder);
        this.recorder.connect(getContext().destination);

        this.startedRecording = Date.now();
        this.isRecording = true;
        this.events.emit('start');
    }
    stop() {
        this.inputNode.disconnect();
        this.recorder.disconnect();
        this.inputNode = null;
        this.recorder = null;
        this.isRecording = false;

        const output = Promise.all(
            this.streams.map(
                stream => new Promise(res => stream.once('finish', res))
            )
        );
        this.streams.forEach(s => s.end());
        this.streams = null;
        this.events.emit('stopping');
        output.then(() => this.events.emit('stopped'));
        return output;
    }
};
