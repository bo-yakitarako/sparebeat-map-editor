import * as React from 'react';
import { useSelector } from "react-redux";
import { AppState } from '../store';

const Selector = () => {
	const { x, y, width, height } = useSelector((state: AppState) => state.selector);
	const selectorStyle: React.CSSProperties = {
		display: x > 0 && y > 0 ? 'block' : 'none',
		position: 'absolute',
		left: x,
		top: y,
		width: width,
		height: height,
		border: 'solid 2px rgba(0, 78, 255, 0.4)',
		background: 'rgba(0, 96, 255, 0.2)',
		zIndex: 10,
	};
	return (
		<div style={selectorStyle}></div>
	);
};

export default Selector;
