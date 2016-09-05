import React from 'react';

import Logo from './Logo';


const HeaderToolbar = () =>
    <div style={{
        alignItems: 'center',
        background: '#151515',
        display: 'flex',
        height: 55,
        padding: '0 15px',
    }}>
        <Logo />
    </div>;

export default HeaderToolbar;
