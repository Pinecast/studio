import React from 'react';


const Progress = ({percent = 0, style = {}}) =>
    <div
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={percent * 100}
        role='progressbar'
        style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            borderRadius: 3,
            height: 5,
            overflow: 'hidden',

            ...style,
        }}
    >
        <div
            style={{
                WebkitAppearance: 'none',
                background: '#D591F8',
                display: 'block',
                height: 5,
                transition: 'width 0.2s',
                width: `${percent * 100}%`,
            }}
        />
    </div>;
export default Progress;
