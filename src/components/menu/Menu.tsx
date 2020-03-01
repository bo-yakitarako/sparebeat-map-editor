import * as React from 'react';
import { useSelector } from "react-redux";
import { AppState } from '../../store';
import { Button, Navbar, NavbarDivider, NavbarGroup, NavbarHeading, Alignment, Classes } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

const Menu = () => {
	const loaded = useSelector((state: AppState) => state.loaded);
	return (
		<Navbar style={{height: '50px'}}>
			<NavbarGroup align={Alignment.LEFT}>
				<NavbarHeading>Sparebeat Map Editor</NavbarHeading>
				<NavbarDivider />
				<Button disabled={!loaded} className={Classes.MINIMAL} icon={IconNames.INFO_SIGN} text="曲情報編集" />
				<Button disabled={!loaded} className={Classes.MINIMAL} icon={IconNames.MULTI_SELECT} text="難易度選択" />
				<Button disabled={!loaded}className={Classes.MINIMAL} icon={IconNames.STYLE} text="背景色設定" />
				<NavbarDivider />
				<Button disabled={!loaded} className={Classes.MINIMAL} icon={IconNames.DESKTOP} text="テストプレイ" />
				<Button disabled={!loaded} className={Classes.MINIMAL} icon={IconNames.SAVED} text="一時保存" />
				<Button disabled={!loaded} className={Classes.MINIMAL} icon={IconNames.EXPORT} text="譜面出力" />
				<NavbarDivider />
				<Button className={Classes.MINIMAL} icon={IconNames.COG} text="エディタ設定" />
				<Button className={Classes.MINIMAL} icon={IconNames.HELP} text="ヘルプ" />
			</NavbarGroup>
		</Navbar>
	)
}

export default Menu;
