if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === 'undefined') {
    try {
        require('external:electron-react-devtools').install();
    } catch (e) {
        console.error(e);
    }
}

import React from 'react';
import ReactDOM from 'react-dom';

import KeyContext from './ui/KeyContext';


ReactDOM.render(<KeyContext />, document.querySelector('main'));
