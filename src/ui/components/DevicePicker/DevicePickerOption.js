import React, {Component} from 'react';

import DeviceProblemIndicator from './DeviceProblemIndicator';
import {Recorder} from '../../audio/inputCtx';


export default class DevicePickerOption extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fetching: true,
            outcome: null,
        };

        this.timeout = null;
        this.recorder = null;
    }

    componentDidMount() {
        const recorder = new Recorder();
        this.recorder = recorder;
        recorder.setDeviceId(this.props.deviceId);
        recorder.startListening(1, 1, 16384);
        this.timeout = setTimeout(() => {
            let hasFired = false;
            let hasHeardSomething = false;
            const listener = (_, sample) => {
                if (!sample.length) {
                    return;
                }
                hasFired = true;
                this.setState({fetching: false});
                if (sample.every(x => !x)) {
                    if (!this.state.outcome) {
                        this.setState({outcome: 'nodata'});
                    }
                } else {
                    hasHeardSomething = true;
                    recorder.stop();
                    this.setState({outcome: 'good'});
                }
            };
            recorder.events.on('samples', listener);

            setTimeout(() => {
                if (!hasFired) {
                    this.setState({fetching: false, outcome: 'unresponsive'});
                }
                recorder.stop();
            }, 4000);
            setTimeout(() => {
                if (hasFired && !hasHeardSomething) {
                    this.setState({fetching: false, outcome: 'silent'});
                }
            }, 1000);
        }, 250);
    }

    compnentWillUnmount() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        if (this.recorder) {
            this.recorder.stop();
            this.recorder = null;
        }
    }

    render() {
        const {state: {fetching, outcome}, props: {deviceId, index, label, onSelect, selected}} = this;
        return <label
            style={{
                alignItems: 'center',
                background: 'transparent',
                border: 0,
                borderTop: index ? '1px solid rgba(255, 255, 255, 0.3)' : 0,
                color: '#fff',
                display: 'flex',
                fontSize: '18px',
                height: 36,
                width: '100%',
            }}
        >
            <input
                checked={deviceId === selected}
                onChange={e => {
                    if (!e.target.checked) {
                        return;
                    }
                    onSelect();
                }}
                style={{
                    'WebkitAppearance': 'none',
                    background: deviceId === selected ? '#833BD5' : '#eee',
                    boder: '1px solid #111',
                    boxShadow: 'inset 0 0 0 5px #fff',
                    borderRadius: 50,
                    height: 20,
                    marginRight: 20,
                    transition: 'background-color 0.15s',
                    width: 20,
                }}
                type='radio'
            />
            {label}
            {outcome === 'headphones' &&
                <DeviceProblemIndicator icon='headphones' problemText='Speaker audio could be heard by this device. Ensure you are using headphones.' />}
            {outcome === 'silent' &&
                <DeviceProblemIndicator icon='microphone-slash' problemText='No audio is being produced by this device.' />}
            {outcome === 'unresponsive' &&
                <DeviceProblemIndicator icon='minus-circle' problemText='This device was unresponsive when trying to connect.' />}
        </label>;
    }
};
