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

export function crispCanvas(visualizer){
    visualizer.width = visualizer.clientWidth * window.devicePixelRatio;
    visualizer.height = visualizer.clientHeight * window.devicePixelRatio;
}

export function  drawVisualizer(visualizer,analyzerNode) {
    requestAnimationFrame(drawVisualizer.bind(null,visualizer,analyzerNode));
    const bufferLength = analyzerNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyzerNode.getByteFrequencyData(dataArray);
    const width = visualizer.width;
    const height = visualizer.height;
    const barWidth = Math.round(width / bufferLength);
    const canvasContext = visualizer.getContext('2d');
    canvasContext.clearRect(0, 0, width, height);
    dataArray.forEach((item, index) => {
        const y = item / 256 * height / 2;
        const left = width / 2 - barWidth * index
        const right = width / 2 + barWidth * index
        canvasContext.fillStyle = `hsl(${y / height * 100 + 275},100%,50%)`;
        canvasContext.fillRect(left, (height - y) / 2, barWidth, y);
        canvasContext.fillRect(right, (height - y) / 2, barWidth, y);
    })
}