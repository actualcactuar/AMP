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
export function getAudio(deviceId = 'default') {
    const audio = {
        echoCancellation: false,
        autoGainControl: false,
        noiseSupression: false,
        latency: 0,
        sampleRate: 48000,
        sampleSize: 16,
        deviceId
    }
    return navigator.mediaDevices.getUserMedia({ audio })
}

export function crispCanvas(visualizer) {
    visualizer.width = visualizer.clientWidth;
    visualizer.height = visualizer.clientHeight;
}

export function drawVisualizer(visualizer, analyzerNode) {
    if(analyzerNode.context.state !== 'running') return;
    requestAnimationFrame(drawVisualizer.bind(null, visualizer, analyzerNode));
    const bufferLength = analyzerNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyzerNode.getByteFrequencyData(dataArray);
    const width = Math.round(visualizer.width / 2);
    const height = visualizer.height;
    const barWidth = Math.round(width / bufferLength);
    const canvasContext = visualizer.getContext('2d');
    canvasContext.clearRect(0, 0, width * 2, height * 2);
    dataArray.forEach((item, index) => {
        const y = Math.round((item / 255) * (height / 2 )); // Items value range is between 0 - 255
        const left = Math.round(width - barWidth * index)
        const right = Math.round(width + barWidth * index);
        const hue = Math.round(y / height * 50 + 275)
        const h = Math.round((height - y) / 2);
        canvasContext.fillStyle = `hsl(${hue},100%,50%)`;
        canvasContext.fillRect(left, h, barWidth, y);
        canvasContext.fillRect(right, h, barWidth, y);
    })
}


// visualizer fftsize 32
export const drawVisualizerArc = (visualizer, analyzerNode) => {
    requestAnimationFrame(drawVisualizerArc.bind(null, visualizer, analyzerNode));
    const dataArray = new Uint8Array(analyzerNode.frequencyBinCount);
    analyzerNode.getByteFrequencyData(dataArray);
    const { width, height } = visualizer;
    const x = Math.round(width / 2);
    const y = Math.round(height / 2);
    const canvasContext = visualizer.getContext('2d');
    canvasContext.clearRect(0, 0, width * 2, height * 2);
    dataArray.forEach((item) => {
      const radius = Math.round((item / 255) * (x / 2));
      canvasContext.fillStyle = `rgba(255,255,255,0.1)`;
      canvasContext.beginPath();
      canvasContext.arc(x, y, radius, 0, 2 * Math.PI);
      canvasContext.fill();
    });
    // console.log(dataArray);
  };