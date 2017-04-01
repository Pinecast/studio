import React, {Component} from 'react';

import Button from '../elements/button';
import {styles} from './styles';

import './cloud-connect.css';


export default class ExportOptionCloud extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasToken: false,
        };
    }

    render() {
        if (this.state.hasToken) {
            //
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
                style={{fontSize: '13px'}}
                type='primary'
            >
                Connect to Pinecast
            </Button>
        </div>;
    }
};
