import * as React from 'react';
import { useSelector } from "react-redux";
import { AppState } from '../../../store';
import Line from './Line'

interface IHalfBeat {
	halfBeatIndex: number;
	notesIndexes: number[];
}

const HalfBeat: React.SFC<IHalfBeat> = (props: IHalfBeat) => {
	const notesWidth = useSelector((state: AppState) => state.notesDisplay.notesWidth);
	const intervalRatio = useSelector((state: AppState) => state.notesDisplay.intervalRatio);
	const notesAspect = useSelector((state: AppState) => state.notesDisplay.aspect);
	const snap24 = props.notesIndexes.length === 3;
	const halfBeatHeight = 3 * notesWidth / notesAspect * intervalRatio;
	const beatStyle: React.CSSProperties = {
		position: 'absolute',
		left: '0',
		bottom: `${props.halfBeatIndex * halfBeatHeight}px`,
		width: '100%',
		height: `${halfBeatHeight}px`,
	}
	return (
		<div style={beatStyle}>
			{props.notesIndexes.map((notesIndex, beatIndex) =>
				<Line key={beatIndex} lineIndex={notesIndex} innerBeatIndex={beatIndex} snap24={snap24} centerLine={props.halfBeatIndex % 2 === 0 && beatIndex === 0} sectionFirst={beatIndex === 0 && props.halfBeatIndex === 0} />
			)}
		</div>
	)
};

export default HalfBeat;
