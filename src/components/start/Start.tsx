import React, { useState } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from "react-redux";
import { AppState } from '../../store';
import editorModule, { DifficlutySelect, IMapState } from '../../modules/editorModule';
import music from '../../modules/music/clapModule';
import { SparebeatJsonLoader } from '../../modules/mapConvert/SparebeatJsonLoader';
import { Icon, Button, Toaster, Position, Dialog, Classes, Divider } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { MapJsonReader } from './MapJsonReader';
import { CreateOption } from './CreateOption';

const caution = Toaster.create({
    position: Position.TOP,
    maxToasts: 3,
});

const loadMusicFile = (event: React.ChangeEvent<HTMLInputElement>) => new Promise<void>((resolve) => {
    const audioFile = (event.currentTarget.files as FileList)[0];
    const reader = new FileReader();
    reader.onload = (event) => {
        music.src = event.target?.result as string;
        try {
            localStorage.removeItem('music');
            localStorage.music = music.src;
        } catch {
            caution.show({
                message: 'mp3のサイズが大きいため動作が重い可能性があります',
                icon: IconNames.WARNING_SIGN,
                intent: 'warning',
                timeout: 4000,
            });
        } finally {
            resolve();
        }
    };
    reader.readAsDataURL(audioFile);
});

export const Start = () => {
    const dispatch = useDispatch();
    const [startDialog, startDialogOpen] = useState(false);
    const [loadSaved, loadSavedOpen] = useState(false);
    const { loaded, themeDark, playing, sliderValue } = useSelector((state: AppState) => state);
    window.onload = () => {
        if (localStorage.music && localStorage.map) {
            loadSavedOpen(true);
        }
    };
    window.onbeforeunload = () => {
        dispatch(editorModule.actions.saveMap());
    }
    const fadeOut = () => {
        startDialogOpen(false);
        dispatch(editorModule.actions.updateBarPos(0));
        dispatch(editorModule.actions.updateCurrentTime(0));
        dispatch(editorModule.actions.load());
    };
    const loadLocalMap = () => {
        const loader = new SparebeatJsonLoader(localStorage.map);
        (['easy', 'normal', 'hard'] as DifficlutySelect[]).forEach(diff => {
            const { state: map } = loader.getMapState(diff) as { state: IMapState, failed: number };
            dispatch(editorModule.actions.setMap({ diff, map }));
        });
        dispatch(editorModule.actions.setSongInfo(loader.info));
        fadeOut();
    };
    music.onloadeddata = () => {
        music.volume = sliderValue.musicVolume / 100;
    };
    music.onended = () => {
        if (playing) {
            dispatch(editorModule.actions.toggleMusic());
        }
    };
    return (
        <Wrapper loaded={loaded} themeDark={themeDark}>
            <Dialog
                className={themeDark ? Classes.DARK + ' dialog' : 'dialog'}
                title="サイトにmp3と譜面データが保存されています"
                isOpen={loadSaved}
                isCloseButtonShown={false}
            >
                <ResumeDialogWrapper className={Classes.DIALOG_BODY} >
                    <h3>保存されているデータで再開しますか？</h3>
                    <ResumeDialogButton
                        left="true"
                        text="いいえ"
                        large
                        onClick={() => loadSavedOpen(false)} />
                    <ResumeDialogButton
                        text="はい"
                        large
                        onClick={() => {
                            music.src = localStorage.music;
                            loadSavedOpen(false);
                            loadLocalMap();
                        }}
                    />
                </ResumeDialogWrapper>
            </Dialog>
            <Dialog
                className={themeDark ? Classes.DARK + ' dialog' : 'dialog'}
                title="譜面を生成"
                isOpen={startDialog}
                canEscapeKeyClose={false}
                canOutsideClickClose={false}
                isCloseButtonShown={false}
            >
                <div className={Classes.DIALOG_BODY}>
                    <MapJsonReader fadeOut={fadeOut} />
                    <Divider />
                    {localStorage.map && (
                        <div>
                            <h3>続きから</h3>
                            <div style={{ marginBottom: '5%', textAlign: 'center' }}>
                                <Button
                                    text="サイトに保存された譜面を読み込む"
                                    icon={IconNames.DOWNLOAD}
                                    onClick={() => loadLocalMap()}
                                />
                            </div>
                        </div>
                    )}
                    {localStorage.map && <Divider />}
                    <CreateOption fadeOut={fadeOut} />
                </div>
            </Dialog>
            <MusicInput
                type="file"
                accept="audio/mp3"
                onChange={(event) => loadMusicFile(event).then(() => {
                    startDialogOpen(true);
                })}
            />
            <Description>
                <Icon icon={IconNames.INBOX_SEARCH} iconSize={20} />音源mp3ファイルを選択<br /><br />
				上部メニューの「オンラインオーディオコンバータ」から<br />
				64kbpsのmp3を用意することをオススメします
			</Description>
        </Wrapper>
    );
};

const Wrapper = styled.div<{ loaded: boolean, themeDark: boolean }>`
    position: fixed;
    width: calc(100% - 200px);
    min-height: calc(100vh - 50px);
    left: ${({ loaded }) => loaded ? '100%' : '200px'};
    top: 50px;
    z-index: 10;
    background-color: ${({ themeDark }) => themeDark ? '#30404D' : '#F5F8FA'};
    transition-property: left;
    transition-duration: 1.0s;
`;

const ResumeDialogWrapper = styled.div`
    text-align: center;
    h3 {
        text-align: left;
    }
`;

const ResumeDialogButton = styled(Button) <{ left?: string }>`
    width: 30%;
    ${({ left }) => left === 'true' && 'margin-right: 5%;'}
`;

const MusicInput = styled.input`
    position: absolute;
    display: ${music.src ? 'none' : 'inline'};
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    opacity: 0;
    z-index: 11;
    &:hover {
        cursor: pointer;
    }
`;

const Description = styled.p`
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    white-space: nowrap;
    font-size: 20px;
    text-align: center;
`;
