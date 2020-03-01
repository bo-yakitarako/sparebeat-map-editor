import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import createSagaMiddleware from 'redux-saga'
import mapStateModule from './modules/editorModule';
import rootSaga from './modules/playMusic';

// const rootReducer = combineReducers({
// 	mapState: mapStateModule.reducer,
// });

const sagaMiddleware = createSagaMiddleware();
const setupStore = () => {
	const middlewares = [...getDefaultMiddleware(), sagaMiddleware];
	return configureStore({
		middleware: middlewares,
		reducer: mapStateModule.reducer
	});
};

const store = setupStore();
sagaMiddleware.run(rootSaga);

export default store;

export type AppState = ReturnType<typeof store.getState>;
