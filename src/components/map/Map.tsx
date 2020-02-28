import * as React from 'react';
import { useSelector, useDispatch } from "react-redux";
import { AppState } from '../../store';
import SectionColumn from './notesUnit/SectionColumn';
import { Button, Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import mapStateModule, { assignSection } from '../../modules/mapState';

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
	const column = useSelector((state: AppState) => state.editorSetting.notesDisplay.column);
	const bpm = useSelector((state: AppState) => state.mapState.current.bpm);
	const currentSection = useSelector((state: AppState) => state.mapState.current.currentSection);
	const lineStates = useSelector((state: AppState) => state.mapState.current.lines);
	const sectionLinesCount = useSelector((state: AppState) => state.editorSetting.notesDisplay.lines);
	const sections = assignSection(lineStates, sectionLinesCount);
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
		for (let i = 0; i < sectionIndexes.length; i++) {
			const rect = document.getElementById(`section${i}`)?.getBoundingClientRect();
			if (rect && rect.left < e.clientX && e.clientX < rect.right && rect.top < e.clientY && e.clientY < rect.bottom) {
				
			}
		}
	};
	return (
		<div style={mapStyle} onClick={e => {
			const section = document.getElementById('section0');
			const rect = section?.getBoundingClientRect();
			console.log(rect ? rect.bottom - rect.top : '');
		}}>
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
					<Icon icon={IconNames.INFO_SIGN} iconSize={24} /> BPM: {bpm}
				</div>
			</div>
		</div>
	);
};

export default Map;
