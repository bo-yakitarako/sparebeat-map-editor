import * as React from 'react';
import { useSelector, useDispatch } from "react-redux";
import { AppState } from '../../store';
import SectionColumn from './notesUnit/SectionColumn';
import { Button, Icon, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import editorModule, { assignSection, INotesLineState } from '../../modules/editorModule';
import { NotesStatus } from './Notes';

const Map = () => {
	const dispatch = useDispatch();
	const { currentTime, editMode, current, playing, startTime } = useSelector((state: AppState) => state);
	const { lines, currentSection, bpmChanges } = useSelector((state: AppState) => state[state.current]);
	const { notesWidth, column, sectionLineCount } = useSelector((state: AppState) => state.notesDisplay);
	const sections = assignSection(lines, sectionLineCount);
	const sectionIndexes: number[] = [];
	const mapStyle: React.CSSProperties = {
		position: 'relative',
		maxWidth: 'calc(100% - 200px)',
		minWidth: 'calc(100% - 200px)',
		maxHeight: '100%',
		minHeight: '100%',
		whiteSpace: 'nowrap',
		overflowX: 'hidden',
		overflowY: 'scroll',
		backgroundColor: 'rgba(255, 255, 255, 0)',
		cursor: editMode === 'select' ? 'pointer' : 'defalut',
	};
	for (let i = currentSection; i < sections.length && i < currentSection + column; i++) {
		sectionIndexes.push(i);
	}
	const pageLength = column <= sections.length ? column : sections.length;
	const pageJumpButtonStyle: React.CSSProperties = {
		width: 40,
		margin: '0 5px',
	}
	const moveSection = (movement: number) => () => {
		const nextSection = currentSection + movement;
		dispatch(editorModule.actions.moveSection(nextSection < 0 ? 0 : nextSection > sections.length - column ? sections.length - column : nextSection));
	};
	const getSectionPos = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		if (editMode === 'select' && !playing) {
			for (let i = 0; i < sectionIndexes.length; i++) {
				const rect = document.getElementById(`section${i}`)?.getBoundingClientRect();
				if (rect && rect.left < e.clientX && e.clientX < rect.right - notesWidth && rect.top < e.clientY && e.clientY < rect.bottom) {
					const sectionPos = {section: i + currentSection, pos: rect.bottom - e.clientY};
					dispatch(editorModule.actions.moveBarPos(sectionPos));
					break;
				}
			}
		}
	};
	const lastTime = getLastTime(lines);
	const notesCount = countNotes(lines);
	const infoTooltip = (
		<table style={{textAlign: "left"}}>
			<tbody>
				<tr><td style={{textAlign: 'right', paddingRight: 5}}>難易度</td><td>{current.toUpperCase()}</td></tr>
				<tr><td style={{textAlign: 'right', paddingRight: 5}}>ノーツ数</td><td>{notesCount.notes}</td></tr>
				<tr><td style={{ textAlign: 'right', paddingRight: 5 }}>AN数</td><td>{notesCount.attack}</td></tr>
				<tr><td style={{ textAlign: 'right', paddingRight: 5 }}>密度</td><td>{(notesCount.notes / lastTime).toFixed(2)}{" "}N/秒</td></tr>
			</tbody>
		</table>
	);
	return (
		<div style={mapStyle} onMouseDown={getSectionPos} >
			<div style={{display: 'inline-block', textAlign: 'left'}}>
				{sectionIndexes.map((value, index) => <SectionColumn key={value} id={index} sectionIndex={value} halfBeats={sections[value]} />)}
			</div>
			<div style={{position: 'relative', marginTop: '20px', textAlign: 'center', width: '100%'}}>
				<Button disabled={currentSection <= 0} minimal={true} icon={IconNames.CIRCLE_ARROW_LEFT} style={pageJumpButtonStyle} onClick={() => {dispatch(editorModule.actions.moveSection(0))}} />
				<Button disabled={currentSection <= 0} minimal={true} icon={IconNames.DOUBLE_CHEVRON_LEFT} style={{ width: 40 }} onClick={moveSection(- column)} />
				<Button disabled={currentSection <= 0} minimal={true} icon={IconNames.CHEVRON_LEFT} style={pageJumpButtonStyle} onClick={moveSection(-1)} />
				<span>{currentSection + 1} - {currentSection + pageLength <= sections.length ? currentSection + pageLength : sections.length} / {sections.length}</span>
				<Button disabled={currentSection + pageLength >= sections.length} minimal={true} icon={IconNames.CHEVRON_RIGHT} style={pageJumpButtonStyle} onClick={moveSection(1)} />
				<Button disabled={currentSection + pageLength >= sections.length} minimal={true} icon={IconNames.DOUBLE_CHEVRON_RIGHT} style={{ width: 40 }} onClick={moveSection(column)} />
				<Button disabled={currentSection + pageLength >= sections.length} minimal={true} icon={IconNames.CIRCLE_ARROW_RIGHT} style={pageJumpButtonStyle} onClick={() => {
					const lastIndex = sections.length - column;
					dispatch(editorModule.actions.moveSection(lastIndex < 0 ? 0 : lastIndex));
				}} />
				<div style={{position: 'absolute', top: 0, right: 0, width: '200px', fontSize: '20px'}} >
					<Tooltip content={infoTooltip} >
						<Icon style={{cursor: 'pointer'}} icon={IconNames.INFO_SIGN} iconSize={24} />
					</Tooltip>{" "}
					BPM: {getCurrentBpm(bpmChanges, currentTime - startTime / 1000)}
				</div>
			</div>
		</div>
	);
};

export default Map;

function getCurrentBpm(bpmChanges: {bpm: number, time: number}[], currentTime: number) {
	const effectiveBpmChanges = bpmChanges.filter((value) => value.time <= currentTime);
	return effectiveBpmChanges.length === 0 ? bpmChanges[0].bpm : effectiveBpmChanges[effectiveBpmChanges.length - 1].bpm;
}

function getLastTime(lines: INotesLineState[]) {
	return lines.slice(1).reduce((pre, cur) => {
		return { preLine: cur, time: pre.time + ((pre.preLine.snap24 ? 10 : 15) / pre.preLine.bpm) }
	}, {preLine: lines[0], time: 0}).time;
}

function countNotes(lines: INotesLineState[]) {
	return lines.reduce((pre, cur) => {
		const { notes, attack } = pre;
		const { curNotes, curAttack } = cur.status.reduce((pre, cur) => {
			const { curNotes, curAttack } = pre;
			const nextNotes = curNotes + (cur < 4 ? 1 : 0);
			const nextAttack = curAttack + (cur === NotesStatus.ATTACK ? 1 : 0);
			return { curNotes: nextNotes, curAttack: nextAttack };
		}, {curNotes: 0, curAttack: 0});
		return { notes: notes + curNotes, attack: attack + curAttack };
	}, {notes: 0, attack: 0});
}
