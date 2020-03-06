const context = new AudioContext();
let clapBuffer: AudioBuffer | undefined = undefined;
let clapSrcList: AudioBufferSourceNode[] = [];

window.addEventListener('load', () => {
	const xhr = new XMLHttpRequest();
	xhr.open('GET', 'media/clap.mp3', true);
	xhr.responseType = 'arraybuffer';
	xhr.onload = () => {
		context.decodeAudioData(xhr.response, (buffer) => {
			clapBuffer = buffer;
		});
	};
	xhr.send();
});

function clapOnce(time: number, gainNode: GainNode) {
	if (clapBuffer !== undefined) {
		const source = context.createBufferSource();
		source.buffer = clapBuffer;
		source.connect(context.destination);
		source.connect(gainNode);
		source.start(context.currentTime + time);
		clapSrcList.push(source);
	}
}

export function stopClap() {
	clapSrcList.forEach(value => { value.stop() });
	clapSrcList = [];
}

export function clapActiveTime(activeTimes: { count: number, time: number }[], currentTime:number, startTime: number, ratioSliderValue: number, volumeSliderValue: number) {
	if (volumeSliderValue !== 0) {
		const gainNode = context.createGain();
		gainNode.connect(context.destination);
		const ratio = ratioSliderValue / 100;
		gainNode.gain.value = 2 * (volumeSliderValue / 100) - 1;
		currentTime -= startTime / 1000;
		activeTimes.filter(activeTimeObject => activeTimeObject.time > currentTime).forEach(activeTimeObject => {
			const clapTime = (activeTimeObject.time - currentTime) / ratio;
			[...Array(activeTimeObject.count)].forEach(() => { clapOnce(clapTime, gainNode) });
		});
	}
}