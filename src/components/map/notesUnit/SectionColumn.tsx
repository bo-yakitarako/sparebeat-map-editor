import * as React from 'react';
import { useSelector, useDispatch } from "react-redux";
import { AppState } from '../../../store';
import { Button } from '@blueprintjs/core';
import HalfBeat from './HalfBeat';
import { IconNames } from '@blueprintjs/icons';
import mapStateModule from '../../../modules/editorModule';

interface ISectionColumn {
	id?: number;
	sectionIndex: number;
	halfBeats: Array<number[]>;
}

const SectionColumn: React.SFC<ISectionColumn> = (props: ISectionColumn) => {
	const dispatch = useDispatch();
	const setting = useSelector((state: AppState) => state);
	const isDark = setting.themeDark;
	const notesWidth = setting.notesDisplay.notesWidth;
	const intervalRatio = setting.notesDisplay.intervalRatio;
	const notesAspect = setting.notesDisplay.aspect;
	const lines = setting.notesDisplay.sectionLineCount;
	const barPos = setting.barPos;
	const notesHeignt = notesWidth / notesAspect;
	const height = (lines / 2) * (3 * notesHeignt) * intervalRatio;
	const endBeat = props.halfBeats[props.halfBeats.length - 1];
	const endIndex = endBeat[endBeat.length - 1];
	const sectionStyle: React.CSSProperties = {
		position: 'relative',
		width: `100%`,
		height: `${height}px`,
		zIndex: 1,
	};
	const laneLineStyle = (x: number): React.CSSProperties => {
		const style: React.CSSProperties = {
			position: 'absolute',
			left: `${x}px`,
			top: 0,
			width: `1px`,
			height: `100%`,
			backgroundColor: isDark ? "#BFCCD6" : "#5C7080",
			zIndex: 2,
		};
		return style;
	};
	const playBarStyle: React.CSSProperties = {
		position: 'absolute',
		width: notesWidth * 4,
		height: setting.barWidth,
		backgroundColor: '#cece9e',
		left: 0,
		zIndex: 3,
	};

	return (
		<div style={{ position: 'relative', display: 'inline-block', marginLeft: 20, width: `${notesWidth * 5}px`, cursor: setting.editMode === 'music' ? 'pointer' : 'default'}}>
			<div style={{ position: 'relative', width: '80%', marginBottom: notesWidth / 5 }}>
				{props.sectionIndex > 0 ? <Button icon={IconNames.DELETE} minimal={true} style={{ width: notesWidth, height: notesHeignt, }} onClick={() => dispatch(mapStateModule.actions.removeSection(props.halfBeats))} /> : null}
				<span style={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', fontSize: notesWidth / 3}}>{props.sectionIndex + 1}</span>
				<Button icon={IconNames.ADD} minimal={true} style={{ width: notesWidth, height: notesHeignt, marginLeft: notesWidth * (props.sectionIndex > 0 ? 2 : 3), }} onClick={() => dispatch(mapStateModule.actions.addSection({ sectionIndex: props.sectionIndex, insertIndex: endIndex, lines: lines}))} />
			</div>
			<div id={`section${props.id}`} style={sectionStyle} >
				{props.halfBeats.map((value, index) => <HalfBeat key={index} halfBeatIndex={index} notesIndexes={value} />)}
				{[0, 1, 2, 3, 4].map((value) => {
					return <div key={value} style={laneLineStyle(value * notesWidth)}></div>
				})}
			</div>
			{barPos.section === props.sectionIndex ? <div style={{...playBarStyle, bottom: barPos.pos}}></div> : null}
		</div>
	);
};

export default SectionColumn;