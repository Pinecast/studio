import React from 'react';

import DevicePicker from './components/DevicePicker';
import HeaderToolbar from './components/HeaderToolbar';
import RecordButton from './components/RecordButton';
import {Recorder} from './audio/inputCtx';
import WaveformPreview from './components/WaveformPreview';


const styles = {
    body: {
        margin: '50px auto',
        position: 'relative',
        width: 300,
        zIndex: 2,
    },
};

export default class RecorderUI extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            recording: false,
        };

        this.recorder = new Recorder();
    }

    startRecording() {
        this.setState({recording: true});
    }

    renderCurrentState() {
        if (!this.state.recording) {
            return <div>
                <DevicePicker
                    onChange={id => this.recorder.setDeviceId(id)}
                    style={{marginBottom: 40}}
                />
                <RecordButton onClick={() => this.startRecording()} />
            </div>;
        }

    }

    render() {
        return <main>
            <HeaderToolbar />
            <div style={styles.body}>
                {this.renderCurrentState()}
            </div>
            <WaveformPreview recorder={this.recorder} />
        </main>;
    }
};
