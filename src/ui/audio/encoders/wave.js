import {Buffer} from 'external:buffer';
import fs from 'external:fs';

import waveHeader from 'external:waveheader';


const BYTES_PER_SAMPLE = 2;

export default function encode(sampleCount, streams, sampleRate, outputStream) {
    const channelCount = streams.length;
    if (channelCount !== 1) {
        throw new Error('not implemented: encoding multi-channel WAV files');
    }

    // TODO: check that all of the channels are the same byte length

    const mergedLength = sampleCount * channelCount * BYTES_PER_SAMPLE;

    outputStream.write(
        waveHeader(
            mergedLength,
            {
                bitDepth: BYTES_PER_SAMPLE * 8,
                channels: channelCount,
                sampleRate,
            }
        )
    );

    // const header = new ArrayBuffer(44);
    // const headerView = new DataView(header);

    // writeBytes(headerView, 0, 'RIFF');
    // headerView.setUint32(4, 44 + mergedLength - 8, true);
    // writeBytes(headerView, 8, 'WAVE');

    // writeBytes(headerView, 12, 'fmt ');
    // headerView.setUint32(16, 16, true);
    // headerView.setUint16(20, 1, true);

    // headerView.setUint16(22, channelCount, true);
    // headerView.setUint32(24, sampleRate, true);
    // headerView.setUint32(28, sampleRate * channelCount * BYTES_PER_SAMPLE, true);
    // headerView.setUint16(32, channelCount * BYTES_PER_SAMPLE, true);
    // headerView.setUint16(34, BYTES_PER_SAMPLE * 8, true);

    // writeBytes(headerView, 36, 'data');
    // headerView.setUint32(40, mergedLength, true);

    // outputStream.write(Buffer.from(header));

    if (streams.length !== 1) {
        throw new Error('not implemented: encoding multi-channel WAV data');
    } else if (streams.length === 1) {
        const [stream] = streams;
        stream.on('data', chunk => {
            const pcmChunk = new Float32Array(chunk.buffer);
            const wavChunk = new Int16Array(pcmChunk.length);
            const chunkSize = pcmChunk.length;
            for (let i = 0; i < chunkSize; i++) {
                const val = Math.max(-1.0, Math.min(1.0, pcmChunk[i]));
                wavChunk[i] = val < 0 ? val * 32768 : val * 32767;
            }
            outputStream.write(Buffer.from(wavChunk.buffer));
        });
        return new Promise((resolve, reject) => {
            stream.once('end', () => resolve());
            stream.once('error', e => reject(e));
        });
    }

};


function writeBytes(view, offset, str) {
    for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
    }
}
