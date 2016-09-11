try {
    require('external:electron-react-devtools').install();
} catch (e) {}

import React from 'react';
import ReactDOM from 'react-dom';

import RecorderUI from './ui/RecorderUI';


ReactDOM.render(
    <div>
        <RecorderUI />
    </div>,
    document.querySelector('main')
);
