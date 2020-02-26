import * as React from 'react';
import { useSelector } from "react-redux";
import { AppState } from '../../../store';
import Notes, { NotesStatus } from '../Notes';

interface ILine {
	notesIndex: number;
	innerBeatIndex: number;
	snap24: boolean;
}

const Line: React.SFC<ILine> = (props: ILine) => {
	const notesWidth = useSelector((state: AppState) => state.editorSetting.notesDisplay.notesWidth);
	const isDark = useSelector((state: AppState) => state.editorSetting.themeBlack);
	const height = notesWidth / 2.5;
	const location = (props.snap24 ? 1 : 1.5) * props.innerBeatIndex * height;
	const isBarLine = props.notesIndex === 0;
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
		top: `calc(50% - 0.5px)`,
		width: `100%`,
		height: '1px',
		backgroundColor: isDark ? '#BFCCD6' : '#5C7080',
		zIndex: 2,
	};
	const notesOption = (
		<div style={{
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
		}}>
			<div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>190</div>
			{isBarLine ? <div style={barLineStyle}></div> : null}
		</div>
	);
	const statuses = [
		props.notesIndex % 4 === 0 ? NotesStatus.NORMAL : NotesStatus.NONE,
		props.notesIndex % 4 === 1 ? NotesStatus.NORMAL : NotesStatus.NONE,
		props.notesIndex % 4 === 2 ? NotesStatus.NORMAL : NotesStatus.NONE,
		props.notesIndex % 4 === 3 ? NotesStatus.NORMAL : NotesStatus.NONE,
	];
	return (
		<div style={lineStyle}>
			{statuses.map((value, index) => {
				return <Notes key={index} index={index} width={notesWidth} status={value} />
			})}
			{props.notesIndex === 0 ? notesOption : null}
		</div>
	);
};

export default Line;

