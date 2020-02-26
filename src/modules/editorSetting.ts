import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IEditorSettingState {
	themeBlack: boolean;
	loaded: boolean;
	notesDisplay: {
		notesWidth: number;
		lines: number;
		column: number;
	}
}

const initialState: IEditorSettingState = {
	themeBlack: false,
	loaded: true,
	notesDisplay: {
		notesWidth: 48,
		lines: 16,
		column: 4,
	}
}

const editorSettingModule = createSlice({
	name: 'editorSetting',
	initialState: initialState,
	reducers: {
		changeTheme: (state, action: PayloadAction<boolean>) => {
			state.themeBlack = action.payload;
		},
		load: (state) => {
			state.loaded = true;
		}
	}
});

export default editorSettingModule;
