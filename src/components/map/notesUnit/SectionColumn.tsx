import * as React from 'react';
import { useSelector, useDispatch } from "react-redux";
import { AppState } from '../../../store';
import { Button } from '@blueprintjs/core';
import HalfBeat from './HalfBeat';
import { IconNames } from '@blueprintjs/icons';
import mapStateModule from '../../../modules/mapState';

interface ISectionColumn {
	sectionIndex: number;
	sectionLength: number;
	halfBeats: Array<number[]>;
}

const SectionColumn: React.SFC<ISectionColumn> = (props: ISectionColumn) => {
	const dispatch = useDispatch();
	const isDark = useSelector((state: AppState) => state.editorSetting.themeBlack);
	const column = useSelector((state: AppState) => state.editorSetting.notesDisplay.column);
	const notesWidth = useSelector((state: AppState) => state.editorSetting.notesDisplay.notesWidth);
	const intervalRatio = useSelector((state: AppState) => state.editorSetting.notesDisplay.intervalRatio);
	const notesAspect = useSelector((state: AppState) => state.editorSetting.notesDisplay.aspect);
	const lines = useSelector((state: AppState) => state.editorSetting.notesDisplay.lines);
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
	return (
		<div style={{ position: 'relative', display: 'inline-block', marginLeft: 20, width: `${notesWidth * 5}px`}}>
			<div style={{ position: 'relative', width: '80%', marginBottom: notesWidth / 5 }}>
				{props.sectionIndex > 0 ? <Button icon={IconNames.DELETE} minimal={true} style={{ width: notesWidth, height: notesHeignt, }} onClick={() => dispatch(mapStateModule.actions.removeSection({...props, column: column}))} /> : null}
				<span style={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', fontSize: notesWidth / 3}}>{props.sectionIndex + 1}</span>
				<Button icon={IconNames.ADD} minimal={true} style={{ width: notesWidth, height: notesHeignt, marginLeft: notesWidth * (props.sectionIndex > 0 ? 2 : 3), }} onClick={() => dispatch(mapStateModule.actions.addSection({insertIndex: endIndex, lines: lines}))} />
			</div>
			<div style={sectionStyle}>
				{props.halfBeats.map((value, index) => <HalfBeat key={index} halfBeatIndex={index} notesIndexes={value} />)}
				{[0, 1, 2, 3, 4].map((value) => {
					return <div key={value} style={laneLineStyle(value * notesWidth)}></div>
				})}
			</div>
		</div>
	);
};

export default SectionColumn;
