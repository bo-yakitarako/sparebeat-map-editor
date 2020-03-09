const context = new AudioContext();
let clapBuffer: AudioBuffer | undefined = undefined;
let clapSrcList: AudioBufferSourceNode[] = [];
let clapGain: GainNode | undefined = undefined;

const dom = document.querySelector('#music') as HTMLAudioElement;
export default dom;
const musicSource = context.createMediaElementSource(dom);
musicSource.connect(context.destination);

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

// export function playMusic(currentTime: number) {
// 	dom.currentTime = currentTime;
// 	dom.play();
// }

function clapOnce(time: number) {
	if (clapBuffer !== undefined) {
		const source = context.createBufferSource();
		source.buffer = clapBuffer;
		source.connect(context.destination);
		source.connect(clapGain as GainNode);
		source.start(context.currentTime + time);
		clapSrcList.push(source);
	}
}

export function stopMusic() {
	clapSrcList.forEach(value => { value.stop() });
	dom.pause();
	clapSrcList = [];
	clapGain = undefined;
}

export function clapActiveTime(activeTimes: { count: number, time: number }[], startTime: number, ratioSliderValue: number, volumeSliderValue: number) {
	if (volumeSliderValue !== 0) {
		clapGain = context.createGain();
		clapGain.connect(context.destination);
		const ratio = ratioSliderValue / 100;
		clapGain.gain.value = 2 * (volumeSliderValue / 100) - 1;
		const currentTime = dom.currentTime - startTime / 1000;
		const filtered = activeTimes.filter(activeTimeObject => activeTimeObject.time > currentTime);
		filtered.forEach(activeTimeObject => {
			const clapTime = (activeTimeObject.time - currentTime) / ratio;
			[...Array(activeTimeObject.count)].forEach(() => { clapOnce(clapTime) });
		});
	}
}

export function changeClapVolume(volumeSliderValue: number) {
	if (clapGain !== undefined) {
		clapGain.gain.value = 2 * (volumeSliderValue / 100) - 1;
	}
}
