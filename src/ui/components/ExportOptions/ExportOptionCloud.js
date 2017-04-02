import {ipcRenderer} from 'electron';
import React, {Component, PropTypes} from 'react';

import Button from '../elements/button';
import {styles} from './styles';

import './cloud-connect.css';


const oauthTokenPath = 'oauth.authToken.value';

export default class ExportOptionCloud extends Component {
    static contextTypes = {
        appKeys: PropTypes.object,
    };

    render() {
        if (this.context.appKeys[oauthTokenPath]) {
            const {onSelect, selected} = this.props;
            return <label
                className={`encoding-option ${selected ? 'is-selected' : ''}`}
                style={styles.encodingOption}
            >
                <span style={styles.encodingOptionHeader}>
                    Cloud
                </span>
                <p>
                    Stored on Pinecast Backup<br />
                    Exceptional quality
                </p>
                <input
                    checked={this.props.selected}
                    className='encoding-option-radio'
                    type='radio'
                    name='encoding-type'
                    onChange={() => this.props.onSelect()}
                    value='cloud'
                />
                <i />
            </label>;
        }

        return <div className='cloud-connect' style={styles.encodingOption}>
            <span style={styles.encodingOptionHeader}>
                Cloud
            </span>
            <p>
                Stored on Pinecast Backup<br />
                Exceptional quality
            </p>
            <Button
                className='cloud-connect-button'
                onClick={() => ipcRenderer.send('pinecast-oauth-start')}
                style={{fontSize: '13px'}}
                type='primary'
            >
                Connect to Pinecast
            </Button>
        </div>;
    }
};
