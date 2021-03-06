import { take, put, select, fork, cancel, cancelled, delay } from 'redux-saga/effects';
import editorModule from '../editorModule';
import { AppState } from '../../store';
import music from '../music/clapModule';

const sectionHeight = (state: AppState) => state.notesDisplay.sectionLineCount * 1.5 * state.notesDisplay.intervalRatio * state.notesDisplay.notesWidth / state.notesDisplay.aspect - (state.barWidth);
function* playMusic() {
	while (true) {
		try {
			yield put(editorModule.actions.updateBarPos(yield music.currentTime));
			const sectionIndex = yield select((state: AppState) => state.barPos.section);
			const { sectionLength, currentSection } = yield select((state: AppState) => state[state.current]);
			if (sectionIndex >= sectionLength) {
				const sectionPos = { section: sectionLength - 1, pos: yield select((state: AppState) => sectionHeight(state)) };
				yield put(editorModule.actions.moveBarPos(sectionPos));
				yield put(editorModule.actions.toggleMusic());
			} else {
				const column = yield select((state: AppState) => state.notesDisplay.column);
				if (sectionIndex >= currentSection + column) {
					yield put(editorModule.actions.moveSection(sectionIndex > sectionLength - column ? sectionLength - column : sectionIndex));
				}
			}
			yield delay(20);
		} finally {
			if (yield cancelled()) {}
		}
	}
}

export default function* rootSaga() {
	while (yield take(editorModule.actions.toggleMusic.type)) {
		const playingTask = yield fork(playMusic);
		yield take(editorModule.actions.toggleMusic.type);
		yield cancel(playingTask);
	}
}
