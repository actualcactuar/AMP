import { buildOptions, getAudio, drawVisualizer, crispCanvas } from './js/utils.js';

// DOM
const volume = document.getElementById('volume');
const bass = document.getElementById('bass');
const mid = document.getElementById('mid');
const treble = document.getElementById('treble');
const visualizer = document.getElementById('visualizer');
const fftForm = document.getElementById('fftForm');
// const inputSource = document.getElementById('input');
const oscillatorTone = document.getElementById('oscillatorTone');
const oscillatorType = document.getElementById('oscillatorType');
const start = document.getElementById('start');
const stop = document.getElementById('stop');
const mediaSources = new Map();

// AUDIO CONTEXT
const fftSize = 128;
const context = new AudioContext();
context.suspend();
const analyzerNode = new AnalyserNode(context, { fftSize })
const gainNode = new GainNode(context, { gain: volume.value })
const oscillatorNode = new OscillatorNode(context, { frequency: oscillatorTone.value, type: oscillatorType.value })
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
    // inputSource.onchange = event => {
    //     const deviceId = event.target.value;

    //     for (const source of mediaSources.values()) {
    //         source.disconnect();
    //     }

    //     setupAudioContext(deviceId);
    // }
    oscillatorTone.onchange = event => {
        const herz = parseFloat(event.target.value);
        oscillatorNode.frequency.setValueAtTime(herz, context.currentTime);
    }

    oscillatorType.onchange = event => {
        const type = event.target.value;
        oscillatorNode.type = type;
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
    // const audio = await getAudio(deviceId);
    // const source = context.createMediaStreamSource(audio);
    oscillatorNode
        .connect(trebleEQ)
        .connect(midEQ)
        .connect(bassEQ)
        .connect(gainNode)
        .connect(analyzerNode)
        .connect(context.destination)

    oscillatorNode.start(0);

    // mediaSources.set(deviceId, source);
}

async function App() {
    if (context.state === 'suspended') {
        await context.resume();
    }
    await setupAudioContext();
    // await getAudioIO();
    drawVisualizer(visualizer, analyzerNode);
    crispCanvas(visualizer);
    setEventListeners();
    stop.disabled = false;
    start.disabled = true;
}

stop.disabled = true;
start.onclick = App
stop.onclick = () => {
    oscillatorNode.stop(0);
    oscillatorNode.disconnect();
    context.close();
    stop.disabled = true;
}