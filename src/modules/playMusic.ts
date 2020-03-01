import { take, put, fork, cancel, cancelled, delay } from 'redux-saga/effects';
import editorModule from './editorModule';

const music = (document.getElementById('music') as HTMLAudioElement);
export function* playMusic() {
	while (true) {
		try {
			const time = yield music.currentTime;
			yield put(editorModule.actions.updateBarPos(time));
			yield delay(0.01);
		} finally {
			if (yield cancelled()) {
				console.log('停止');
			}
		}
	}
}

export default function* rootSaga() {
	while (yield take(editorModule.actions.play.type)) {
		console.log('あほがいじ');
		const playingTask = yield fork(playMusic);
		yield take(editorModule.actions.pause.type);
		yield cancel(playingTask);
	}
}
