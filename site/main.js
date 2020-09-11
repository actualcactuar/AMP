import { buildOptions, getAudio } from './js/utils.js';

const volume = document.getElementById('volume');
const bass = document.getElementById('bass');
const mid = document.getElementById('mid');
const treble = document.getElementById('treble');
const visualizer = document.getElementById('visualizer');
const input = document.getElementById('input');
const output = document.getElementById('output');
const fftSize = 256
const context = new AudioContext();
const analyzerNode = new AnalyserNode(context, { fftSize })

async function getAudioIO() {
    const allDevices = await navigator.mediaDevices.enumerateDevices();
    const inputs = allDevices.filter(device => device.kind === 'audioinput')
    const outputs = allDevices.filter(device => device.kind === 'audiooutput')
    buildOptions('#input').from(inputs);
    buildOptions('#output').from(outputs);
}

function crispCanvas(){
    visualizer.width = visualizer.clientWidth * window.devicePixelRatio;
    visualizer.height = visualizer.clientHeight * window.devicePixelRatio;
}

function drawVisualizer() {
    requestAnimationFrame(drawVisualizer);

    const bufferLength = analyzerNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyzerNode.getByteFrequencyData(dataArray);
    const width = visualizer.width;
    const height = visualizer.height;
    const barWidth = Math.round(width / bufferLength);
    const cancvasContext = visualizer.getContext('2d');
    cancvasContext.clearRect(0, 0, width, height);
    dataArray.forEach((item, index) => {
        const y = item / fftSize * height / 2;
        const x = barWidth * index
        cancvasContext.fillStyle = `hsl(${y / height * 400},100%,50%)`;
        cancvasContext.fillRect(x, height - y, barWidth, y);
    })
}

async function setupAudioContext() {
    const audio = await getAudio();
    if (context.state === 'suspended') {
        await context.resume();
    }

    const source = context.createMediaStreamSource(audio);

    source
        .connect(analyzerNode)
        .connect(context.destination)
}



async function App() {
    crispCanvas();
    await getAudioIO()
    await setupAudioContext();
    drawVisualizer()

    window.onresize = crispCanvas;
}

App();