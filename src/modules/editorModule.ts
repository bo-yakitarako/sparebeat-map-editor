import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import MusicBar, { SectionPos } from './MusicBar';
import { NotesStatus } from '../components/map/Notes';
import { IChangeNotesStatus } from '../components/map/notesUnit/Line';
import SparebeatJsonLoader from './mapConvert/SparebeatJsonLoader';
import testJson from './mapConvert/testJson';

export type NotesOption = 'inBind' | 'bpm' | 'speed' | 'barLine' | 'barLineState';
export interface INotesLineState {
	status: NotesStatus[];
	snap24: boolean;
	inBind: boolean;
	bpm: number;
	speed: number;
	barLine: boolean;
	barLineState: boolean;
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
	activeTime: number[];
}

export interface ISelectRange {
	lane: {
		start: number;
		end: number;
	};
	line: {
		start: number;
		end: number;
	}
};
export interface ICopyObject {
	sectionIndex: number;
	lineIndex: number;
	object: {
		lane: number; 
		status: NotesStatus;
	}[];
}

export type DifficlutySelect = 'easy' | 'normal' | 'hard';
export type EditMode = 'add' | 'select' | 'music';
export type NotesMode = 'normal' | 'attack' | 'longStart' | 'longEnd';
export type Slider = 'timePosition' | 'playbackRate' | 'musicVolume' | 'clapVolume';
export interface IEditorState {
	themeDark: boolean;
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
	sliderValue: {
		timePosition: number;
		playbackRate: number;
		musicVolume: number;
		clapVolume: number;
	};
	temporaryNotesOption: {
		bpm: number;
		speed: number;
		barLine: boolean;
		barLineState: boolean;
		inBind: boolean;
	};
	selector: {
		baseX: number;
		baseY: number;
		x: number;
		y: number;
		width: number;
		height: number;
	};
	rangeSelect: {
		select: ISelectRange[];
		copy: ICopyObject[];
	};
	info: {
		title: string;
		artist: string;
		url: string;
		level: {
			easy: number | string;
			normal: number | string;
			hard: number | string;
		};
		bgColor: string[];
	};
	startTime: number;
	currentTime: number;
	clapIndex: number | undefined;
	current: DifficlutySelect;
	easy: IMapState;
	normal: IMapState;
	hard: IMapState;
	historySize: number;
}

const initialSectionCount = 16;
const loader = new SparebeatJsonLoader(testJson);
const { title, beats, startTime, level, artist, url, bgColor } = loader.info;
// const initialMapState: IMapState = { bpm: initialBpm, snap24: false, currentSection: 0, sectionLength: 4, lines: [], linesHistory: [], historyIndex: 0, bpmChanges: [], activeTime: [] };
// for (let i = 0; i < 4 * initialSectionCount; i++) {
// 	const lineState: INotesLineState = { status: [...initialNotesStatus], inBind: false, snap24: false, bpm: initialBpm, barLine: i % initialSectionCount === 0, speed: 1.0, barLineState: true };
// 	initialMapState.lines.push(lineState);
// }
// initialMapState.linesHistory.push(initialMapState.lines);
// initialMapState.bpmChanges = getBpmChanges(initialMapState.lines);

const initialState: IEditorState = {
	themeDark: true,
	loaded: true,
	editMode: 'add',
	notesMode: 'normal',
	notesDisplay: {
		notesWidth: 48,
		sectionLineCount: beats !== undefined ? beats * 4 : initialSectionCount,
		column: 4,
		intervalRatio: 1.0,
		aspect: 2.5,
	},
	barWidth: 4,
	barPos: { section: 0, pos: 24 / 2.5 - 2 },
	playing: false,
	sliderValue: {
		timePosition: 0,
		playbackRate: 100,
		musicVolume: 10,
		clapVolume: 100,
	},
	temporaryNotesOption: {
		inBind: false,
		bpm: 0,
		speed: 1.0,
		barLine: false,
		barLineState: true,
	},
	selector: {
		baseX: 0, baseY: 0, x: 0, y: 0, width: 0, height: 0,
	},
	rangeSelect: {
		select: [], copy: [],
	},
	info: {
		title: title !== undefined ? title : '',
		artist: artist !== undefined ? artist : '',
		url: url !== undefined ? url : '',
		level: level,
		bgColor: bgColor !== undefined ? bgColor : [],
	},
	startTime: startTime,
	currentTime: 0.0,
	clapIndex: undefined,
	current: 'hard',
	easy: loader.getMapState('easy') as IMapState,
	normal: loader.getMapState('normal') as IMapState,
	hard: loader.getMapState('hard') as IMapState,
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
	if (state[state.current].currentSection > state[state.current].sectionLength - state.notesDisplay.column - target) {
		state[state.current].currentSection = state[state.current].sectionLength - state.notesDisplay.column - target;
		if (state[state.current].currentSection < 0) {
			state[state.current].currentSection = 0;
		}
	}
}

const mapStateModule = createSlice({
	name: 'notesState',
	initialState: initialState,
	reducers: {
		changeTheme: (state, action: PayloadAction<boolean>) => {
			state.themeDark = action.payload;
		},
		load: (state) => {
			state.loaded = true;
		},
		changeEditMode: (state, action: PayloadAction<EditMode>) => {
			state.rangeSelect.select = [];
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
			state.sliderValue.timePosition = 1000 * (action.payload / (document.getElementById('music') as HTMLAudioElement).duration);
			const musicBar = new MusicBar(state, state[state.current].bpmChanges);
			state.barPos = musicBar.currentPosition(action.payload);
		},
		moveBarPos: (state, action: PayloadAction<SectionPos>) => {
			const musicBar = new MusicBar(state, state[state.current].bpmChanges);
			const time = musicBar.posToTime(action.payload);
			state.currentTime = time;
			state.barPos = action.payload;
			state.sliderValue.timePosition = 1000 * (time / (document.getElementById('music') as HTMLAudioElement).duration);
			state.clapIndex = searchClapIndex(state, time);
			(document.getElementById('music') as HTMLAudioElement).currentTime = time;
		},
		updateCurrentTime: (state, action: PayloadAction<number>) => {
			state.currentTime = action.payload;
			state.sliderValue.timePosition = 1000 * (action.payload / (document.getElementById('music') as HTMLAudioElement).duration);
			state.clapIndex = searchClapIndex(state, action.payload);
		},
		updateClapIndex: (state, action: PayloadAction<number>) => {
			state.clapIndex = searchClapIndex(state, action.payload, state.clapIndex);
		},
		changeSliderValue: (state, action: PayloadAction<{slider: Slider, value: number}>) => {
			state.sliderValue[action.payload.slider] = action.payload.value;
		},
		updateInfo: (state, action: PayloadAction<{info: 'title' | 'artist' | 'url', value: string}>) => {
			state.info[action.payload.info] = action.payload.value;
		},
		setStartTime: (state, action: PayloadAction<{value: number, time: number}>) => {
			state.startTime = isNaN(action.payload.value) ? 0 : action.payload.value;
			const musicBar = new MusicBar(state, state[state.current].bpmChanges);
			state.barPos = musicBar.currentPosition(action.payload.time);
		},
		setSelectorBase: (state, action: PayloadAction<{x: number, y: number}>) => {
			state.selector.baseX = action.payload.x;
			state.selector.baseY = action.payload.y;
		},
		setSelectorRect: (state, action: PayloadAction<{x: number, y: number}>) => {
			const { x, y } = action.payload;
			const { baseX, baseY } = state.selector;
			state.selector.x = x < baseX ? x : baseX;
			state.selector.y = y < baseY ? y : baseY;
			state.selector.width = Math.abs(baseX - x);
			state.selector.height = Math.abs(baseY - y);
		},
		changeNotesStatus: (state, action: PayloadAction<IChangeNotesStatus>) => {
			const line = action.payload.lineIndex;
			const lane = action.payload.laneIndex;
			const status = state[state.current].lines[line].status[lane];
			if (action.payload.newStatus === NotesStatus.NONE && (status === NotesStatus.LONG_START || status ===  NotesStatus.LONG_END)) {
				deleteLongNotes(action.payload, state[state.current].lines);
			} else {
				state[state.current].lines[line].status[lane] = action.payload.newStatus;
				if (action.payload.newStatus === NotesStatus.LONG_START || action.payload.newStatus === NotesStatus.LONG_END) {
					connectLongNotes(action.payload, state[state.current].lines);
				} else if (action.payload.newStatus === NotesStatus.NONE) {
					for (let lineIndex = line - 1; lineIndex >= 0; lineIndex--) {
						const status = state[state.current].lines[lineIndex].status[lane];
						if (status !== NotesStatus.NONE) {
							if (status === NotesStatus.LONG_START) {
								connectLongNotes({lineIndex: lineIndex, laneIndex: lane, newStatus: status}, state[state.current].lines);
							}
							break;
						}
					}
				}
			}
			state[state.current].activeTime = searchActiveTime(state[state.current].lines);
			state.clapIndex = searchClapIndex(state);
			pushHistory(state[state.current], state[state.current].lines, state.historySize);
		},
		copySelect: (state) => {
			const { select } = state.rangeSelect;
			if (select.length === 0) {
				return;
			}
			const firstIndex = select[0].line.start;
			const copyObject: ICopyObject[] = [];
			select.forEach((select, index) => {
				for (let line = select.line.start; line <= select.line.end; line++) {
					const status: {lane: number, status: NotesStatus}[] = [];
					for (let lane = select.lane.start; lane <= select.lane.end; lane++) {
						const laneStatus = state[state.current].lines[line].status[lane];
						status.push({lane: lane - select.lane.start, status: laneStatus === NotesStatus.INVALID ? NotesStatus.NONE : laneStatus});
					}
					copyObject.push({sectionIndex: index, lineIndex: line - firstIndex, object: status});
				}
			});
			state.rangeSelect.copy = copyObject;
		},
		pasteSelect: (state, action: PayloadAction<{initialLine: number, initialLane: number}>) => {
			const { initialLine, initialLane } = action.payload;
			const copyObject = state.rangeSelect.copy;
			const willConnect: IChangeNotesStatus[] = [];
			let changed = false;
			const firstSection = copyObject[0].sectionIndex;
			const pushWillConnect = (copyIndex: number, initialLane: number, dir: number) => {
				if (dir === 0) {
					return;
				}
				const copy = copyObject[copyIndex];
				for (let lane = initialLane; lane < 4 && lane < copy.object[copy.object.length - 1].lane + initialLane; lane++) {
					for (let line = copy.lineIndex + initialLine + dir; line >= 0 && line < state[state.current].lines.length; line += dir) {
						const status = state[state.current].lines[line].status[lane];
						if ((dir < 0 && status === NotesStatus.LONG_START) || (dir > 0 && status === NotesStatus.LONG_END)) {
							willConnect.push({ lineIndex: line, laneIndex: lane, newStatus: status });
							break;
						}
					}
				}
			};
			for (let copyIndex = 0; copyIndex < copyObject.length; copyIndex++) {
				const current = copyObject[copyIndex];
				if (initialLine + current.lineIndex >= state[state.current].lines.length) {
					break;
				}
				const pre = copyIndex > 0 ? copyObject[copyIndex - 1] : null;
				const next = copyIndex < copyObject.length - 1 ? copyObject[copyIndex + 1] : null;
				const dir = pre === null || pre.sectionIndex !== current.sectionIndex ? -1 : next === null || current.sectionIndex !== next.sectionIndex ? 1 : 0;
				const firstLane = current.sectionIndex === firstSection ? initialLane : current.object[0].lane;
				pushWillConnect(copyIndex, firstLane, dir);
				for (let lane = firstLane; lane < 4 && lane <= current.object[current.object.length - 1].lane + firstLane; lane++) {
					const newStatus = current.object[lane - firstLane].status;
					if (state[state.current].lines[current.lineIndex + initialLine].status[lane] !== newStatus) {
						state[state.current].lines[current.lineIndex + initialLine].status[lane] = newStatus;
						if (newStatus === NotesStatus.LONG_END) {
							connectLongNotes({ lineIndex: current.lineIndex + initialLine, laneIndex: lane, newStatus: newStatus }, state[state.current].lines);
						}
						changed = true;
					}
				}
			}
			if (changed && willConnect.length > 0) {
				willConnect.forEach((value) => {
					deleteLongNotes(value, state[state.current].lines);
					if (state[state.current].lines[value.lineIndex].status[value.laneIndex] === NotesStatus.NONE) {
						state[state.current].lines[value.lineIndex].status[value.laneIndex] = value.newStatus;
					}
					connectLongNotes(value, state[state.current].lines);
				});
			}
			if (changed) {
				pushHistory(state[state.current], state[state.current].lines, state.historySize);
			}
		},
		deleteSelected: (state) => {
			let changed = false;
			const willConnect: IChangeNotesStatus[] = [];
			for (const select of state.rangeSelect.select) {
				for (let line = select.line.start; line <= select.line.end; line++) {
					for (let lane = select.lane.start; lane <= select.lane.end; lane++) {
						const status = state[state.current].lines[line].status[lane];
						if (status < 2) {
							state[state.current].lines[line].status[lane] = NotesStatus.NONE;
							changed = true;
						} else if (status < 4) {
							deleteLongNotes({lineIndex: line, laneIndex: lane, newStatus: NotesStatus.NONE}, state[state.current].lines);
							changed = true;
						}
						if (line === select.line.start) {
							const dir = line === select.line.start ? -1: 1;
							for (let index = line + dir; index >= 0 && index < state[state.current].lines.length; index += dir) {
								const status = state[state.current].lines[index].status[lane];
								if ((dir < 0 && status === NotesStatus.LONG_START) || (dir > 0 && status === NotesStatus.LONG_END)) {
									willConnect.push({lineIndex: index, laneIndex: lane, newStatus: dir < 0 ? NotesStatus.LONG_START : NotesStatus.LONG_END});
								}
							}
						}
					}
				}
			}
			if (willConnect.length > 0) {
				willConnect.forEach((starts) => {
					connectLongNotes(starts, state[state.current].lines);
				});
			}
			if (changed) {
				pushHistory(state[state.current], state[state.current].lines, state.historySize);
			}
		},
		saveTemporaryNotesOption: (state, action: PayloadAction<number>) => {
			const { bpm, speed, barLine, barLineState, inBind } = state[state.current].lines[action.payload];
			state.temporaryNotesOption = { bpm: bpm, speed: speed, barLine: barLine, barLineState: barLineState, inBind: inBind };
		},
		updateTemporaryNotesOption: (state, action: PayloadAction<{index: number, target: NotesOption, value: number | boolean}>) => {
			if (typeof action.payload.value === 'boolean') {
				(state.temporaryNotesOption[action.payload.target] as boolean) = action.payload.value;
			} else {
				(state.temporaryNotesOption[action.payload.target] as number) = action.payload.value;
			}
		},
		changeNotesOption: (state, action: PayloadAction<{lineIndex: number, target: NotesOption, update: number | boolean}>) => {
			updateNotesOption(action.payload.lineIndex, action.payload.target, action.payload.update, state);
		},
		addSection: (state, action: PayloadAction<{ sectionIndex: number, insertIndex: number }>) => {
			const { notesDisplay: { sectionLineCount, column }, historySize } = state;
			const { snap24, lines, currentSection, sectionLength } = state[state.current];
			const insertLine = lines[action.payload.insertIndex];
			const notesStatus = [...Array(4)].map((value, index) => {
				return lines[action.payload.insertIndex].status[index] === NotesStatus.INVALID ? NotesStatus.INVALID : NotesStatus.NONE;
			});
			for (let i = 0; i < sectionLineCount * (snap24 ? 1.5 : 1); i++) {
				const addLine: INotesLineState = { status: [...notesStatus], snap24: snap24, inBind: insertLine.inBind, bpm: insertLine.bpm, speed: insertLine.speed, barLine: i === 0, barLineState: insertLine.barLineState };
				state[state.current].lines.splice(action.payload.insertIndex + i + 1, 0, addLine);
			}
			state[state.current].sectionLength++;
			if (currentSection + column - 1 === action.payload.sectionIndex && sectionLength > column) {
				state[state.current].currentSection++;
			}
			state[state.current].activeTime = searchActiveTime(state[state.current].lines);
			state.clapIndex = searchClapIndex(state);
			pushHistory(state[state.current], state[state.current].lines, historySize);
		},
		removeSection: (state, action: PayloadAction<number[][]>) => {
			adjustCurrentSection(state, 1);
			removeSection(state[state.current], action.payload);
			state[state.current].sectionLength--;
			state[state.current].activeTime = searchActiveTime(state[state.current].lines);
			state.clapIndex = searchClapIndex(state);
			pushHistory(state[state.current], state[state.current].lines, state.historySize);
		},
		addHistory: (state) => {
			pushHistory(state[state.current], state[state.current].lines, state.historySize);
		},
		changeSnap: (state) => {
			changeWholeBeatSnap(state[state.current]);
		},
		setupBpm: (state, action: PayloadAction<number>) => {
			state[state.current].bpm = action.payload;
		},
		moveSection: (state, action: PayloadAction<number>) => {
			state[state.current].currentSection = action.payload;
		},
		adoptSelection: (state, action: PayloadAction<ISelectRange[]>) => {
			state.rangeSelect.select = action.payload;
			state.selector = {baseX: 0, baseY: 0, x: 0, y: 0, width: 0, height: 0};
		},
		changeDifficulty: (state, action: PayloadAction<DifficlutySelect>) => {
			state[state.current] = state[action.payload];
		},
		undo: (state) => {
			state[state.current].historyIndex--;
			if (state[state.current].historyIndex < 0) {
				state[state.current].historyIndex = 0;
			}
			state[state.current].lines = state[state.current].linesHistory[state[state.current].historyIndex];
			state[state.current].sectionLength = assignSection(state[state.current].lines, state.notesDisplay.sectionLineCount).length;
			state[state.current].activeTime = searchActiveTime(state[state.current].lines);
			state.clapIndex = searchClapIndex(state);
			adjustCurrentSection(state, 0);
		},
		redo: (state) => {
			state[state.current].historyIndex++;
			if (state[state.current].historyIndex > state[state.current].linesHistory.length - 1) {
				state[state.current].historyIndex = state[state.current].linesHistory.length - 1;
			}
			state[state.current].lines = state[state.current].linesHistory[state[state.current].historyIndex];
			state[state.current].sectionLength = assignSection(state[state.current].lines, state.notesDisplay.sectionLineCount).length;
			state[state.current].activeTime = searchActiveTime(state[state.current].lines);
			state.clapIndex = searchClapIndex(state);
			adjustCurrentSection(state, 0);
		},
	}
});

export default mapStateModule;

export function isActiveLine(line: INotesLineState) {
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
			const barLine = mapState.lines[index + 1].barLine;
			if (!isActiveLine(mapState.lines[index + 1]) && !barLine) {
				mapState.lines[index].snap24 = mapState.lines[index + 1].snap24 = true;
				const newLine: INotesLineState = {
					status: mapState.lines[index + 1].status.map((value) => value === NotesStatus.INVALID ? NotesStatus.INVALID : NotesStatus.NONE),
					snap24: true,
					inBind: mapState.lines[index + 1].inBind,
					bpm: mapState.lines[index + 1].bpm,
					speed: mapState.lines[index + 1].speed,
					barLine: false,
					barLineState: mapState.lines[index + 1].barLineState,
				}
				mapState.lines.splice(index + 1, 0, newLine);
				index += 3;
			} else {
				index += 2;
			}
		} else {
			const barLine = mapState.lines[index + 1].barLine || mapState.lines[index + 1].barLine;
			if (!isActiveLine(mapState.lines[index + 1]) && !isActiveLine(mapState.lines[index + 2]) && !barLine) {
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

export function getLineIndexesInSection(sectionIndex: number, sections: number[][][]) {
	const halfBeats = sections[sectionIndex];
	const first = halfBeats[0][0];
	const last = halfBeats[halfBeats.length - 1][halfBeats[halfBeats.length - 1].length - 1];
	return [...Array(last - first + 1)].map((value, index) => index + first);
}

export function assignSection(lineStates: INotesLineState[], sectionLineCount: number) {
	const halfBeatsInSection = sectionLineCount / 2;
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
	const endIndex = halfBeats.reverse()[0].reverse()[0];
	for (let line = startIndex; line <= endIndex; line++) {
		state.lines[line].status.forEach((value, lane) => {
			if (value < 2) {
				state.lines[line].status[lane] = NotesStatus.NONE;
			} else if (value < 4) {
				deleteLongNotes({lineIndex: line, laneIndex: lane, newStatus: value}, state.lines);
			}
		});
	}
	state.lines = state.lines.filter((value, index) => index < startIndex || endIndex < index);
}

function searchClapIndex(state: IEditorState, time?: number, index: number = 0): number | undefined {
	if (!time) {
		time = state.currentTime - state.startTime / 1000;
	}
	if (state[state.current].activeTime.length === 0 || state[state.current].activeTime.length <= index) {
		return undefined;
	} else if (time <= state[state.current].activeTime[0]) {
		return 0;
	} else {
		return state[state.current].activeTime[index] < time && time < state[state.current].activeTime[index + 1] ? index + 1 : searchClapIndex(state, time, index + 1);
	}
}

export function searchActiveTime(lines: INotesLineState[]) {
	let time = 0;
	const activeTime: number[] = [];
	for (const lineState of lines) {
		if (isActiveLine(lineState)) {
			activeTime.push(time);
		}
		time += (lineState.snap24 ? 10 : 15) / lineState.bpm;
	}
	return activeTime;
}

export function getBpmChanges(lines: INotesLineState[]) {
	let time = 0;
	const bpmChanges = [{bpm: lines[0].bpm, time: 0}] as { bpm: number, time: number }[];
	for (let i = 1; i < lines.length; i++) {
		const line = lines[i - 1];
		time += (line.snap24 ? 10 : 15) / line.bpm;
		if (line.bpm !== lines[i].bpm) {
			bpmChanges.push({ bpm: lines[i].bpm, time: time });
		}
	}
	return bpmChanges;
}

function turnInvalid(lane: number, edge1: number, edge2: number, lines: INotesLineState[]) {
	const last = edge1 < edge2 ? edge2 : edge1;
	for (let line = (edge1 < edge2 ? edge1 : edge2) + 1; line < last; line++) {
		lines[line].status[lane] = NotesStatus.INVALID;
	}
};

function findLnEdgeAndTurnInvalid(connectTarget: NotesStatus, lineIndex: number, laneIndex: number, lines: INotesLineState[], dir: 1 | -1) {
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

export function connectLongNotes(change: IChangeNotesStatus, lines: INotesLineState[]) {
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

function updateNotesOption(lineIndex: number, target: NotesOption, update: number | boolean, state: IEditorState) {
	if (target === 'barLine') {
		const newVal = update as boolean;
		state[state.current].lines[lineIndex].barLine = lineIndex > 0 && newVal;
		if (!newVal && lineIndex > 0) {
			const preLine = state[state.current].lines[lineIndex - 1];
			updateNotesOption(lineIndex, 'bpm', preLine.bpm, state);
			updateNotesOption(lineIndex, 'speed', preLine.speed, state);
			updateNotesOption(lineIndex, 'barLineState', preLine.barLineState, state);
			state[state.current].lines[lineIndex].barLine = false;
		}
	} else if (target === 'inBind' || target === 'barLineState') {
		const newVal = update as boolean;
		if (target === 'barLineState' && newVal !== state[state.current].lines[lineIndex].barLineState && !state[state.current].lines[lineIndex].barLine) {
			state[state.current].lines[lineIndex].barLine = true;
		}
		for (let i = lineIndex; i < state[state.current].lines.length && state[state.current].lines[i][target] !== newVal; i++) {
			state[state.current].lines[i][target] = newVal;
		}
	} else {
		const newVal = update as number;
		if (newVal !== state[state.current].lines[lineIndex][target]) {
			const lines = state[state.current].lines;
			if (!lines[lineIndex].barLine) {
				state[state.current].lines[lineIndex].barLine = true;
			}
			for (let i = lineIndex; i < lines.length && lines[i][target] !== newVal; i++) {
				state[state.current].lines[i][target] = newVal;
			}
			if (target === 'bpm') {
				state[state.current].bpmChanges = getBpmChanges(state[state.current].lines);
				state[state.current].activeTime = searchActiveTime(state[state.current].lines);
				state.clapIndex = searchClapIndex(state);
			}
		}
	}
}
