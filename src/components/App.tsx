import React from 'react';
import styled from 'styled-components';
import { Classes } from '@blueprintjs/core';
import { useSelector, useDispatch } from "react-redux";
import { AppState } from '../store';
import editorModule, { ISelectRange, getLineIndexesInSection, assignSection } from '../modules/editorModule';
import { Start } from './start/Start';
import { Menu } from './menu/Menu';
import Controller from './controller/Controller';
import Map from './map/Map';
import { Selector } from './Selector';

export const App = () => {
    const dispatch = useDispatch();
    const { themeDark, editMode, openTest, notesDisplay, selector, map } = useSelector((state: AppState) => (
        { ...state, map: state[state.current] }
    ));
    const { lines, currentSection } = map;
    const { column, notesWidth, intervalRatio, aspect, sectionLineCount } = notesDisplay;
    const { baseX, baseY, x, y, width, height } = selector;
    const modeSelect = editMode === 'select';
    const notesHeight = notesWidth / aspect;
    const sections = assignSection(lines, sectionLineCount);
    const getLineLocations = (lineIndexes: number[]) => {
        return lineIndexes.slice(1).reduce((locations, i) => ([
                ...locations,
                locations[locations.length - 1] + notesHeight * intervalRatio * (lines[i].snap24 ? 1.0 : 1.5),
        ]), [0]);
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
            const lineStartArray = lineIndexes.filter((value, i) => rect.bottom - lineLocations[i] < y + height);
            const lineEndArray = lineIndexes.filter((value, i) => rect.bottom - lineLocations[i] - notesHeight > y);
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
        <Wrapper className={themeDark ? Classes.DARK : ""} onContextMenu={() => false}>
            <Main
                themeDark={themeDark}
                className={themeDark ? Classes.DARK : ""}
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
                <Editor>
                    <Controller />
                    <Map />
                </Editor>
                <Selector />
            </Main>
            <Start />
            <TestPlayerWrapper openTest={openTest} onClick={() => {
                dispatch(editorModule.actions.toggleTest());
                (document.querySelector('#sparebeat_test') as HTMLDivElement).innerHTML = '';
            }} >
                <TestPlayer id="sparebeat_test" />
            </TestPlayerWrapper>
        </Wrapper>
    );
};

const Wrapper = styled.div`
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -khtml-user-select: none;
    -webkit-user-drag: none;
    -khtml-user-drag: none;
`;

const Main = styled.div<{ themeDark: boolean }>`
    position: 'absolute';
    left: 0;
    top: 0;
    width: "100%";
    min-height: "100vh";
    background-color: ${({ themeDark }) => themeDark ? "#30404D" : "#F5F8FA"};
    z-index: 5;
`;

const Editor = styled.div`
    display: flex;
    flex-direction: row;
    white-space: nowrap;
    overflow-x: hidden;
    max-width: 100%;
    min-width: 100%;
    max-height: calc(100vh - 50px);
    min-height: calc(100vh - 50px);
    text-align: left;
`;

const TestPlayerWrapper = styled.div<{ openTest: boolean }>`
    position: fixed;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    display: ${({ openTest }) => openTest ? 'block' : 'none'};
    z-index: 15;
    background-color: rgba(0, 0, 0, 0.5);
    cursor: pointer;
`;

const TestPlayer = styled.div`
    position: absolute;
    width: 960;
    height: 640;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 20;
`;
