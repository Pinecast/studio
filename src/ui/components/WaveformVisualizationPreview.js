import React, {Component} from 'react';

import {createWaveformFromRecorder} from '../audio/WaveformVisualizer';


export default class WaveformVisualizationPreview extends Component {
    constructor(props) {
        super(props);
        this.ctx = null;
        this.cb = null;

        this.draw = this.draw.bind(this);

        this.height = 0;
        this.width = 0;

        this.resizeListener = null;

        this.wv = createWaveformFromRecorder(props.recorder, 0);
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

        this.cb = setTimeout(this.draw, 0);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.strokeStyle = '#fff';
        this.wv.drawCanvas(this.ctx);
    }

    render() {
        return <canvas
            ref={e => this.setupCanvas(e)}
            style={{
                height: 150,
                width: '100%',
            }}
        />;
    }
};
