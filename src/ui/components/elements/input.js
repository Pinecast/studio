import React, {Component} from 'react';

import * as styles from '../../styles';


export default class Input extends Component {
    get value() {
        return this.refs.input.value;
    }

    render() {
        const {style = {}, ...props} = this.props;
        return <input
            {...props}
            ref='input'
            style={{...styles.input, ...style}}
        />;
    }
};
