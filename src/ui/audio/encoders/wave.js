import {Buffer} from 'external:buffer';
import fs from 'external:fs';


const BYTES_PER_SAMPLE = 2;

export default function encode(sampleCount, channelPaths, sampleRate, outputPath) {
    const channelCount = channelPaths.length;

    const out = fs.createWriteStream(outputPath);
    // TODO: check that all of the channels are the same byte length

    const mergedLength = sampleCount * channelCount * BYTES_PER_SAMPLE;
    const header = new ArrayBuffer(44);
    const headerView = new DataView(header);

    writeBytes(headerView, 0, 'RIFF');
    headerView.setUint32(4, 44 + mergedLength, true);
    writeBytes(headerView, 8, 'WAVE');

    writeBytes(headerView, 12, 'fmt ');
    headerView.setUint32(16, 16, true);
    headerView.setUint16(20, 1, true);

    headerView.setUint16(22, channelCount, true);
    headerView.setUint32(24, sampleRate, true);
    headerView.setUint32(28, sampleRate * channelCount * BYTES_PER_SAMPLE, true);
    headerView.setUint16(32, channelCount * BYTES_PER_SAMPLE, true);
    headerView.setUint16(34, BYTES_PER_SAMPLE * 8, true);

    writeBytes(headerView, 36, 'data');
    headerView.setUint32(40, mergedLength, true);

    out.write(Buffer.from(header));
    header = headerView = null;

};


function writeBytes(view, offset, str) {
    for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
    }
}
