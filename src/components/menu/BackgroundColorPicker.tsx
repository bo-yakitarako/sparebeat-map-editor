import React from 'react';
import { useSelector, useDispatch } from "react-redux";
import { ChromePicker } from 'react-color';
import { AppState } from '../../store';
import editorModule, { DifficlutySelect } from 'modules/editorModule';

interface IRgb {
	r: number; g: number; b: number;
};

const SparebeatStartMenu: React.SFC<{top: IRgb, bottom: IRgb}> = (props: {top: IRgb, bottom: IRgb}) => {
	const bpm = useSelector((state: AppState) => state.easy.lines[0].bpm);
	const { title, artist, level } = useSelector((state: AppState) => state.info);
	const { top, bottom } = props;
	const color = `linear-gradient(rgba(${top.r}, ${top.g}, ${top.b}, .8), rgba(${bottom.r}, ${bottom.g}, ${bottom.b}, .8))`;
	return (
		<div style={{ position: 'relative', display: 'inline-block', width: 480, height: 320, marginTop: 15, }}>
			<img alt="" src="/media/polygon.png" style={{ position: 'absolute', width: '100%', height: '100%', left: 0, top: 0, zIndex: 0 }} />
			<div className="background" style={{ backgroundImage: color, }}></div>
			<div className="StartScene">
				<div id="header">
					<div className="title">{ title }</div>
					<div className="artist">{ artist }</div>
				</div>
				<div id="level-selector">
					{ Object.keys(level).map((diff) => (
					<div key={diff} className={ `level-box level-${diff}` }>
						<div className="level-label">LEVEL</div>
							<div className="level-number">{level[diff as DifficlutySelect].length === 0 ? '　' : level[diff as DifficlutySelect] }</div>
						<div className="level-label">{ diff.toUpperCase() }</div>
					</div>
					)) }
				</div>
				<div id="start-footer">
					<div id="start-speed">
						<span className="arrow-button">{ "<" }</span>
						<span>Speed{ " " }x1.00</span>
						<span className="arrow-button">{ ">" }</span>
					</div>
					<span className="bpm">BPM:{ bpm }</span>
					<div id="start-timing">
						<span className="arrow-button">{ "<" }</span>
						<span>Timing{ " " }±0.00</span>
						<span className="arrow-button">{ ">" }</span>
					</div>
				</div>
			</div>
			<div className="backdrop"></div>
		</div>
	);
};

const BackgroundColorPicker = () => {
	const dispatch = useDispatch();
	const { bgColor } = useSelector((state: AppState) => state.info);
	let top = { r: 67, g: 198, b: 172 };
	let bottom = { r: 25, g: 22, b: 84 };
	if (bgColor.length > 1) {
		top = convertHexToRgb(bgColor[0]);
		bottom = convertHexToRgb(bgColor[1]);
	}
	return (
		<div style={{ textAlign: 'center' }}>
			<SparebeatStartMenu top={top} bottom={bottom} />
			<div style={{ marginTop: 10 }}>
				<div style={{ display: 'inline-block' }}>
					<ChromePicker key={0} color={top} disableAlpha={true} onChange={(color) => {
						dispatch(editorModule.actions.updateBgColor({ index: 0, color: color.hex }));
					}} />
				</div>
				<div style={{ display: 'inline-block', marginLeft: 10 }}>
					<ChromePicker key={1} color={bottom} disableAlpha={true} onChange={(color) => {
						dispatch(editorModule.actions.updateBgColor({ index: 1, color: color.hex }));
					}} />
				</div>
			</div>
		</div>
	);
};

export default BackgroundColorPicker;

function convertHexToRgb(hex: string) {
	if (hex.slice(0, 1) === "#") hex = hex.slice(1);
	if (hex.length === 3) hex = hex.slice(0, 1) + hex.slice(0, 1) + hex.slice(1, 2) + hex.slice(1, 2) + hex.slice(2, 3) + hex.slice(2, 3);
	const rgbArray = [hex.slice(0, 2), hex.slice(2, 4), hex.slice(4, 6)].map(function (str) {
		return parseInt(str, 16);
	});
	return { r: rgbArray[0], g: rgbArray[1], b: rgbArray[2] };
}
