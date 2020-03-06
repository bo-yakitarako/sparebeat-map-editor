import { IEditorState } from '../editorModule';

export interface IBpmChanges {
	bpm: number;
	time: number;
}

export interface IClap {
	music: HTMLAudioElement[];
	clapIndex: number;
	clapTime: number[];
}

export type SectionPos = {
	section: number,
	pos: number,
}

export default class MusicBar {
	private barWidth: number;
	private startTime: number;
	private notesHeight: number;
	private lines: number;
	private intervalRatio: number;
	private bpmChanges: IBpmChanges[];

	constructor(setting: IEditorState, bpmChanges: IBpmChanges[]) {
		this.barWidth = setting.barWidth;
		this.startTime = setting.startTime;
		this.notesHeight = setting.notesDisplay.notesWidth / setting.notesDisplay.aspect;
		this.lines = setting.notesDisplay.sectionLineCount;
		this.intervalRatio = setting.notesDisplay.intervalRatio;
		this.bpmChanges = [...bpmChanges];
	}

	private get sectinHeight() {
		return this.lines * 1.5 * this.intervalRatio * this.notesHeight;
	}

	private calcPos = (time: number, bpm: number) => time * bpm * this.notesHeight * this.intervalRatio / 10;

	public currentPosition(time: number): SectionPos {
		time -= this.startTime / 1000;
		const effectiveBpm = this.bpmChanges.filter((value) => value.time < time);
		effectiveBpm.push({bpm: 0, time: time});
		let pos = 0;
		for (let i = 1; i < effectiveBpm.length; i++) {
			pos += this.calcPos(effectiveBpm[i].time - effectiveBpm[i - 1].time, effectiveBpm[i - 1].bpm);
		}
		pos += (this.notesHeight - this.barWidth) / 2;
		const sectionHeight = this.sectinHeight;
		const sectionIndex = Math.floor(pos / sectionHeight);
		const posInSection = pos % sectionHeight;
		return {section: sectionIndex, pos: posInSection};
	}

	public posToTime(sectionPos: SectionPos) {
		const calcTime = (pos: number, bpm: number) => 10 * pos / (bpm * this.notesHeight * this.intervalRatio);
		const calcBpmPos = (i: number) => this.calcPos(this.bpmChanges[i + 1].time - this.bpmChanges[i].time, this.bpmChanges[i].bpm);
		const pos = this.sectinHeight * sectionPos.section + sectionPos.pos - (this.notesHeight - this.barWidth) / 2;
		let bpmPos = 0, add = this.bpmChanges.length > 1 ? calcBpmPos(0) : 0, i = 0;
		while (i < this.bpmChanges.length - 1 && bpmPos + add < pos) {
			i++;
			bpmPos += add;
			add = i < this.bpmChanges.length - 1 ? calcBpmPos(i) : 0;
		}
		return this.bpmChanges[i].time + calcTime(pos - bpmPos, this.bpmChanges[i].bpm) + this.startTime / 1000;
	}
}
