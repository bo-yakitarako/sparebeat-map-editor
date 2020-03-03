import { all, take, put, select, fork, cancel, cancelled, delay } from 'redux-saga/effects';
import editorModule from './editorModule';
import { AppState } from '../store';

const music = (document.getElementById('music') as HTMLAudioElement);
const clapAmount = 16;
const claps = [...Array(clapAmount)].map(() => new Audio('media/clap.mp3'));

const sectionHeight = (state: AppState) => state.notesDisplay.sectionLineCount * 1.5 * state.notesDisplay.intervalRatio * state.notesDisplay.notesWidth / state.notesDisplay.aspect - (state.barWidth);

function* clapAudio() {
	while (true) {
		try {
			const time = yield music.currentTime - (yield select((state: AppState) => state.startTime)) / 1000;
			const activeTime = yield select((state: AppState) => state.current.activeTime);
			const clapIndex = yield select((state: AppState) => state.clapIndex);
			if (clapIndex !== undefined && time > activeTime[clapIndex]) {
				claps[clapIndex % clapAmount].volume = (yield select((state: AppState) => state.sliderValue.clapVolume)) / 100;
				yield claps[clapIndex % clapAmount].play();
				yield put(editorModule.actions.updateClapIndex(time));
			}
			yield delay(10);
		} finally {
			if (yield cancelled()) {}
		}
	}
}

function* playMusic() {
	while (true) {
		try {
			const time = yield music.currentTime;
			yield put(editorModule.actions.updateBarPos(time));
			const sectionIndex = yield select((state: AppState) => state.barPos.section);
			const sectionLength = yield select((state: AppState) => state.current.sectionLength);
			if (sectionIndex >= sectionLength) {
				const sectionPos = { section: sectionLength - 1, pos: yield select((state: AppState) => sectionHeight(state)) };
				music.pause();
				yield put(editorModule.actions.moveBarPos(sectionPos));
				yield put(editorModule.actions.pause());
			} else {
				const currentSection = yield select((state: AppState) => state.current.currentSection);
				const column = yield select((state: AppState) => state.notesDisplay.column);
				if (sectionIndex >= currentSection + column) {
					yield put(editorModule.actions.moveSection(sectionIndex > sectionLength - column ? sectionLength - column : sectionIndex));
				}
			}
			yield delay(10);
		} finally {
			if (yield cancelled()) {}
		}
	}
}

export default function* rootSaga() {
	while (yield take(editorModule.actions.play.type)) {
		const playingTask = yield all([
			fork(playMusic),
			fork(clapAudio),
		]);
		yield take(editorModule.actions.pause.type);
		yield cancel(playingTask);
	}
}
