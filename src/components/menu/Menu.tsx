import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from "react-redux";
import styled from 'styled-components';
import { AppState } from '../../store';
import { Button, Navbar, NavbarDivider, NavbarGroup, NavbarHeading, Tooltip, Alignment, Classes, Toaster, Position, Intent, Dialog, AnchorButton } from '@blueprintjs/core';
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

    const { themeDark, loaded, mapChanged } = useSelector((state: AppState) => state);
    const { title } = useSelector((state: AppState) => state.info);
    const mapJson = useSelector((state: AppState) => new SparebeatJsonExport(state).export());
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
                <Tooltip disabled={!loaded} content="譜面ファイルをクリップボードにコピー、サイトに保存">
                    <Button disabled={!loaded} className={Classes.MINIMAL} icon={IconNames.SAVED} intent={mapChanged ? themeDark ? Intent.PRIMARY : Intent.WARNING : Intent.NONE} large={true} onClick={() => {
                        dispatch(editorModule.actions.saveMap());
                        const listener = (e: ClipboardEvent) => {
                            if (e.clipboardData) {
                                e.clipboardData.setData("text/plain", JSON.stringify(mapJson, null, '\t'));
                                menuToast.show({ message: 'クリップボードにコピー、保存しました', intent: Intent.PRIMARY, timeout: 2000 });
                            }
                            e.preventDefault();
                            document.removeEventListener("copy", listener);
                        }
                        document.addEventListener("copy", listener);
                        document.execCommand("copy");
                    }} />
                </Tooltip>
                <Tooltip disabled={!loaded} content="譜面出力">
                    <Button disabled={!loaded} className={Classes.MINIMAL} icon={IconNames.EXPORT} large={true} onClick={() => {
                        const downLoadLink = document.createElement('a');
                        downLoadLink.download = 'map.json';
                        downLoadLink.href = URL.createObjectURL(new Blob([JSON.stringify(mapJson, null, '\t')], { type: "text.plain" }));
                        downLoadLink.dataset.downloadurl = ["text/plain", downLoadLink.download, downLoadLink.href].join(":");
                        downLoadLink.click();
                    }} />
                </Tooltip>
                <NavbarDivider />
                <Tooltip content="エディタ設定">
                    <Button className={Classes.MINIMAL} icon={IconNames.COG} large={true} onClick={() => { settingOpen(true) }} />
                </Tooltip>
                <Tooltip content="使い方">
                    <AnchorButton className={Classes.MINIMAL} icon={IconNames.HELP} large={true} href="https://note.com/bo_yakitarako/n/n287021401622" target="_blank" />
                </Tooltip>
                <Tooltip content="Sparebeat設定">
                    <AnchorButton minimal large icon={IconNames.SETTINGS} href="https://sparebeat.com/settings" onMouseDown={() => { dispatch(editorModule.actions.saveMap()) }} />
                </Tooltip>
                <Tooltip disabled={loaded} content="オンラインオーディオコンバータ">
                    <AnchorButton disabled={loaded} minimal={true} icon={IconNames.CHANGES} large={true} href="https://online-audio-converter.com/ja/" target="_blank" />
                </Tooltip>
                <NavbarHeading style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 20 }}>{title}</NavbarHeading>
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
