import React, {Component} from 'react';


const SAMPLE_RATE = 50;

export default class WaveformPreview extends Component {
    constructor(props) {
        super(props);
        this.ctx = null;
        this.cb = null;

        this.drawer = this.draw.bind(this);

        this.height = 0;
        this.width = 0;

        this.resizeListener = null;

        this.dataArr = null;
    }

    componentWillUnmount() {
        if (this.resizeListener) {
            window.removeEventListener('resize', this.resizeListener);
        }
    }

    setupCanvas(canvas) {
        if (!canvas) {
            this.ctx = null;
            clearTimeout(this.cb);
            this.cb = null;
            return;
        }

        this.height = canvas.height = canvas.clientHeight;
        this.width = canvas.width = canvas.clientWidth;

        this.resizeListener = () => {
            canvas.height = this.height = canvas.clientHeight;
            canvas.width = this.width = canvas.clientWidth;
        };
        window.addEventListener('resize', this.resizeListener);

        const ctx = canvas.getContext('2d');
        this.ctx = ctx;

        this.cb = setTimeout(this.drawer, SAMPLE_RATE);
    }

    draw() {
        this.props.recorder.getAnalyzer().then(a => {
            if (!this.dataArr) {
                this.dataArr = new Float32Array(a.frequencyBinCount);
            }
            this.ctx.clearRect(0, 0, this.width, this.height);

            a.getFloatFrequencyData(this.dataArr);

            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';

            for (let i = 0; i < a.frequencyBinCount; i++) {
                const height = (this.dataArr[i] + 140) * 2;
                const numSquares = Math.floor(height / 255 * this.height / 5);
                for (let y = 0; y < numSquares; y++) {
                    this.ctx.fillRect(
                        i / a.frequencyBinCount * this.width,
                        this.height - y * 5 - 1,
                        3,
                        3
                    );
                }
            }

            this.cb = setTimeout(this.drawer, SAMPLE_RATE);
        });
    }

    render() {
        return <canvas
            ref={e => this.setupCanvas(e)}
            style={{
                bottom: 0,
                height: 400,
                left: 0,
                position: 'absolute',
                right: 0,
                width: '100%',
                zIndex: 0
            }}
        />;
    }
};
