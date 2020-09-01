import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Switch, Divider, ButtonGroup, Button } from '@blueprintjs/core';
import { AppState } from 'store';
import editorModule, { SparebeatTheme } from 'modules/editorModule';
import Notes, { NotesStatus } from 'components/map/Notes';
import { ChromePicker } from 'react-color';

export const ColorSetting = () => {
    const dispatch = useDispatch();
    const { themeDark, sparebeatTheme, barColor, notesDisplay: { aspect } } = useSelector((state: AppState) => state);
    const changeSparebeatTheme = (theme: SparebeatTheme) => () => {
        if (theme !== sparebeatTheme) {
            dispatch(editorModule.actions.changeSparebeatTheme(theme));
        }
    };
    type LineType = { index: number, status: NotesStatus, style?: React.CSSProperties };
    const displayNotesWidth = 50;
    const Line: React.SFC<LineType> = (props: LineType) => {
        return (
            <div style={props.style ? props.style : {}}>{[0, 1, 2, 3].map(i => <Notes key={i} index={i} width={displayNotesWidth} status={i === props.index ? props.status : i === 3 && props.index === 0 ? 'attack' : 'none'} inBind={props.index === 1} selected={props.index === 2} />)}</div>
        );
    };
    const notesHeight = displayNotesWidth / aspect;
    return (
        <div style={{ marginLeft: '5%' }}>
            <Switch checked={themeDark} label="ダークテーマを適用" onChange={(event) => {
                dispatch(editorModule.actions.changeTheme(event.currentTarget.checked));
            }} />
            <Divider />
            <div>Sparebeatテーマ</div>
            <ButtonGroup style={{ width: '100%', marginTop: '3%', marginBottom: '3%' }}>
                {(['default', 'sunset', '39'] as SparebeatTheme[]).map((value: SparebeatTheme) => {
                    return <Button key={value} style={{ width: '33.3%' }} active={sparebeatTheme === value} text={value} onClick={changeSparebeatTheme(value)} />
                })}
            </ButtonGroup>
            <Divider />
            <div style={{ margin: '5% 0' }}>
                <div style={{ position: 'relative', display: 'inline-block', width: 4 * displayNotesWidth, fontSize: 0 }}>
                    <Line index={3} status="long_end" />
                    <Line index={2} status="long_start" style={{ marginTop: notesHeight / 2 }} />
                    <Line index={1} status="normal" style={{ marginTop: notesHeight / 2 }} />
                    <Line index={0} status="normal" style={{ marginTop: notesHeight / 2 }} />
                    <div style={{ position: 'absolute', width: '100%', height: 4, left: 0, top: '50%', transform: 'translateY(-50%)', backgroundColor: barColor }}></div>
                </div>
                <div style={{ display: 'inline-block', marginLeft: '4%', }}>
                    <div style={{ marginBottom: '2%' }}>再生バーの色設定</div>
                    <ChromePicker color={barColor} onChange={color => {
                        dispatch(editorModule.actions.changeBarColor(color.hex));
                    }} />
                </div>
            </div>
        </div>
    );
};
