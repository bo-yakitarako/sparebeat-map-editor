import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { cloneDeep } from 'lodash';
import MusicBar, { SectionPos } from './MusicBar';
import { NotesStatus } from '../components/map/Notes';
import { IChangeNotesStatus } from '../components/map/notesUnit/Line';

export interface INotesLineState {
	status: NotesStatus[];
	snap24: boolean;
	bpm: number;
	section?: boolean;
	speed?: number;
	barLine?: boolean;
}

export interface IMapState {
	bpm: number;
	snap24: boolean;
	currentSection: number;
	sectionLength: number;
	lines: INotesLineState[];
	linesHistory: INotesLineState[][];
	historyIndex: number;
	bpmChanges: { bpm: number, time: number }[];
}

export type DifficlutySelect = 'easy' | 'normal' | 'hard';
export type EditMode = 'add' | 'remove' | 'music';
export type NotesMode = 'normal' | 'attack' | 'longStart' | 'longEnd';
export interface IEditorState {
	themeBlack: boolean;
	loaded: boolean;
	editMode: EditMode;
	notesMode: NotesMode;
	notesDisplay: {
		notesWidth: number;
		sectionLineCount: number;
		column: number;
		intervalRatio: number;
		aspect: number;
	};
	barWidth: number;
	playing: boolean;
	barPos: SectionPos;
	startTime: number;
	currentTime: number;
	current: IMapState;
	easy: IMapState;
	normal: IMapState;
	hard: IMapState;
	historySize: number;
}

const initialNotesStatus = [NotesStatus.NONE, NotesStatus.NONE, NotesStatus.NONE, NotesStatus.NONE];

const initialBpm = 210;
const initialMapState: IMapState = { bpm: initialBpm, snap24: false, currentSection: 0, sectionLength: 4, lines: [], linesHistory: [], historyIndex: 0, bpmChanges: [] };
for (let i = 0; i < 64; i++) {
	const lineState: INotesLineState = { status: [...initialNotesStatus], snap24: false, bpm: initialBpm, barLine: i % 16 === 0 ? true : undefined };
	if (i === 0) {
		lineState.barLine = lineState.section = true;
		lineState.speed = 1.0;
	}
	initialMapState.lines.push(lineState);
}
initialMapState.linesHistory.push(initialMapState.lines);
initialMapState.bpmChanges = getBpmChanges(initialMapState);

const initialState: IEditorState = {
	themeBlack: true,
	loaded: true,
	editMode: 'add',
	notesMode: 'normal',
	notesDisplay: {
		notesWidth: 48,
		sectionLineCount: 16,
		column: 4,
		intervalRatio: 1.0,
		aspect: 2.5,
	},
	barWidth: 4,
	barPos: { section: 0, pos: 24 / 2.5 - 2 },
	playing: false,
	startTime: 0,
	currentTime: 0.0,
	current: initialMapState,
	easy: initialMapState,
	normal: cloneDeep<IMapState>(initialMapState),
	hard: cloneDeep<IMapState>(initialMapState),
	historySize: 50,
};

const pushHistory = (state: IMapState, notesLineState: INotesLineState[], historySize: number): void => {
	if (state.historyIndex < state.linesHistory.length - 1) {
		state.linesHistory = state.linesHistory.slice(0, state.historyIndex + 1);
	}
	state.historyIndex = state.linesHistory.push(notesLineState) - 1;
	if (state.linesHistory.length > historySize) {
		state.linesHistory = state.linesHistory.slice(state.linesHistory.length - historySize);
		state.historyIndex = historySize - 1;
	}
};
const adjustCurrentSection = (state: IEditorState, target: number) => {
	if (state.current.currentSection > state.current.sectionLength - state.notesDisplay.column - target) {
		state.current.currentSection = state.current.sectionLength - state.notesDisplay.column - target;
		if (state.current.currentSection < 0) {
			state.current.currentSection = 0;
		}
	}
}

const mapStateModule = createSlice({
	name: 'notesState',
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
		play: (state) => {
			state.playing = true;
		},
		pause: (state) => {
			state.playing = false;
		},
		updateBarPos: (state, action: PayloadAction<number>) => {
			state.currentTime = action.payload;
			const musicBar = new MusicBar(state, state.current.bpmChanges);
			state.barPos = musicBar.currentPosition(action.payload);
		},
		moveBarPos: (state, action: PayloadAction<SectionPos>) => {
			state.barPos = action.payload;
		},
		updateCurrentTime: (state, action: PayloadAction<number>) => {
			state.currentTime = action.payload;
		},
		changeNotesStatus: (state, action: PayloadAction<IChangeNotesStatus>) => {
			const line = action.payload.lineIndex;
			const lane = action.payload.laneIndex;
			const status = state.current.lines[line].status[lane];
			if (action.payload.newStatus === NotesStatus.NONE && (status === NotesStatus.LONG_START || status ===  NotesStatus.LONG_END)) {
				deleteLongNotes(action.payload, state.current.lines);
			} else {
				if (action.payload.newStatus === NotesStatus.LONG_START || action.payload.newStatus === NotesStatus.LONG_END) {
					connectLongNotes(action.payload, state.current.lines);
				}
				state.current.lines[line].status[lane] = action.payload.newStatus;
			}
			pushHistory(state.current, state.current.lines, state.historySize);
		},
		addSection: (state, action: PayloadAction<{ sectionIndex: number, insertIndex: number, lines: number }>) => {
			const snap24 = state.current.snap24;
			for (let i = 0; i < action.payload.lines * (snap24 ? 1.5 : 1); i++) {
				const addLine: INotesLineState = { status: [...initialNotesStatus], snap24: snap24, bpm: state.current.lines[action.payload.insertIndex].bpm, barLine: i === 0 ? true : undefined };
				state.current.lines.splice(action.payload.insertIndex + i + 1, 0, addLine);
			}
			state.current.sectionLength++;
			if (state.current.currentSection + state.notesDisplay.column - 1 === action.payload.sectionIndex && state.current.sectionLength > state.notesDisplay.column) {
				state.current.currentSection++;
			}
			pushHistory(state.current, state.current.lines, state.historySize);
		},
		removeSection: (state, action: PayloadAction<number[][]>) => {
			adjustCurrentSection(state, 1);
			removeSection(state.current, action.payload);
			state.current.sectionLength--;
			pushHistory(state.current, state.current.lines, state.historySize);
		},
		changeSnap: (state) => {
			changeWholeBeatSnap(state.current);
		},
		setupBpm: (state, action: PayloadAction<number>) => {
			state.current.bpm = action.payload;
		},
		moveSection: (state, action: PayloadAction<number>) => {
			state.current.currentSection = action.payload;
		},
		changeDifficulty: (state, action: PayloadAction<DifficlutySelect>) => {
			state.current = state[action.payload];
		},
		undo: (state) => {
			state.current.historyIndex--;
			if (state.current.historyIndex < 0) {
				state.current.historyIndex = 0;
			}
			state.current.lines = state.current.linesHistory[state.current.historyIndex];
			state.current.sectionLength = assignSection(state.current.lines, state.notesDisplay.sectionLineCount).length;
			adjustCurrentSection(state, 0);
		},
		redo: (state) => {
			state.current.historyIndex++;
			if (state.current.historyIndex > state.current.linesHistory.length - 1) {
				state.current.historyIndex = state.current.linesHistory.length - 1;
			}
			state.current.lines = state.current.linesHistory[state.current.historyIndex];
			state.current.sectionLength = assignSection(state.current.lines, state.notesDisplay.sectionLineCount).length;
			adjustCurrentSection(state, 0);
		},
	}
});

export default mapStateModule;

const isActiveLine = (line: INotesLineState) => {
	for (const notes of line.status) {
		if (notes < 4) {
			return true;
		}
	}
	return false;
};

function changeWholeBeatSnap(mapState: IMapState) {
	mapState.snap24 = !mapState.snap24;
	let index = 0;
	while (index < mapState.lines.length) {
		index = changeBeatSnap(mapState, index);
	}
}

function changeBeatSnap(mapState: IMapState, startIndex: number) {
	let index = startIndex;
	if (mapState.snap24 === mapState.lines[index].snap24) {
		index += mapState.snap24 ? 3 : 2;
	} else {
		if (mapState.snap24) {
			if (!isActiveLine(mapState.lines[index + 1])) {
				mapState.lines[index].snap24 = mapState.lines[index + 1].snap24 = true;
				const newLine: INotesLineState = {
					status: [NotesStatus.NONE, NotesStatus.NONE, NotesStatus.NONE, NotesStatus.NONE],
					snap24: true,
					bpm: mapState.lines[index + 1].bpm,
				}
				mapState.lines.splice(index + 1, 0, newLine);
				index += 3;
			} else {
				index += 2;
			}
		} else {
			if (!isActiveLine(mapState.lines[index + 1]) && !isActiveLine(mapState.lines[index + 2])) {
				mapState.lines[index].snap24 = mapState.lines[index + 1].snap24 = false;
				mapState.lines.splice(index + 2, 1);
				index += 2;
			} else {
				index += 3;
			}
		}
	}
	return index;
}

export function assignSection(lineStates: INotesLineState[], sectionLinesCount: number) {
	const halfBeatsInSection = sectionLinesCount / 2;
	const sections: number[][][] = [];
	let index = 0;
	while (index < lineStates.length) {
		const assignedHalfBeatsResult = assignHalfBeats(lineStates, index, halfBeatsInSection);
		sections.push(assignedHalfBeatsResult.halfBeats);
		index = assignedHalfBeatsResult.nextIndex;
	}
	return sections;
}

function assignHalfBeats(lineStates: INotesLineState[], startIndex: number, halfBeatsInSection: number) {
	let index = startIndex;
	const halfBeats: number[][] = [];
	let halfBeat: number[] = [];
	while (halfBeats.length < halfBeatsInSection && index < lineStates.length) {
		halfBeat.push(index);
		if ((halfBeat.length === 2 && !lineStates[index].snap24) || halfBeat.length > 2) {
			halfBeats.push(halfBeat);
			halfBeat = [];
		}
		index++;
	}
	return { halfBeats: halfBeats, nextIndex: index };
}

function removeSection(state: IMapState, halfBeats: number[][]) {
	const startIndex = halfBeats[0][0];
	const endBeat = halfBeats[halfBeats.length - 1];
	const endIndex = endBeat[endBeat.length - 1];
	state.lines = state.lines.filter((value, index) => index < startIndex || endIndex < index);
}

function getBpmChanges(mapState: IMapState) {
	let time = 0;
	const bpmChanges = [{bpm: mapState.lines[0].bpm, time: 0}] as { bpm: number, time: number }[];
	for (let i = 1; i < mapState.lines.length; i++) {
		const line = mapState.lines[i - 1];
		time += (line.snap24 ? 10 : 15) / line.bpm;
		if (line.bpm !== mapState.lines[i].bpm) {
			bpmChanges.push({ bpm: mapState.lines[i].bpm, time: time });
		}
	}
	return bpmChanges;
}

const turnInvalid = (lane: number, edge1: number, edge2: number, lines: INotesLineState[]) => {
	const last = edge1 < edge2 ? edge2 : edge1;
	for (let line = (edge1 < edge2 ? edge1 : edge2) + 1; line < last; line++) {
		lines[line].status[lane] = NotesStatus.INVALID;
	}
};

const findLnEdgeAndTurnInvalid = (connectTarget: NotesStatus, lineIndex: number, laneIndex: number, lines: INotesLineState[], dir: 1 | -1) => {
	for (let index = lineIndex + dir; index < lines.length && index >= 0; index += dir) {
		const status = lines[index].status[laneIndex];
		if (status === connectTarget) {
			turnInvalid(laneIndex, lineIndex, index, lines);
			break;
		} else if (status !== NotesStatus.NONE) {
			break;
		}
	}
};

function connectLongNotes(change: IChangeNotesStatus, lines: INotesLineState[]) {
	const connectTarget = change.newStatus === NotesStatus.LONG_START ? NotesStatus.LONG_END : NotesStatus.LONG_START;
	const dir = change.newStatus === NotesStatus.LONG_START ? 1 : -1;
	findLnEdgeAndTurnInvalid(connectTarget, change.lineIndex, change.laneIndex, lines, dir);
}

function deleteLongNotes(change: IChangeNotesStatus, lines: INotesLineState[]) {
	const currentStatus = lines[change.lineIndex].status[change.laneIndex];
	const newLnPossibility = 0 < change.lineIndex && change.lineIndex < lines.length - 1 && (
		(currentStatus === NotesStatus.LONG_START && lines[change.lineIndex + 1].status[change.laneIndex] === NotesStatus.INVALID) || 
		(currentStatus === NotesStatus.LONG_END && lines[change.lineIndex - 1].status[change.laneIndex] === NotesStatus.INVALID)
	);
	const dir = newLnPossibility ? (currentStatus === NotesStatus.LONG_START ? -1 : 1) : undefined;
	lines[change.lineIndex].status[change.laneIndex] = NotesStatus.NONE;
	if (dir) {
		const removeDir = dir < 0 ? 1 : -1;
		findLnEdgeAndTurnInvalid(currentStatus, change.lineIndex + removeDir, change.laneIndex, lines, dir);
		if (lines[change.lineIndex].status[change.laneIndex] === NotesStatus.NONE) {
			for (let i = change.lineIndex + removeDir; lines[i].status[change.laneIndex] === NotesStatus.INVALID; i += removeDir) {
				lines[i].status[change.laneIndex] = NotesStatus.NONE;
			}
		}
	}
}
