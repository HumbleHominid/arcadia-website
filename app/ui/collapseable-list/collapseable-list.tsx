'use client';

import CollapseableListItem, { CollapseableListItemData } from "@/app/ui/collapseable-list/collapseable-list-item";
import Accordian from "@/app/ui/accordian";

export default function CollapseableList({
	data = [],
	title = "",
	isExpandedDefault = false,
}:{
	data?: Array<CollapseableListItemData>;
	title: string;
	isExpandedDefault?: boolean;
}) {
	return (
		<Accordian
			title={title}
			isExpandedDefault={isExpandedDefault}
		>
		{data.map((item, index) => {
			return (
				<CollapseableListItem key={index} data={item} />
			)})}
		</Accordian>
	)
}