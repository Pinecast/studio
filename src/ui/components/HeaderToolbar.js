import React from 'react';

import Logo from './Logo';


const HeaderToolbar = ({children = null}) =>
    <div style={{
        alignItems: 'center',
        background: '#151515',
        display: 'flex',
        height: 55,
        padding: '0 15px',
    }}>
        <Logo />
        {children}
    </div>;

export default HeaderToolbar;
