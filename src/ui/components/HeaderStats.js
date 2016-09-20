import fileSize from 'file-size';
import React, {Component} from 'react';

import * as globalStyles from '../styles';


const fileSizeConfig = {fixed: 0};

export default class HeaderStats extends Component {
    constructor(props) {
        super(props);
        this.state = {
            memoryUsage: null,
        };

        this.timer = null;
    }

    componentDidMount() {
        this.timer = setInterval(() => {
            const {props: {recorder}} = this;
            if (!recorder) {
                return;
            }
            this.setState({memoryUsage: recorder.streamLength * recorder.channelCount});
        }, 250);
    }
    componentWillUnmount() {
        clearInterval(this.timer);
        this.timer = null;
    }

    render() {
        return <span
            style={globalStyles.headerLabel}
            title='Disk space used'
        >
            {'Size '}
            <em style={globalStyles.headerLabelEmphasis}>
                {fileSize(this.state.memoryUsage, fileSizeConfig).human('jedec')}
            </em>
        </span>;
    }
};
