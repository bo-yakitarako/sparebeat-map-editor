import React from 'react';
import { useSelector, useDispatch } from "react-redux";
import styled from 'styled-components';
import { ChromePicker } from 'react-color';
import { AppState } from '../../../store';
import editorModule from 'modules/editorModule';
import { SparebeatStartMenu } from './SparebeatStartMenu';

export interface IRgb {
    r: number;
    g: number;
    b: number;
};

const { updateBgColor } = editorModule.actions;

export const BackgroundColorPicker = () => {
    const dispatch = useDispatch();
    const { top, bottom } = useSelector(({ info: { bgColor } }: AppState) => parseBackgroundRGB(bgColor));
    return (
        <Wrapper>
            <SparebeatStartMenu top={top} bottom={bottom} />
            <PickerWrapper>
                <ChromePicker
                    key={0}
                    color={top}
                    disableAlpha
                    onChange={({ hex }) => {
                        dispatch(updateBgColor({ index: 0, color: hex }));
                    }}
                />
                <ChromePicker
                    key={1}
                    color={bottom}
                    disableAlpha
                    onChange={({ hex }) => {
                        dispatch(updateBgColor({ index: 1, color: hex }));
                    }}
                />
            </PickerWrapper>
        </Wrapper>
    );
};

const parseBackgroundRGB = (bgColor: string[]) => {
    if (bgColor.length < 2) {
        return {
            top: { r: 67, g: 198, b: 172 },
            bottom: { r: 25, g: 22, b: 84 },
        };
    }
    const convertHexToRgb = (hex: string) => {
        const splitByColor = () => {
            const code = hex[0] === '#' ? hex.substr(1) : hex;
            if (code.length === 3) {
                return [code[0] + code[0], code[1] + code[1], code[2] + code[2]];
            }
            return [code.substr(0, 2), code.substr(2, 2), code.substr(4, 2)];
        };
        const [r, g, b] = splitByColor().map((code) => parseInt(code, 16));
        return { r, g, b };
    };
    return {
        top: convertHexToRgb(bgColor[0]),
        bottom: convertHexToRgb(bgColor[1]),
    };
};

const Wrapper = styled.div`
    text-align: center;
`;

const PickerWrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-top: 10px;
    margin-left: auto;
    margin-right: auto;
    width: 480px;
`;
