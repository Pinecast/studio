import React, {Component} from 'react';

import * as styles from '../../styles';


export default class Button extends Component {
    render() {
        return <button
            onClick={this.props.onClick}
            style={styles.button}
            type='button'
        >
            {this.props.children}
        </button>;
    }
};

Button.defaultProps = {
    onClick: () => {},
};
