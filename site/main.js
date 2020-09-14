import { buildOptions, getAudio, drawVisualizer, crispCanvas } from './js/utils.js';

// DOM
const volume = document.getElementById('volume');
const bass = document.getElementById('bass');
const mid = document.getElementById('mid');
const treble = document.getElementById('treble');
const visualizer = document.getElementById('visualizer');
const fftForm = document.getElementById('fftForm');
const inputSource = document.getElementById('input');
const output = document.getElementById('output');
const mediaSources = new Map();

// AUDIO CONTEXT
const fftSize = 1024
const context = new AudioContext();
const analyzerNode = new AnalyserNode(context, { fftSize })
const gainNode = new GainNode(context, { gain: volume.value })
const bassEQ = new BiquadFilterNode(context, {
    frequency: 500,
    type: 'lowshelf',
    gain: bass.value
})
const midEQ = new BiquadFilterNode(context, {
    frequency: 500,
    type: 'peaking',
    Q: Math.SQRT1_2, // no overlap between treble or bass
    gain: mid.value
})
const trebleEQ = new BiquadFilterNode(context, {
    frequency: 3000,
    type: 'highshelf',
    gain: treble.value
})

window.test = context;


function setEventListeners() {
    window.onresize = crispCanvas;
    volume.oninput = event => {
        const value = parseFloat(event.target.value);
        gainNode.gain.setTargetAtTime(value, context.currentTime, 0.1)
    }
    bass.oninput = event => {
        const value = parseInt(event.target.value);
        bassEQ.gain.setTargetAtTime(value, context.currentTime, 0.1)
    }
    mid.oninput = event => {
        const value = parseInt(event.target.value);
        midEQ.gain.setTargetAtTime(value, context.currentTime, 0.1)
    }
    treble.oninput = event => {
        const value = parseInt(event.target.value);
        trebleEQ.gain.setTargetAtTime(value, context.currentTime, 0.1)
    }
    fftForm.oninput = event => {
        const form = event.target.closest('form');
        const { fftIncrement, fftBaseValue } = Object.fromEntries(new FormData(form))
        const base = parseInt(fftBaseValue);
        const increment = parseInt(fftIncrement);
        const outputValue = Math.round(base * Math.pow(2, increment));
        analyzerNode.fftSize = outputValue;
        console.log({ outputValue })
    }
    inputSource.onchange = event => {
        const deviceId = event.target.value;

        for (const source of mediaSources.values()) {
            source.disconnect();
        }

        setupAudioContext(deviceId);
    }
}

async function getAudioIO() {
    const allDevices = await navigator.mediaDevices.enumerateDevices();
    const inputs = allDevices.filter(device => device.kind === 'audioinput')
    const outputs = allDevices.filter(device => device.kind === 'audiooutput')
    buildOptions('#input').from(inputs);
    buildOptions('#output').from(outputs);
}

async function setupAudioContext(deviceId = "default") {
    const audio = await getAudio(deviceId);

    if (context.state === 'suspended') {
        await context.resume();
    }
    const source = context.createMediaStreamSource(audio);
    source
        .connect(trebleEQ)
        .connect(midEQ)
        .connect(bassEQ)
        .connect(gainNode)
        .connect(analyzerNode)
        .connect(context.destination)

    mediaSources.set(deviceId, source);
}

async function App() {
    await getAudioIO();
    await setupAudioContext();
    drawVisualizer(visualizer, analyzerNode);
    crispCanvas(visualizer);
    setEventListeners();
}

App();