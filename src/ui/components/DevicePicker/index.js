import React, {Component} from 'react';

import DevicePickerOption from './DevicePickerOption';
import {getDevices} from '../../audio/getUserMedia';


export default class DevicePicker extends Component {
    constructor(props) {
        super(props);
        this.state = {
            devices: null,
            selected: null,
        };
    }

    componentDidMount() {
        getDevices().then(devices => this.setState({devices, selected: devices[0].id}));
    }

    render() {
        const {state: {devices, selected}, props: {onChange, style}} = this;
        if (!devices) {
            return <div style={style}>
                Loading input device list...
            </div>;
        }
        return <div style={style}>
            {devices.map(({id, label}, i) =>
                <DevicePickerOption
                    deviceId={id}
                    index={i}
                    key={id}
                    label={label}
                    onSelect={() => {
                        this.setState({selected: id});
                        onChange(id);
                    }}
                    selected={selected}
                />)}
        </div>;
    }
};
