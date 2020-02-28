import * as React from 'react';
import { useSelector, useDispatch } from "react-redux";
import { AppState } from '../../../store';
import Notes, { NotesStatus } from '../Notes';
import mapStateModule from '../../../modules/mapState';
import { NotesMode, EditMode } from 'modules/editorSetting';

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
	const dispatch = useDispatch();
	const notesWidth = useSelector((state: AppState) => state.editorSetting.notesDisplay.notesWidth);
	const intervalRatio = useSelector((state: AppState) => state.editorSetting.notesDisplay.intervalRatio);
	const notesAspect = useSelector((state: AppState) => state.editorSetting.notesDisplay.aspect);
	const isDark = useSelector((state: AppState) => state.editorSetting.themeBlack);
	const editMode = useSelector((state: AppState) => state.editorSetting.editMode);
	const addNotes = useSelector((state: AppState) => state.editorSetting.notesMode);
	const lineState = useSelector((state: AppState) => state.mapState.current.lines);
	const currentLineState = lineState[props.lineIndex];
	const height = notesWidth / notesAspect;
	const location = (props.snap24 ? 1 : 1.5) * props.innerBeatIndex * height * intervalRatio;
	const canDisplayBpm = props.lineIndex === 0 || currentLineState.bpm !== lineState[props.lineIndex - 1].bpm;
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
			<div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
				{canDisplayBpm ? currentLineState.bpm : currentLineState.speed ? `× ${currentLineState.speed.toFixed(1)}` : ''}
			</div>
			{currentLineState.barLine ? <div style={barLineStyle}></div> : null}
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
		if (editMode !== 'music' && notesStatus !== currentLineState.status[index]) {
			const changeStatus: IChangeNotesStatus = {
				lineIndex: props.lineIndex,
				laneIndex: index,
				newStatus: notesStatus,
			};
			dispatch(mapStateModule.actions.changeNotesStatus(changeStatus));
		}
	}
	return (
		<div style={lineStyle}>
			{currentLineState.status.map((value, index) => {
				return <Notes key={index} index={index} width={notesWidth} status={value} aspect={notesAspect} onClick={changeNotes(index)} centerLine={props.centerLine} />
			})}
			{notesOption}
		</div>
	);
};

export default Line;

