import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { NumericInput, Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import editorModule from '../../modules/editorModule';

const { initializeMap, loadExternalMap } = editorModule.actions;

export const CreateOption: React.FC<{ fadeOut: () => void }> = ({ fadeOut }) => {
	const dispatch = useDispatch();
	const [bpm, bpmChange] = useState(150);
	const [beats, beatsChange] = useState(4);
	return (
		<Wrapper>
			<h3>譜面の新規作成</h3>
			<Contents>
				<p>BPM</p>
				<NumericInput
					value={bpm}
					fill
					onValueChange={(value) => bpmChange(isNaN(value) ? 1 : value)}
				/>
			</Contents>
			<Contents center>
				<p>拍子</p>
				<NumericInput
					value={beats}
					fill
					onValueChange={(value) => beatsChange(isNaN(value) ? 1 : value)}
				/>
			</Contents>
			<ContentsBottom>
				<Button
					text="新規作成"
					icon={IconNames.BUILD}
					onClick={() => {
						localStorage.removeItem('map');
						dispatch(initializeMap({ bpm, beats }));
						dispatch(loadExternalMap());
						fadeOut();
					}}
				/>
			</ContentsBottom>
		</Wrapper>
	)
};

const Wrapper = styled.div`
	text-align: center;
	h3 {
		text-align: left;
	}
`;

const Contents = styled.div<{ center?: boolean }>`
	display: inline-block;
	width: 35%;
	margin-left: ${({ center }) => center ? '5%' : '0'};
	p {
		text-align: left;
	}
`;

const ContentsBottom = styled.div`
	margin-top: 5%;
`;
