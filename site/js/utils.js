export function buildOptions(selector) {
    const root = document.querySelector(selector);
    function from (devices) {
        const fragment = new DocumentFragment();
        for (const device of devices) {
            const option = document.createElement('option');
            option.selected = !!device.deviceId == 'default';
            option.value = device.deviceId;
            option.label = device.label;
            fragment.appendChild(option)
        };
        root.appendChild(fragment);
    }

    return { from };
}
export function getAudio() {
    const audio = {
        echoCancellation: false,
        autoGainControl: false,
        noiseSupression: false,
        latency: 0
    }
    return navigator.mediaDevices.getUserMedia({ audio })
}