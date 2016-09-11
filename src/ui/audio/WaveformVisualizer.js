import fs from 'external:fs';


const VIS_SAMPLES_PER_SECOND = 100;
// We multiply these by two because we have two floats per resample
const ONE_MINUTE_OF_SAMPLES = VIS_SAMPLES_PER_SECOND * 60 * 2;
const HALF_MINUTE_OF_SAMPLES = VIS_SAMPLES_PER_SECOND * 30 * 2;

export class WaveformVisualizer {
    constructor(sampleRate, audioLength = 0, immutable = false) {
        this.audioLength = audioLength;
        this.sampleRate = sampleRate;
        this.samplesPerResample = sampleRate / VIS_SAMPLES_PER_SECOND;
        this.data = new Float32Array(
            (immutable ? calculateResampledSize : calculateOptimisticResampledSize)(audioLength)
        );
        this.resampleCap = 0;
    }

    gotSampleBlob(blob, streamStartIndex) {
        const sampleSize = blob.length;
        const updatedResampledSize = calculateResampledSize(this.audioLength + sampleSize);
        if (updatedResampledSize > this.data.length) {
            const oldData = this.data;
            this.data = new Float32Array(updatedResampledSize);
            this.data.set(oldData);
        }

        // TODO: This could probably be improved substantially with SIMD.js

        const rsEndIndex = calculateResampledSize(streamStartIndex + sampleSize, this.sampleRate, false);
        for (
            let rsIndex = calculateResampledSize(streamStartIndex, this.sampleRate, false);
            rsIndex < rsEndIndex;
            rsIndex += 2
        ) {
            let posCum = 0;
            let posCnt = 0;
            let negCum = 0;
            let negCnt = 0;
            let min = Infinity;
            let max = -1 * Infinity;
            for (let i = 0) {
                const sample = blob[i];
                if (sample > 0) {
                    posCum += sample;
                    posCnt++;
                    if (sample > max) { // TODO: check that this is okay with else; just an optimization
                        max = sample;
                    }
                } else {
                    negCum += sample;
                    negCnt++;
                    if (sample < min) {
                        min = sample;
                    }
                }
            }

            this.data[rsIndex] = posCum / posCnt;
            this.data[rsIndex + 1] = negCum / negCnt;
        }
        this.resampleCap = rsEndIndex;
        this.audioLength += sampleSize;
    }

    drawCanvas(ctx) { // TODO: add start and end time
        const height = ctx.canvas.height;
        const width = ctx.canvas.width;
        // ctx.clearRect(0, 0, width, ctx.canvas.height);
        // ctx.strokeStyle = '#fff';

        ctx.save();
        ctx.translate(0, height / 2);
        ctx.scale(1, 200); // TODO: pick a number
        const rsCap = this.resampleCap / 2;
        const rsCapOverWidth = rsCap / width | 0;
        for (let i = 0; i < width; i++) {
            const rsIndex = i * rsCapOverWidth * 2;
            ctx.beginPath();
            ctx.moveTo(i, this.data[rsIndex]);
            ctx.lineTo(i, this.data[rsIndex + 1]);
            ctx.stroke();
        }
        ctx.restore();
    }
};

export function createWaveformFromPCMFile(filePath, sampleRate) {
    const size = fs.statSync(filePath).size;

    const rs = fs.createReadStream(filePath);
    const wv = new WaveformVisualizer(sampleRate, size, true);
    let i = 0;
    rs.on('data', blob => {
        wv.gotSampleBlob(blob, i);
        i += blob.length;
    });
    return wv;
};
export function createWaveformFromRecorder(recorder, channelIdx) {
    const wv = new WaveformVisualizer(recorder.sampleRate);
    recorder.events.on('samples', (streamLength, ...samples) => {
        wv.gotSampleBlob(samples[channelIdx], streamLength);
    });
    return wv;
};

function calculateResampledSize(audioLength, sampleRate, preallocate = true) {
    if (!audioLength && preallocate) {
        return ONE_MINUTE_OF_SAMPLES; // TODO: Is a minute too low?
    }
    // * 2 because we have two floats per resample
    return audioLength / sampleRate * VIS_SAMPLES_PER_SECOND * 2;
}

function calculateOptimisticResampledSize(audioLength, sampleRate) {
    const rss = calculateResampledSize(audioLength, sampleRate);
    const overflow = rss % ONE_MINUTE_OF_SAMPLES;
    if (overflow > HALF_MINUTE_OF_SAMPLES) {
        rss += overflow;
    } else {
        rss += ONE_MINUTE_OF_SAMPLES;
    }
    return rss;
}
