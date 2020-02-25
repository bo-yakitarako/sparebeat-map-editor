import * as React from 'react';
import { Button, Navbar, NavbarDivider, NavbarGroup, NavbarHeading, Alignment, Classes } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

const Menu = () => {
	return (
		<Navbar>
			<NavbarGroup align={Alignment.LEFT}>
				<NavbarHeading>Sparebeat Map Editor</NavbarHeading>
				<NavbarDivider />
				<Button className={Classes.MINIMAL} icon={IconNames.INFO_SIGN} text="曲情報編集" />
				<Button className={Classes.MINIMAL} icon={IconNames.MULTI_SELECT} text="難易度選択" />
				<Button className={Classes.MINIMAL} icon={IconNames.STYLE} text="背景色設定" />
				<NavbarDivider />
				<Button className={Classes.MINIMAL} icon={IconNames.DESKTOP} text="テストプレイ" />
				<Button className={Classes.MINIMAL} icon={IconNames.SAVED} text="一時保存" />
				<Button className={Classes.MINIMAL} icon={IconNames.EXPORT} text="譜面出力" />
				<NavbarDivider />
				<Button className={Classes.MINIMAL} icon={IconNames.COG} text="エディタ設定" />
				<Button className={Classes.MINIMAL} icon={IconNames.HELP} text="ヘルプ" />
			</NavbarGroup>
		</Navbar>
	)
}

export default Menu;
