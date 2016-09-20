import React from 'react';

import BodyTimer from './components/BodyTimer';
import DevicePicker from './components/DevicePicker';
import HeaderStats from './components/HeaderStats';
import HeaderTimer from './components/HeaderTimer';
import HeaderToolbar from './components/HeaderToolbar';
import RecordButton from './components/RecordButton';
import {Recorder} from './audio/inputCtx';
import StopButton from './components/StopButton';
import WaveformPreview from './components/WaveformPreview';
import WaveformVisualizationPreview from './components/WaveformVisualizationPreview';


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
            step: 'initial',
        };

        this.recorder = new Recorder();
    }

    startRecording() {
        this.recorder.start(1); // 1 -> mono
        this.setState({step: 'recording'});
    }

    stopRecording() {
        this.setState({step: 'flushing'}, () => {
            this.recorder.stop().then(() => this.setState({step: 'saved'}));
        });
    }

    renderCurrentState() {
        if (this.state.step === 'initial') {
            return <div>
                <DevicePicker
                    onChange={id => this.recorder.setDeviceId(id)}
                    style={{marginBottom: 40}}
                />
                <RecordButton onClick={() => this.startRecording()} />
            </div>;
        }
        if (this.state.step === 'recording') {
            return <div>
                <BodyTimer recorder={this.recorder} />
                <StopButton onClick={() => this.stopRecording()} />
                <WaveformVisualizationPreview recorder={this.recorder} />
            </div>;
        }

    }

    renderHeader() {
        if (this.state.step !== 'recording') {
            return null;
        }

        return [
            <HeaderTimer key='timer' />,
            <HeaderStats key='mem' recorder={this.recorder} />
        ];
    }

    render() {
        const step = this.state.step;
        return <main>
            <HeaderToolbar>
                {this.renderHeader()}
            </HeaderToolbar>
            <div style={{...styles.body, width: step === 'initial' ? 300 : '100%'}}>
                {this.renderCurrentState()}
            </div>
            <WaveformPreview
                recorder={this.recorder}
                isDulled={!(step === 'initial' || step === 'recording')}
            />
        </main>;
    }
};
