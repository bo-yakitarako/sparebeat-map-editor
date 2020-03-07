import { take, put, select, fork, cancel, cancelled, delay } from 'redux-saga/effects';
import editorModule from '../editorModule';
import { AppState } from '../../store';
import { stopMusic } from '../music/clapModule';

// const clapAmount = 16;
// const claps = [...Array(clapAmount)].map(() => new Audio('media/clap.mp3'));
const music = document.querySelector('#music') as HTMLAudioElement;
const sectionHeight = (state: AppState) => state.notesDisplay.sectionLineCount * 1.5 * state.notesDisplay.intervalRatio * state.notesDisplay.notesWidth / state.notesDisplay.aspect - (state.barWidth);

// function* clapAudio() {
// 	while (true) {
// 		try {
// 			const time = yield music.currentTime - (yield select((state: AppState) => state.startTime)) / 1000;
// 			const activeTime = yield select((state: AppState) => state[state.current].activeTime);
// 			const clapIndex = yield select((state: AppState) => state.clapIndex);
// 			if (clapIndex !== undefined && time > activeTime[clapIndex]) {
// 				const clap = new Audio('media/clap.mp3');
// 				clap.volume = (yield select((state: AppState) => state.sliderValue.clapVolume)) / 100;
// 				yield clap.play();
// 				yield put(editorModule.actions.updateClapIndex(time));
// 			}
// 			yield delay(10);
// 		} finally {
// 			if (yield cancelled()) {}
// 		}
// 	}
// }

function* playMusic() {
	while (true) {
		try {
			const time = yield music.currentTime;
			yield put(editorModule.actions.updateBarPos(time));
			const sectionIndex = yield select((state: AppState) => state.barPos.section);
			const { sectionLength, currentSection } = yield select((state: AppState) => state[state.current]);
			if (sectionIndex >= sectionLength) {
				const sectionPos = { section: sectionLength - 1, pos: yield select((state: AppState) => sectionHeight(state)) };
				yield put(editorModule.actions.pause());
				yield stopMusic();
				yield put(editorModule.actions.moveBarPos(sectionPos));
			} else {
				const column = yield select((state: AppState) => state.notesDisplay.column);
				if (sectionIndex >= currentSection + column) {
					yield put(editorModule.actions.moveSection(sectionIndex > sectionLength - column ? sectionLength - column : sectionIndex));
				}
			}
			yield delay(25);
		} finally {
			if (yield cancelled()) {}
		}
	}
}

export default function* rootSaga() {
	while (yield take(editorModule.actions.play.type)) {
		const playingTask = yield fork(playMusic);
		yield take(editorModule.actions.pause.type);
		yield cancel(playingTask);
	}
}