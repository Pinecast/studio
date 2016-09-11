import React, {Component} from 'react';


export default class SyrupyButton extends Component {
    constructor(props) {
        super(props);
        this.state = {
            clicking: false,
            hovering: false,
        };

        this.onMouseDown = () => this.setState({clicking: true});
        this.onMouseOut = () => this.setState({hovering: false, clicking: false});
        this.onMouseOver = () => this.setState({hovering: true});
        this.onMouseUp = () => this.setState({clicking: false, hovering: true});
        this.setAlwaysProps(props);
    }
    setAlwaysProps({onClick}) {
        this.alwaysProps = {
            onMouseDown: this.onMouseDown,
            onMouseOut: this.onMouseOut,
            onMouseOver: this.onMouseOver,
            onMouseUp: this.onMouseUp,

            onClick,
        };
    }
    componentWillReceiveProps(newProps) {
        this.setAlwaysProps(newProps);
    }
};
