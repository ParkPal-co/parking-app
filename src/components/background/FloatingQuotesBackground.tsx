/**
 * src/components/background/FloatingQuotesBackground.tsx
 * Component that displays animated quotes floating across the screen
 */

import React, { useEffect, useRef, useState } from "react";

interface Quote {
  text: string;
  x: number;
  y: number;
  speed: number;
  fontSize: number;
  fontFamily: string;
  direction: "left" | "right";
}

const quotes = [
  "Amazing event, but...",
  "Missed the whole first half",
  "I can't believe someone would take up two spots like that",
  "Came back to find out someone dinged my car",
  "Drove around aimlessly for 30 minutes",
  "Parking was a joke",
  "Imagine how nice it would be to live that close",
  "Where did we leave the car?",
  "Wish I had a driveway nearby",
  "Next time I'm taking an Uber",
  "The walk was longer than the event",
  "Found a spot, but at what cost?",
  "Parking should be included in the ticket",
  "My car is still in the lot somewhere",
  "The parking situation was a nightmare",
];

const fonts = [
  "font-serif",
  "font-sans",
  "font-mono",
  "font-serif italic",
  "font-sans italic",
  "font-mono italic",
];

const fontSizes = [
  "text-sm",
  "text-base",
  "text-lg",
  "text-xl",
  "text-2xl",
  "text-3xl",
];

// Define fixed y-positions as percentages of the container height
const yPositions = [10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 85, 75, 65, 55, 45];

export const FloatingQuotesBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [quotesState, setQuotesState] = useState<Quote[]>([]);
  const animationFrameRef = useRef<number>();

  // Initialize quotes with random positions and properties
  useEffect(() => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    const newQuotes: Quote[] = [];

    // Create quotes with fixed y-positions
    for (let i = 0; i < 12; i++) {
      const direction = Math.random() < 0.5 ? "left" : "right";
      // All quotes start within 100px of either side of the screen
      const startX = -100 + Math.random() * (containerWidth + 200);

      newQuotes.push({
        text: quotes[Math.floor(Math.random() * quotes.length)],
        x: startX,
        y: (containerHeight * yPositions[i]) / 100, // Convert percentage to actual pixels
        speed: 0.5 + Math.random() * 0.5, // Speed between 0.5 and 1
        fontSize: Math.floor(Math.random() * fontSizes.length),
        fontFamily: Math.floor(Math.random() * fonts.length),
        direction,
      });
    }

    setQuotesState(newQuotes);
  }, []);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;

      setQuotesState((prevQuotes) =>
        prevQuotes.map((quote, index) => {
          let newX =
            quote.x +
            (quote.direction === "right" ? quote.speed : -quote.speed);

          // Handle wrapping based on direction
          if (quote.direction === "right" && newX > containerWidth + 200) {
            newX = -200; // Start further off-screen left
          } else if (quote.direction === "left" && newX < -200) {
            newX = containerWidth + 200; // Start further off-screen right
          }

          return {
            ...quote,
            x: newX,
            // Keep the same y position based on the index
            y: (containerHeight * yPositions[index]) / 100,
          };
        })
      );

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, overflow: "visible", margin: "-200px" }}
    >
      {quotesState.map((quote, index) => (
        <div
          key={index}
          className={`absolute text-gray-400 ${fontSizes[quote.fontSize]} ${
            fonts[quote.fontFamily]
          } whitespace-nowrap`}
          style={{
            transform: `translate(${quote.x}px, ${quote.y}px)`,
            opacity: 0.4,
          }}
        >
          "{quote.text}"
        </div>
      ))}
    </div>
  );
};
