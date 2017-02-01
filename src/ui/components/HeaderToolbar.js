import * as os from 'external:os';

import React from 'react';

import Logo from './Logo';


function isMacOS() {
    return os.platform() === 'darwin' && parseFloat(os.release().split('.')[0]) >= 15;
}


const HeaderToolbar = ({children = null, macOS = isMacOS()}) =>
    <div style={{
        // WebkitAppRegion: 'drag',

        alignItems: 'center',
        background: '#151515',
        display: 'flex',
        height: macOS ? 38 : 55,
        left: 0,
        padding: macOS ? '0 15px 0 75px' : '0 15px',
        position: 'fixed',
        right: 0,
        top: 0,
    }}>
        <Logo />
        {children}
    </div>;

export default HeaderToolbar;
