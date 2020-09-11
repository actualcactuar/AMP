async function getAudioIO () {
    const allDevices = await navigator.mediaDevices.enumerateDevices();
    console.log(allDevices)
}

getAudioIO()