import React, {Component} from 'react';

import Input from './input';
import * as styles from '../../styles';


export default class InputNumber extends Component {
    get value() {
        return this.refs.input.value;
    }

    render() {
        const {style = {}, ...props} = this.props;
        return <Input
            {...props}
            ref='input'
            style={{...styles.inputNumber, ...style}}
            type='number'
        />;
    }
};
