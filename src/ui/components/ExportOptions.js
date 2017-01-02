import fs from 'external:fs';

import encodeMp3 from '../audio/encoders/mp3';
import encodeWAV from '../audio/encoders/wave';
import {remote} from 'electron';
const dialog = remote.dialog;

import React, {Component} from 'react';


const titles = {
    mp3: 'Mp3',
    wav: 'WAV',
};
const encoders = {
    mp3: encodeMp3,
    wav: encodeWAV,
};

export default class ExportOptions extends Component {
    saveAs(type) {
        const exportPath = dialog.showSaveDialog({
            title: `Export Audio as ${titles[type]}`,
            buttonLabel: 'Export',
            filters: [
                {
                    name: titles[type],
                    extensions: [type],
                },
                {
                    name: 'Custom File Type',
                    extensions: ['*'],
                },
            ],
        });
        const {recorder} = this.props;
        const inputStreams = recorder.getReadStreams();
        const outputStream = fs.createWriteStream(exportPath);
        Promise.all(inputStreams.map(s =>
            new Promise((resolve, reject) => {
                s.once('readable', resolve);
                s.once('error', reject);
            })
        )).then(() => {
            // TODO: check that all of the channels are the same byte length
            return encoders[type](
                recorder.streamLength,
                inputStreams,
                recorder.sampleRate,
                outputStream
            );
        });
    }
    render() {
        return <div>
            <button
                onClick={() => this.saveAs('wav')}
                type='button'
            >
                WAV
            </button>
            <button
                onClick={() => this.saveAs('mp3')}
                type='button'
            >
                Mp3
            </button>
        </div>;
    }
};
