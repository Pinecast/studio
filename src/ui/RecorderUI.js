import React, {Component} from 'react';
import {remote} from 'electron';
const dialog = remote.dialog;

import BodyTimer from './components/BodyTimer';
import BodyTimerDisplay from './components/BodyTimerDisplay';
import DevicePicker from './components/DevicePicker';
import Exporter from './components/Exporter';
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
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'center',
        overflowY: 'auto',
        position: 'relative',
        zIndex: 2,
    },
};

export default class RecorderUI extends Component {
    constructor(props) {
        super(props);
        this.state = {
            step: 'initial',
            // step: 'saved',
        };

        this.recorder = new Recorder();
    }

    startRecording() {
        this.recorder.start(1); // 1 -> mono
        this.setState({step: 'recording'});
    }

    stopRecording() {
        const stopper = this.recorder.stop();
        this.setState({step: 'flushing'}, () => {
            stopper.then(() => this.setState({step: 'saved'}));
        });
    }

    renderCurrentState() {
        if (this.state.step === 'initial') {
            return <div style={{maxHeight: '100%', paddingBottom: 100}}>
                <DevicePicker
                    onChange={id => this.recorder.setDeviceId(id)}
                    ref='dp'
                    style={{marginBottom: 40}}
                />
                <RecordButton
                    onClick={() => {
                        if (!this.refs.dp.isSelectionOkay) {
                            const result = dialog.showMessageBox({
                                type: 'question',
                                buttons: ['Choose Again', 'Continue'],
                                defaultId: 0,
                                title: 'Use potentially bad microphone?',
                                message: 'We were not able to detect a good signal from the microphone you chose. Do you wish to continue or choose a different microphone?',
                                detail: 'A bad microphone may be a malfunctioning device, or a software microphone that is not producing audio.',
                            });
                            if (!result) {
                                return;
                            }
                        }
                        this.startRecording();
                    }}
                />
            </div>;
        }
        if (this.state.step === 'recording') {
            return <div>
                <BodyTimer recorder={this.recorder} />
                <StopButton onClick={() => this.stopRecording()} />
                <WaveformVisualizationPreview recorder={this.recorder} />
            </div>;
        }
        if (this.state.step === 'flushing') {
            return <div>
                <BodyTimerDisplay
                    endTime={this.recorder.stoppedRecording}
                    startTime={this.recorder.startedRecording}
                />
                <div
                    style={{
                        color: '#fff',
                        fontSize: '40px',
                        opacity: 0.5,
                        textAlign: 'center',
                    }}
                >
                    Saving backup...
                </div>
            </div>;
        }
        if (this.state.step === 'saved') {
            return <Exporter recorder={this.recorder} />;
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
        return <div>
            <HeaderToolbar>
                {this.renderHeader()}
            </HeaderToolbar>
            <section style={styles.body}>
                {this.renderCurrentState()}
            </section>
            <WaveformPreview
                recorder={this.recorder}
                isDulled={!(step === 'initial' || step === 'recording')}
            />
        </div>;
    }
};
