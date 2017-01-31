import fs from 'external:fs';

import encodeMp3 from '../audio/encoders/mp3';
import encodeWAV from '../audio/encoders/wave';
import {remote} from 'electron';
const dialog = remote.dialog;

import React, {Component} from 'react';


const titles = {
    mp3: 'MP3',
    wav: 'WAV',
};
const encoders = {
    mp3: encodeMp3,
    wav: encodeWAV,
};

const styles = {
    encodingOptionWrapper: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: 40,
    },
    encodingOption: {
        background: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 3,
        boxShadow: '0 0 0 transparent',
        flex: '0 0 200px',
        margin: '0 10px 10px',
        padding: '20px 0',
        textAlign: 'center',
        transform: 'scale(1, 1)',
        transition: 'transform 0.2s, background-color 0.2s, box-shadow 0.2s',
        width: 200,
    },
    encodingOptionHeader: {
        fontSize: '1.7em',
    },
};

export default class ExportOptions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            type: null,
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
            return encoders[type](
                recorder.streamLength,
                inputStreams,
                recorder.sampleRate,
                outputStream
            );
        });
    }

    render() {
        return <form
            onSubmit={e => e.preventDefault()}
            ref='form'
            style={styles.encodingOptionWrapper}
        >
            <label
                className={`encoding-option ${this.state.type === 'wav' ? 'is-selected' : ''}`}
                style={styles.encodingOption}
            >
                <span style={styles.encodingOptionHeader}>
                    WAV
                </span>
                <p>
                    Very big files<br />
                    Perfect quality
                </p>
                <input
                    className='encoding-option-radio'
                    type='radio'
                    name='encoding-type'
                    onChange={e => this.setState({type: e.target.value})}
                    value='wav'
                />
                <i />
            </label>
            <label
                className={`encoding-option ${this.state.type === 'mp3' ? 'is-selected' : ''}`}
                style={styles.encodingOption}
            >
                <span style={styles.encodingOptionHeader}>
                    MP3
                </span>
                <p>
                    Moderate-size files<br />
                    Exceptional quality
                </p>
                <input
                    className='encoding-option-radio'
                    type='radio'
                    name='encoding-type'
                    onChange={e => this.setState({type: e.target.value})}
                    value='mp3'
                />
                <i />
            </label>
            {this.state.type &&
                <div
                    style={{
                        display: 'flex',
                        flex: '0 0 100%',
                        justifyContent: 'center',
                        padding: '30px 0',
                    }}
                >
                    <button
                        onClick={e => {
                            e.preventDefault();
                            this.saveAs(this.state.type);
                        }}
                        style={{
                            appearance: 'none',
                            background: 'transparent',
                            border: '1px solid #fff',
                            borderRadius: 4,
                            color: '#fff',
                            fontFamily: '-apple-system, \'Helvetica Neue\', Helvetica, sans-serif',
                            fontSize: '1.25em',
                            padding: '15px 30px',
                        }}
                        type='button'
                    >
                        Save As...
                    </button>
                </div>}
        </form>;
    }
};
