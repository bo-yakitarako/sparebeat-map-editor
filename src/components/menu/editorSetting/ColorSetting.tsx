import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Switch, Divider, ButtonGroup, Button } from '@blueprintjs/core';
import { AppState } from 'store';
import editorModule, { SparebeatTheme } from 'modules/editorModule';
import Notes, { NotesStatus } from 'components/map/Notes';
import { ChromePicker } from 'react-color';

const {
    changeSparebeatTheme: changeSparebeatThemeAction,
    changeTheme,
    changeBarColor
} = editorModule.actions;

export const ColorSetting = () => {
    const dispatch = useDispatch();
    const {
        themeDark,
        sparebeatTheme,
        barColor,
        notesDisplay: { aspect }
    } = useSelector((state: AppState) => state);
    const changeSparebeatTheme = (theme: SparebeatTheme) => () => {
        if (theme !== sparebeatTheme) {
            dispatch(changeSparebeatThemeAction(theme));
        }
    };
    const displayNotesWidth = 50;
    const notesHeight = displayNotesWidth / aspect;
    const Line: React.FC<{ index: number, status: NotesStatus }> = ({ index, status }) => {
        return (
            <StyledLine top={index === 3} notesHeight={notesHeight}>
                {[0, 1, 2, 3].map((i) => (
                    <Notes
                        key={i}
                        index={i}
                        width={displayNotesWidth}
                        status={i === index ? status : i === 3 && index === 0 ? 'attack' : 'none'}
                        inBind={index === 1}
                        selected={index === 2}
                    />
                ))}
            </StyledLine>
        );
    };
    return (
        <Wrapper>
            <Switch
                checked={themeDark}
                label="ダークテーマを適用"
                onChange={({ currentTarget: { checked } }) => dispatch(changeTheme(checked))}
            />
            <Divider />
            <p>Sparebeatテーマ</p>
            <ThemeChangeButtonGroup>
                {(['default', 'sunset', '39'] as SparebeatTheme[]).map((value) => (
                    <ThemeChangeButton
                        key={value}
                        active={sparebeatTheme === value}
                        text={value}
                        onClick={changeSparebeatTheme(value)}
                    />
                ))}
            </ThemeChangeButtonGroup>
            <Divider />
            <ColorDisplay>
                <Lines displayNotesWidth={displayNotesWidth}>
                    <Line index={3} status="long_end" />
                    <Line index={2} status="long_start" />
                    <Line index={1} status="normal" />
                    <Line index={0} status="normal" />
                    <Bar barColor={barColor} />
                </Lines>
                <BarColorWrapper>
                    <p>再生バーの色設定</p>
                    <ChromePicker color={barColor} onChange={({ hex }) => {
                        dispatch(changeBarColor(hex));
                    }} />
                </BarColorWrapper>
            </ColorDisplay>
        </Wrapper>
    );
};

const Wrapper = styled.div`
    margin-left: 5%;
    p {
        margin: 0;
    }
`;

const StyledLine = styled.div<{ top: boolean, notesHeight: number }>`
    ${({ top, notesHeight }) => !top && `margin-top: ${notesHeight / 2}px`}
`;

const ThemeChangeButtonGroup = styled(ButtonGroup)`
    width: 100%;
    margin-top: 3%;
    margin-bottom: 3%;
`;

const ThemeChangeButton = styled(Button)`
    width: 33.3%;
`;

const ColorDisplay = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 5% 0;
`;

const Lines = styled.div<{ displayNotesWidth: number }>`
    position: relative;
    width: ${({ displayNotesWidth }) => displayNotesWidth * 4}px;
    font-size: 0;
`;

const Bar = styled.span<{ barColor: string }>`
    position: absolute;
    width: 100%;
    height: 4px;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    background-color: ${({ barColor }) => barColor};
`;

const BarColorWrapper = styled.div`
    margin-left: 4%;
    p {
        margin: 0;
        margin-bottom: 2%;
    }
`;
