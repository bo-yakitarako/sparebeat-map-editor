import React from 'react';
import { useSelector, useDispatch } from "react-redux";
import styled from 'styled-components';
import { AppState } from '../../../store';
import editorModule, { NotesDisplay } from '../../../modules/editorModule';
import { NumericInput } from '@blueprintjs/core';

const {
    changeNotesDisplay: changeNotesDisplayAction,
    changeBarWidth,
    updateBarPos,
    changeHistorySize,
    changeClapDelay,
} = editorModule.actions;

export const DisplaySetting = () => {
    const dispatch = useDispatch();
    const {
        barWidth,
        notesDisplay: { notesWidth, column, intervalRatio, aspect },
        historySize,
        currentTime,
        clapDelay,
    } = useSelector((state: AppState) => state);
    const changeNotesDisplay = (setting: NotesDisplay, min: number) => (num: number) => {
        dispatch(changeNotesDisplayAction({
            setting,
            value: (isNaN(num) ? min : num),
        }));
    };
    const properties = [
        {
            title: 'ノーツの幅',
            range: [20, 100, 1],
            value: notesWidth,
            method: changeNotesDisplay('notesWidth', 20),
        },
        {
            title: 'ノーツの縦横比',
            range: [0.1, 10, 0.1],
            value: aspect,
            method: changeNotesDisplay('aspect', 0.1),
        },
        {
            title: '表示列数',
            range: [1, 20, 1],
            value: column,
            method: changeNotesDisplay('column', 1),
        },
        {
            title: '上下のノーツとの間隔の比率',
            range: [1, 5, 0.1],
            value: intervalRatio,
            method: changeNotesDisplay('intervalRatio', 1),
        },
        {
            title: '再生バーの太さ',
            range: [1, 20, 0.5],
            value: barWidth,
            method: (num: number) => {
                dispatch(changeBarWidth(isNaN(num) ? 1 : num));
                dispatch(updateBarPos(currentTime));
            },
        },
        {
            title: '履歴を残す数(メモリ圧迫注意)',
            range: [10, 100, 1],
            value: historySize,
            method: (num: number) => {
                dispatch(changeHistorySize(isNaN(num) ? 10 : num));
            },
        },
        {
            title: 'クラップのタイミング',
            range: [-2000, 2000, 1],
            value: clapDelay,
            method: (num: number) => {
                dispatch(changeClapDelay(isNaN(num) ? 0 : num));
            },
        }
    ];
    return (
        <Wrapper>
            {properties.map(({ title, range, value, method }, index) => (
                <Item key={index}>
                    <p>{title}</p>
                    <NumericInput
                        fill
                        min={range[0]}
                        max={range[1]}
                        stepSize={range[2]}
                        value={value}
                        onValueChange={method}
                    />
                </Item>
            ))}
        </Wrapper>
    );
};

const Wrapper = styled.div`
    display: flex;
    margin-left: 5%;
    flex-wrap: wrap;
    justify-content: space-between;
`;

const Item = styled.div`
    width: 48%;
    margin-bottom: 5%;
`;
