import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { AppState } from 'store';
import SparebeatJsonExport from 'modules/mapConvert/SparebeatJsonExport';
import music from 'modules/music/clapModule';
import editorModule from 'modules/editorModule';

const {
    toggleTest,
} = editorModule.actions;

export const TestPlayer = () => {
    const dispatch = useDispatch();
    const mapJson = useSelector((state: AppState) =>
        new SparebeatJsonExport(state).export()
    );

    useEffect(() => {
        const dataUrl = `data:application/json;base64,${
            window.btoa(unescape(encodeURIComponent(JSON.stringify(mapJson))))
        }`;
        Sparebeat.load(dataUrl, music.src);
    }, [mapJson]);

    return (
        <Overlay onClick={() => dispatch(toggleTest())}>
            <TestPlayerWrapper>
                <iframe
                    title="sparebeat_test"
                    id="sparebeat"
                    width="960"
                    height="640"
                    src="https://sparebeat.com/embed/"
                    frameBorder="0"
                />
            </TestPlayerWrapper>
        </Overlay>
    )
};

const Overlay = styled.div`
    position: fixed;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    z-index: 15;
    background-color: rgba(0, 0, 0, 0.5);
    cursor: pointer;
`;

const TestPlayerWrapper = styled.div`
    position: absolute;
    width: 960;
    height: 640;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 20;
`;
