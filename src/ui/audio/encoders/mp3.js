import {Buffer} from 'external:buffer';
import fs from 'external:fs';

import {Mp3Encoder as LAMEMp3Encoder} from 'external:lamejs';

import BaseEncoder from './BaseEncoder';


const KBPS = 192;


export default class Mp3Encoder extends BaseEncoder {
    encode(sampleCount, streams, sampleRate, outputStream) {
        const channelCount = streams.length;

        if (streams.length !== 1) {
            throw new Error('not implemented: encoding multi-channel mp3 data');
        } else if (streams.length === 1) {
            const encoder = new LAMEMp3Encoder(1, sampleRate, KBPS);
            const [stream] = streams;
            let progress = 0;
            const inputSize = sampleCount * 2;
            stream.on('data', chunk => {
                if (chunk.length % 4 !== 0) {
                    console.warn(`Got unaligned chunk of size ${chunk.length}`);
                }
                const mp3Chunk = encoder.encodeBuffer(new Int16Array(chunk.buffer));
                outputStream.write(Buffer.from(mp3Chunk));
                progress += chunk.length;
                this.sendProgress(progress / inputSize);
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
    }

}
