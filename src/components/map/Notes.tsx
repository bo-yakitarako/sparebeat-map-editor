import * as React from 'react';
import { useSelector, useDispatch } from "react-redux";
import { ContextMenu } from '@blueprintjs/core';
import editorModule from '../../modules/editorModule';
import { AppState } from '../../store';
import MapContextMenu from './MapContextMenu';
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
	inBind?: boolean;
	selected?: boolean;
	onClick?: Function;
	onRightClick?: Function;
	lineIndex?: number;
};

const notesColors = {
	default: ['#ce9eff', '#ceceff', '#9eceff', '#9effff', '#ff4e4e'],
	sunset: ['#ff9ece', '#ff9e9e', '#ffce9e', '#ffff9e', '#9c4eff'],
	'39': ['#cecece', '#00cece', '#00cece', '#cecece', '#ff4e9e'],
}

const NotesComponent: React.SFC<INotes> = (props: INotes) => {
	const dispatch = useDispatch();
	const { themeDark, sparebeatTheme, editMode, rangeSelect } = useSelector((state: AppState) => state);;
	const height = props.width / (props.aspect ? props.aspect : 2.5);
	const boxStyle: React.CSSProperties = {
		position: 'relative',
		display: 'inline-block',
		width: `${props.width}px`,
		height: `${height}px`,
		cursor: props.status === NotesStatus.INVALID && editMode !== 'select' ? 'default' : 'pointer',
		zIndex: 0,
	};
	const barLineStyle: React.CSSProperties = {
		position: 'absolute',
		left: `0px`,
		top: `${height / 2 - 1}px`,
		width: `100%`,
		height: '2px',
		backgroundColor: themeDark ? "#BFCCD6" : "#5C7080",
		zIndex: 2,
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
		const fillColor = props.status === NotesStatus.ATTACK ? notesColors[sparebeatTheme][4] : props.status === NotesStatus.NONE ? (themeDark ? "#738694" : "#F5F8FA") : notesColors[sparebeatTheme][props.index];
		const strokeColor = props.selected ? '#2965CC' : props.inBind ? notesColors.default[4] : (themeDark ? "#BFCCD6" : "#5C7080");
		const click = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
			if (props.onClick) {
				props.onClick(e);
			}
		};
		const rightClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
			if (editMode === 'select') {
				ContextMenu.show(<MapContextMenu themeDark={themeDark} rangeSelect={rangeSelect} delete={() => { dispatch(editorModule.actions.deleteSelected()) }}
					copy={() => { dispatch(editorModule.actions.copySelect())}}
					cut={() => {
						dispatch(editorModule.actions.copySelect());
						dispatch(editorModule.actions.deleteSelected());
					}}
					paste={() => { dispatch(editorModule.actions.pasteSelect({initialLine: props.lineIndex as number, initialLane: props.index})) }}
					reverse={() => { dispatch(editorModule.actions.reverseSelect()) }}
				/>, { left: e.clientX, top: e.clientY });
			} else {
				if (props.onRightClick) {
					props.onRightClick(e);
				}
			} 
		};
		if (props.status === NotesStatus.LONG_START || props.status === NotesStatus.LONG_END) {
			const lnTokenStyle: React.CSSProperties = {
				position: 'absolute',
				color: notesColors[sparebeatTheme][4],
				fontSize: `${props.width / 3.2}px`,
				left: '50%',
				top: '50%',
				transform: 'translate(-50%, -50%)',
				zIndex: 2
			};
			const tokenText = props.status === NotesStatus.LONG_START ? 'S' : 'E';
			notes = (
				<div style={boxStyle} onClick={click} onContextMenu={rightClick} >
					<Polyline points={diamondPointsValue} fill={{ color: fillColor }} stroke={{ color: strokeColor}} strokeWidth={strokeWidth} />
					{props.centerLine ? <div style={barLineStyle}></div> : null}
					<span style={lnTokenStyle}>{tokenText}</span>
				</div>
			);
		} else {
			notes = (
				<div style={boxStyle} onClick={click} onContextMenu={rightClick} >
					<Polyline points={diamondPointsValue} fill={{ color: fillColor }} stroke={{ color: strokeColor}} strokeWidth={strokeWidth} />
					{props.centerLine ? <div style={barLineStyle}></div> : null}
				</div>
			);
		}
	}
	return notes;
};

export default NotesComponent;
