if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === 'undefined') {
    try {
        require('external:electron-react-devtools').install();
    } catch (e) {
        console.error(e);
    }
}

import React from 'react';
import ReactDOM from 'react-dom';

import RecorderUI from './ui/RecorderUI';


ReactDOM.render(
    <div>
        <RecorderUI />
    </div>,
    document.querySelector('main')
);
