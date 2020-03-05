import { AppState } from '../../store';
import ISparebeatJson, { mapUnion, IMapOption } from './ISparebeatJson';
import { INotesLineState, isActiveLine } from '../editorModule';
import { NotesStatus } from '../../components/map/Notes';

export default class SparebeatJsonExport {
	private state: AppState;

	constructor(state: AppState) {
		this.state = state;
	}

	public export() {
		const { title, artist, url, level, bgColor } = this.state.info;
		const json: ISparebeatJson = {
			title: title,
			artist: artist,
			url: url.length === 0 ? undefined : url,
			bgColor: bgColor.length === 0 ? undefined : bgColor,
			beats: this.state.notesDisplay.sectionLineCount / 4,
			bpm: this.state[this.state.current].lines[0].bpm,
			startTime: this.state.startTime,
			level: {
				easy: isNaN(parseFloat(level.easy.toString())) ? level.easy.toString() : parseFloat(level.easy.toString()),
				normal: isNaN(parseFloat(level.normal.toString())) ? level.normal.toString() : parseFloat(level.normal.toString()),
				hard: isNaN(parseFloat(level.hard.toString())) ? level.hard.toString() : parseFloat(level.hard.toString()),
			},
			map: {
				easy: this.convertNotesStatusToMap('easy'),
				normal: this.convertNotesStatusToMap('normal'),
				hard: this.convertNotesStatusToMap('hard'),
			},
		}
		return json;
	}

	private convertNotesStatusToMap(difficulty: 'easy' | 'normal' | 'hard') {
		const lines = this.state[difficulty].lines;
		const map: mapUnion[] = [];
		let mapText = '';
		let lastIndex = lines.length - 1;
		while (!isActiveLine(lines[lastIndex]) && lastIndex > 0) {
			lastIndex--;
		}
		for (let i = 0; i <= lastIndex; i++) {
			const option = SparebeatJsonExport.requireOption(i, lines);
			if (option !== undefined) {
				map.push(option);
			}
			mapText += SparebeatJsonExport.statusToMap(i, lines) + ',';
			if (i === lastIndex || (i < lastIndex && lines[i + 1].barLine)) {
				map.push(mapText.substr(0, mapText.length - 1));
				mapText = '';
			}
		}
		return map;
	}

	private static requireOption(index: number, lines: INotesLineState[]): IMapOption | undefined {
		const cur = lines[index];
		if (index === 0) {
			const option: IMapOption = {
				barLine: !cur.barLineState ? false : undefined,
				speed: cur.speed !== 1.0 ? cur.speed : undefined,
			};
			if (option.barLine === undefined && option.speed === undefined) {
				return undefined;
			}
			return JSON.parse(JSON.stringify(option)) as IMapOption;;
		}
		const pre = lines[index - 1];
		const option: IMapOption = {
			barLine: cur.barLineState !== pre.barLineState ? cur.barLineState : undefined,
			bpm: cur.bpm !== pre.bpm ? cur.bpm : undefined,
			speed: cur.speed !== pre.speed ? cur.speed : undefined,
		};
		if (option.barLine === undefined && option.bpm === undefined && option.speed === undefined) {
			return undefined;
		}
		return JSON.parse(JSON.stringify(option)) as IMapOption;
	}

	private static statusToMap(index: number, lines: INotesLineState[]) {
		let mapText = '';
		if ((index === 0 && lines[0].snap24) || (index > 0 && !lines[index - 1].snap24 && lines[index].snap24)) {
			mapText += '(';
		}
		if ((index === 0 && lines[0].inBind) || (index > 0 && !lines[index - 1].inBind && lines[index].inBind)) {
			mapText += '[';
		}
		if (index > 0 && lines[index - 1].snap24 && !lines[index].snap24) {
			mapText += ')';
		}
		if (index > 0 && lines[index - 1].inBind && !lines[index].inBind) {
			mapText += ']';
		}
		lines[index].status.forEach((value, index) => {
			if (value === NotesStatus.NORMAL) {
				mapText += (index + 1);
			} else if (value === NotesStatus.ATTACK) {
				mapText += (index + 5);
			} else if (value < 4) {
				const lnText = value === NotesStatus.LONG_START ? 'abcd' : 'efgh';
				mapText += lnText[index];
			}
		});
		return mapText;
	}
}
