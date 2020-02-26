import * as React from 'react';
import { useSelector } from "react-redux";
import { AppState } from '../../store';
import SectionColumn from './notesUnit/SectionColumn';
import { Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

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
	const column = useSelector((state: AppState) => state.editorSetting.notesDisplay.column);
	const halfBeats = [[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15]];
	const pageJumpButtonStyle: React.CSSProperties = {
		width: 40,
		margin: '0 10px',
	}
	return (
		<div style={mapStyle}>
			<div style={{display: 'inline-block', textAlign: 'left'}}>
				{[...Array(column)].map(() => <SectionColumn halfBeats={halfBeats} />)}
			</div>
			<div style={{marginTop: '20px', textAlign: 'center'}}>
				<Button icon={IconNames.DOUBLE_CHEVRON_LEFT} style={{ width: 40 }} />
				<Button icon={IconNames.CHEVRON_LEFT} style={pageJumpButtonStyle} />
				<span>1 / 4</span>
				<Button icon={IconNames.CHEVRON_RIGHT} style={pageJumpButtonStyle} />
				<Button icon={IconNames.DOUBLE_CHEVRON_RIGHT} style={{ width: 40 }} />
			</div>
		</div>
	);
};

export default Map;
