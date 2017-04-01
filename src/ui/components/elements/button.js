import React, {Component} from 'react';

import * as styles from '../../styles';


export default class Button extends Component {
    getButtonStyle() {
        if (this.props.type === 'light') {
            return styles.button;
        }
        if (this.props.type === 'primary') {
            return styles.buttonPrimary;
        }
        return null;
    }
    render() {
        return <button
            className={this.props.className}
            onClick={this.props.onClick}
            style={{...this.getButtonStyle(), ...this.props.style}}
            type='button'
        >
            {this.props.children}
        </button>;
    }
};

Button.defaultProps = {
    className: '',
    onClick: () => {},
    style: {},
    type: 'light',
};
