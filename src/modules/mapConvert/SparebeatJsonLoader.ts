import ISparebeatJson, { mapUnion } from './ISparebeatJson';
import { INotesLineState, assignSection, searchActiveTime, getBpmChanges, connectLongNotes } from '../editorModule';
import { NotesStatus } from '../../components/map/Notes';

export class SparebeatJsonLoader {
	private json: ISparebeatJson;

	constructor(jsonString: string) {
		this.json = JSON.parse(jsonString);
	}

	public get info() {
		return this.json;
	}

	public getMapState(difficulty: 'easy' | 'normal' | 'hard') {
		const converted = this.loadMap(this.json.map[difficulty]);
		if (converted !== undefined) {
			const { lines, failed } = converted;
			if (typeof lines === 'number') {
				return lines;
			}
			const sections = assignSection(lines, this.json.beats !== undefined ? this.json.beats * 4 : 16);
			return { state: {
				snap24: lines[0].snap24,
				currentSection: 0,
				sectionLength: sections.length,
				lines: lines,
				linesHistory: [lines],
				historyIndex: 0,
				bpmChanges: getBpmChanges(lines),
				activeTime: searchActiveTime(lines),
			}, failed };
		} else {
			return undefined;
		}
	}

	private loadMap(map: mapUnion[]) {
		let bpm = parseFloat(this.json.bpm.toString());
		if (isNaN(bpm) && typeof map[0] === 'object') {
			bpm = map[0].bpm !== undefined ? parseFloat(map[0].bpm.toString()) : NaN;
		}
		if (isNaN(bpm)) {
			return undefined;
		}
		if (map.length === 0) {
			map.push("");
		}
		let speed = 1.0;
		let barLineState = true;
		let inBind = false, snap24 = false;
		const lines: INotesLineState[] = [];
		let optionCount = 0, failed = -1;
		for (let i = 0; i < map.length; i++) {
			const value = map[i];
			if (typeof value === 'object') {
				bpm = value.bpm !== undefined ? parseFloat(value.bpm.toString()) : bpm;
				speed = value.speed !== undefined ? parseFloat(value.speed.toString()) : speed;
				barLineState = value.barLine !== undefined ? (typeof value.barLine === 'string' ? value.barLine === 'true' : value.barLine) : barLineState;
				optionCount++;
			} else {
				const next = SparebeatJsonLoader.convertMapString(lines, value, snap24, bpm, speed, barLineState, inBind);
				if (next === undefined) {
					failed = i - optionCount;
					break;
				}
				snap24 = next.snap24;
				inBind = next.inBind;
			}
		}
		const beats = this.json.beats !== undefined ? this.json.beats * 4 : 16;
		SparebeatJsonLoader.modifySection(lines, beats);
		return { lines, failed };
	}

	private static modifySection(lines: INotesLineState[], beats: number) {
		const sections = assignSection(lines, beats);
		if (sections[sections.length - 1].length < beats / 2) {
			const lastIndex = lines.length - 1;
			const max = (lines[lastIndex].snap24 ? 1.5 : 1) * (beats - sections[sections.length - 1].length * 2);
			const addFirstIndex = sections[sections.length - 1].length === 0 ?
			sections.length > 1 ? sections[sections.length - 2].reverse()[0].reverse()[0] + 1 : 0 :
			sections.reverse()[0].reverse()[0].reverse()[0] + 1;
			while (lines.length < addFirstIndex + max) {
				lines.push(Object.assign({}, lines[lastIndex], {
					barLine: false,
					status: [...Array(4)].map(() => NotesStatus.NONE),
				}));
			}
		}
	}

	private static convertMapString(lines: INotesLineState[], mapStrings: string, snap24: boolean, bpm: number, speed: number, barLineState: boolean, inBind: boolean): { snap24: boolean, inBind: boolean } | undefined {
		const mapData = mapStrings.split(',');
		for (let i = 0; i < mapData.length; i++) {
			const mapString = mapData[i];
			if ((!inBind && mapString.includes('[')) || (inBind && mapString.includes(']'))) {
				inBind = !inBind;
			}
			if ((!snap24 && mapString.includes('(')) || (snap24 && mapString.includes(')'))) {
				const snapCount = this.countSameSnap(lines, snap24);
				if (snapCount % (!snap24 ? 2 : 3) !== 0) {
					return undefined;
				}
				snap24 = !snap24;
			}
			const status = this.convertMapStringToNotesStatus(mapString);
			lines.push({
				status: status,
				snap24: snap24,
				inBind: inBind,
				bpm: bpm,
				speed: speed,
				barLine: i === 0,
				barLineState: barLineState,
			});
			status.forEach((value, index) => {
				if (value === NotesStatus.LONG_END) {
					connectLongNotes({lineIndex: lines.length - 1, laneIndex: index, newStatus: value}, lines);
				}
			});
		}
		return {snap24: snap24, inBind: inBind};
	}

	private static convertMapStringToNotesStatus(mapString: string) {
		const status: NotesStatus[] = [NotesStatus.NONE, NotesStatus.NONE, NotesStatus.NONE, NotesStatus.NONE];
		mapString.split('').forEach((notesString) => {
			switch (notesString) {
				case '1':
					status[0] = NotesStatus.NORMAL;
					break;
				case '2':
					status[1] = NotesStatus.NORMAL;
					break;
				case '3':
					status[2] = NotesStatus.NORMAL;
					break;
				case '4':
					status[3] = NotesStatus.NORMAL;
					break;
				case '5':
					status[0] = NotesStatus.ATTACK;
					break;
				case '6':
					status[1] = NotesStatus.ATTACK;
					break;
				case '7':
					status[2] = NotesStatus.ATTACK;
					break;
				case '8':
					status[3] = NotesStatus.ATTACK;
					break;
				case 'a':
					status[0] = NotesStatus.LONG_START;
					break;
				case 'b':
					status[1] = NotesStatus.LONG_START;
					break;
				case 'c':
					status[2] = NotesStatus.LONG_START;
					break;
				case 'd':
					status[3] = NotesStatus.LONG_START;
					break;
				case 'e':
					status[0] = NotesStatus.LONG_END;
					break;
				case 'f':
					status[1] = NotesStatus.LONG_END;
					break;
				case 'g':
					status[2] = NotesStatus.LONG_END;
					break;
				case 'h':
					status[3] = NotesStatus.LONG_END;
					break;
			}
		});
		return status;
	}

	private static countSameSnap(lines: INotesLineState[], snap: boolean) {
		let count = 0;
		for (let i = lines.length - 1; i >= 0 && lines[i].snap24 === snap; i--) {
			count++;
		}
		return count;
	}
}
