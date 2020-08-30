import React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../../store';
import { DifficlutySelect } from 'modules/editorModule';
import { IRgb } from './BackgroundColorPicker';

export const SparebeatStartMenu: React.FC<{ top: IRgb, bottom: IRgb }> = ({ top, bottom }) => {
    const bpm = useSelector((state: AppState) => state.easy.lines[0].bpm);
    const { title, artist, level } = useSelector((state: AppState) => state.info);
    const color = `linear-gradient(rgba(${top.r}, ${top.g}, ${top.b}, .8), rgba(${bottom.r}, ${bottom.g}, ${bottom.b}, .8))`;
    return (
        <div style={{ position: 'relative', display: 'inline-block', width: 480, height: 320, marginTop: 15, }}>
            <img alt="" src="/media/polygon.png" style={{ position: 'absolute', width: '100%', height: '100%', left: 0, top: 0, zIndex: 0 }} />
            <div className="background" style={{ backgroundImage: color, }}></div>
            <div className="StartScene">
                <div id="header">
                    <div className="title">{title}</div>
                    <div className="artist">{artist}</div>
                </div>
                <div id="level-selector">
                    {Object.keys(level).map((diff) => (
                        <div key={diff} className={`level-box level-${diff}`}>
                            <div className="level-label">LEVEL</div>
                            <div className="level-number">{level[diff as DifficlutySelect].length === 0 ? '　' : level[diff as DifficlutySelect]}</div>
                            <div className="level-label">{diff.toUpperCase()}</div>
                        </div>
                    ))}
                </div>
                <div id="start-footer">
                    <div id="start-speed">
                        <span className="arrow-button">{"<"}</span>
                        <span>Speed{" "}x1.00</span>
                        <span className="arrow-button">{">"}</span>
                    </div>
                    <span className="bpm">BPM:{bpm}</span>
                    <div id="start-timing">
                        <span className="arrow-button">{"<"}</span>
                        <span>Timing{" "}±0.00</span>
                        <span className="arrow-button">{">"}</span>
                    </div>
                </div>
            </div>
            <div className="backdrop"></div>
        </div>
    );
};
