import {Buffer} from 'external:buffer';

import waveHeader from 'external:waveheader';

import BaseEncoder from './BaseEncoder';


const BYTES_PER_SAMPLE = 2;

export default class WaveEncoder extends BaseEncoder {
    encode(sampleCount, streams, sampleRate, outputStream) {
        const channelCount = streams.length;
        if (channelCount !== 1) {
            throw new Error('not implemented: encoding multi-channel WAV files');
        }

        outputStream.write(
            waveHeader(
                sampleCount * channelCount * BYTES_PER_SAMPLE * 2,
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
            let progress = 0;
            const inputSize = sampleCount * BYTES_PER_SAMPLE;
            stream.pipe(outputStream);
            stream.on('data', chunk => {
                progress += chunk.length;
                this.sendProgress(progress / inputSize);
            });
            return new Promise((resolve, reject) => {
                stream.once('end', () => {
                    outputStream.end(() => resolve());
                });
                stream.once('error', e => reject(e));
            });
        }
    }
};
