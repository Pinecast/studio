export default class BaseEncoder {
    constructor() {
        this.progressHandlers = new Set();
    }

    onProgress(listener) {
        this.progressHandlers.add(listener);
    }

    sendProgress(percent) {
        for (let handler of this.progressHandlers) {
            handler(percent);
        }
    }
};
