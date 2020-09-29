import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from "react-redux";
import styled from 'styled-components';
import { AppState } from '../../store';
import { Button, Navbar, NavbarDivider, NavbarGroup, NavbarHeading, Tooltip, Alignment, Classes, Toaster, Position, Dialog, AnchorButton } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import editorModule from '../../modules/editorModule';
import SparebeatJsonExport from '../../modules/mapConvert/SparebeatJsonExport';
import { BackgroundColorPicker } from './bgColor/BackgroundColorPicker';
import { EditorSetting } from './editorSetting/EditorSetting';
import { SongInfoDialog } from './dialog/SongInfoDialog';
import { DifficultyDialog } from './dialog/DifficultyDialog';

const {
    saveSetting,
    toggleTest,
    saveMap,
} = editorModule.actions;

const menuToast = Toaster.create({
    position: Position.TOP,
    maxToasts: 3,
});

export interface IDialogFooter {
    handleState: () => void;
}

export const DialogFooter: React.FC<IDialogFooter> = ({ handleState }) => (
    <FooterWrapper className={Classes.DIALOG_FOOTER}>
        <Button text="閉じる" onClick={handleState} />
    </FooterWrapper>
);

const FooterWrapper = styled.div`
    text-align: right;
`;

export const Menu = () => {
    const dispatch = useDispatch();

    const [infoDialog, infoDialogOpen] = useState(false);
    const handleInfoDialog = useCallback(() => {
        infoDialogOpen((pre) => !pre);
    }, [infoDialogOpen]);

    const [diffDialog, diffDialogOpen] = useState(false);
    const handleDiffDialog = useCallback(() => {
        diffDialogOpen((pre) => !pre);
    }, [diffDialogOpen]);

    const [backDialog, backDialogOpen] = useState(false);
    const handleBackDialog = useCallback(() => {
        backDialogOpen((pre) => !pre);
    }, [backDialogOpen]);

    const [settingDialog, settingOpen] = useState(false);
    const handleSettingDialog = useCallback(() => {
        settingOpen((pre) => !pre);
    }, [settingOpen]);

    const {
        themeDark,
        loaded,
        mapChanged,
        info: { title },
        mapJson,
    } = useSelector((state: AppState) => ({
        ...state,
        mapJson: new SparebeatJsonExport(state).export(),
    }));

    const copyAndSave = () => {
        dispatch(saveMap());
        const listener = (e: ClipboardEvent) => {
            if (e.clipboardData) {
                const text = JSON.stringify(mapJson, null, '\t');
                e.clipboardData.setData('text/plain', text);
                menuToast.show({
                    message: 'クリップボードにコピー、保存しました',
                    intent: 'primary',
                    timeout: 2000,
                });
            }
            e.preventDefault();
            document.removeEventListener("copy", listener);
        }
        document.addEventListener("copy", listener);
        document.execCommand("copy");
    };

    const download = () => {
        const downLoadLink = document.createElement('a');
        downLoadLink.download = 'map.json';
        const text = JSON.stringify(mapJson, null, '\t');
        const urlObject = new Blob([text], { type: "text.plain" });
        downLoadLink.href = URL.createObjectURL(urlObject);
        downLoadLink.dataset.downloadurl = [
            "text/plain",
            downLoadLink.download,
            downLoadLink.href
        ].join(":");
        downLoadLink.click();
    };

    return (
        <WrapNavbar>
            <SongInfoDialog
                isOpen={infoDialog}
                handleState={handleInfoDialog}
            />
            <DifficultyDialog
                isOpen={diffDialog}
                handleState={handleDiffDialog}
            />
            <BackgroundDialog
                className={themeDark ? Classes.DARK : ''}
                isOpen={backDialog}
                title="背景色設定"
                onClose={handleBackDialog}
            >
                <BackgroundColorPicker />
            </BackgroundDialog>
            <Dialog
                className={themeDark ? Classes.DARK : ''}
                isOpen={settingDialog}
                title="エディタ設定"
                onClose={handleSettingDialog}
                onClosed={() => dispatch(saveSetting())}
            >
                <EditorSetting />
                <DialogFooter handleState={handleSettingDialog} />
            </Dialog>

            <NavbarGroup align={Alignment.LEFT}>
                <NavbarHeading>Sparebeat Map Editor</NavbarHeading>
                <NavbarDivider />
                <Tooltip disabled={!loaded} content="曲情報の編集">
                    <Button
                        disabled={!loaded}
                        className={Classes.MINIMAL}
                        icon={IconNames.INFO_SIGN}
                        large
                        onClick={handleInfoDialog}
                    />
                </Tooltip>
                <Tooltip disabled={!loaded} content="難易度変更">
                    <Button
                        disabled={!loaded}
                        className={Classes.MINIMAL}
                        icon={IconNames.MULTI_SELECT}
                        large
                        onClick={handleDiffDialog}
                    />
                </Tooltip>
                <Tooltip disabled={!loaded} content="背景色設定">
                    <Button
                        disabled={!loaded}
                        className={Classes.MINIMAL}
                        icon={IconNames.STYLE}
                        large
                        onClick={handleBackDialog}
                    />
                </Tooltip>
                <NavbarDivider />
                <Tooltip disabled={!loaded} content="テストプレイ">
                    <Button
                        disabled={!loaded}
                        className={Classes.MINIMAL}
                        icon={IconNames.DESKTOP}
                        large
                        onClick={() => dispatch(toggleTest())}
                    />
                </Tooltip>
                <Tooltip
                    disabled={!loaded}
                    content="譜面ファイルをクリップボードにコピー、サイトに保存"
                >
                    <Button
                        disabled={!loaded}
                        className={Classes.MINIMAL}
                        icon={IconNames.SAVED}
                        intent={mapChanged ? (themeDark ? 'primary' : 'warning') : 'none'}
                        large
                        onClick={copyAndSave}
                    />
                </Tooltip>
                <Tooltip disabled={!loaded} content="譜面出力">
                    <Button
                        disabled={!loaded}
                        className={Classes.MINIMAL}
                        icon={IconNames.EXPORT}
                        large
                        onClick={download}
                    />
                </Tooltip>
                <NavbarDivider />
                <Tooltip content="エディタ設定">
                    <Button
                        className={Classes.MINIMAL}
                        icon={IconNames.COG}
                        large
                        onClick={handleSettingDialog}
                    />
                </Tooltip>
                <Tooltip content="使い方">
                    <AnchorButton
                        className={Classes.MINIMAL}
                        icon={IconNames.HELP}
                        large
                        href="https://note.com/bo_yakitarako/n/n287021401622"
                        target="_blank"
                        rel="noopener"
                    />
                </Tooltip>
                <Tooltip content="Sparebeat設定">
                    <AnchorButton
                        minimal
                        large
                        icon={IconNames.SETTINGS}
                        href="https://sparebeat.com/settings"
                        onMouseDown={() => dispatch(saveMap())}
                    />
                </Tooltip>
                <Tooltip disabled={loaded} content="オンラインオーディオコンバータ">
                    <AnchorButton
                        disabled={loaded}
                        minimal
                        large
                        icon={IconNames.CHANGES}
                        href="https://online-audio-converter.com/ja/"
                        target="_blank"
                        rel="noopener"
                    />
                </Tooltip>
                <SongTitle>{title}</SongTitle>
            </NavbarGroup>
        </WrapNavbar>
    )
};

const WrapNavbar = styled(Navbar)`
    height: 50px;
`;

const BackgroundDialog = styled(Dialog)`
    width: 600px;
`;

const SongTitle = styled(NavbarHeading)`
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 20px;
`;
