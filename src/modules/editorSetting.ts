import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type EditMode = 'add' | 'remove' | 'music';
export type NotesMode = 'normal' | 'attack' | 'longStart' | 'longEnd';
interface IEditorSettingState {
	themeBlack: boolean;
	loaded: boolean;
	editMode: EditMode;
	notesMode: NotesMode;
	notesDisplay: {
		notesWidth: number;
		lines: number;
		column: number;
		intervalRatio: number;
		aspect: number;
	}
}

const initialState: IEditorSettingState = {
	themeBlack: true,
	loaded: true,
	editMode: 'add',
	notesMode: 'normal',
	notesDisplay: {
		notesWidth: 48,
		lines: 16,
		column: 4,
		intervalRatio: 1.0,
		aspect: 2.5,
	},
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
		},
		changeEditMode: (state, action: PayloadAction<EditMode>) => {
			state.editMode = action.payload;
		},
		changeNotesMode: (state, action: PayloadAction<NotesMode>) => {
			state.notesMode = action.payload;
		},
	}
});

export default editorSettingModule;
