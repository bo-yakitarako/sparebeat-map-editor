import React from 'react';
import { Classes } from '@blueprintjs/core';
import { useSelector, useDispatch } from "react-redux";
import { AppState } from '../store';
import editorModule, { ISelectRange, getLineIndexesInSection, assignSection } from '../modules/editorModule';
import Start from './Start';
import Menu from './menu/Menu';
import Controller from './menu/Controller';
import Map from './map/Map';
import Selector from './Selector';

const editorStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    whiteSpace: 'nowrap',
    overflowX: 'hidden',
    maxWidth: '100%',
    minWidth: '100%',
    maxHeight: 'calc(100vh - 50px)',
    minHeight: 'calc(100vh - 50px)',
    textAlign: 'left',
}

function App() {
    const dispatch = useDispatch();
    const { themeDark, editMode, openTest } = useSelector((state: AppState) => state);
    const { lines, currentSection } = useSelector((state: AppState) => state[state.current]);
    const { column, notesWidth, intervalRatio, aspect, sectionLineCount } = useSelector((state: AppState) => state.notesDisplay);
    const { baseX, baseY, x, y, width, height } = useSelector((state: AppState) => state.selector);
    const modeSelect = editMode === 'select';
    const notesHeight = notesWidth / aspect;
    const sections = assignSection(lines, sectionLineCount);
    const getLineLocations = (lineIndexes: number[]) => {
        const locations = [0];
        let length = 0;
        for (let i = 1; i < lineIndexes.length; i++) {
            const line = lines[lineIndexes[i - 1]];
            length += notesHeight * intervalRatio * (line.snap24 ? 1.0 : 1.5);
            locations.push(length);
        }
        return locations;
    };
    const isSelectIntoSectionRect = (rect: DOMRect | undefined) => {
        if (rect === undefined) {
            return false;
        }
        const right = rect.left + notesWidth * 4;
        return !(x > right || x + width < rect.left) && !(y > rect.bottom || y + height < rect.top);
    };
    const getSelectRange = (index: number): ISelectRange | undefined => {
        const judgeRect = document.getElementById(`section${index}`)?.getBoundingClientRect();
        if (isSelectIntoSectionRect(judgeRect)) {
            const rect = judgeRect as DOMRect;
            const lineIndexes = getLineIndexesInSection(currentSection + index, sections);
            const lineLocations = getLineLocations(lineIndexes);
            const laneStartArray = [0, 1, 2, 3].filter((value) => x < rect.left + notesWidth * value);
            const laneEndArray = [3, 2, 1, 0].filter((value) => x + width > rect.left + notesWidth * (value + 1));
            const lineStartArray = lineIndexes.filter((value, index) => rect.bottom - lineLocations[index] < y + height);
            const lineEndArray = lineIndexes.filter((value, index) => rect.bottom - lineLocations[index] - notesHeight > y);
            return {
                lane: {
                    start: laneStartArray[0], end: laneEndArray[0],
                }, line: {
                    start: lineStartArray[0], end: lineEndArray[lineEndArray.length - 1],
                }
            }
        }
        return undefined;
    };
    const select = () => [...Array(column)].map((value, index) => index).reduce((pre, cur) => {
        const range = getSelectRange(cur);
        if (range !== undefined) {
            pre.push(range);
        }
        return pre;
    }, [] as ISelectRange[]);
    const dispatchSelect = () => {
        if (baseX > 0 && baseY > 0) {
            dispatch(editorModule.actions.adoptSelection(select()));
        }
    };
    return (
        <div className={themeDark ? Classes.DARK : ""}>
            <div
                className={themeDark ? Classes.DARK : ""}
                style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: "100%",
                    minHeight: "100vh",
                    backgroundColor: themeDark ? "#30404D" : "#F5F8FA",
                    zIndex: 5,
                }}
                onMouseDown={e => {
                    if (modeSelect && e.clientX > 200 && e.clientY > 50 && e.button !== 2) {
                        dispatch(editorModule.actions.adoptSelection([]));
                        dispatch(editorModule.actions.setSelectorBase({x: e.clientX, y: e.clientY }))
                    }
                }}
                onMouseMove={e => {
                    if (baseX !== 0 && baseY !== 0) {
                        dispatch(editorModule.actions.setSelectorRect({x: e.clientX, y: e.clientY }));
                    }
                }}
                onMouseUp={dispatchSelect} onMouseLeave={dispatchSelect}
            >
                <Menu/>
                <div style={editorStyle}>
                    <Controller />
                    <Map />
                </div>
                <Selector />
            </div>
            <Start />
            <div style={{ position: 'fixed', width: '100%', height: '100vh', left: 0, top: 0, display: openTest ? 'block' : 'none', zIndex: 15, backgroundColor: 'rgba(0, 0, 0, 0.5)', cursor: 'pointer' }} onClick={() => { dispatch(editorModule.actions.toggleTest()) }} >
                <div id="sparebeat_test" style={{ position: 'absolute', width: 960, height: 640, left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 20, }}></div>
            </div>
        </div>
    );
}

export default App;
