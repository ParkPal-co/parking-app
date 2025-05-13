import React from "react";
import Icon1 from "../../assets/images/Icon1.png";

export const NoEventsFound: React.FC = () => (
  <div className="flex flex-col items-center justify-center gap-2">
    <div className="p-2">
      <img
        src={Icon1}
        alt="No events"
        className="w-12 h-12"
        style={{ filter: "brightness(5)" }}
      />
    </div>
    <p className="text-primary-600 text-lg font-medium">
      No upcoming events found
    </p>
    <p className="text-primary-500 text-sm">
      Try adjusting your search or check back later!
    </p>
  </div>
);
