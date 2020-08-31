import React, { Dispatch } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { Toaster, Position } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import editorModule, { DifficlutySelect, IMapState } from '../../modules/editorModule';
import { SparebeatJsonLoader } from '../../modules/mapConvert/SparebeatJsonLoader';

interface IProps {
    fadeOut: () => void;
}

const caution = Toaster.create({
    position: Position.TOP,
    maxToasts: 3,
});

const loadMapJson = (event: React.ChangeEvent<HTMLInputElement>, dispatch: Dispatch<any>, fadeOut: () => void) => {
    const jsonFile = (event.currentTarget.files as FileList)[0];
    const reader = new FileReader();
    reader.onload = (event) => {
        const loader = new SparebeatJsonLoader(event.target?.result as string);
        const easy = loader.getMapState('easy');
        if (easy === undefined) {
            caution.show({ message: 'bpmわかんね', intent: 'danger', timeout: 2000, icon: IconNames.WARNING_SIGN });
        } else {
            const { setMap, setSongInfo, loadExternalMap } = editorModule.actions;
            (['easy', 'normal', 'hard'] as DifficlutySelect[]).forEach(diff => {
                const map = loader.getMapState(diff) as { state: IMapState, failed: number };
                if (map.failed >= 0) {
                    caution.show({ message: `${diff.toUpperCase()}譜面の第${map.failed + 1}小節の()がおかしくてそれ以降は読み込まれないよ`, intent: 'danger', timeout: 10000, icon: IconNames.WARNING_SIGN });
                }
                dispatch(setMap({ diff: diff, map: map.state }));
            });
            dispatch(setSongInfo(loader.info));
            localStorage.removeItem('map');
            dispatch(loadExternalMap());
            fadeOut();
        }
    };
    reader.readAsText(jsonFile);
};

export const MapJsonReader: React.FC<IProps> = ({ fadeOut }) => {
    const dispatch = useDispatch();
    return (
        <Wrapper>
            <ReadMapTitle>譜面ファイルを読み込む</ReadMapTitle>
            <label className="bp3-file-input">
                <input
                    type="file"
                    accept="application/json"
                    onChange={(event) => loadMapJson(event, dispatch, fadeOut)}
                />
                <span className="bp3-file-upload-input">譜面ファイルを選択</span>
            </label>
        </Wrapper>
    )
};

const Wrapper = styled.div`
    width: 100%;
    text-align: center;
    margin-bottom: 5%;
`;

const ReadMapTitle = styled.h3`
    text-align: left;
`;
