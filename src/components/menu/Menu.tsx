import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from "react-redux";
import styled from 'styled-components';
import { AppState } from '../../store';
import { Button, Navbar, NavbarDivider, NavbarGroup, NavbarHeading, Tooltip, Alignment, Classes, Toaster, Position, Intent, Dialog, AnchorButton } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import editorModule from '../../modules/editorModule';
import music from '../../modules/music/clapModule';
import SparebeatJsonExport from '../../modules/mapConvert/SparebeatJsonExport';
import { BackgroundColorPicker } from './bgColor/BackgroundColorPicker';
import { EditorSetting } from './editorSetting/EditorSetting';
import { SongInfoDialog } from './dialog/SongInfoDialog';
import { DifficultyDialog } from './dialog/DifficultyDialog';

const menuToast = Toaster.create({
	position: Position.TOP,
	maxToasts: 3,
});

export interface IDialogFooter {
	setState: React.Dispatch<React.SetStateAction<boolean>>
}

export const DialogFooter: React.FC<IDialogFooter> = ({ setState }) => {
	const handleClose = useCallback(() => {
		setState(() => false);
	}, [setState]);
	return (
		<FooterWrapper className={Classes.DIALOG_FOOTER}>
			<Button text="閉じる" onClick={handleClose} />
		</FooterWrapper>
	);
};

const FooterWrapper = styled.div`
	text-align: right;
`;

export const Menu = () => {
	const dispatch = useDispatch();
	const [ infoDialog, infoDialogOpen ] = useState(false);
	const [ diffDialog, diffDialogOpen ] = useState(false);
	const [ backDialog, backDialogOpen ] = useState(false);
	const [ settingDialog, settingOpen ] = useState(false);
	const { themeDark, loaded, playing, mapChanged } = useSelector((state: AppState) => state);
	const { title } = useSelector((state: AppState) => state.info);
	const mapJson = useSelector((state: AppState) => new SparebeatJsonExport(state).export());
	const dialogFooter = (opener: React.Dispatch<React.SetStateAction<boolean>>) => (
		<div className={Classes.DIALOG_FOOTER} style={{ textAlign: 'right' }} >
			<Button text="閉じる" onClick={() => opener(false)} />
		</div>
	);
	return (
		<Navbar style={{height: '50px'}}>
			<SongInfoDialog
				isOpen={infoDialog}
				setState={infoDialogOpen}
			/>
			<DifficultyDialog
				isOpen={diffDialog}
				setState={diffDialogOpen}
			/>
			<Dialog className={themeDark ? Classes.DARK + ' dialog' : 'dialog'} style={{ width: 600 }} isOpen={backDialog} title="背景色設定" onClose={() => { backDialogOpen(false) }}>
				<BackgroundColorPicker />
			</Dialog>
			<Dialog className={themeDark ? Classes.DARK + ' dialog' : 'dialog' } isOpen={settingDialog} title="エディタ設定" onClose={() => settingOpen(false) } onClosed={() => {
				dispatch(editorModule.actions.saveSetting());
			}} >
				<EditorSetting />
				{dialogFooter(settingOpen)}
			</Dialog>
			<NavbarGroup align={Alignment.LEFT}>
				<NavbarHeading>Sparebeat Map Editor</NavbarHeading>
				<NavbarDivider />
				<Tooltip disabled={!loaded} content="曲情報の編集">
					<Button disabled={!loaded} className={Classes.MINIMAL} icon={IconNames.INFO_SIGN} large={true} onClick={() => infoDialogOpen(true) } />
				</Tooltip>
				<Tooltip disabled={!loaded} content="難易度変更">
					<Button disabled={!loaded} className={Classes.MINIMAL} icon={IconNames.MULTI_SELECT} large={true} onClick={() => {
						diffDialogOpen(true);
						if (playing) {
							dispatch(editorModule.actions.toggleMusic());
						}
					}} />
				</Tooltip>
				<Tooltip disabled={!loaded} content="背景色設定">
					<Button disabled={!loaded} className={Classes.MINIMAL} icon={IconNames.STYLE} large={true} onClick={() => { backDialogOpen(true) }} />
				</Tooltip>
				<NavbarDivider />
				<Tooltip disabled={!loaded} content="テストプレイ">
					<Button disabled={!loaded} className={Classes.MINIMAL} icon={IconNames.DESKTOP} large={true} onClick={() => {
						const testDOM = document.querySelector('#sparebeat_test') as HTMLDivElement;
						testDOM.innerHTML = '<iframe id="sparebeat" width="960" height="640" src="https://sparebeat.com/embed/" frameborder="0"></iframe>';
						const encodeBase64 = (str: string) => window.btoa(unescape(encodeURIComponent(str)));
						const dataUrl = 'data:application/json;base64,' + encodeBase64(JSON.stringify(mapJson));
						const script = document.createElement('script');
						script.innerHTML = `Sparebeat.load('${dataUrl}', '${music.src}')`;
						testDOM.appendChild(script);
						dispatch(editorModule.actions.toggleTest());
					}} />
				</Tooltip>
				<Tooltip disabled={!loaded} content="譜面ファイルをクリップボードにコピー、サイトに保存">
					<Button disabled={!loaded} className={Classes.MINIMAL} icon={IconNames.SAVED} intent={mapChanged ? themeDark ? Intent.PRIMARY : Intent.WARNING : Intent.NONE} large={true} onClick={() => {
						dispatch(editorModule.actions.saveMap());
						const listener = (e: ClipboardEvent) => {
							if (e.clipboardData) {
								e.clipboardData.setData("text/plain", JSON.stringify(mapJson, null, '\t'));
								menuToast.show({message: 'クリップボードにコピー、保存しました', intent: Intent.PRIMARY, timeout: 2000});
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
				<NavbarHeading style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 20 }}>{ title }</NavbarHeading>
			</NavbarGroup>
		</Navbar>
	)
};
