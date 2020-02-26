import * as React from 'react';
import { useSelector } from "react-redux";
import { AppState } from '../../../store';
import { Button } from '@blueprintjs/core';
import HalfBeat from './HalfBeat';
import { IconNames } from '@blueprintjs/icons';

interface ISectionColumn {
	halfBeats: Array<number[]>;
}

const SectionColumn: React.SFC<ISectionColumn> = (props: ISectionColumn) => {
	const isDark = useSelector((state: AppState) => state.editorSetting.themeBlack);
	const notesWidth = useSelector((state: AppState) => state.editorSetting.notesDisplay.notesWidth);
	const lines = useSelector((state: AppState) => state.editorSetting.notesDisplay.lines);
	const notesHeignt = notesWidth / 2.5;
	const height = (lines / 2) * (3 * notesHeignt);
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
			<div style={{width: '100%', marginBottom: notesWidth / 5}}>
				<Button icon={IconNames.DELETE} minimal={true} style={{ position: 'relative', width: notesWidth, height: notesHeignt, }} />
				<Button icon={IconNames.ADD} minimal={true} style={{ position: 'relative', width: notesWidth, height: notesHeignt, marginLeft: notesWidth * 2, }} />
			</div>
			<div style={sectionStyle}>
				{props.halfBeats.map((value, index) => <HalfBeat key={index} halfBeatIndex={index} notesIndexes={value} />)}
				{[0, 1, 2, 3, 4].map((value) => {
					return <div style={laneLineStyle(value * notesWidth)}></div>
				})}
			</div>
		</div>
	);
};

export default SectionColumn;
