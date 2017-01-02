import React from 'react';

import BodyTimerDisplay from './BodyTimerDisplay';


const BodyTimer = ({recorder}) =>
    <BodyTimerDisplay startTime={recorder.startedRecording} endTime={null} />;

export default BodyTimer;
