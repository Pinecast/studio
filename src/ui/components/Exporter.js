import fs from 'external:fs';

import {remote} from 'electron';
const dialog = remote.dialog;

import React, {Component} from 'react';

import BodyTimerDisplay from './BodyTimerDisplay';
import Button from './elements/button';
import ExportOptions from './ExportOptions';
import Mp3Encoder from '../audio/encoders/mp3';
import ProgressBar from './elements/progress';
import WaveEncoder from '../audio/encoders/wave';


const titles = {
    mp3: 'MP3',
    wav: 'WAV',
};
const encoders = {
    mp3: Mp3Encoder,
    wav: WaveEncoder,
};

const styles = {
    headerStyle: {
        color: '#fff',
        fontSize: '40px',
        opacity: 0.5,
        textAlign: 'center',
    },
};

export default class Exporter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            progress: 0,
            readyState: 'ready',
        };
    }

    saveAs(type) {
        const exportPath = dialog.showSaveDialog({
            title: `Export Audio as ${titles[type]}`,
            buttonLabel: 'Export',
            filters: [
                {
                    name: titles[type],
                    extensions: [type],
                }
            ],
        });

        if (!exportPath) {
            // They clicked cancel
            return;
        }

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
            const encoder = new encoders[type]();
            encoder.onProgress(progress => this.setState({progress}));
            return encoder.encode(
                recorder.streamLength,
                inputStreams,
                recorder.sampleRate,
                outputStream
            );
        }).then(
            () => this.setState({readyState: 'finished', progress: 1}),
            error => this.setState({readyState: 'error', progress: 0, error})
        );

        this.setState({readyState: 'encoding', progress: 0})
    }

    render() {
        const {
            props: {recorder},
            state: {progress, readyState},
        } = this;

        if (readyState === 'ready') {
            return <div>
                <BodyTimerDisplay
                    endTime={recorder.stoppedRecording}
                    startTime={recorder.startedRecording}
                />
                <div style={styles.headerStyle}>
                    Export To
                </div>
                <ExportOptions onSave={type => this.saveAs(type)} />
            </div>;
        }

        if (readyState === 'encoding') {
            return <div style={{width: '100%'}}>
                <div style={styles.headerStyle}>
                    Exporting...
                </div>
                <ProgressBar percent={progress} style={{margin: '20px'}} />
            </div>;
        }

        if (readyState === 'finished') {
            return <div>
                <div style={styles.headerStyle}>
                    Export Complete
                </div>
                <Button onClick={() => this.setState({readyState: 'ready'})}>
                    Export Again
                </Button>
            </div>;
        }


        return <div>
            <div style={styles.headerStyle}>
                Uh-oh...
            </div>
            <p>There was a problem processing your export.</p>
            <pre>{this.state.error.toString()}</pre>
        </div>;
    }
};
