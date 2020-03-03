import React, { useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { AppState } from '../../../store';
import editorModule, { EditMode, NotesMode } from '../../../modules/editorModule';
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
	const notesWidth = useSelector((state: AppState) => state.notesDisplay.notesWidth);
	const intervalRatio = useSelector((state: AppState) => state.notesDisplay.intervalRatio);
	const notesAspect = useSelector((state: AppState) => state.notesDisplay.aspect);
	const isDark = useSelector((state: AppState) => state.themeDark);
	const editMode = useSelector((state: AppState) => state.editMode);
	const addNotes = useSelector((state: AppState) => state.notesMode);
	const lineState = useSelector((state: AppState) => state.current.lines);
	const currentLine = lineState[props.lineIndex];
	const temporary = useSelector((state: AppState) => state.temporaryNotesOption);
	const height = notesWidth / notesAspect;
	const location = (props.snap24 ? 1 : 1.5) * props.innerBeatIndex * height * intervalRatio;
	const bpmChanging = props.lineIndex === 0 || currentLine.bpm !== lineState[props.lineIndex - 1].bpm;
	const speedChanging = props.lineIndex > 0 && currentLine.speed !== lineState[props.lineIndex - 1].speed;
	const isBarLine = currentLine.barLineState && currentLine.barLine;
	const optionStyle = editMode !== 'music' ? (isDark ? 'notesOptionDark' : 'notesOption') : '';
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
		backgroundColor: isDark ? '#BFCCD6' : '#5C7080',
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
			color: isDark ? '#14CCBD' : '#008075',
			cursor: 'pointer',
			zIndex: 1,
		}} onClick={() => {
			open(true);
		}}>
			<div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
				{bpmChanging ? currentLine.bpm : speedChanging && currentLine.speed ? `×${currentLine.speed.toFixed(1)}` : ''}
			</div>
			{isBarLine ? <div style={barLineStyle}></div> : null}
		</div>
	);
	const convertNotesStatus = (editMode: EditMode, addNotes: NotesMode) => {
		return editMode === 'remove' ? NotesStatus.NONE :
			addNotes === 'normal' ? NotesStatus.NORMAL :
				addNotes === 'attack' ? NotesStatus.ATTACK :
					addNotes === 'longStart' ? NotesStatus.LONG_START :
						NotesStatus.LONG_END;
	}
	const changeNotes = (index: number) => () => {
		const notesStatus = convertNotesStatus(editMode, addNotes);
		if (editMode !== 'music' && notesStatus !== currentLine.status[index]) {
			const changeStatus: IChangeNotesStatus = {
				lineIndex: props.lineIndex,
				laneIndex: index,
				newStatus: notesStatus,
			};
			dispatch(editorModule.actions.changeNotesStatus(changeStatus));
		}
	}
	const inputStyle: React.CSSProperties = {
		width: '40%',
		marginBottom: '4%',
	};
	return (
		<div style={lineStyle}>
			<Dialog isOpen={dialogOpened} title="オプションの変更" onClose={() => {open(false)}} onOpening={() => {
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
						if (temporary.barLine !== currentLine.barLine) {
							dispatch(editorModule.actions.changeNotesOption({lineIndex: props.lineIndex, target: 'barLine', update: temporary.barLine}));
							changed = true;
						}
						if (temporary.bpm !== currentLine.bpm) {
							dispatch(editorModule.actions.changeNotesOption({lineIndex: props.lineIndex, target: 'bpm', update: temporary.bpm}));
							changed = true;
						}
						if (temporary.speed !== currentLine.speed) {
							dispatch(editorModule.actions.changeNotesOption({lineIndex: props.lineIndex, target: 'speed', update: temporary.speed}));
							changed = true;
						}
						if (temporary.barLineState !== currentLine.barLineState) {
							dispatch(editorModule.actions.changeNotesOption({lineIndex: props.lineIndex, target: 'barLineState', update: temporary.barLineState}));
							changed = true;
						}
						if (temporary.inBind !== currentLine.inBind) {
							dispatch(editorModule.actions.changeNotesOption({lineIndex: props.lineIndex, target: 'inBind', update: temporary.inBind}));
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
				return <Notes key={index} index={index} width={notesWidth} status={value} aspect={notesAspect} inBind={currentLine.inBind} onClick={changeNotes(index)} centerLine={props.centerLine} />
			})}
			{notesOption}
		</div>
	);
};

export default Line;

