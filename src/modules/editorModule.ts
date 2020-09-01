import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { cloneDeep } from 'lodash';
import MusicBar, { SectionPos } from './music/MusicBar';
import music, { clapActiveTime, stopMusic } from './music/clapModule';
import { NotesStatus } from '../components/map/Notes';
import { IChangeNotesStatus } from '../components/map/notesUnit/Line';
import ISparebeatJson from './mapConvert/ISparebeatJson';
import SparebeatJsonExport from "./mapConvert/SparebeatJsonExport";

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
	snap24: boolean;
	currentSection: number;
	sectionLength: number;
	lines: INotesLineState[];
	linesHistory: INotesLineState[][];
	historyIndex: number;
	bpmChanges: { bpm: number, time: number }[];
	activeTime: { count: number, time: number }[];
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

interface ISaveSetting {
	general: {
		notesWidth: number;
		aspect: number;
		column: number;
		intervalRatio: number;
		barWidth: number;
		historySize: number;
		clapDelay: number;
	};
	color: {
		themeDark: boolean;
		sparebeatTheme: SparebeatTheme;
		barColor: string;
	};
	difficulty: DifficlutySelect;
};

interface ISaveVolume {
	musicVolume: number;
	clapVolume: number;
}

export type DifficlutySelect = 'easy' | 'normal' | 'hard';
export type SparebeatTheme = 'default' | 'sunset' | '39';
export type NotesDisplay = 'notesWidth' | 'column' | 'intervalRatio' | 'aspect';
export type EditMode = 'add' | 'select';
export type NotesMode = 'normal' | 'attack' | 'longStart' | 'longEnd';
export type Slider = 'timePosition' | 'playbackRate' | 'musicVolume' | 'clapVolume';
export interface IEditorState {
	startPosition: number;
	themeDark: boolean;
	sparebeatTheme: SparebeatTheme;
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
	barColor: string;
	barPos: SectionPos;
	playing: boolean;
	openTest: boolean;
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
			easy: string;
			normal: string;
			hard: string;
		};
		bgColor: string[];
	};
	startTime: number;
	currentTime: number;
	clapDelay: number;
	current: DifficlutySelect;
	easy: IMapState;
	normal: IMapState;
	hard: IMapState;
	mapChanged: boolean;
	historySize: number;
}

const initialSectionCount = 16;
const setting = localStorage.setting ? JSON.parse(localStorage.setting) as ISaveSetting : undefined;
const volume = localStorage.volume ? JSON.parse(localStorage.volume) as ISaveVolume : undefined;

const initialBpm = 150;
const initialNotesStatus = [...Array(4)].map(() => 'none' as NotesStatus);
const initialMapState: IMapState = { snap24: false, currentSection: 0, sectionLength: 1, lines: [], linesHistory: [], historyIndex: 0, bpmChanges: [], activeTime: [] };
for (let i = 0; i < initialSectionCount; i++) {
	const lineState: INotesLineState = { status: [...initialNotesStatus], inBind: false, snap24: false, bpm: initialBpm, barLine: i % initialSectionCount === 0, speed: 1.0, barLineState: true };
	initialMapState.lines.push(lineState);
}
initialMapState.linesHistory.push(initialMapState.lines);
initialMapState.bpmChanges = [{ bpm: initialBpm, time: 0 }];

const notesWidth = setting ? setting.general.notesWidth : 50;
const aspect = setting ? setting.general.aspect : 2.5;
const barWidth = setting ? setting.general.barWidth : 4;
const initialState: IEditorState = {
	startPosition: 0,
	themeDark: setting ? setting.color.themeDark : false,
	sparebeatTheme: setting ? setting.color.sparebeatTheme : 'default',
	loaded: false,
	editMode: 'add',
	notesMode: 'normal',
	notesDisplay: {
		notesWidth: setting ? setting.general.notesWidth : 50,
		sectionLineCount: initialSectionCount,
		column: setting ? setting.general.column : 4,
		intervalRatio: setting ? setting.general.intervalRatio : 1.0,
		aspect: setting ? setting.general.aspect : 2.5,
	},
	barWidth: setting ? setting.general.barWidth : 4,
	barColor: setting ? setting.color.barColor : '#cece9e',
	barPos: { section: 0, pos: (notesWidth / 2) / aspect - barWidth / 2 },
	playing: false,
	openTest: false,
	sliderValue: {
		timePosition: 0,
		playbackRate: 100,
		musicVolume: volume ? volume.musicVolume : 100,
		clapVolume: volume ? volume.clapVolume : 100,
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
		title: '',
		artist: '',
		url: '',
		level: {
			easy: '',
			normal: '',
			hard: '',
		},
		bgColor: [],
	},
	startTime: 0,
	currentTime: 0.0,
	clapDelay: setting && setting.general.clapDelay ? setting.general.clapDelay : 0,
	current: setting && setting.difficulty ? setting.difficulty : 'hard',
	easy: initialMapState,
	normal: cloneDeep(initialMapState),
	hard: cloneDeep(initialMapState),
	mapChanged: false,
	historySize: setting ? setting.general.historySize : 50,
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
		changeTheme: (state: IEditorState, action: PayloadAction<boolean>) => {
			state.themeDark = action.payload;
		},
		changeSparebeatTheme: (state: IEditorState, action: PayloadAction<SparebeatTheme>) => {
			state.sparebeatTheme = action.payload;
		},
		changeBarColor: (state: IEditorState, action: PayloadAction<string>) => {
			state.barColor = action.payload;
		},
		changeNotesDisplay: (state: IEditorState, action: PayloadAction<{ setting: NotesDisplay, value: number }>) => {
			state.notesDisplay[action.payload.setting] = action.payload.value;
		},
		changeBarWidth: (state: IEditorState, action: PayloadAction<number>) => {
			state.barWidth = action.payload;
		},
		changeHistorySize: (state: IEditorState, action: PayloadAction<number>) => {
			state.historySize = action.payload;
			(['easy', 'normal', 'hard'] as DifficlutySelect[]).forEach((diff) => {
				if (state[diff].linesHistory.length > state.historySize) {
					state[diff].linesHistory = state[diff].linesHistory.slice(state[diff].linesHistory.length - state.historySize);
					if (state[diff].historyIndex >= state[diff].linesHistory.length) {
						state[diff].historyIndex = state[diff].linesHistory.length - 1;
					}
				}
			});
		},
		saveSetting: (state: IEditorState) => {
			const { themeDark, sparebeatTheme, notesDisplay: { notesWidth, aspect, column, intervalRatio }, barColor, barWidth, current, clapDelay, historySize } = state;
			const setting: ISaveSetting = {
				general: {
					notesWidth, aspect, column, intervalRatio, barWidth, clapDelay, historySize,
				},
				color: {
					themeDark, sparebeatTheme, barColor
				},
				difficulty: current
			};
			localStorage.setting = JSON.stringify(setting);
		},
		saveMap: (state: IEditorState) => {
			if (state.loaded) {
				const mapJson = new SparebeatJsonExport(state).export();
				try {
					localStorage.map = JSON.stringify(mapJson);
				} catch {
					localStorage.removeItem('music');
					localStorage.map = JSON.stringify(mapJson);
				}
				state.mapChanged = false;
			}
		},
		load: (state: IEditorState) => {
			state.loaded = true;
		},
		fadeStart: (state: IEditorState) => {
			state.startPosition++;
		},
		setSongInfo: (state: IEditorState, action: PayloadAction<ISparebeatJson>) => {
			const { title, beats, startTime, level, artist, url, bgColor } = action.payload;
			state.info.title = title !== undefined ? title : '';
			state.info.artist = artist !== undefined ? artist : '';
			state.info.url = url !== undefined ? url : '';
			state.info.level = {
				easy: level.easy.toString(),
				normal: level.normal.toString(),
				hard: level.hard.toString(),
			};
			state.info.bgColor = bgColor !== undefined ? bgColor : [];
			state.notesDisplay.sectionLineCount = 4 * (beats ? beats : 4);
			state.startTime = startTime;
		},
		setMap: (state: IEditorState, action: PayloadAction<{ diff: DifficlutySelect, map: IMapState }>) => {
			state[action.payload.diff] = action.payload.map;
		},
		initializeMap: (state: IEditorState, action: PayloadAction<{ bpm: number, beats: number }>) => {
			state.notesDisplay.sectionLineCount = action.payload.beats * 4;
			const lines = getInitialLines(action.payload.bpm, state.notesDisplay.sectionLineCount);
			const mapState: IMapState = {
				snap24: false,
				currentSection: 0,
				sectionLength: 1,
				lines: lines,
				linesHistory: [lines],
				historyIndex: 0,
				bpmChanges: [{ bpm: action.payload.bpm, time: 0 }],
				activeTime: [],
			};
			state.easy = mapState;
			state.normal = cloneDeep(mapState);
			state.hard = cloneDeep(mapState);
		},
		changeEditMode: (state: IEditorState, action: PayloadAction<EditMode>) => {
			state.rangeSelect.select = [];
			state.editMode = action.payload;
		},
		changeEditModeToAdd: (state: IEditorState) => {
			state.rangeSelect.select = [];
			state.editMode = 'add';
		},
		changeEditModeToSelect: (state: IEditorState) => {
			state.rangeSelect.select = [];
			state.editMode = 'select';
		},
		changeNotesMode: (state: IEditorState, action: PayloadAction<NotesMode>) => {
			state.notesMode = action.payload;
		},
		changeNotesModeToNormal: (state: IEditorState) => {
			state.notesMode = 'normal';
		},
		changeNotesModeToAttack: (state: IEditorState) => {
			state.notesMode = 'attack';
		},
		changeNotesModeToLongStart: (state: IEditorState) => {
			state.notesMode = 'longStart';
		},
		changeNotesModeToLongEnd: (state: IEditorState) => {
			state.notesMode = 'longEnd';
		},
		toggleMusic: (state: IEditorState) => {
			if (state.loaded) {
				if (!state.playing) {
					const { startTime, clapDelay, sliderValue: { playbackRate, clapVolume } } = state;
					const { activeTime } = state[state.current];
					clapActiveTime(activeTime, startTime, clapDelay, playbackRate, clapVolume);
					music.play();
				} else {
					stopMusic();
					music.pause();
					state.currentTime = music.currentTime;
					state.sliderValue.timePosition = 1000 * (state.currentTime / music.duration);
				}
				state.playing = !state.playing;
			}
		},
		updateBarPos: (state: IEditorState, action: PayloadAction<number>) => {
			state.currentTime = action.payload;
			state.sliderValue.timePosition = 1000 * (state.currentTime / music.duration);
			const musicBar = new MusicBar(state, state[state.current].bpmChanges);
			state.barPos = musicBar.currentPosition(state.currentTime);
		},
		moveBarPos: (state: IEditorState, action: PayloadAction<SectionPos>) => {
			const musicBar = new MusicBar(state, state[state.current].bpmChanges);
			const time = musicBar.posToTime(action.payload);
			state.currentTime = music.currentTime = time;
			state.barPos = action.payload;
			state.sliderValue.timePosition = 1000 * (time / music.duration);
		},
		updateCurrentTime: (state: IEditorState, action: PayloadAction<number>) => {
			state.currentTime = action.payload;
			state.sliderValue.timePosition = 1000 * (action.payload / music.duration);
		},
		moveCurrentTimeOnSlider: (state: IEditorState, action: PayloadAction<number>) => {
			const time = (action.payload / 1000) * music.duration;
			const { bpmChanges, sectionLength } = state[state.current];
			const musicBar = new MusicBar(state, bpmChanges);
			const barPos = musicBar.currentPosition(time);
			const column = state.notesDisplay.column;
			if (barPos.section < sectionLength) {
				state[state.current].currentSection = sectionLength - column < 0 ? 0 : barPos.section > sectionLength - column ? sectionLength - column : barPos.section;
				state.barPos = barPos;
				music.currentTime = state.currentTime = time;
				state.sliderValue.timePosition = action.payload;
			} else {
				const correctSection = sectionLength - 1;
				state[state.current].currentSection = sectionLength - column < 0 ? 0 : correctSection > sectionLength - column ? sectionLength - column : correctSection;
				state.barPos = { section: correctSection, pos: musicBar.sectinHeight - state.barWidth };
				const correctTime = musicBar.posToTime(state.barPos);
				music.currentTime = state.currentTime = correctTime;
				state.sliderValue.timePosition = 1000 * (correctTime / music.duration);
			}
		},
		changeSliderValue: (state: IEditorState, action: PayloadAction<{slider: Slider, value: number}>) => {
			state.sliderValue[action.payload.slider] = action.payload.value;
			if (action.payload.slider === 'musicVolume' || action.payload.slider === 'clapVolume') {
				const volume: ISaveVolume = { musicVolume: state.sliderValue.musicVolume, clapVolume: state.sliderValue.clapVolume };
				localStorage.volume = JSON.stringify(volume);
			}
		},
		changeClapDelay: (state: IEditorState, action: PayloadAction<number>) => {
			state.clapDelay = action.payload;
		},
		updateInfo: (state: IEditorState, action: PayloadAction<{info: 'title' | 'artist' | 'url', value: string}>) => {
			state.info[action.payload.info] = action.payload.value;
			state.mapChanged = true;
		},
		loadExternalMap: (state: IEditorState) => {
			state.mapChanged = true;
		},
		updateLevel: (state: IEditorState, action: PayloadAction<{difficulty: DifficlutySelect, value: string}>) => {
			state.info.level[action.payload.difficulty] = action.payload.value;
			state.mapChanged = true;
		},
		updateBgColor: (state: IEditorState, action: PayloadAction<{ index: number, color: string }>) => {
			if (state.info.bgColor.length === 0) {
				state.info.bgColor = ['#43C6AC', '#191654'];
			}
			state.info.bgColor[action.payload.index] = action.payload.color;
			state.mapChanged = true;
		},
		setStartTime: (state: IEditorState, action: PayloadAction<{value: number, time: number}>) => {
			state.startTime = isNaN(action.payload.value) ? 0 : action.payload.value;
			const musicBar = new MusicBar(state, state[state.current].bpmChanges);
			state.barPos = musicBar.currentPosition(action.payload.time);
			state.mapChanged = true;
		},
		setSelectorBase: (state: IEditorState, action: PayloadAction<{x: number, y: number}>) => {
			state.selector.baseX = action.payload.x;
			state.selector.baseY = action.payload.y;
		},
		setSelectorRect: (state: IEditorState, action: PayloadAction<{x: number, y: number}>) => {
			const { x, y } = action.payload;
			const { baseX, baseY } = state.selector;
			state.selector.x = x < baseX ? x : baseX;
			state.selector.y = y < baseY ? y : baseY;
			state.selector.width = Math.abs(baseX - x);
			state.selector.height = Math.abs(baseY - y);
		},
		changeNotesStatus: (state: IEditorState, action: PayloadAction<IChangeNotesStatus>) => {
			const line = action.payload.lineIndex;
			const lane = action.payload.laneIndex;
			const status = state[state.current].lines[line].status[lane];
			if (action.payload.newStatus === 'none' && (status === 'long_start' || status ===  'long_end')) {
				deleteLongNotes(action.payload, state[state.current].lines);
			} else {
				state[state.current].lines[line].status[lane] = action.payload.newStatus;
				if (action.payload.newStatus === 'long_start' || action.payload.newStatus === 'long_end') {
					connectLongNotes(action.payload, state[state.current].lines);
				} else if (action.payload.newStatus === 'none') {
					for (let lineIndex = line - 1; lineIndex >= 0; lineIndex--) {
						const status = state[state.current].lines[lineIndex].status[lane];
						if (status !== 'none') {
							if (status === 'long_start') {
								connectLongNotes({lineIndex: lineIndex, laneIndex: lane, newStatus: status}, state[state.current].lines);
							}
							break;
						}
					}
				}
			}
			state.mapChanged = true;
			state[state.current].activeTime = searchActiveTime(state[state.current].lines);
			pushHistory(state[state.current], state[state.current].lines, state.historySize);
		},
		copySelect: (state: IEditorState) => {
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
						status.push({lane: lane - select.lane.start, status: laneStatus === 'invalid' ? 'none' : laneStatus});
					}
					copyObject.push({sectionIndex: index, lineIndex: line - firstIndex, object: status});
				}
			});
			state.rangeSelect.copy = copyObject;
		},
		reverseSelect: (state: IEditorState) => {
			const { select } = state.rangeSelect;
			if (select.length === 0) {
				return;
			}
			select.forEach(selection => {
				for (let line = selection.line.start; line <= selection.line.end; line++) {
					const originState = [...state[state.current].lines[line].status];
					const newState = [...originState];
					for (let lane = selection.lane.start; lane <= selection.lane.end; lane++) {
						newState[lane] = originState[selection.lane.end - lane];
					}
					state[state.current].lines[line].status = newState;
				}
			});
			state.mapChanged = true;
			pushHistory(state[state.current], state[state.current].lines, state.historySize);
		},
		pasteSelect: (state: IEditorState, action: PayloadAction<{initialLine: number, initialLane: number}>) => {
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
						if ((dir < 0 && status === 'long_start') || (dir > 0 && status === 'long_end')) {
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
						if (newStatus === 'long_end') {
							connectLongNotes({ lineIndex: current.lineIndex + initialLine, laneIndex: lane, newStatus: newStatus }, state[state.current].lines);
						}
						changed = true;
					}
				}
			}
			if (changed && willConnect.length > 0) {
				willConnect.forEach((value) => {
					deleteLongNotes(value, state[state.current].lines);
					if (state[state.current].lines[value.lineIndex].status[value.laneIndex] === 'none') {
						state[state.current].lines[value.lineIndex].status[value.laneIndex] = value.newStatus;
					}
					connectLongNotes(value, state[state.current].lines);
				});
			}
			if (changed) {
				state.mapChanged = true;
				state[state.current].activeTime = searchActiveTime(state[state.current].lines);
				pushHistory(state[state.current], state[state.current].lines, state.historySize);
			}
		},
		deleteSelected: (state: IEditorState) => {
			if (state.rangeSelect.select.length === 0) {
				return;
			}
			let changed = false;
			const willConnect: IChangeNotesStatus[] = [];
			for (const select of state.rangeSelect.select) {
				for (let line = select.line.start; line <= select.line.end; line++) {
					for (let lane = select.lane.start; lane <= select.lane.end; lane++) {
						const status = state[state.current].lines[line].status[lane];
						if (status === 'normal' || status === 'attack') {
							state[state.current].lines[line].status[lane] = 'none';
							changed = true;
						} else if (status.includes('long')) {
							deleteLongNotes({lineIndex: line, laneIndex: lane, newStatus: 'none'}, state[state.current].lines);
							changed = true;
						}
						if (line === select.line.start) {
							const dir = line === select.line.start ? -1: 1;
							for (let index = line + dir; index >= 0 && index < state[state.current].lines.length; index += dir) {
								const status = state[state.current].lines[index].status[lane];
								if ((dir < 0 && status === 'long_start') || (dir > 0 && status === 'long_end')) {
									willConnect.push({lineIndex: index, laneIndex: lane, newStatus: dir < 0 ? 'long_start' : 'long_end'});
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
				state.mapChanged = true;
				state[state.current].activeTime = searchActiveTime(state[state.current].lines);
				pushHistory(state[state.current], state[state.current].lines, state.historySize);
			}
			state.rangeSelect.select = [];
		},
		saveTemporaryNotesOption: (state: IEditorState, action: PayloadAction<number>) => {
			const { bpm, speed, barLine, barLineState, inBind } = state[state.current].lines[action.payload];
			state.temporaryNotesOption = { bpm: bpm, speed: speed, barLine: barLine, barLineState: barLineState, inBind: inBind };
		},
		updateTemporaryNotesOption: (state: IEditorState, action: PayloadAction<{index: number, target: NotesOption, value: number | boolean}>) => {
			if (typeof action.payload.value === 'boolean') {
				(state.temporaryNotesOption[action.payload.target] as boolean) = action.payload.value;
			} else {
				(state.temporaryNotesOption[action.payload.target] as number) = action.payload.value;
			}
		},
		changeNotesOption: (state: IEditorState, action: PayloadAction<{lineIndex: number, target: NotesOption, update: number | boolean}>) => {
			updateNotesOption(action.payload.lineIndex, action.payload.target, action.payload.update, state);
		},
		addSection: (state: IEditorState, action: PayloadAction<{ sectionIndex: number, insertIndex: number }>) => {
			const { notesDisplay: { sectionLineCount, column }, historySize } = state;
			const { snap24, lines, currentSection, sectionLength } = state[state.current];
			const insertLine = lines[action.payload.insertIndex];
			const notesStatus = [...Array(4)].map((value, index) => {
				return lines[action.payload.insertIndex].status[index] === 'invalid' ? 'invalid' : 'none';
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
			state.mapChanged = true;
			pushHistory(state[state.current], state[state.current].lines, historySize);
		},
		removeSection: (state: IEditorState, action: PayloadAction<number[][]>) => {
			adjustCurrentSection(state, 1);
			removeSection(state[state.current], action.payload);
			state[state.current].sectionLength--;
			state[state.current].activeTime = searchActiveTime(state[state.current].lines);
			state.mapChanged = true;
			pushHistory(state[state.current], state[state.current].lines, state.historySize);
		},
		addHistory: (state: IEditorState) => {
			state.mapChanged = true;
			pushHistory(state[state.current], state[state.current].lines, state.historySize);
		},
		changeSnap: (state: IEditorState) => {
			changeWholeBeatSnap(state[state.current]);
		},
		moveSection: (state: IEditorState, action: PayloadAction<number>) => {
			state[state.current].currentSection = action.payload;
		},
		adoptSelection: (state: IEditorState, action: PayloadAction<ISelectRange[]>) => {
			state.rangeSelect.select = action.payload;
			state.selector = {baseX: 0, baseY: 0, x: 0, y: 0, width: 0, height: 0};
		},
		changeDifficulty: (state: IEditorState, action: PayloadAction<DifficlutySelect>) => {
			state.current = action.payload;
		},
		cloneDifficulty: (state: IEditorState, action: PayloadAction<{origin: DifficlutySelect, target: DifficlutySelect}>) => {
			const origin = cloneDeep(state[action.payload.origin]);
			const target = state[action.payload.target];
			target.snap24 = origin.snap24;
			target.sectionLength = origin.sectionLength;
			target.lines = origin.lines;
			target.bpmChanges = origin.bpmChanges;
			target.activeTime = origin.activeTime;
			state.mapChanged = true;
			pushHistory(target, target.lines, state.historySize);
		},
		deleteMap: (state: IEditorState, action: PayloadAction<DifficlutySelect>) => {
			const bpm = state[action.payload].lines[0].bpm;
			const lines = getInitialLines(bpm, state.notesDisplay.sectionLineCount);
			state[action.payload].snap24 = false;
			state[action.payload].currentSection = 0;
			state[action.payload].sectionLength = 1;
			state[action.payload].lines = lines;
			state[action.payload].bpmChanges = [{ bpm: bpm, time: 0 }];
			state[action.payload].activeTime = [];
			if (state.current === action.payload) {
				const musicBar = new MusicBar(state, state[action.payload].bpmChanges);
				state.currentTime = 0;
				state.barPos = musicBar.currentPosition(0);
				state.sliderValue.timePosition = 0;
				music.currentTime = 0;
			}
			state.mapChanged = true;
			pushHistory(state[action.payload], lines, state.historySize);
		},
		undo: (state: IEditorState) => {
			if (state[state.current].historyIndex > 0) {
				state[state.current].historyIndex--;
				if (state[state.current].historyIndex < 0) {
					state[state.current].historyIndex = 0;
				}
				state[state.current].lines = state[state.current].linesHistory[state[state.current].historyIndex];
				state[state.current].sectionLength = assignSection(state[state.current].lines, state.notesDisplay.sectionLineCount).length;
				state[state.current].activeTime = searchActiveTime(state[state.current].lines);
				adjustCurrentSection(state, 0);
				state.mapChanged = true;
			}
		},
		redo: (state: IEditorState) => {
			const { historyIndex, linesHistory } = state[state.current];
			if (historyIndex < linesHistory.length - 1) {
				state[state.current].historyIndex++;
				if (state[state.current].historyIndex > linesHistory.length - 1) {
					state[state.current].historyIndex = linesHistory.length - 1;
				}
				state[state.current].lines = linesHistory[state[state.current].historyIndex];
				state[state.current].sectionLength = assignSection(state[state.current].lines, state.notesDisplay.sectionLineCount).length;
				state[state.current].activeTime = searchActiveTime(state[state.current].lines);
				adjustCurrentSection(state, 0);
				state.mapChanged = true;
			}
		},
		toggleTest: (state: IEditorState) => {
			state.openTest = !state.openTest;
		},
	}
});

export default mapStateModule;

export function isActiveLine(line: INotesLineState) {
	for (const notes of line.status) {
		if (notes !== 'none' && notes !== 'invalid') {
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
					status: mapState.lines[index + 1].status.map((value) => value === 'invalid' ? 'invalid' : 'none'),
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

function getInitialLines(bpm: number, sectionLineCount: number) {
	return [...Array(sectionLineCount)].map((value, index) => {
		return {
			status: [...initialNotesStatus],
			snap24: false,
			inBind: false,
			bpm: bpm,
			speed: 1.0,
			barLine: index === 0,
			barLineState: true,
		} as INotesLineState;
	});
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
			if (value === 'normal' || value === 'attack') {
				state.lines[line].status[lane] = 'none';
			} else if (value.includes('long')) {
				deleteLongNotes({lineIndex: line, laneIndex: lane, newStatus: value}, state.lines);
			}
		});
	}
	state.lines = state.lines.filter((value, index) => index < startIndex || endIndex < index);
}

export function searchActiveTime(lines: INotesLineState[]) {
	let time = 0;
	const activeTime: { count: number, time: number }[] = [];
	for (const lineState of lines) {
		const count = lineState.status.reduce((pre, cur) => pre + (cur !== 'none' && cur !== 'invalid' ? 1 : 0), 0);
		if (count > 0) {
			activeTime.push({ count: count, time: time });
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
		lines[line].status[lane] = 'invalid';
	}
};

function findLnEdgeAndTurnInvalid(connectTarget: NotesStatus, lineIndex: number, laneIndex: number, lines: INotesLineState[], dir: 1 | -1) {
	for (let index = lineIndex + dir; index < lines.length && index >= 0; index += dir) {
		const status = lines[index].status[laneIndex];
		if (status === connectTarget) {
			turnInvalid(laneIndex, lineIndex, index, lines);
			break;
		} else if (status !== 'none') {
			break;
		}
	}
};

export function connectLongNotes(change: IChangeNotesStatus, lines: INotesLineState[]) {
	const connectTarget = change.newStatus === 'long_start' ? 'long_end' : 'long_start';
	const dir = change.newStatus === 'long_start' ? 1 : -1;
	findLnEdgeAndTurnInvalid(connectTarget, change.lineIndex, change.laneIndex, lines, dir);
}

function deleteLongNotes(change: IChangeNotesStatus, lines: INotesLineState[]) {
	const currentStatus = lines[change.lineIndex].status[change.laneIndex];
	const newLnPossibility = 0 < change.lineIndex && change.lineIndex < lines.length - 1 && (
		(currentStatus === 'long_start' && lines[change.lineIndex + 1].status[change.laneIndex] === 'invalid') || 
		(currentStatus === 'long_end' && lines[change.lineIndex - 1].status[change.laneIndex] === 'invalid')
	);
	const dir = newLnPossibility ? (currentStatus === 'long_start' ? -1 : 1) : undefined;
	lines[change.lineIndex].status[change.laneIndex] = 'none';
	if (dir) {
		const removeDir = dir < 0 ? 1 : -1;
		findLnEdgeAndTurnInvalid(currentStatus, change.lineIndex + removeDir, change.laneIndex, lines, dir);
		if (lines[change.lineIndex].status[change.laneIndex] === 'none') {
			for (let i = change.lineIndex + removeDir; lines[i].status[change.laneIndex] === 'invalid'; i += removeDir) {
				lines[i].status[change.laneIndex] = 'none';
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
			}
		}
	}
}
