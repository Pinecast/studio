import React, {Component} from 'react';

import {getDevices} from '../audio/getUserMedia';


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
                <label
                    key={id}
                    style={{
                        alignItems: 'center',
                        background: 'transparent',
                        border: 0,
                        borderTop: i ? '1px solid rgba(255, 255, 255, 0.3)' : 0,
                        color: '#fff',
                        display: 'flex',
                        fontSize: '18px',
                        height: 36,
                        width: '100%',
                    }}
                >
                    <input
                        checked={id === selected}
                        onChange={e => {
                            if (!e.target.checked) {
                                return;
                            }
                            onChange(id);
                            this.setState({selected: id});
                        }}
                        style={{
                            'WebkitAppearance': 'none',
                            background: id === selected ? '#833BD5' : '#eee',
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
                </label>
            )}
        </div>;
    }
};
