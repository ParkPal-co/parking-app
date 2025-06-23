import { useEffect } from "react";
import { Event, ParkingSpot } from "../../types";

// Constants
const MARKER_STYLES = {
  EVENT: {
    container:
      "bg-accent text-white rounded-xl px-5 py-2.5 font-semibold text-base relative flex items-center shadow-lg",
    pointer:
      "absolute left-1/2 bottom-[-12px] transform -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[12px] border-l-transparent border-r-transparent border-t-accent",
  },
  DRIVEWAY: {
    selected: {
      container: "w-[280px] p-5 pb-7 min-h-[120px] shadow-lg",
      image: "w-full h-[120px] object-cover rounded-lg mb-3",
      price: "font-bold text-xl mb-2",
      description:
        "text-base text-primary-600 mb-3 text-left w-full line-clamp-2",
      button:
        "w-full bg-accent text-white rounded-lg px-4 py-2.5 font-bold text-lg hover:bg-accent-light transition-normal focus-ring",
    },
    unselected: {
      container: "w-auto px-3 py-2.5 shadow-md text-base font-medium",
    },
    pointer:
      "absolute left-1/2 bottom-[-12px] transform -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[12px] border-l-transparent border-r-transparent border-t-white",
  },
} as const;

const MAX_DESCRIPTION_LENGTH = 100;
const DEFAULT_IMAGE = "https://placehold.co/280x140?text=No+Image";

interface MapMarkersProps {
  map: google.maps.Map | null;
  event: Event | null;
  spots: ParkingSpot[];
  selectedSpot: ParkingSpot | null;
  onSpotSelect: (spot: ParkingSpot | null) => void;
  onBookSpot: (spot: ParkingSpot) => void;
}

type MarkerContentCreator = () => HTMLElement;

const createPointer = (className: string): HTMLElement => {
  const pointer = document.createElement("div");
  pointer.className = className;
  return pointer;
};

const createEventMarkerContent: MarkerContentCreator = () => {
  const div = document.createElement("div");
  div.className = MARKER_STYLES.EVENT.container;
  div.setAttribute("role", "img");
  div.setAttribute("aria-label", "Event location marker");
  div.textContent = "Event";

  div.appendChild(createPointer(MARKER_STYLES.EVENT.pointer));
  return div;
};

const createImage = (url: string): HTMLImageElement => {
  const img = document.createElement("img");
  img.src = url;
  img.alt = "Driveway preview";
  img.className = MARKER_STYLES.DRIVEWAY.selected.image;
  img.onerror = () => {
    img.src = DEFAULT_IMAGE;
    img.alt = "No image available";
  };
  return img;
};

const createPrice = (price: number): HTMLElement => {
  const priceDiv = document.createElement("div");
  priceDiv.className = MARKER_STYLES.DRIVEWAY.selected.price;
  priceDiv.textContent = `$${price}`;
  return priceDiv;
};

const createDescription = (description: string): HTMLElement => {
  const descDiv = document.createElement("div");
  descDiv.className = MARKER_STYLES.DRIVEWAY.selected.description;
  descDiv.textContent =
    description.length > MAX_DESCRIPTION_LENGTH
      ? `${description.substring(0, MAX_DESCRIPTION_LENGTH)}...`
      : description;
  return descDiv;
};

const createBookButton = (
  spot: ParkingSpot,
  onBook: (spot: ParkingSpot) => void
): HTMLButtonElement => {
  const button = document.createElement("button");
  button.className = MARKER_STYLES.DRIVEWAY.selected.button;
  button.textContent = "Book Now";
  button.setAttribute("aria-label", `Book parking spot for $${spot.price}`);
  button.addEventListener("click", (e) => {
    e.stopPropagation();
    onBook(spot);
  });
  return button;
};

const createDrivewayMarkerContent = (
  spot: ParkingSpot,
  isSelected: boolean,
  onBook: (spot: ParkingSpot) => void
): HTMLElement => {
  const div = document.createElement("div");
  div.className = `bg-white text-primary-900 rounded-xl relative flex flex-col items-center transition-normal ${
    isSelected
      ? MARKER_STYLES.DRIVEWAY.selected.container
      : MARKER_STYLES.DRIVEWAY.unselected.container
  }`;
  div.setAttribute("role", "button");
  div.setAttribute(
    "aria-label",
    `Parking spot at ${spot.address} for $${spot.price}`
  );
  div.setAttribute("tabindex", "0");

  if (isSelected) {
    const imgUrl = spot.images?.[0] || DEFAULT_IMAGE;
    const description = spot.description || "No description available";

    div.appendChild(createImage(imgUrl));
    div.appendChild(createPrice(spot.price));
    div.appendChild(createDescription(description));
    div.appendChild(createBookButton(spot, onBook));
  } else {
    const priceDiv = document.createElement("div");
    priceDiv.textContent = `$${spot.price}`;
    div.appendChild(priceDiv);
  }

  div.appendChild(createPointer(MARKER_STYLES.DRIVEWAY.pointer));
  return div;
};

export const MapMarkers: React.FC<MapMarkersProps> = ({
  map,
  event,
  spots,
  selectedSpot,
  onSpotSelect,
  onBookSpot,
}) => {
  useEffect(() => {
    if (!map || !event) {
      console.log("Map or event not available:", { map, event });
      return;
    }

    if (!window.google?.maps?.marker?.AdvancedMarkerElement) {
      console.error("AdvancedMarkerElement is not available");
      return;
    }

    const mapClickListener = map.addListener("click", () => {
      if (selectedSpot) {
        onSpotSelect(null);
      }
    });

    const markers: google.maps.marker.AdvancedMarkerElement[] = [];

    // Event marker
    const eventMarker = new window.google.maps.marker.AdvancedMarkerElement({
      map,
      position: event.location.coordinates || { lat: 37.7749, lng: -122.4194 },
      content: createEventMarkerContent(),
      title: event.title,
    });
    markers.push(eventMarker);

    // Driveway markers
    spots.forEach((spot) => {
      const isSelected = selectedSpot?.id === spot.id;
      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        map,
        position: spot.coordinates,
        content: createDrivewayMarkerContent(spot, isSelected, onBookSpot),
        title: spot.id,
        zIndex: isSelected ? 1000 : 1,
      });

      marker.addListener("gmp-click", (event: MouseEvent) => {
        event.stopImmediatePropagation();
        onSpotSelect(spot);
      });

      markers.push(marker);
    });

    return () => {
      markers.forEach((marker) => (marker.map = null));
      mapClickListener.remove();
    };
  }, [map, event, spots, selectedSpot, onSpotSelect, onBookSpot]);

  return null;
};
