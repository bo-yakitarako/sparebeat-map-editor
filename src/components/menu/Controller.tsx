import * as React from 'react';
import { useSelector, useDispatch } from "react-redux";
import { AppState } from '../../store';
import { NumericInput, Card, Elevation, Divider, Button, ButtonGroup, Slider } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import Notes, { NotesStatus } from '../map/Notes';
import mapStateModule from '../../modules/mapState';
import editorSettingModule, { EditMode, NotesMode } from '../../modules/editorSetting';

const controllerStyle: React.CSSProperties = {
	display: "inline-flex",
	flexDirection: "column",
	width: "200px",
	minHeight: "100%",
	maxHeight: "100%",
	textAlign: "left",
	overflowY: 'scroll',
};

const currentTimeCardStyle: React.CSSProperties = {
	width: '100%',
	textAlign: 'center',
	fontSize: '24px',
}

const music = new Audio('media/Grievous_Lady.mp3');
music.volume = 0.1;

const Controller = () => {
	const dispatch = useDispatch();
	const putting = true;
	const notesWidth = 60;
	const loaded = useSelector((state: AppState) => state.editorSetting.loaded);
	const editMode = useSelector((state: AppState) => state.editorSetting.editMode);
	const notesMode = useSelector((state: AppState) => state.editorSetting.notesMode);
	const barPos = useSelector((state: AppState) => state.editorSetting.barPos);
	const mapState = useSelector((state: AppState) => state.mapState.current);
	const bpmChanges = mapState.bpmChanges;
	const changeEdit = (mode: EditMode) => () => {
		dispatch(editorSettingModule.actions.changeEditMode(mode));
	}
	const changeNotes = (mode: NotesMode) => () => {
		dispatch(editorSettingModule.actions.changeNotesMode(mode));
	}
	music.ontimeupdate = () => {
		dispatch(editorSettingModule.actions.updateBarPos({time: music.currentTime, bpmChanges: bpmChanges}));
		console.log(barPos);
	};
	// setInterval(() => {
	// }, 1000);
	return (
		<Card elevation={Elevation.TWO} style={controllerStyle}>
			<p>Start Time</p>
			<NumericInput disabled={!loaded} placeholder="Start Time" style={{width: "120px"}} onValueChange={(value) => {console.log(value)}} />
			<Divider />
			<p>ノーツオプション</p>
			<ButtonGroup fill={true}>
				<Button disabled={!loaded} icon={IconNames.EDIT} active={loaded && editMode === 'add'} onClick={changeEdit('add')} />
				<Button disabled={!loaded} icon={IconNames.ERASER} active={loaded && editMode === 'remove'} onClick={changeEdit('remove')} />
				<Button disabled={!loaded} icon={IconNames.MUSIC} active={loaded && editMode === 'music'} onClick={changeEdit('music')} />
			</ButtonGroup>
			<ButtonGroup fill={true}>
				<Button active={loaded && notesMode === 'normal'} disabled={!putting || !loaded || editMode !== 'add'}><Notes index={0} status={NotesStatus.NORMAL} width={notesWidth} onClick={changeNotes('normal')} /></Button>
				<Button active={loaded && notesMode === 'attack'} disabled={!putting || !loaded || editMode !== 'add'}><Notes index={0} status={NotesStatus.ATTACK} width={notesWidth} onClick={changeNotes('attack')} /></Button>
			</ButtonGroup>
			<ButtonGroup fill={true}>
				<Button active={loaded && notesMode === 'longStart'} disabled={!putting || !loaded || editMode !== 'add'}><Notes index={0} status={NotesStatus.LONG_START} width={notesWidth} onClick={changeNotes('longStart')} /></Button>
				<Button active={loaded && notesMode === 'longEnd'} disabled={!putting || !loaded || editMode !== 'add'}><Notes index={0} status={NotesStatus.LONG_END} width={notesWidth} onClick={changeNotes('longEnd')} /></Button>
			</ButtonGroup>
			<Divider />
				<p>ビートスナップ変更</p>
				<Button disabled={!loaded} icon={IconNames.EXCHANGE} text={`1/4 ${mapState.snap24 ? '←' : '→'} 1/6`} onClick={() => dispatch(mapStateModule.actions.changeSnap())} />
			<Divider />
			<ButtonGroup fill={true} vertical={true}>
				<Button disabled={!loaded || mapState.historyIndex === 0} icon={IconNames.UNDO} text='元に戻す' onClick={() => dispatch(mapStateModule.actions.undo())} />
				<Button disabled={!loaded || mapState.historyIndex === mapState.linesHistory.length - 1} icon={IconNames.REDO} text='やり直し' onClick={() => dispatch(mapStateModule.actions.redo())} />
			</ButtonGroup>
			<Divider />
			<p>Music Player</p>
			<Card style={currentTimeCardStyle}>00:00:00</Card>
			<ButtonGroup fill={true}>
				<Button disabled={!loaded} icon={IconNames.PLAY} onClick={() => {
					music.play();
				}} />
				<Button disabled={!loaded} icon={IconNames.STOP} onClick={() => {
					music.pause();
				}} />
			</ButtonGroup>
			<br />
			<p>再生位置</p>
			<Slider disabled={!loaded} max={1000} labelRenderer={false} value={500} />
			<br />
			<p>再生速度</p>
			<Slider max={4} intent="success" labelRenderer={false} value={2} />
			<br />
			<p>楽曲音量</p>
			<Slider max={100} intent="warning" labelRenderer={false} value={50} />
			<br />
			<Divider />
			<p>タップ音量</p>
			<Slider max={100} intent="warning" labelRenderer={false} value={50} />
			<br />
		</Card>
	);
};

export default Controller;
