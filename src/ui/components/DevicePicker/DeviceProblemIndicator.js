import React from 'react';


const DeviceProblemIndicator = ({icon, problemText}) =>
    <div
        className='device-problem-indicator'
        style={{
            display: 'inline-block',
            padding: '0 10px',
            position: 'relative',
        }}
    >
        <i className={`fa fa-${icon}`} />
        <div
            style={{
                background: 'rgba(0, 0, 0, 0.8)',
                borderRadius: 5,
                left: 30,
                padding: 5,
                position: 'absolute',
                transition: '0.2s opacity, 0.15s top',
                width: 250,
                zIndex: 10,
            }}
        >
            {problemText}
        </div>
    </div>;

export default DeviceProblemIndicator;
