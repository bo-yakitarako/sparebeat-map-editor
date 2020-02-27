import { combineReducers, configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import editorSetting from './modules/editorSetting';
import mapStateModule from './modules/mapState';

const rootReducer = combineReducers({
	editorSetting: editorSetting.reducer,
	mapState: mapStateModule.reducer,
});

const setupStore = () => {
	const middlewares = [...getDefaultMiddleware()];
	return configureStore({
		middleware: middlewares,
		reducer: rootReducer
	});
};

const store = setupStore();
export default store;

export type AppState = ReturnType<typeof store.getState>;
