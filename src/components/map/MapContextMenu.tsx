import * as React from 'react';
import { Menu, MenuItem, Divider } from "@blueprintjs/core";
import { ISelectRange, ICopyObject } from '../../modules/editorModule';
import { IconNames } from '@blueprintjs/icons';

interface IMapContextMenu {
	themeDark: boolean;
	rangeSelect: { copy: ICopyObject[], select: ISelectRange[] };
	cut: Function;
	copy: Function;
	paste: Function;
	reverse: Function;
	delete: Function;
}

const MapContextMenu: React.SFC<IMapContextMenu> = (props: IMapContextMenu) => {
	const { select, copy } = props.rangeSelect;
	return (
		<Menu style={{ backgroundColor: props.themeDark ? "#30404D" : "#F5F8FA", color: !props.themeDark ? '#182026' : '#F5F8FA' }} >
			<MenuItem icon={IconNames.CUT} disabled={select.length === 0} text="切り取り" onClick={() => { props.cut() }} />
			<MenuItem icon={IconNames.BRING_DATA} disabled={select.length === 0} text="コピー(ctrl+C)" onClick={() => { props.copy() }} />
			<Divider />
			<MenuItem icon={IconNames.SWAP_HORIZONTAL} disabled={select.length === 0} text="左右反転(ctrl+R)" onClick={() => { props.reverse() }} />
			<MenuItem icon={IconNames.COMPARISON} disabled={copy.length === 0} text="貼り付け" onClick={() => { props.paste() }} />
			<Divider />
			<MenuItem icon={IconNames.DELETE} disabled={select.length === 0} text="削除(ctrl+D)" onClick={() => { props.delete() }} />
		</Menu>
	);
};

export default MapContextMenu;
