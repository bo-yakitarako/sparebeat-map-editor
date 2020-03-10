import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { bindShortcuts } from 'redux-shortcuts';
import createSagaMiddleware from 'redux-saga'
import editorModule from './modules/editorModule';
import rootSaga from './modules/music/playMusic';

const sagaMiddleware = createSagaMiddleware();
const setupStore = () => {
	const middlewares = [...getDefaultMiddleware(), sagaMiddleware];
	return configureStore({
		middleware: middlewares,
		reducer: editorModule.reducer
	});
};

const store = setupStore();
sagaMiddleware.run(rootSaga);
bindShortcuts(
	[['1', '8'], editorModule.actions.changeEditModeToAdd, true],
	[['2', '9'], editorModule.actions.changeEditModeToSelect, true],
	[['3', '0'], editorModule.actions.changeEditModeToMusic, true],
	[['q', 'i'], editorModule.actions.changeNotesModeToNormal, true],
	[['w', 'o'], editorModule.actions.changeNotesModeToAttack, true],
	[['a', 'k'], editorModule.actions.changeNotesModeToLongStart, true],
	[['s', 'l'], editorModule.actions.changeNotesModeToLongEnd, true],
	[['command+s', 'ctrl+s'], editorModule.actions.saveMap, true],
	[['command+z', 'ctrl+z'], editorModule.actions.undo, true],
	[['command+y', 'ctrl+y'], editorModule.actions.redo, true],
	[['command+c', 'ctrl+c'], editorModule.actions.copySelect, true],
	[['shift'], editorModule.actions.toggleMusic, true]
)(store.dispatch);

export default store;

export type AppState = ReturnType<typeof store.getState>;
