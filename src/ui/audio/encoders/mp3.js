import {Buffer} from 'external:buffer';
import fs from 'external:fs';

import {Mp3Encoder} from 'external:lamejs';


const KBPS = 192;


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
            const mp3Chunk = encoder.encodeBuffer(new Int16Array(chunk.buffer));
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
