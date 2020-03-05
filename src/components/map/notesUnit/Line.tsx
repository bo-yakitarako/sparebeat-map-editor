import React, { useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { AppState } from '../../../store';
import editorModule, { NotesMode } from '../../../modules/editorModule';
import { Button, Dialog, Checkbox, Classes } from '@blueprintjs/core';
import Notes, { NotesStatus } from '../Notes';

interface ILine {
	lineIndex: number;
	innerBeatIndex: number;
	snap24: boolean;
	centerLine?: boolean;
}

export interface IChangeNotesStatus {
	lineIndex: number;
	laneIndex: number;
	newStatus: NotesStatus;
}

const Line: React.SFC<ILine> = (props: ILine) => {
	const [dialogOpened, open] = useState(false);
	const dispatch = useDispatch();
	const { themeDark, editMode, notesMode, temporaryNotesOption, rangeSelect: { select } } = useSelector((state: AppState) => state);
	const { lines } = useSelector((state: AppState) => state[state.current]);
	const { notesWidth, intervalRatio, aspect } = useSelector((state: AppState) => state.notesDisplay);
	const currentLine = lines[props.lineIndex];
	const height = notesWidth / aspect;
	const location = (props.snap24 ? 1 : 1.5) * props.innerBeatIndex * height * intervalRatio;
	const bpmChanging = props.lineIndex === 0 || currentLine.bpm !== lines[props.lineIndex - 1].bpm;
	const speedChanging = props.lineIndex > 0 && currentLine.speed !== lines[props.lineIndex - 1].speed;
	const isBarLine = currentLine.barLineState && currentLine.barLine;
	const optionStyle = editMode === 'add' ? (themeDark ? 'notesOptionDark' : 'notesOption') : '';
	const selected = (laneIndex: number) => select.reduce((pre, cur) => {
		const inSelect = cur.lane.start <= laneIndex && laneIndex <= cur.lane.end && cur.line.start <= props.lineIndex && props.lineIndex <= cur.line.end;
		return pre || inSelect;
	}, false);
	const lineStyle: React.CSSProperties = {
		position: 'absolute',
		left: '0',
		bottom: `${location}px`,
		width: '100%',
		height: `${height}px`,
		fontSize: 0,
		whiteSpace: 'nowrap',
		overflow: 'hidden',
	};
	const barLineStyle: React.CSSProperties = {
		position: 'absolute',
		left: `0px`,
		top: `calc(50% - 1px)`,
		width: `100%`,
		height: '2px',
		backgroundColor: themeDark ? '#BFCCD6' : '#5C7080',
		zIndex: 2,
	};
	const notesOption = (
		<div className={optionStyle} style={{
			position: 'absolute',
			top: 0,
			left: notesWidth * 4,
			width: notesWidth,
			height: '100%',
			textAlign: 'center',
			fontSize: notesWidth / 3,
			color: themeDark ? '#14CCBD' : '#008075',
			cursor: 'pointer',
			zIndex: 1,
		}} onClick={() => {
			if (editMode === 'add') {
				open(true);
			}
		}}>
			<div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
				{bpmChanging ? currentLine.bpm : speedChanging && currentLine.speed ? `×${currentLine.speed.toFixed(1)}` : ''}
			</div>
			{isBarLine ? <div style={barLineStyle}></div> : null}
		</div>
	);
	const convertNotesStatus = (addNotes: NotesMode) => {
		return addNotes === 'normal' ? NotesStatus.NORMAL :
				addNotes === 'attack' ? NotesStatus.ATTACK :
					addNotes === 'longStart' ? NotesStatus.LONG_START :
						NotesStatus.LONG_END;
	}
	const changeNotes = (index: number) => (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
		const notesStatus = convertNotesStatus(notesMode);
		if (editMode === 'add' && notesStatus !== currentLine.status[index]) {
			const changeStatus: IChangeNotesStatus = {
				lineIndex: props.lineIndex,
				laneIndex: index,
				newStatus: notesStatus,
			};
			dispatch(editorModule.actions.changeNotesStatus(changeStatus));
		}
	};
	const changeNotesOnRightClick = (index: number) => (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
		if (editMode === 'add' && currentLine.status[index] < 4) {
			dispatch(editorModule.actions.changeNotesStatus({lineIndex: props.lineIndex, laneIndex: index, newStatus: NotesStatus.NONE}));
		}
	};
	const inputStyle: React.CSSProperties = {
		width: '40%',
		marginBottom: '4%',
	};
	return (
		<div style={lineStyle}>
			<Dialog className={ themeDark ? Classes.DARK : '' } isOpen={dialogOpened} title="オプションの変更" onClose={() => {open(false)}} onOpening={() => {
				dispatch(editorModule.actions.saveTemporaryNotesOption(props.lineIndex));
			}} >
				<div className={Classes.DIALOG_BODY} style={{textAlign: 'center'}} >
					<input style={{...inputStyle, marginRight: '5%'}} className={Classes.INPUT} placeholder="bpmを入力" defaultValue={currentLine.bpm.toString()} onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
						const value = parseFloat(event.target.value);
						dispatch(editorModule.actions.updateTemporaryNotesOption({ index: props.lineIndex, target: 'bpm', value: isNaN(value) || value < 1 ? currentLine.bpm : value}));
					}} />
					<input style={inputStyle} className={Classes.INPUT} placeholder="speedを入力" defaultValue={currentLine.speed.toString()} onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
						const value = parseFloat(event.target.value);
						dispatch(editorModule.actions.updateTemporaryNotesOption({ index: props.lineIndex, target: 'speed', value: isNaN(value) ? currentLine.speed : value}));
					}} /><br />
					<Checkbox disabled={props.lineIndex === 0} style={{marginRight: '5%'}} label="小節線" inline={true} large={true} defaultChecked={currentLine.barLine} onChange={(event: React.FormEvent<HTMLInputElement>) => {
						dispatch(editorModule.actions.updateTemporaryNotesOption({ index: props.lineIndex, target: 'barLine', value: event.currentTarget.checked}));
					}} />
					<Checkbox style={{marginRight: '5%'}} label="小節線を表示" inline={true} large={true} defaultChecked={currentLine.barLineState} onChange={(event: React.FormEvent<HTMLInputElement>) => {
						dispatch(editorModule.actions.updateTemporaryNotesOption({ index: props.lineIndex, target: 'barLineState', value: event.currentTarget.checked}));
					}} />
					<Checkbox label="バインドゾーン" inline={true} large={true} defaultChecked={currentLine.inBind} onChange={(event: React.FormEvent<HTMLInputElement>) => {
						dispatch(editorModule.actions.updateTemporaryNotesOption({ index: props.lineIndex, target: 'inBind', value: event.currentTarget.checked}));
					}} />
				</div>
				<div className={Classes.DIALOG_FOOTER} style={{textAlign: 'right'}}>
					<Button text="キャンセル" onClick={() => open(false)} style={{width: 100, marginRight: 20}} />
					<Button text="OK" style={{ width: 100 }} onClick={() => {
						let changed = false;
						if (temporaryNotesOption.barLine !== currentLine.barLine) {
							dispatch(editorModule.actions.changeNotesOption({lineIndex: props.lineIndex, target: 'barLine', update: temporaryNotesOption.barLine}));
							changed = true;
						}
						if (temporaryNotesOption.bpm !== currentLine.bpm) {
							dispatch(editorModule.actions.changeNotesOption({lineIndex: props.lineIndex, target: 'bpm', update: temporaryNotesOption.bpm}));
							changed = true;
						}
						if (temporaryNotesOption.speed !== currentLine.speed) {
							dispatch(editorModule.actions.changeNotesOption({lineIndex: props.lineIndex, target: 'speed', update: temporaryNotesOption.speed}));
							changed = true;
						}
						if (temporaryNotesOption.barLineState !== currentLine.barLineState) {
							dispatch(editorModule.actions.changeNotesOption({lineIndex: props.lineIndex, target: 'barLineState', update: temporaryNotesOption.barLineState}));
							changed = true;
						}
						if (temporaryNotesOption.inBind !== currentLine.inBind) {
							dispatch(editorModule.actions.changeNotesOption({lineIndex: props.lineIndex, target: 'inBind', update: temporaryNotesOption.inBind}));
							changed = true;
						}
						if (changed) {
							dispatch(editorModule.actions.addHistory());
						}
						open(false);
					}} />
				</div>
			</Dialog>
			{currentLine.status.map((value, index) => {
				return <Notes key={index} index={index} width={notesWidth} status={value} aspect={aspect} inBind={currentLine.inBind} centerLine={props.centerLine} selected={selected(index)} onClick={changeNotes(index)} onRightClick={changeNotesOnRightClick(index)} lineIndex={props.lineIndex} />
			})}
			{notesOption}
		</div>
	);
};

export default Line;

