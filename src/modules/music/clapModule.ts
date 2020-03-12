const context = new AudioContext();
let clapBuffer: AudioBuffer | undefined = undefined;
let clapSrcList: AudioBufferSourceNode[] = [];
let clapGain: GainNode | undefined = undefined;

const dom = document.querySelector('#music') as HTMLAudioElement;
const musicSource = context.createMediaElementSource(dom);
musicSource.connect(context.destination);
export default musicSource.mediaElement;

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

const onTouch = () => {
	document.removeEventListener('touchstart', onTouch);
	const emptySource = context.createBufferSource();
	emptySource.start();
	emptySource.stop();
};
window.addEventListener('touchstart', onTouch);
const eventName = typeof document.ontouchend !== 'undefined' ? 'touchend' : 'mouseup';
const initAudioContext = () => {
	document.removeEventListener(eventName, initAudioContext);
	context.resume();
};
window.addEventListener(eventName, initAudioContext);

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

export function clapActiveTime(activeTimes: { count: number, time: number }[], startTime: number, clapDelay: number, ratioSliderValue: number, volumeSliderValue: number) {
	if (volumeSliderValue !== 0) {
		const timeAtClapStart = context.currentTime;
		clapGain = context.createGain();
		clapGain.connect(context.destination);
		const ratio = ratioSliderValue / 100;
		clapGain.gain.value = 2 * (volumeSliderValue / 100) - 1;
		const currentTime = dom.currentTime - (startTime - clapDelay) / 1000;
		const filtered = activeTimes.filter(activeTimeObject => activeTimeObject.time > currentTime);
		filtered.forEach(activeTimeObject => {
			const delay = context.currentTime - timeAtClapStart;
			const clapTime = (activeTimeObject.time - currentTime - delay) / ratio;
			[...Array(activeTimeObject.count)].forEach(() => { clapOnce(clapTime) });
		});
	}
	musicSource.mediaElement.play();
}

export function changeClapVolume(volumeSliderValue: number) {
	if (clapGain !== undefined) {
		clapGain.gain.value = 2 * (volumeSliderValue / 100) - 1;
	}
}
