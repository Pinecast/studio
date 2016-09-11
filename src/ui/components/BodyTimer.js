import React, {Component} from 'react';


const styles = {
    main: {
        color: '#fff',
        fontSize: '100px',
        fontWeight: '100',
        marginBottom: 100,
        textAlign: 'center',
    }
};

export default class BodyTimer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            timeElapsed: null,
        };

        this.timer = null;
    }

    componentWillMount() {
        const cb = () => {
            const {props: {recorder}} = this;
            if (!recorder) {
                return;
            }
            this.setState({timeElapsed: Date.now() - recorder.startedRecording});
            this.timer = requestAnimationFrame(cb);
        };
        this.timer = requestAnimationFrame(cb);
    }
    componentWillUnmount() {
        cancelAnimationFrame(this.timer);
        this.timer = null;
    }

    getTimeRemaining() {
        const {timeElapsed} = this.state;
        if (timeElapsed === null) {
            return '--:--:--.---';
        }
        const elapsed = timeElapsed / 1000 | 0;
        return `${Math.floor(elapsed / 3600)}:${('0' + Math.floor(elapsed / 60)).slice(-2)}:${('0' + elapsed % 60).slice(-2)}.${('00' + timeElapsed % 1000).slice(-3)}`
    }

    render() {
        return <div style={styles.main}>
            {this.getTimeRemaining()}
        </div>;
    }
};
