import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { cloneDeep } from 'lodash';
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
	bpmChanges: {bpm: number, time: number}[];
}

export type DifficlutySelect = 'easy' | 'normal' | 'hard';
export interface IMapStateParDifficulty {
	column: number;
	sectionLineCount: number;
	current: IMapState;
	easy: IMapState;
	normal: IMapState;
	hard: IMapState;
	historySize: number;
}

const initialNotesStatus = [NotesStatus.NONE, NotesStatus.NONE, NotesStatus.NONE, NotesStatus.NONE];

const initialMapState: IMapState = { bpm: 210, snap24: false, currentSection: 0, sectionLength: 4, lines: [], linesHistory: [], historyIndex: 0, bpmChanges: [{bpm: 210, time: 0}] };
for (let i = 0; i < 64; i++) {
	const lineState: INotesLineState = { status: [...initialNotesStatus], snap24: false, bpm: initialMapState.bpm };
	if (i === 0) {
		lineState.barLine = lineState.section = true;
		lineState.speed = 1.0;
	}
	initialMapState.lines.push(lineState);
}
initialMapState.linesHistory.push(initialMapState.lines);

const initialState: IMapStateParDifficulty = {
	column: 4,
	sectionLineCount: 16,
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
const adjustCurrentSection = (state: IMapStateParDifficulty, target: number) => {
	if (state.current.currentSection > state.current.sectionLength - state.column - target) {
		state.current.currentSection = state.current.sectionLength - state.column - target;
		if (state.current.currentSection < 0) {
			state.current.currentSection = 0;
		}
	}
}

const mapStateModule = createSlice({
	name: 'notesState',
	initialState: initialState,
	reducers: {
		changeNotesStatus: (state, action: PayloadAction<IChangeNotesStatus>) => {
			const line = action.payload.lineIndex;
			const lane = action.payload.laneIndex;
			state.current.lines[line].status[lane] = action.payload.newStatus;
			pushHistory(state.current, state.current.lines, state.historySize);
		},
		addSection: (state, action: PayloadAction<{ insertIndex: number, lines: number }>) => {
			const snap24 = state.current.snap24;

			for (let i = 0; i < action.payload.lines * (snap24 ? 1.5 : 1); i++) {
				const addLine: INotesLineState = { status: [...initialNotesStatus], snap24: snap24, bpm: state.current.lines[action.payload.insertIndex].bpm };
				state.current.lines.splice(action.payload.insertIndex + i, 0, addLine);
			}
			state.current.sectionLength++;
			pushHistory(state.current, state.current.lines, state.historySize);
		},
		removeSection: (state, action: PayloadAction<number[][]>) => {
			adjustCurrentSection(state, -1);
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
			state.current.sectionLength = assignSection(state.current.lines, state.sectionLineCount).length;
			adjustCurrentSection(state, 0);
		},
		redo: (state) => {
			state.current.historyIndex++;
			if (state.current.historyIndex > state.current.linesHistory.length - 1) {
				state.current.historyIndex = state.current.linesHistory.length - 1;
			}
			state.current.lines = state.current.linesHistory[state.current.historyIndex];
			state.current.sectionLength = assignSection(state.current.lines, state.sectionLineCount).length;
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
					bpm: mapState.lines[index].bpm,
				}
				mapState.lines.splice(startIndex + 1, 0, newLine);
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

// function getBpmChanges(mapState: IMapState) {
// 	let time = 0;
// 	const bpmChanges = [] as { bpm: number, time: number }[];
// 	for (let i = 1; i < mapState.lines.length; i++) {
// 		const line = mapState.lines[i - 1];
// 		if (line.bpm !== mapState.lines[i].bpm || i === 1) {
// 			bpmChanges.push({ bpm: line.bpm, time: time });
// 		}
// 		time += (line.snap24 ? 10 : 15) / line.bpm;
// 	}
// 	return bpmChanges;
// }
