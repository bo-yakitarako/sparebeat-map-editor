import React from 'react';
import { useSelector, useDispatch } from "react-redux";
import { AppState } from '../../../store';
import editorModule, { NotesDisplay } from '../../../modules/editorModule';
import { Tabs, Tab, NumericInput } from '@blueprintjs/core';
import { ColorSetting } from './ColorSetting';

const DisplaySetting = () => {
	const dispatch = useDispatch();
	const { barWidth, notesDisplay: { notesWidth, column, intervalRatio, aspect }, historySize, currentTime, clapDelay } = useSelector((state: AppState) => state);
	const changeNotesDisplay = (setting: NotesDisplay, min: number) => (num: number) => {
		dispatch(editorModule.actions.changeNotesDisplay({ setting: setting, value: isNaN(num) ? min : num }));
	};

	return (
		<div style={{ marginLeft: '5%' }}>
			<div style={{ display: 'inline-block', width: '45%', marginRight: '5%' }}>
				<p>ノーツの幅</p>
				<NumericInput fill={true} min={20} max={100} value={notesWidth} onValueChange={changeNotesDisplay('notesWidth', 20)} />
			</div>
			<div style={{ display: 'inline-block', width: '45%' }}>
				<p>ノーツの縦横比</p>
				<NumericInput fill={true} min={0.1} max={10} value={aspect} stepSize={0.1} onValueChange={changeNotesDisplay('aspect', 0.1)} />
			</div>
			<div style={{ marginBottom: '5%' }}></div>
			<div style={{ display: 'inline-block', width: '45%', marginRight: '5%' }}>
				<p>表示列数</p>
				<NumericInput fill={true} min={1} max={20} value={column} onValueChange={changeNotesDisplay('column', 1)} />
			</div>
			<div style={{ display: 'inline-block', width: '45%' }}>
				<p>上下のノーツとの間隔の比率</p>
				<NumericInput fill={true} min={1} max={5} value={intervalRatio} stepSize={0.1} onValueChange={changeNotesDisplay('intervalRatio', 1)} />
			</div>
			<div style={{ marginBottom: '5%' }}></div>
			<div style={{ display: 'inline-block', width: '45%', marginRight: '5%' }}>
				<p>再生バーの太さ</p>
				<NumericInput fill={true} min={1} max={20} value={barWidth} onValueChange={(num) => {
					dispatch(editorModule.actions.changeBarWidth(isNaN(num) ? 1 : num));
					dispatch(editorModule.actions.updateBarPos(currentTime));
				}} />
			</div>
			<div style={{ display: 'inline-block', width: '45%' }}>
				<p>履歴を残す数(メモリ圧迫注意)</p>
				<NumericInput fill={true} min={10} max={100} value={historySize} onValueChange={(num) => {
					dispatch(editorModule.actions.changeHistorySize(isNaN(num) ? 10 : num));
				}} />
			</div>
			<div style={{ marginBottom: '5%' }}></div>
			<div style={{ width: '45%', marginBottom: '5%', whiteSpace: 'nowrap' }}>
				<p>クラップのタイミング</p>
				<NumericInput fill={true} min={-2000} max={2000} value={clapDelay} onValueChange={(num) => {
					dispatch(editorModule.actions.changeClapDelay(isNaN(num) ? 0 : num));
				}} />
			</div>
		</div>
	);
};

const EditorSetting = () => {
	return (
		<div style={{ width: '95%' }}>
			<Tabs id="editorSetting" defaultSelectedTabId="general" >
				<Tab style={{ width: '20%', marginLeft: '5%', textAlign: 'center' }} id="general" title="全般" panel={ <DisplaySetting /> } />
				<Tab style={{ width: '20%', textAlign: 'center' }} id="color" title="カラー" panel={ <ColorSetting /> } />
			</Tabs>
		</div>
	);
};

export default EditorSetting;
