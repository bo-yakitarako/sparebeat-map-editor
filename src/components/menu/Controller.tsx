import * as React from 'react';
import { useSelector, useDispatch } from "react-redux";
import { AppState } from '../../store';
import { NumericInput, Card, Elevation, Divider, Button, ButtonGroup, Slider } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import Notes, { NotesStatus } from '../map/Notes';
import mapStateModule from '../../modules/editorModule';
import editorSettingModule, { EditMode, NotesMode, Slider as SliderType } from '../../modules/editorModule';

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
};

const formatTime = (time: number) => {
	if (time < 0) {
		return '00:00:00';
	}
	const doubleDigest = (num: number) => ("0" + num).slice(-2);
	const minute = Math.floor(time / 60);
	const second = Math.floor(time) % 60;
	const mill = Math.floor(((time - Math.floor(time)) * 100));
	return `${doubleDigest(minute)}:${doubleDigest(second)}:${doubleDigest(mill)}`;
};

const music = document.getElementById('music') as HTMLAudioElement;
const Controller = () => {
	const dispatch = useDispatch();
	const putting = true;
	const notesWidth = 60;
	const loaded = useSelector((state: AppState) => state.loaded);
	const editMode = useSelector((state: AppState) => state.editMode);
	const notesMode = useSelector((state: AppState) => state.notesMode);
	const currentTime = useSelector((state: AppState) => state.currentTime);
	const playing = useSelector((state: AppState) => state.playing);
	const mapState = useSelector((state: AppState) => state.current);
	const startTime = useSelector((state: AppState) => state.startTime);
	const sliderValue = useSelector((state: AppState) => state.sliderValue);
	if (!playing) {
		music.pause();
	}
	const changeEdit = (mode: EditMode) => () => {
		dispatch(editorSettingModule.actions.changeEditMode(mode));
	}
	const changeNotes = (mode: NotesMode) => () => {
		dispatch(editorSettingModule.actions.changeNotesMode(mode));
	};
	const changeSliderValue = (slider: SliderType) => (value: number) => {
		dispatch(editorSettingModule.actions.changeSliderValue({slider: slider, value: value}));
	};

	return (
		<Card elevation={Elevation.TWO} style={controllerStyle}>
			<p>Start Time</p>
			<NumericInput disabled={!loaded} placeholder="Start Time" style={{width: "120px"}} value={startTime} onValueChange={(value) => {dispatch(editorSettingModule.actions.setStartTime({value: value, time: music.currentTime}))}} />
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
			<Card style={currentTimeCardStyle}>{formatTime(currentTime)}</Card>
			<ButtonGroup fill={true}>
				<Button disabled={!loaded} icon={!playing ? IconNames.PLAY : IconNames.PAUSE} onClick={() => {
					if (!playing) {
						dispatch(editorSettingModule.actions.play());
						music.play();
					} else {
						dispatch(editorSettingModule.actions.pause());
						music.pause();
					}
				}} />
				<Button disabled={!loaded} icon={IconNames.STOP} onClick={() => {
					music.pause();
					dispatch(editorSettingModule.actions.pause());
					dispatch(editorSettingModule.actions.updateCurrentTime(0));
					dispatch(editorSettingModule.actions.updateBarPos(0));
					music.currentTime = 0;
				}} />
			</ButtonGroup>
			<br />
			<div>再生位置</div>
			<Slider disabled={!loaded} max={1000} labelRenderer={false} value={sliderValue.timePosition} />
			<br />
			<div>再生速度</div>
			<Slider min={1} max={100} intent="success" labelRenderer={false} value={sliderValue.playbackRate} onChange={changeSliderValue('playbackRate')} onRelease={
				(value: number) => { music.playbackRate = value / 100 }
			} />
			<br />
			<div>楽曲音量</div>
			<Slider max={100} intent="warning" labelRenderer={false} value={sliderValue.musicVolume} onChange={changeSliderValue('musicVolume')} onRelease={
				(value: number) => { music.volume = value / 100 }
			} />
			<br />
			<Divider />
			<div>タップ音量</div>
			<Slider max={100} intent="warning" labelRenderer={false} value={sliderValue.clapVolume} onChange={changeSliderValue('clapVolume')} />
			<br />
		</Card>
	);
};

export default Controller;
