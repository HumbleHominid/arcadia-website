"use client";

import CollapsableListItem, {
  CollapsableListItemData,
} from "@/app/ui/collapsable-list/collapsable-list-item";
import Accordion from "@/app/ui/accordion";

export default function CollapsableList({
  data = [],
  title = "",
  isExpandedDefault = false,
}: {
  data?: Array<CollapsableListItemData>;
  title: string;
  isExpandedDefault?: boolean;
}) {
  return (
    <Accordion title={title} isExpandedDefault={isExpandedDefault}>
      {data.map((item, index) => {
        return <CollapsableListItem key={index} data={item} />;
      })}
    </Accordion>
  );
}
