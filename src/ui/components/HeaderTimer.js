import React, {Component} from 'react';

import {getContext} from '../audio/inputCtx';
import * as globalStyles from '../styles';
import InputNumber from './elements/inputNumber';
import Label from './elements/label';


const styles = {
    buttonWrapper: {
        marginTop: 10,
        textAlign: 'center',
    },
    timer: {
        ...globalStyles.headerButton,
    },
    timerPicker: {
        background: '#333',
        borderRadius: 3,
        boxShadow: '0 3px 15px #000',
        fontSize: '14px',
        left: globalStyles.headerButton.marginLeft,
        padding: '5px 15px 15px',
        position: 'absolute',
        top: 'calc(100% + 5px)',
        zIndex: 100,
    },
    wrapper: {
        position: 'relative',
    },
};

export default class HeaderTimer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            targetTimestamp: null,

            showingPicker: false,
        };

        this.timer = null;
    }

    componentWillUnmount() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }

    reffed(e) {
        if (!e) {
            if (this.timer) {
                clearTimeout(this.timer);
            }
            return;
        }

        const timeout = () => {
            const remaining = Math.floor((this.state.targetTimestamp - Date.now()) / 1000);
            if (remaining < 0) {
                e.innerText = '00:00:00';
                this.timer = null;
                this.setState({targetTimestamp: null});

                const ctx = getContext();
                const osc = ctx.createOscillator();
                osc.frequency.value = 500;
                const oscGain = ctx.createGain();
                oscGain.gain.value = 0.5;

                setTimeout(() => {
                    osc.stop(0);
                    osc.disconnect();
                    oscGain.disconnect();
                }, 1000);
                osc.connect(oscGain)
                oscGain.connect(ctx.destination)
                osc.start(0);

            } else {
                e.innerText = `${Math.floor(remaining / 3600)}:${('0' + Math.floor((remaining / 60) % 60)).slice(-2)}:${('0' + remaining % 60).slice(-2)}`;
                this.timer = setTimeout(timeout, 250);
            }
        };
        this.timer = setTimeout(timeout, 0);
    }

    renderPicker() {
        return <div style={styles.timerPicker}>
            <Label text='Hours'>
                <InputNumber defaultValue={0} ref='tpHours' />
            </Label>
            <Label text='Minutes'>
                <InputNumber defaultValue={30} ref='tpMinutes' />
            </Label>
            <div style={styles.buttonWrapper}>
                <button
                    onClick={() => {
                        this.setState({
                            targetTimestamp:
                                Date.now() +
                                parseInt(this.refs.tpHours.value) * 1000 * 60 * 60 +
                                parseInt(this.refs.tpMinutes.value) * 1000 * 60,
                            showingPicker: false,
                        });
                    }}
                    style={globalStyles.fullButton}
                >
                    Set
                </button>
            </div>
        </div>;
    }

    renderSetButton() {
        const {state: {showingPicker}} = this;

        return <div style={styles.wrapper}>
            <button
                onClick={() => this.setState({showingPicker: !showingPicker})}
                style={globalStyles.headerButton}
            >
                Set Timer
            </button>
            {showingPicker && this.renderPicker()}
        </div>;
    }

    render() {
        if (!this.state.targetTimestamp) {
            return this.renderSetButton();
        }
        return <div
            onClick={e => {
                this.setState({targetTimestamp: null});
                e.target.innerText = '';
            }}
            ref={e => this.reffed(e)}
            style={styles.timer}
        />;
    }
};
