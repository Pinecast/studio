import {ipcRenderer} from 'electron';
import React, {Component, PropTypes} from 'react';

import RecorderUI from './RecorderUI';


export default class KeyContext extends Component {
    static childContextTypes = {
        appKeys: PropTypes.object,
    };

    constructor(...args) {
        super(...args);
        this.state = {
            keys: ipcRenderer.sendSync('pinecast-get-app-keys'),
        };

        this.stateHandler = (_, keys) => {
            this.setState({keys});
        };
    }

    componentDidMount() {
        ipcRenderer.on('pinecast-got-api-keys', this.stateHandler);
    }

    componentWillUnmount() {
        ipcRenderer.removeListener('pinecast-got-api-keys', this.stateHandler);
    }

    getChildContext() {
        return {appKeys: this.state.keys};
    }

    render() {
        return <RecorderUI />;
    }
};
