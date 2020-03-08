import React from 'react';
import { useSelector, useDispatch } from "react-redux";
import { AppState } from '../../store';
import editorModule, { SparebeatTheme, NotesDisplay } from '../../modules/editorModule';
import { Tabs, Tab, Switch, Divider, ButtonGroup, Button, NumericInput } from '@blueprintjs/core';
import { ChromePicker } from 'react-color';
import { NotesStatus } from 'components/map/Notes';
import Notes from '../map/Notes';

const ColorSetting = () => {
	const dispatch = useDispatch();
	const { themeDark, sparebeatTheme, barColor, notesDisplay: { aspect } } = useSelector((state: AppState) => state);
	const changeSparebeatTheme = (theme: SparebeatTheme) => () => {
		if (theme !== sparebeatTheme) {
			dispatch(editorModule.actions.changeSparebeatTheme(theme));
		}
	};
	type LineType = { index: number, status: NotesStatus, style?: React.CSSProperties };
	const displayNotesWidth = 50;
	const Line: React.SFC<LineType> = (props: LineType) => {
		return (
			<div style={ props.style ? props.style : {} }>{ [0, 1, 2, 3].map(i => <Notes key={i} index={i} width={displayNotesWidth} status={i === props.index ? props.status : i === 3 && props.index === 0 ? NotesStatus.ATTACK : NotesStatus.NONE} inBind={props.index === 1} selected={props.index === 2} />) }</div>
		);
	};
	const notesHeight = displayNotesWidth / aspect;
	return (
		<div style={{ marginLeft: '5%' }}>
			<Switch checked={themeDark} label="ダークテーマを適用" onChange={(event) => {
				dispatch(editorModule.actions.changeTheme(event.currentTarget.checked));
			}} />
			<Divider />
			<div>Sparebeatテーマ</div>
			<ButtonGroup style={{ width: '100%', marginTop: '3%', marginBottom: '3%' }}>
				{ (['default', 'sunset', '39'] as SparebeatTheme[] ).map((value: SparebeatTheme) => {
					return <Button key={value} style={{ width: '33.3%' }} active={sparebeatTheme === value} text={value} onClick={changeSparebeatTheme(value)} />
				}) }
			</ButtonGroup>
			<Divider />
			<div style={{ margin: '5% 0' }}>
				<div style={{ position: 'relative', display: 'inline-block', width: 4 * displayNotesWidth, fontSize: 0 }}>
					<Line index={3} status={NotesStatus.LONG_END} />
					<Line index={2} status={NotesStatus.LONG_START} style={{ marginTop: notesHeight / 2 }} />
					<Line index={1} status={NotesStatus.NORMAL} style={{ marginTop: notesHeight / 2 }} />
					<Line index={0} status={NotesStatus.NORMAL} style={{ marginTop: notesHeight / 2 }} />
					<div style={{ position: 'absolute', width: '100%', height: 4, left: 0, top: '50%', transform: 'translateY(-50%)', backgroundColor: barColor }}></div>
				</div>
				<div style={{ display: 'inline-block', marginLeft: '4%',  }}>
					<div style={{ marginBottom: '2%' }}>再生バーの色設定</div>
					<ChromePicker color={barColor} onChange={color => {
						dispatch(editorModule.actions.changeBarColor(color.hex));
					}} />
				</div>
			</div>
		</div>
	);
};

const DisplaySetting = () => {
	const dispatch = useDispatch();
	const { barWidth, notesDisplay: { notesWidth, column, intervalRatio, aspect }, historySize, currentTime } = useSelector((state: AppState) => state);
	const changeNotesDisplay = (setting: NotesDisplay, min: number) => (num: number, str: string) => {
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
