import * as React from 'react';
import { useSelector } from "react-redux";
import { AppState } from '../../store';
const { Rectangle, Polyline } = require('react-shapes');

export enum NotesStatus {
	NORMAL, ATTACK, LONG_START, LONG_END, NONE, INVALID
}

interface INotes {
	index: number;
	width: number;
	status: NotesStatus;
	aspect?: number;
	centerLine?: boolean;
	onClick?: Function;
};

const notesColors: {[key: string]: string[]} = {
	default: ['#ce9eff', '#ceceff', '#9eceff', '#9effff', '#ff4e4e']
}

const NotesComponent: React.SFC<INotes> = (props: INotes) => {
	const height = props.width / (props.aspect ? props.aspect : 2.5);
	const boxStyle: React.CSSProperties = {
		position: 'relative',
		display: 'inline-block',
		width: `${props.width}px`,
		height: `${height}px`,
		cursor: props.status !== NotesStatus.INVALID ? 'pointer' : 'default',
	};
	const isDark = useSelector((state: AppState) => state.themeDark);;
	const barLineStyle: React.CSSProperties = {
		position: 'absolute',
		left: `0px`,
		top: `${height / 2 - 1.5}px`,
		width: `100%`,
		height: '3px',
		backgroundColor: isDark ? "#BFCCD6" : "#5C7080",
		zIndex: 1,
	};
	let notes = (
		<div style={boxStyle}>
			<Rectangle width={props.width} height={height} fill={{ color: "rgba(255, 255, 255, 0)"}} />
		</div>
	);
	if (props.status !== NotesStatus.INVALID) {
		const strokeWidth = props.width / 25;
		const points: string[] = [`${strokeWidth},${height / 2}`, `${props.width / 2},${strokeWidth}`, `${props.width - strokeWidth},${height / 2}`, `${props.width / 2},${height - strokeWidth}`]
		const diamondPointsValue = `${points[0]} ${points[1]} ${points[2]} ${points[3]} ${points[0]} ${points[1]}`;
		const fillColor = props.status === NotesStatus.ATTACK ? notesColors.default[4] : props.status === NotesStatus.NONE ? (isDark ? "#5C7080" : "#F5F8FA") : notesColors.default[props.index];
		const click = () => {
			if (props.onClick) {
				props.onClick();
			}
		};
		if (props.status === NotesStatus.LONG_START || props.status === NotesStatus.LONG_END) {
			const lnTokenStyle: React.CSSProperties = {
				position: 'absolute',
				color: notesColors.default[4],
				fontSize: `${props.width / 3.2}px`,
				left: '50%',
				transform: 'translateX(-50%)',
				zIndex: 2
			};
			const tokenText = props.status === NotesStatus.LONG_START ? 'S' : 'E';
			notes = (
				<div style={boxStyle} onClick={click}>
					<Polyline points={diamondPointsValue} fill={{ color: fillColor }} stroke={{ color: isDark ? "#BFCCD6" : "#5C7080"}} strokeWidth={strokeWidth} />
					{props.centerLine ? <div style={barLineStyle}></div> : null}
					<span style={lnTokenStyle}>{tokenText}</span>
				</div>
			);
		} else {
			notes = (
				<div style={boxStyle} onClick={click}>
					<Polyline points={diamondPointsValue} fill={{ color: fillColor }} stroke={{ color: isDark ? "#BFCCD6" : "#5C7080"}} strokeWidth={strokeWidth} />
					{props.centerLine ? <div style={barLineStyle}></div> : null}
				</div>
			);
		}
	}
	return notes;
};

export default NotesComponent;
