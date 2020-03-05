import React, { useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { AppState } from '../../store';
import { Button, Navbar, NavbarDivider, NavbarGroup, NavbarHeading, Tooltip, Alignment, Classes, Toaster, Position, Intent, Dialog, InputGroup } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import editorModule from '../../modules/editorModule';
import SparebeatJsonExport from '../../modules/mapConvert/SparebeatJsonExport';

const saveToast = Toaster.create({
	position: Position.TOP,
	maxToasts: 1,
});

const Menu = () => {
	const dispatch = useDispatch();
	const [ infoDialog, infoDialogOpen ] = useState(false);
	const { themeDark, loaded } = useSelector((state: AppState) => state);
	const { title, artist, url } = useSelector((state: AppState) => state.info);
	const mapJson = useSelector((state: AppState) => new SparebeatJsonExport(state).export());
	return (
		<Navbar style={{height: '50px'}}>
			<Dialog className={themeDark ? Classes.DARK : ''} isOpen={infoDialog} title="曲情報の編集" onClose={() => { infoDialogOpen(false) }}>
				<div className={Classes.DIALOG_BODY}>
					<InputGroup leftIcon={IconNames.INFO_SIGN} placeholder="曲タイトルを入力" value={title} style={{ marginBottom: '5%' }} onChange={(event: React.FormEvent<HTMLInputElement>) => {
						dispatch(editorModule.actions.updateInfo({info: 'title', value: event.currentTarget.value}));
					}} />
					<InputGroup leftIcon={IconNames.PERSON} placeholder="アーティスト名を入力" value={artist} style={{ marginBottom: '5%' }} onChange={(event: React.FormEvent<HTMLInputElement>) => {
						dispatch(editorModule.actions.updateInfo({info: 'artist', value: event.currentTarget.value}));
					}} />
					<InputGroup leftIcon={IconNames.HOME} placeholder="アーティストのサイトのURLを入力" value={url} onChange={(event: React.FormEvent<HTMLInputElement>) => {
						dispatch(editorModule.actions.updateInfo({info: 'url', value: event.currentTarget.value}));
					}} />
				</div>
				<div className={Classes.DIALOG_FOOTER} style={{textAlign: 'right'}} >
					<Button text="閉じる" onClick={() => infoDialogOpen(false)} />
				</div>
			</Dialog>
			<NavbarGroup align={Alignment.LEFT}>
				<NavbarHeading>Sparebeat Map Editor</NavbarHeading>
				<NavbarDivider />
				<Tooltip content="曲情報編集">
					<Button disabled={!loaded} className={Classes.MINIMAL} icon={IconNames.INFO_SIGN} large={true} onClick={() => infoDialogOpen(true)} />
				</Tooltip>
				<Tooltip content="難易度変更">
					<Button disabled={!loaded} className={Classes.MINIMAL} icon={IconNames.MULTI_SELECT} large={true} />
				</Tooltip>
				<Tooltip content="背景色設定">
					<Button disabled={!loaded} className={Classes.MINIMAL} icon={IconNames.STYLE} large={true} />
				</Tooltip>
				<NavbarDivider />
				<Tooltip content="テストプレイ">
					<Button disabled={!loaded} className={Classes.MINIMAL} icon={IconNames.DESKTOP} large={true} />
				</Tooltip>
				<Tooltip content="譜面ファイルをクリップボードにコピー、一時保存">
					<Button disabled={!loaded} className={Classes.MINIMAL} icon={IconNames.SAVED} large={true} onClick={() => {
						localStorage.map = JSON.stringify(mapJson);
						const listener = (e: ClipboardEvent) => {
							if (e.clipboardData) {
								e.clipboardData.setData("text/plain", JSON.stringify(mapJson, null, '\t'));
								saveToast.show({message: 'クリップボードにコピーしました', intent: Intent.PRIMARY, timeout: 2000});
							}
							e.preventDefault();
							document.removeEventListener("copy", listener);
						}
						document.addEventListener("copy", listener);
						document.execCommand("copy");
					}} />
				</Tooltip>
				<Tooltip content="譜面出力">
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
					<Button className={Classes.MINIMAL} icon={IconNames.COG} large={true} />
				</Tooltip>
				<Tooltip content="ヘルプ">
					<Button className={Classes.MINIMAL} icon={IconNames.HELP} large={true} />
				</Tooltip>
			</NavbarGroup>
		</Navbar>
	)
}

export default Menu;
