import React from 'react';

import {Recorder} from './audio/inputCtx';


export default class PrototypeRecorder extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            blob: null,
            recording: false,
        };

        this.recorder = new Recorder();
        // this.audioCtx = new AudioContext();
        // this.input = null;
        // this.recorder = null;

        // this.channel = [];
        // this.recordingLength = 0;

        // getAudioStream().then(stream => {
        //     this.input = this.audioCtx.createMediaStreamSource(stream);
        // });
    }

    startRecording() {
        this.recorder.start();

        // this.recordingLength = 0;
        // this.channel = [];

        // this.recorder = this.audioCtx.createScriptProcessor(BUFFER_SIZE, 2, 2);
        // this.recorder.onaudioprocess = e => {
        //     const leftChannel = e.inputBuffer.getChannelData(0);
        //     this.channel.push(new Float32Array(leftChannel));
        //     this.recordingLength += BUFFER_SIZE;
        // };
        // this.input.connect(this.recorder);
        // this.recorder.connect(this.audioCtx.destination);
        this.setState({recording: true, blob: null});
    }
    stopRecording() {
        this.recorder.disconnect();
        this.input.disconnect();
        this.recorder = null;

        const merged = new Float32Array(this.recordingLength);
        let offset = 0;
        for (let i of this.channel) {
            merged.set(i, offset);
            offset += i.length;
        }

        const buffer = new ArrayBuffer(44 + merged.length * 2);
        const view = new DataView(buffer);

        writeBytes(view, 0, 'RIFF');
        view.setUint32(4, 44 + merged.length * 2, true);
        writeBytes(view, 8, 'WAVE');

        writeBytes(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);

        view.setUint16(22, 1, true);
        view.setUint32(24, getSampleRate(), true);
        view.setUint32(28, getSampleRate() * 2, true);
        view.setUint16(32, 4, true);
        view.setUint16(34, 16, true);

        writeBytes(view, 36, 'data');
        view.setUint32(40, merged.length * 2, true);

        const volume = 1;
        for (let j = 0; j < merged.length; j++) {
            view.setInt16(44 + j * 2, merged[j] * (0x7FFF * volume), true);
        }

        const blob = new Blob([view], {type: 'audio/wav'});

        this.setState({recording: false, blob});
    }

    render() {
        const {
            state: {blob, recording},
        } = this;
        return <div>
            {recording ?
                <button onClick={() => this.stopRecording()}>Stop</button> :
                <button onClick={() => this.startRecording()}>Record</button>}
            {blob &&
                <audio src={URL.createObjectURL(blob)} autoPlay />}
            {blob &&
                <a href={URL.createObjectURL(blob)} download>Download</a>}
        </div>;
    }
};


function writeBytes(view, offset, str) {
    for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
    }
}
