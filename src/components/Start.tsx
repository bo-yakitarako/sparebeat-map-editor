import React, { useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { AppState } from '../store';
import editorModule, { DifficlutySelect, IMapState } from '../modules/editorModule';
import music from '../modules/music/clapModule';
import SparebeatJsonLoader from '../modules/mapConvert/SparebeatJsonLoader';
import { Icon, Button, Toaster, Position, Dialog, Classes, Divider, NumericInput } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

const caution = Toaster.create({
	position: Position.TOP,
	maxToasts: 3,
});

let mapGeneratorOpen = false;

const Start = () => {
	const dispatch = useDispatch();
	const [startDialog, startDialogOpen] = useState(false);
	const [loadSaved, loadSavedOpen] = useState(false);
	const [bpm, bpmChange] = useState(150);
	const [beats, beatsChange] = useState(4);
	const { loaded, themeDark, sliderValue } = useSelector((state: AppState) => state);
	window.onload = () => {
		if (localStorage.music && localStorage.map) {
			loadSavedOpen(true);
		}
	};
	const fadeOut = () => {
		startDialogOpen(false);
		dispatch(editorModule.actions.load());
	};
	const loadLocalMap = () => {
		const loader = new SparebeatJsonLoader(localStorage.map);
		(['easy', 'normal', 'hard'] as DifficlutySelect[]).forEach(diff => {
			const map = loader.getMapState(diff) as { state: IMapState, failed: number };
			dispatch(editorModule.actions.setMap({ diff: diff, map: map.state }));
		});
		dispatch(editorModule.actions.setSongInfo(loader.info));
		fadeOut();
	};
	music.onloadeddata = () => {
		music.volume = sliderValue.musicVolume / 100;
		if (mapGeneratorOpen) {
			startDialogOpen(true);
		} else {
			loadLocalMap();
		}
	};
	music.onended = () => {
		dispatch(editorModule.actions.pause());
	};
	return (
		<div style={{ position: 'fixed', width: 'calc(100% - 200px)', minHeight: 'calc(100vh - 50px)', left: !loaded ? '200px' : '100%', top: 50, zIndex: 10, backgroundColor: themeDark ? "#30404D" : "#F5F8FA", transitionProperty: 'left', transitionDuration: '1.0s' }}>
			<Dialog className="dialog" title="サイトにmp3と譜面データが保存されています" isOpen={loadSaved} isCloseButtonShown={false} >
				<div className={Classes.DIALOG_BODY} style={{ textAlign: 'center' }} >
					<h3 style={{ textAlign: 'left' }}>保存されているデータで再開しますか？</h3>
					<Button text="いいえ" large={true} style={{ width: '30%', marginRight: '5%' }} onClick={() => { loadSavedOpen(false) }} />
					<Button text="はい" large={true} style={{ width: '30%' }} onClick={() => {
						music.src = localStorage.music;
						loadSavedOpen(false);
					}} />
				</div>
			</Dialog>
			<Dialog className="dialog" title="譜面を生成" isOpen={startDialog} canEscapeKeyClose={false} canOutsideClickClose={false} isCloseButtonShown={false} >
				<div className={Classes.DIALOG_BODY}>
					<div style={{ width: '100%', textAlign: 'center', marginBottom: '5%' }}>
						<h3 style={{ textAlign: 'left' }}>譜面ファイルを読み込む</h3>
						<label className="bp3-file-input">
							<input type="file" accept="application/json" onChange={(event) => {
								const jsonFile = (event.currentTarget.files as FileList)[0];
								const reader = new FileReader();
								reader.onload = (event) => {
									const loader = new SparebeatJsonLoader(event.target?.result as string);
									const easy = loader.getMapState('easy');
									if (easy === undefined) {
										caution.show({ message: 'bpmわかんね', intent: 'danger', timeout: 2000, icon: IconNames.WARNING_SIGN });
									} else {
										(['easy', 'normal', 'hard'] as DifficlutySelect[]).forEach(diff => {
											const map = loader.getMapState(diff) as { state: IMapState, failed: number };
											if (map.failed >= 0) {
												caution.show({ message: `${diff.toUpperCase()}譜面の第${map.failed + 1}小節の()がおかしくてそれ以降は読み込まれないよ`, intent: 'danger', timeout: 10000, icon: IconNames.WARNING_SIGN });
											}
											dispatch(editorModule.actions.setMap({ diff: diff, map: map.state }));
										});
										dispatch(editorModule.actions.setSongInfo(loader.info));
										localStorage.removeItem('map');
										fadeOut();
									}
								};
								reader.readAsText(jsonFile);
							}} />
  							<span className="bp3-file-upload-input">譜面ファイルを選択</span>
						</label>
					</div>
					<Divider />
					{ !localStorage.map ? null :
					<div>
						<h3>続きから</h3>
						<div style={{ marginBottom: '5%', textAlign: 'center' }}>
							<Button text="サイトに保存された譜面を読み込む" icon={ IconNames.DOWNLOAD } onClick={() => { loadLocalMap() }} />
						</div>
					</div> }
					{ !localStorage.map ? null : <Divider /> }
					<div style={{ textAlign: 'center' }}>
						<h3 style={{ textAlign: 'left' }}>譜面の新規作成</h3>
						<div style={{ display: 'inline-block', width: '35%' }}>
							<p style={{ textAlign: 'left' }}>BPM</p>
							<NumericInput value={bpm} fill={true} onValueChange={(value) => {
								bpmChange(isNaN(value) ? 1 : value);
							}} />
						</div>
						<div style={{ display: 'inline-block', width: '35%', marginLeft: '5%' }}>
							<p style={{ textAlign: 'left' }}>拍子</p>
							<NumericInput value={beats} fill={true} onValueChange={(value) => {
								beatsChange(isNaN(value) ? 1 : value);
							}} />
						</div>
						<div style={{ marginTop: '5%' }}>
							<Button text="新規作成" icon={ IconNames.BUILD } onClick={() => {
								localStorage.removeItem('map');
								dispatch(editorModule.actions.initializeMap({ bpm, beats }));
								fadeOut();
							}} />
						</div>
					</div>
				</div>
			</Dialog>
			<input type="file" accept="audio/mp3" style={{ position: 'absolute', display: music.src !== '' ? 'none' : 'inline', width: '100%', height: '100%', left: 0, top: 0, opacity: 0, cursor: 'pointer', zIndex: 11, }} onChange={event => {
				const audioFile = (event.currentTarget.files as FileList)[0];
				const reader = new FileReader();
				reader.onload = (event) => {
					mapGeneratorOpen = true;
					music.src = event.target?.result as string;
					try {
						localStorage.removeItem('music');
						localStorage.music = music.src;
					} catch {
						caution.show({ message: 'mp3のサイズが大きいため動作が重い可能性があります', icon: IconNames.WARNING_SIGN, intent: 'warning', timeout: 4000 });
					}
				};
				reader.readAsDataURL(audioFile);
			}} />
			<div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', whiteSpace: 'nowrap', fontSize: 20, textAlign: 'center' }}>
				<Icon icon={IconNames.INBOX_SEARCH} iconSize={20} />音源mp3ファイルを選択<br/><br />
				上部メニューの「オンラインオーディオコンバータ」から<br/>
				64kbpsのmp3を用意することをオススメします
			</div>
		</div>
	);
};

export default Start;
