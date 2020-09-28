import React from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, InputGroup, Classes } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { AppState } from 'store';
import editorModule from 'modules/editorModule';
import { DialogFooter, IDialogFooter } from '../Menu';

const { updateInfo } = editorModule.actions;

export type Event = React.FormEvent<HTMLInputElement>;
export type Props = IDialogFooter & {
    isOpen: boolean;
};

export const SongInfoDialog: React.FC<Props> = ({ handleState, isOpen }) => {
    const dispatch = useDispatch();
    const {
        themeDark,
        info: { title, artist, url },
    } = useSelector((state: AppState) => state);
    return (
        <Dialog
            className={themeDark ? Classes.DARK : ''}
            isOpen={isOpen}
            title="曲情報の編集"
            onClose={handleState}
        >
            <div className={Classes.DIALOG_BODY}>
                <Input
                    bottom={false}
                    leftIcon={IconNames.INFO_SIGN}
                    placeholder="曲タイトルを入力"
                    value={title}
                    onChange={(event: Event) => {
                        const info = 'title';
                        const value = event.currentTarget.value;
                        dispatch(updateInfo({ info, value }))
                    }}
                />
                <Input
                    bottom={false}
                    leftIcon={IconNames.PERSON}
                    placeholder="アーティスト名を入力"
                    value={artist}
                    onChange={(event: Event) => {
                        const info = 'artist';
                        const value = event.currentTarget.value;
                        dispatch(updateInfo({ info, value }))
                    }}
                />
                <Input
                    bottom
                    leftIcon={IconNames.HOME}
                    placeholder="アーティストのサイトのURLを入力"
                    value={url}
                    onChange={(event: Event) => {
                        const info = 'url';
                        const value = event.currentTarget.value;
                        dispatch(updateInfo({ info, value }))
                    }}
                />
            </div>
            <DialogFooter handleState={handleState} />
        </Dialog>
    );
};

const Input = styled(InputGroup)<{ bottom: boolean }>`
    ${({ bottom }) => !bottom && 'margin-bottom: 5%;'}
`;
