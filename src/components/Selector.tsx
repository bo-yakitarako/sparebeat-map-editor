import * as React from 'react';
import styled from 'styled-components';
import { useSelector } from "react-redux";
import { AppState } from '../store';

export const Selector = () => {
	const { x, y, width, height } = useSelector((state: AppState) => state.selector);
	return (
		<SelectorWrapper x={x} y={y} width={width} height={height} />
	);
};

interface ISelectorWrapper {
	x: number;
	y: number;
	width: number;
	height: number;
};

const SelectorWrapper = styled.div<ISelectorWrapper>`
	display: ${({ x, y }) => x > 0 && y > 0 ? 'block' : 'none'};
	position: absolute;
	left: ${({ x }) => x}px;
	top: ${({ y }) => y}px;
	width: ${({ width }) => width}px;
	height: ${({ height }) => height}px;
	border: solid 2px rgba(0, 78, 255, 0.4);
	background: rgba(0, 96, 255, 0.2);
	z-index: 10;
`;
