import Image from "next/image";
import Accordion from "@/app/ui/accordion";

type AnnouncementData = {
  title: string;
  description: string;
  imgSrc: string;
  endDate: {
    year: number;
    month: number;
    day: number;
  };
};

export default function Announcement() {
  // TODO: Fetch announcements from the DB so the codebase doesn't have to change every
  //  time there is a new announcement.
  const data: AnnouncementData = {
    title: "Arcadia Stream Weekend",
    description:
      "We are officially organizing our first ever Charity Stream Weekend! Taking place August 16th and 17th, we are going to be raising money for the wonderful charity of Gamer's Outreach. Keep your eyes peeled closer to the date for the exact times and the streaming schedule - we are going to be running some mini events and interacting a whole bunch with the community! If there's anything specific you'd like to see us do on the weekend, including rewards for fundraising goals - drop a suggestion in the ⁠💡-suggestions chat of our Discord. Hope to see you all there and hope everyone is hyped! ",
    imgSrc: "/images/charity_stream_2025.png",
    endDate: {
      year: 2025,
      month: 8,
      day: 18,
    },
  };

  const endDate = new Date(
    `${data.endDate.year}-${data.endDate.month}-${data.endDate.day}`,
  );
  if (new Date() > endDate) return <></>;

  return (
    // TODO: Only display the announcement if the event isn't expired
    <div className="w-full px-2">
      <Accordion title="Announcement" isExpandedDefault={true}>
        <div className="grid grid-rows-[auto_auto_auto] gap-x-4 rounded-sm bg-white p-1 drop-shadow-sm md:grid-cols-[1fr_4fr] md:grid-rows-[auto_1fr] md:p-2 md:drop-shadow-md">
          <Image
            src={data.imgSrc}
            alt={`${data.title} promo image`}
            width={1587}
            height={2245}
            className="mr-1 h-auto w-full self-center pb-4 md:row-span-2 md:mr-1.5 md:pb-0"
          />
          <h1 className="mb-4 text-4xl font-thin md:text-6xl">{data.title}</h1>
          <p className="text-base md:text-lg">{data.description}</p>
        </div>
      </Accordion>
    </div>
  );
}
