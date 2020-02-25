import * as React from 'react';
const { Polyline } = require('react-shapes');

export enum NotesStatus {
	NORMAL, ATTACK, LONG_START, LONG_END, NONE, INVALID
}

interface INotes {
	index: number;
	width: number;
	status: NotesStatus;
};

const notesColors: {[key: string]: string[]} = {
	default: ['#ce9eff', '#ceceff', '#9eceff', '#9effff', '#ff4e4e']
}

const NotesComponent: React.SFC<INotes> = (props: INotes) => {
	const height = props.width / 2.5;
	const boxStyle: React.CSSProperties = {
		position: 'relative',
		width: `${props.width}px`,
		height: `${height}px`,
	};
	let notes = <span style={boxStyle}></span>
	if (props.status !== NotesStatus.INVALID) {
		const isDark = false;
		const strokeWidth = props.width / 30;
		const diamondPoints = `${strokeWidth},${height / 2} ${props.width / 2},${strokeWidth} ${props.width - strokeWidth},${height / 2} ${props.width / 2},${height - strokeWidth} ${strokeWidth},${height / 2} ${props.width / 2},${strokeWidth}`;
		const fillColor = props.status === NotesStatus.ATTACK ? notesColors.default[4] : props.status === NotesStatus.NONE ? (isDark ? "#738694" : "#F5F8FA") : notesColors.default[props.index];
		if (props.status === NotesStatus.LONG_START || props.status === NotesStatus.LONG_END) {
			const lnTokenStyle: React.CSSProperties = {
				position: 'absolute',
				color: notesColors.default[4],
				fontSize: `${props.width / 3}px`,
				left: '50%',
				transform: 'translateX(-50%)',
				zIndex: 1
			};
			const tokenText = props.status === NotesStatus.LONG_START ? 'S' : 'E';
			notes = (
				<span style={boxStyle}>
					<span style={lnTokenStyle}>{tokenText}</span>
					<Polyline points={diamondPoints} fill={{ color: fillColor }} stroke={{ color: !isDark ? "#BFCCD6" : "#F5F8FA"}} strokeWidth={strokeWidth} />
				</span>
			);
		} else {
			notes = (
				<span style={boxStyle}>
					<Polyline points={diamondPoints} fill={{ color: fillColor }} stroke={{ color: !isDark ? "#BFCCD6" : "#F5F8FA"}} strokeWidth={strokeWidth} />
				</span>
			);
		}
	}
	return notes;
};

export default NotesComponent;
