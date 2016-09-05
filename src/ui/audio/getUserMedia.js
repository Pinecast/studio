const gum = (
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia
);


export function getDevices() {
    return new Promise((resolve, reject) => {
        navigator.mediaDevices.enumerateDevices().then(devices => {
            resolve(
                devices
                    .filter(device => device.kind === 'audioinput')
                    .map(({deviceId: id, label}) => ({id, label}))
            );
        }, reject);
    });
};

export function getAudioStream(deviceId = null) {
    return new Promise((resolve, reject) => {
        gum.call(
            navigator,
            {
                // audio: {deviceId: deviceId ? {exact: deviceId} : undefined},
                // audio: !deviceId ? true : {deviceId: {exact: {deviceId}}},
                audio: deviceId ? {optional: [{sourceId: deviceId}]} : true,
            },
            resolve,
            reject
        );
    });
};
