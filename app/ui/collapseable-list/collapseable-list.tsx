"use client";

import CollapseableListItem, {
  CollapseableListItemData,
} from "@/app/ui/collapseable-list/collapseable-list-item";
import Accordion from "@/app/ui/accordion";

export default function CollapseableList({
  data = [],
  title = "",
  isExpandedDefault = false,
}: {
  data?: Array<CollapseableListItemData>;
  title: string;
  isExpandedDefault?: boolean;
}) {
  return (
    <Accordion title={title} isExpandedDefault={isExpandedDefault}>
      {data.map((item, index) => {
        return <CollapseableListItem key={index} data={item} />;
      })}
    </Accordion>
  );
}
