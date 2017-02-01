import {Buffer} from 'external:buffer';

import waveHeader from 'external:waveheader';


const BYTES_PER_SAMPLE = 2;

export default function encode(sampleCount, streams, sampleRate, outputStream) {
    const channelCount = streams.length;
    if (channelCount !== 1) {
        throw new Error('not implemented: encoding multi-channel WAV files');
    }

    outputStream.write(
        waveHeader(
            sampleCount * channelCount * BYTES_PER_SAMPLE,
            {
                bitDepth: BYTES_PER_SAMPLE * 8,
                channels: channelCount,
                sampleRate,
            }
        )
    );

    if (streams.length !== 1) {
        throw new Error('not implemented: encoding multi-channel WAV data');
    } else if (streams.length === 1) {
        const [stream] = streams;
        stream.on('data', chunk => {
            outputStream.write(Buffer.from(chunk.buffer));
        });
        return new Promise((resolve, reject) => {
            stream.once('end', () => {
                outputStream.end(() => resolve());
            });
            stream.once('error', e => reject(e));
        });
    }

};
