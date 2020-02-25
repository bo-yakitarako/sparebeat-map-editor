import * as React from 'react';
import { NumericInput, Card, Elevation, Divider, Button, ButtonGroup, Slider } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import Notes, { NotesStatus } from '../map/Notes';

const controllerStyle: React.CSSProperties = {
	display: "inline-flex",
	flexDirection: "column",
	width: "200px",
	minHeight: "calc(100vh - 50px)",
	maxHeight: "calc(100vh - 50px)",
	textAlign: "left",
	overflowY: 'scroll',
};

const currentTimeCardStyle: React.CSSProperties = {
	width: '100%',
	textAlign: 'center',
	fontSize: '24px',
}

const Controller = () => {
	const putting = true;
	const notesWidth = 60;
	return (
		<Card elevation={Elevation.TWO} style={controllerStyle}>
			<p>Start Time</p>
			<NumericInput placeholder="Start Time" style={{width: "120px"}} onValueChange={(value) => {console.log(value)}} />
			<Divider />
			<p>ノーツオプション</p>
			<ButtonGroup fill={true}>
				<Button icon={IconNames.EDIT} active={true} />
				<Button icon={IconNames.ERASER} />
				<Button icon={IconNames.MUSIC} />
			</ButtonGroup>
			<ButtonGroup fill={true}>
				<Button active={true} disabled={!putting}><Notes index={0} status={NotesStatus.NORMAL} width={notesWidth} /></Button>
				<Button disabled={!putting}><Notes index={0} status={NotesStatus.NONE} width={notesWidth} /></Button>
			</ButtonGroup>
			<ButtonGroup fill={true}>
				<Button disabled={!putting}><Notes index={0} status={NotesStatus.LONG_START} width={notesWidth} /></Button>
				<Button disabled={!putting}><Notes index={0} status={NotesStatus.LONG_END} width={notesWidth} /></Button>
			</ButtonGroup>
			<Divider />
				<p>ビートスナップ変更</p>
				<Button icon={IconNames.EXCHANGE} text={`16分 → 24分`} />
			<Divider />
			<ButtonGroup fill={true} vertical={true}>
				<Button icon={IconNames.UNDO} text='元に戻す' />
				<Button icon={IconNames.REDO} text='やり直し' />
			</ButtonGroup>
			<Divider />
			<p>Music Player</p>
			<Card style={currentTimeCardStyle}>00:00</Card>
			<ButtonGroup fill={true}>
				<Button icon={IconNames.PLAY} />
				<Button icon={IconNames.STOP} />
			</ButtonGroup>
			<br />
			<p>再生位置</p>
			<Slider max={1000} labelRenderer={false} value={500} />
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
