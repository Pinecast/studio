import React, {Component} from 'react';


export default class BodyTimerDisplay extends Component {
    constructor(props) {
        super(props);
        this.raf = null;
    }
    componentDidMount() {
        this.raf = requestAnimationFrame(() => {
            this.draw();
            if (!this.props.endTime) {
                this.componentDidMount();
            } else {
                this.raf = null;
            }
        });
    }
    componentWillUnmount() {
        if (this.raf) {
            cancelAnimationFrame(this.raf);
        }
    }

    draw() {
        const ctx = this.refs.canvas.getContext('2d');
        ctx.font = '100 192px -apple-system, Helvetica Neue, Helvetica, sans-serif';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.clearRect(0, 0, 960 * 2, 200);

        ctx.fillText(this.getTimeRemaining(), 960, 96 * 2);
    }

    getTimeRemaining() {
        const {startTime, endTime} = this.props;
        if (startTime === null) {
            return '--:--:--.---';
        }

        const timeElapsed = endTime ? endTime - startTime : Date.now() - startTime;

        const elapsed = timeElapsed / 1000 | 0;
        return `${Math.floor(elapsed / 3600)}:${('0' + Math.floor(elapsed / 60)).slice(-2)}:${('0' + elapsed % 60).slice(-2)}.${('00' + timeElapsed % 1000).slice(-3)}`
    }

    render() {
        return <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 100,
        }}>
            <canvas
                height={200}
                ref='canvas'
                style={{
                    height: 100,
                    maxWidth: 960,
                    width: '100%',
                }}
                width={960 * 2}
            />
        </div>;
    }
};
