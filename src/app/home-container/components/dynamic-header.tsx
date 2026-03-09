import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const DynamicHeadline = () => {
  const [currentEvent, setCurrentEvent] = useState(0);
  const eventTypes = [
    "Birthday's",
    "Wedding's",
    "Concert's",
    "Festival's",
    "House Party's",
    "Conference's",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentEvent((prev) => (prev + 1) % eventTypes.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [eventTypes.length]);

  return (
    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
      <span className="inline-block">Your </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentEvent}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="inline-block ml-3 bg-linear-to-r from-[#A1349A] to-[#5B1A57] bg-clip-text text-transparent"
        >
          {eventTypes[currentEvent]}
        </motion.span>
      </AnimatePresence>{" "}
      <span className="inline-block">Digital Memory Bank.</span>
    </h1>
  );
};

export default DynamicHeadline;
