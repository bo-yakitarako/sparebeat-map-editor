import * as React from 'react';
import { useSelector, useDispatch } from "react-redux";
import { AppState } from '../../store';
import { NumericInput, Card, Elevation, Divider, Button, ButtonGroup, Slider } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import Notes, { NotesStatus } from '../map/Notes';
import mapStateModule from '../../modules/editorModule';
import editorModule, { EditMode, NotesMode, Slider as SliderType } from '../../modules/editorModule';
import { playMusic, clapActiveTime, stopMusic, changeClapVolume } from '../../modules/music/clapModule';

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
	const { loaded, editMode, notesMode, currentTime, playing, startTime, sliderValue } = useSelector((state: AppState) => state);
	const { snap24, linesHistory, historyIndex, activeTime } = useSelector((state: AppState) => state[state.current]);
	music.onloadeddata = () => {
		dispatch(editorModule.actions.load());
	};
	if (!playing) {
		music.pause();
	}
	const changeEdit = (mode: EditMode) => () => {
		dispatch(editorModule.actions.changeEditMode(mode));
	}
	const changeNotes = (mode: NotesMode) => () => {
		dispatch(editorModule.actions.changeNotesMode(mode));
	};
	const changeSliderValue = (slider: SliderType) => (value: number) => {
		dispatch(editorModule.actions.changeSliderValue({slider: slider, value: value}));
	};
	const pause = () => {
		music.pause();
		music.currentTime = currentTime;
		stopMusic();
		dispatch(editorModule.actions.pause());
	};

	return (
		<Card elevation={Elevation.TWO} style={controllerStyle}>
			<p>Start Time</p>
			<NumericInput disabled={!loaded} placeholder="Start Time" style={{width: "120px"}} value={startTime} onValueChange={(value) => {dispatch(editorModule.actions.setStartTime({value: value, time: music.currentTime}))}} />
			<Divider />
			<p>編集ツール</p>
			<ButtonGroup fill={true}>
				<Button disabled={!loaded} icon={IconNames.EDIT} active={loaded && editMode === 'add'} onClick={changeEdit('add')} />
				<Button disabled={!loaded} icon={IconNames.SELECT} active={loaded && editMode === 'select'} onClick={changeEdit('select')} />
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
				<Button disabled={!loaded} icon={IconNames.EXCHANGE} text={`1/4 ${snap24 ? '←' : '→'} 1/6`} onClick={() => dispatch(mapStateModule.actions.changeSnap())} />
			<Divider />
			<ButtonGroup fill={true} vertical={true}>
				<Button disabled={!loaded || historyIndex === 0} icon={IconNames.UNDO} text='元に戻す' onClick={() => dispatch(mapStateModule.actions.undo())} />
				<Button disabled={!loaded || historyIndex === linesHistory.length - 1} icon={IconNames.REDO} text='やり直し' onClick={() => dispatch(mapStateModule.actions.redo())} />
			</ButtonGroup>
			<Divider />
			<p>Music Player</p>
			<Card style={currentTimeCardStyle}>{formatTime(currentTime)}</Card>
			<ButtonGroup fill={true}>
				<Button disabled={!loaded} icon={!playing ? IconNames.PLAY : IconNames.PAUSE} onClick={() => {
					if (!playing) {
						dispatch(editorModule.actions.play());
						playMusic(currentTime);
						clapActiveTime(activeTime, currentTime, startTime, sliderValue.playbackRate, sliderValue.clapVolume);
					} else {
						pause();
					}
				}} />
				<Button disabled={!loaded} icon={IconNames.STOP} onClick={() => {
					pause();
					dispatch(editorModule.actions.updateCurrentTime(0));
					dispatch(editorModule.actions.updateBarPos(0));
					music.currentTime = 0;
				}} />
			</ButtonGroup>
			<br />
			<Divider />
			<div>再生位置</div>
			<Slider disabled={!loaded} max={1000} labelRenderer={false} value={sliderValue.timePosition} />
			<br />
			<Divider />
			<div>再生速度</div>
			<Slider min={1} max={100} intent="success" labelRenderer={false} value={sliderValue.playbackRate} onChange={changeSliderValue('playbackRate')} onRelease={(value: number) => {
					music.playbackRate = value / 100;
					pause();
				 }
			} />
			<br />
			<Divider />
			<div>楽曲音量</div>
			<Slider max={100} intent="warning" labelRenderer={false} value={sliderValue.musicVolume} onChange={changeSliderValue('musicVolume')} onRelease={
				(value: number) => { music.volume = value / 100 }
			} />
			<br />
			<Divider />
			<div>タップ音量</div>
			<Slider max={100} intent="warning" labelRenderer={false} value={sliderValue.clapVolume} onChange={changeSliderValue('clapVolume')} onRelease={changeClapVolume} />
			<br />
		</Card>
	);
};

export default Controller;
