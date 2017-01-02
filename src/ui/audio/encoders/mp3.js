import {Buffer} from 'external:buffer';
import fs from 'external:fs';

import {Mp3Encoder} from 'external:lamejs';


const KBPS = 128;


export default function encode(sampleCount, streams, sampleRate, outputStream) {
    const channelCount = streams.length;

    if (streams.length !== 1) {
        throw new Error('not implemented: encoding multi-channel mp3 data');
    } else if (streams.length === 1) {
        const encoder = new Mp3Encoder(1, sampleRate, KBPS);
        const [stream] = streams;
        stream.on('data', chunk => {
            if (chunk.length % 4 !== 0) {
                console.warn(`Got unaligned chunk of size ${chunk.length}`);
            }
            const pcmChunk = new Float32Array(chunk.buffer);
            const wavChunk = new Int16Array(pcmChunk.length);
            const chunkSize = pcmChunk.length;
            for (let i = 0; i < chunkSize; i++) {
                const val = Math.max(-1.0, Math.min(1.0, pcmChunk[i]));
                wavChunk[i] = val < 0 ? val * 32768 : val * 32767;
            }
            const mp3Chunk = encoder.encodeBuffer(wavChunk);

            outputStream.write(Buffer.from(mp3Chunk));
        });
        return new Promise((resolve, reject) => {
            stream.once('end', () => {
                const lastChunk = encoder.flush();
                if (lastChunk.length) {
                    outputStream.end(Buffer.from(lastChunk), () => resolve());
                } else {
                    outputStream.end(() => resolve());
                }
            });
            stream.once('error', e => reject(e));
        });
    }

};
