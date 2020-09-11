import { buildOptions } from './js/utils.js';

async function getAudioIO() {
    const allDevices = await navigator.mediaDevices.enumerateDevices();
    const inputs = allDevices.filter(device => device.kind === 'audioinput')
    const outputs = allDevices.filter(device => device.kind === 'audiooutput')
    buildOptions('#input').from(inputs);
    buildOptions('#output').from(outputs);
}

getAudioIO()