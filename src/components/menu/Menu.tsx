import React, { useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { AppState } from '../../store';
import { Button, Navbar, NavbarDivider, NavbarGroup, NavbarHeading, Tooltip, Alignment, Classes, Toaster, Position, Intent, Dialog, InputGroup, MenuItem, AnchorButton } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Select, ItemRenderer } from '@blueprintjs/select';
import editorModule, { DifficlutySelect } from '../../modules/editorModule';
import music from '../../modules/music/clapModule';
import SparebeatJsonExport from '../../modules/mapConvert/SparebeatJsonExport';
import { BackgroundColorPicker } from './bgColor/BackgroundColorPicker';
import EditorSetting from './editorSetting/EditorSetting';

const menuToast = Toaster.create({
	position: Position.TOP,
	maxToasts: 3,
});

interface ICloneSelect {
	index: number;
	difficulty: DifficlutySelect;
}
const cloneSelects: ICloneSelect[] = ['easy', 'normal', 'hard'].map((value, index) => ({ index: index, difficulty: value as DifficlutySelect }));
const CloneSelect = Select.ofType<ICloneSelect>();

interface ICloneSelector {
	me: DifficlutySelect;
	opponent: DifficlutySelect;
}

const Menu = () => {
	const dispatch = useDispatch();
	const [ infoDialog, infoDialogOpen ] = useState(false);
	const [ diffDialog, diffDialogOpen ] = useState(false);
	const [ originSelect, changeOrigin ] = useState('easy' as DifficlutySelect);
	const [ targetSelect, changeTarget ] = useState('normal' as DifficlutySelect);
	const [ backDialog, backDialogOpen ] = useState(false);
	const [ settingDialog, settingOpen ] = useState(false);
	const { themeDark, loaded, playing, current, mapChanged } = useSelector((state: AppState) => state);
	const { title, artist, url, level } = useSelector((state: AppState) => state.info);
	const mapJson = useSelector((state: AppState) => new SparebeatJsonExport(state).export());
	const dialogFooter = (opener: React.Dispatch<React.SetStateAction<boolean>>) => (
		<div className={Classes.DIALOG_FOOTER} style={{ textAlign: 'right' }} >
			<Button text="閉じる" onClick={() => opener(false)} />
		</div>
	);
	const diffWindow = (difficulty: DifficlutySelect) => (
		<div style={{ display: 'inline-block', width: '25%', margin: `0 ${difficulty === 'normal' ? '5%' : '0'}`, }}>
			<Button active={ current === difficulty } text={difficulty.toUpperCase()} style={{width: '100%'}} onClick={() => {
				if (current !== difficulty) {
					dispatch(editorModule.actions.changeDifficulty(difficulty));
					dispatch(editorModule.actions.updateCurrentTime(0));
					dispatch(editorModule.actions.updateBarPos(0));
				}
			}} />
			<InputGroup style={{ textAlign: 'center' }} value={level[difficulty].toString()} onChange={(event: React.FormEvent<HTMLInputElement>) => {
				dispatch(editorModule.actions.updateLevel({ difficulty: difficulty, value: event.currentTarget.value }));
			}} />
			<Button intent={Intent.DANGER} text="リセット" style={{ width: '100%', marginTop: '10%' }} onClick={() => { dispatch(editorModule.actions.deleteMap(difficulty)) }} />
		</div>
	);
	const CloneSelector: React.SFC<ICloneSelector> = (props: ICloneSelector) => {
		const renderItem: ItemRenderer<ICloneSelect> = (select, { handleClick, modifiers }) => {
			return <MenuItem key={select.index} active={props.me === select.difficulty} disabled={props.opponent === select.difficulty} text={select.difficulty.toUpperCase()} onClick={handleClick} />
		};
		const handleClick = (select: ICloneSelect) => {
			if (props.me === originSelect) {
				changeOrigin(select.difficulty);
			} else {
				changeTarget(select.difficulty);
			}
		};
		return (
			<CloneSelect
				items={cloneSelects}
				itemRenderer={renderItem}
				onItemSelect={handleClick}
				filterable={false}
			>
				<Button text={props.me.toUpperCase()} rightIcon={ IconNames.CARET_DOWN } />
			</CloneSelect>
		);
	};
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
				{dialogFooter(infoDialogOpen)}
			</Dialog>
			<Dialog className={themeDark ? Classes.DARK : ''} isOpen={diffDialog} title="難易度変更" onClose={() => {
				dispatch(editorModule.actions.saveSetting());
				diffDialogOpen(false);
			}}>
				<div className={ Classes.DIALOG_BODY } style={{ textAlign: 'center' }}>
					<div style={{ marginBottom: '10%' }} >
						{diffWindow('easy')}
						{diffWindow('normal')}
						{diffWindow('hard')}
					</div>
					<div>
						<CloneSelector me={originSelect} opponent={targetSelect} />
						譜面から
						<CloneSelector me={targetSelect} opponent={originSelect} />
						譜面へ
						<Button text="コピー" onClick={() => { dispatch(editorModule.actions.cloneDifficulty({ origin: originSelect, target: targetSelect })) }} />
					</div>
				</div>
				<div className={Classes.DIALOG_FOOTER} style={{ textAlign: 'right' }} >
					<Button text="閉じる" onClick={() => {
						dispatch(editorModule.actions.saveSetting());
						diffDialogOpen(false);
					}} />
				</div>
			</Dialog>
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
}

export default Menu;
