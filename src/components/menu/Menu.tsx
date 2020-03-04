import * as React from 'react';
import { useSelector } from "react-redux";
import { AppState } from '../../store';
import { Button, Navbar, NavbarDivider, NavbarGroup, NavbarHeading, Tooltip, Alignment, Classes } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

const Menu = () => {
	const loaded = useSelector((state: AppState) => state.loaded);
	return (
		<Navbar style={{height: '50px'}}>
			<NavbarGroup align={Alignment.LEFT}>
				<NavbarHeading>Sparebeat Map Editor</NavbarHeading>
				<NavbarDivider />
				<Tooltip content="曲情報編集">
					<Button disabled={!loaded} className={Classes.MINIMAL} icon={IconNames.INFO_SIGN} large={true} />
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
					<Button disabled={!loaded} className={Classes.MINIMAL} icon={IconNames.SAVED} large={true} />
				</Tooltip>
				<Tooltip content="譜面出力">
					<Button disabled={!loaded} className={Classes.MINIMAL} icon={IconNames.EXPORT} large={true} />
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
