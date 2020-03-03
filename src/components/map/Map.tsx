import * as React from 'react';
import { useSelector, useDispatch } from "react-redux";
import { AppState } from '../../store';
import SectionColumn from './notesUnit/SectionColumn';
import { Button, Icon, Tooltip, Classes } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import mapStateModule, { assignSection, IEditorState } from '../../modules/editorModule';
import MusicBar from '../../modules/MusicBar';
import { NotesStatus } from './Notes';

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
};

const Map = () => {
	const dispatch = useDispatch();
	const state = useSelector((state: AppState) => state); 
	const mapState = state.current;
	const column = state.notesDisplay.column;
	const currentSection = mapState.currentSection;
	const sectionLinesCount = state.notesDisplay.sectionLineCount;
	const sections = assignSection(mapState.lines, sectionLinesCount);
	const sectionIndexes: number[] = [];
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
		dispatch(mapStateModule.actions.moveSection(nextSection < 0 ? 0 : nextSection > sections.length - column ? sections.length - column : nextSection));
	};
	const getSectionPos = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		if (state.editMode === 'music') {
			for (let i = 0; i < sectionIndexes.length; i++) {
				const rect = document.getElementById(`section${i}`)?.getBoundingClientRect();
				if (rect && rect.left < e.clientX && e.clientX < rect.right && rect.top < e.clientY && e.clientY < rect.bottom) {
					const sectionPos = {section: i + currentSection, pos: rect.bottom - e.clientY};
					const musicBar = new MusicBar(state, mapState.bpmChanges);
					const time = musicBar.posToTime(sectionPos);
					dispatch(mapStateModule.actions.updateCurrentTime(time));
					dispatch(mapStateModule.actions.moveBarPos(sectionPos));
					(document.getElementById('music') as HTMLAudioElement).currentTime = time;
				}
			}
		}
	};
	const lastTime = getLastTime(state);
	const notesCount = countNotes(state);
	const infoTooltip = (
		<table style={{textAlign: "left"}}>
			<tr><td style={{textAlign: 'right', paddingRight: 5}}>ノーツ数</td><td>{notesCount.notes}</td></tr>
			<tr><td style={{ textAlign: 'right', paddingRight: 5 }}>AN数</td><td>{notesCount.attack}</td></tr>
			<tr><td style={{ textAlign: 'right', paddingRight: 5 }}>密度</td><td>{(notesCount.notes / lastTime).toFixed(2)}{" "}N/秒</td></tr>
		</table>
	);
	return (
		<div style={mapStyle} onClick={getSectionPos}>
			<div style={{display: 'inline-block', textAlign: 'left'}}>
				{sectionIndexes.map((value, index) => <SectionColumn key={value} id={index} sectionIndex={value} halfBeats={sections[value]} />)}
			</div>
			<div style={{position: 'relative', marginTop: '20px', textAlign: 'center', width: '100%'}}>
				<Button disabled={currentSection <= 0} minimal={true} icon={IconNames.DOUBLE_CHEVRON_LEFT} style={{ width: 40 }} onClick={moveSection(- column)} />
				<Button disabled={currentSection <= 0} minimal={true} icon={IconNames.CHEVRON_LEFT} style={pageJumpButtonStyle} onClick={moveSection(-1)} />
				<span>{currentSection + 1} - {currentSection + pageLength <= sections.length ? currentSection + pageLength : sections.length} / {sections.length}</span>
				<Button disabled={currentSection + pageLength >= sections.length} minimal={true} icon={IconNames.CHEVRON_RIGHT} style={pageJumpButtonStyle} onClick={moveSection(1)} />
				<Button disabled={currentSection + pageLength >= sections.length} minimal={true} icon={IconNames.DOUBLE_CHEVRON_RIGHT} style={{ width: 40 }} onClick={moveSection(column)} />
				<div style={{position: 'absolute', top: 0, right: 0, width: '200px', fontSize: '20px'}} >
					<Tooltip className={state.themeDark ? Classes.DARK : ''} content={infoTooltip} >
						<Icon style={{cursor: 'pointer'}} icon={IconNames.INFO_SIGN} iconSize={24} />
					</Tooltip>{" "}
					BPM: {getCurrentBpm(state)}
				</div>
			</div>
		</div>
	);
};

export default Map;

function getCurrentBpm(state: IEditorState) {
	const bpmChanges = state.current.bpmChanges;
	const effectiveBpmChanges = bpmChanges.filter((value) => value.time <= state.currentTime);
	return effectiveBpmChanges.length === 0 ? bpmChanges[0].bpm : effectiveBpmChanges[effectiveBpmChanges.length - 1].bpm;
}

function getLastTime(state: IEditorState) {
	return state.current.lines.slice(1).reduce((pre, cur) => {
		return { preLine: cur, time: pre.time + ((pre.preLine.snap24 ? 10 : 15) / pre.preLine.bpm) }
	}, {preLine: state.current.lines[0], time: 0}).time;
}

function countNotes(state: IEditorState) {
	return state.current.lines.reduce((pre, cur) => {
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
