import React, {Component} from 'react';

import Button from '../elements/button';
import ExportOptionCloud from './ExportOptionCloud';
import {styles} from './styles';


export default class ExportOptions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            type: null,
        };
    }

    render() {
        return <form
            onSubmit={e => e.preventDefault()}
            ref='form'
            style={styles.encodingOptionWrapper}
        >
            <label
                className={`encoding-option ${this.state.type === 'wav' ? 'is-selected' : ''}`}
                style={styles.encodingOption}
            >
                <span style={styles.encodingOptionHeader}>
                    WAV
                </span>
                <p>
                    Very big files<br />
                    Perfect quality
                </p>
                <input
                    className='encoding-option-radio'
                    type='radio'
                    name='encoding-type'
                    onChange={e => this.setState({type: e.target.value})}
                    value='wav'
                />
                <i />
            </label>
            <label
                className={`encoding-option ${this.state.type === 'mp3' ? 'is-selected' : ''}`}
                style={styles.encodingOption}
            >
                <span style={styles.encodingOptionHeader}>
                    MP3
                </span>
                <p>
                    Moderate-size files<br />
                    Exceptional quality
                </p>
                <input
                    className='encoding-option-radio'
                    type='radio'
                    name='encoding-type'
                    onChange={e => this.setState({type: e.target.value})}
                    value='mp3'
                />
                <i />
            </label>
            <ExportOptionCloud
                selected={this.state.type === 'cloud'}
                onSelect={() => this.setState({type: 'cloud'})}
            />
            {this.state.type &&
                <div
                    style={{
                        display: 'flex',
                        flex: '0 0 100%',
                        justifyContent: 'center',
                        padding: '30px 0',
                    }}
                >
                    <Button
                        onClick={e => {
                            e.preventDefault();
                            this.props.onSave(this.state.type);
                        }}
                    >
                        Save As...
                    </Button>
                </div>}
        </form>;
    }
};
