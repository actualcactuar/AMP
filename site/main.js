import { buildOptions, getAudio, drawVisualizer, crispCanvas } from './js/utils.js';

const volume = document.getElementById('volume');
const bass = document.getElementById('bass');
const mid = document.getElementById('mid');
const treble = document.getElementById('treble');
const visualizer = document.getElementById('visualizer');
const input = document.getElementById('input');
const output = document.getElementById('output');
const fftSize = 512
const context = new AudioContext();
const analyzerNode = new AnalyserNode(context, { fftSize })

async function getAudioIO() {
    const allDevices = await navigator.mediaDevices.enumerateDevices();
    const inputs = allDevices.filter(device => device.kind === 'audioinput')
    const outputs = allDevices.filter(device => device.kind === 'audiooutput')
    buildOptions('#input').from(inputs);
    buildOptions('#output').from(outputs);
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
    await getAudioIO();
    await setupAudioContext();
    drawVisualizer(visualizer,analyzerNode);
    crispCanvas(visualizer);
    window.onresize = crispCanvas;
}

App();