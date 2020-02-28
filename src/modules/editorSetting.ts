import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import MusicBar, { IMusicBar, SectionPos } from './MusicBar';

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
	};
	barWidth: number;
	barPos: SectionPos;
}

export interface IUpdateBarPos {
	time: number;
	bpmChanges: {
		bpm: number;
		time: number;
	}[];
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
	barWidth: 4,
	barPos: {section: 0, pos: 24 / 2.5 - 2},
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
		updateBarPos: (state, action: PayloadAction<IUpdateBarPos>) => {
			const musicBarState: IMusicBar = {
				barWidth: state.barWidth,
				notesHeight: state.notesDisplay.notesWidth / state.notesDisplay.aspect,
				lines: state.notesDisplay.lines,
				intervalRatio: state.notesDisplay.intervalRatio,
				bpmChanges: action.payload.bpmChanges,
			};
			const musicBar = new MusicBar(musicBarState);
			state.barPos = musicBar.currentPosition(action.payload.time);
		},
	}
});

export default editorSettingModule;
