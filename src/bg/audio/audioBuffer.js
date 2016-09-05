const {app, ipcMain} = require('electron');
const fs = require('fs');
const path = require('path');

const {BUFFER_SIZE} = require('../../shared/constants');


const tempDir = app.getPath('temp');

const buffId = 0;
const buffers = {};

ipcMain.on('ab-req-new', (e, channelCount = 1) => {
    const id = buffId++;
    buffers[id] = new AudioBuffer(id, channelCount);
    e.sender.send('ab-res-new', id.toString());
});

ipcMain.on('ab-com-pushsamp', (e, id, ...samples) => {
    if (!(id in buffers)) {
        e.sender.send('ab-res-err', id, 'Buffer does not exist');
        return;
    }
    buffers[id].push(samples);
});


class AudioBuffer {
    constructor(id, channelCount) {
        this.id = id;
        this.channelCount = channelCount;

        this.samples = [];
        for (let i = 0; i < channelCount; i++) {
            this.samples.push([]);
        }

        this.bufferPath = path.join(
            tempDir,
            `ps_audiobuffer_${id}`,
            'data.pcm'
        );
        fs.mkdirSync(this.bufferPath);

        this.isFlushing = false;
        this.wroteSomething = false;

        this.error = false;
    }
    push(samples) {
        if (this.error) {
            throw this.error;
        }
        samples.forEach((s, i) => {
            this.samples[i].push(s);
        });

        this.flush();
    }
    shift() {
        return this.samples.map(s => s.shift());
    }
    flush() {
        if (this.error) {
            throw this.error;
        }
        if (this.isFlushing) {
            return;
        }
        if (!this.samples.length || !this.samples[0].length) {
            return;
        }

        const handler = err => {
            if (err) {
                this.error = err;
                throw err;
            }
            this.wroteSomething = true;
            if (!this.samples[0].length) {
                this.isFlushing = false;
                return;
            }
            fs.appendFile(this.bufferPath, interleave(this.shift()), handler);
        };

        this.isFlushing = true;

        if (this.wroteSomething) {
            fs.appendFile(this.bufferPath, interleave(this.shift()), handler);
            return;
        }

        fs.writeFile(this.bufferPath, interleave(this.shift()), handler);
    }
    unreference() {
        delete buffers[this.id];
    }
}

function interleave(samples) {
    const length = samples.reduce((acc, s) => return acc + s.length, 0);
    const interleaved = new Float32Array(length);

    let inputIndex = 0;
    const sampleCount = samples.length;
    for (let i = 0; i < length;) {
        for (let j = 0; j < sampleCount; j++) {
            interleaved[i++] = samples[j][inputIndex];
        }
        inputIndex++;
    }

    return interleaved;
}
