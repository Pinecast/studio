import React from 'react';

import * as styles from '../../styles';


const Label = ({children, style = {}, text}) =>
    <label style={{...styles.label, ...style}}>
        <span style={styles.labelText}>{text}</span>
        {children}
    </label>;

export default Label;
