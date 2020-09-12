export function buildOptions(selector) {
    const root = document.querySelector(selector);
    function from(devices) {
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
        latency: 0,
    }
    return navigator.mediaDevices.getUserMedia({
        audio
    })
}

export function crispCanvas(visualizer) {
    visualizer.width = visualizer.clientWidth;
    visualizer.height = visualizer.clientHeight;
}

export function drawVisualizer(visualizer, analyzerNode) {
    requestAnimationFrame(drawVisualizer.bind(null, visualizer, analyzerNode));
    const bufferLength = analyzerNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyzerNode.getByteFrequencyData(dataArray);
    const width = Math.round(visualizer.width);
    const height = visualizer.height;
    const barWidth = Math.round(width / bufferLength);
    const canvasContext = visualizer.getContext('2d');
    canvasContext.clearRect(0, 0, width * 2, height * 2);
    dataArray.forEach((item, index) => {
        const y = Math.round((item / 100) * (height / 4));
        const x = Math.round(barWidth * index);
        const left = Math.round(width - barWidth * index)
        const right = Math.round(width + barWidth * index);
        const hue = Math.round(y / height * 100 + 275)
        const h = Math.round((height - y));
        canvasContext.fillStyle = `hsl(${hue},100%,50%)`;
        // canvasContext.fillRect(left, h, barWidth, y);
        // canvasContext.fillRect(right, h, barWidth, y);
        canvasContext.fillRect(x, h, barWidth, y);
    })
}