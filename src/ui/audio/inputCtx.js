import {ipcRenderer} from 'electron';

import {BUFFER_SIZE} from '../../shared/constants';
import {getAudioStream} from './getUserMedia';


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


export class Recorder {
    constructor() {
        this.recorder = null;
        this.inputNode = null;
        this.analyzer = null;

        this.setupInputNode();

        this.streams = [];
        this.streamLength = 0;

        this.deviceId = null;
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
        for (let i = 0; i < channelCount; i++) {
            this.streams.push([]);
        }

        this.recorder = getContext().createScriptProcessor(BUFFER_SIZE, this.channelCount, this.channelCount);
        this.recorder.onaudioprocess = e => {
            for (let i = 0; i < this.channelCount; i++) {
                this.streams[i].push(
                    new Float32Array(e.inputBuffer.getChannelData(i))
                );
            }
            this.streamLength += BUFFER_SIZE;
        };
    }
    stop() {
        this.inputNode.disconnect();
        this.recorder.disconnect();
        this.inputNode = null;
        this.recorder = null;

        return new Promise((resolve, reject) => {
            //
        });
    }
};
