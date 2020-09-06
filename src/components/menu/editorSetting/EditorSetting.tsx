import React from 'react';
import styled from 'styled-components';
import { Tabs, Tab } from '@blueprintjs/core';
import { ColorSetting } from './ColorSetting';
import { DisplaySetting } from './DisplaySetting';

export const EditorSetting = () => {
    return (
        <Wrapper>
            <Tabs id="editorSetting" defaultSelectedTabId="general" >
                <Tab
                    className="setting-tab"
                    id="general"
                    title="全般"
                    panel={<DisplaySetting />}
                />
                <Tab
                    className="setting-tab"
                    id="color"
                    title="カラー"
                    panel={<ColorSetting />}
                />
            </Tabs>
        </Wrapper>
    );
};

const Wrapper = styled.div`
    width: 95%;
    .bp3-tab-list {
        padding-left: 5%;
        .setting-tab {
            width: 20%;
            text-align: center;
        }
    }
`;
