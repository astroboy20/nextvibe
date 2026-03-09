/* eslint-disable @next/next/no-img-element */
"use client";
import { Camera, QrCode } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const AnimatedPhoneContent = () => {
  const [step, setStep] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    // Dynamic timing: Steps 0-3 get 3 seconds, Step 4 (carousel) gets 6 seconds
    const duration = step === 4 ? 6000 : 3000;
    const timer = setTimeout(() => {
      setStep((prev) => (prev + 1) % 5);
    }, duration);
    return () => clearTimeout(timer);
  }, [step]);

  // Carousel timer for individual images
  useEffect(() => {
    if (step === 4) {
      const carouselTimer = setInterval(() => {
        setCarouselIndex((prev) => (prev + 1) % 4);
      }, 1500);
      return () => clearInterval(carouselTimer);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCarouselIndex(0);
    }
  }, [step]);

  return (
    <div className="relative w-full h-full">
      <motion.div
        className="absolute inset-0 bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: step === 0 ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Camera className="w-24 h-24 text-white" />
        </motion.div>
        <div className="absolute bottom-8 left-0 right-0 text-center text-white font-semibold px-4">
          Capturing the moment...
        </div>
      </motion.div>

      <motion.div
        className="absolute inset-0 bg-white flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: step === 1 ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: step === 1 ? 1 : 0, rotate: 0 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="w-40 h-40 bg-linear-to-br from-[#A1349A] to-[#5B1A57] rounded-3xl flex items-center justify-center">
            <QrCode className="w-28 h-28 text-white" />
          </div>
          <motion.div
            className="absolute -inset-4 border-4 border-[#A1349A] rounded-3xl"
            animate={{ scale: [1, 1.1, 1], opacity: [1, 0, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
        <div className="absolute bottom-8 left-0 right-0 text-center text-[#5B1A57] font-semibold px-4">
          Your VibeTag is ready!
        </div>
      </motion.div>

      <motion.div
        className="absolute inset-0 bg-linear-to-br from-gray-900 to-gray-700 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: step === 2 ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-48 h-48 border-4 border-[#A1349A] rounded-2xl relative">
            <motion.div
              className="absolute inset-0 bg-[#A1349A] opacity-30"
              animate={{ y: ["-100%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </motion.div>
        <div className="absolute bottom-8 left-0 right-0 text-center text-white font-semibold px-4">
          Scanning VibeTag...
        </div>
      </motion.div>

      <motion.div
        className="absolute inset-0 bg-white p-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: step === 3 ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid grid-cols-2 gap-0 h-full w-full">
          {[
            "/images/gallery1.png",
            "/images/gallery2.jpg",
            "/images/gallery3.png",
            "/images/gallery4.png",
          ].map((imageUrl, i) => (
            <motion.div
              key={i}
              className="overflow-hidden bg-gray-100 w-full h-full"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: step === 3 ? 1 : 0,
                opacity: step === 3 ? 1 : 0,
              }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <img
                src={imageUrl}
                alt={`Memory ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </motion.div>
          ))}
        </div>
        <div className="absolute bottom-8 left-0 right-0 text-center text-[#5B1A57] font-semibold px-4 bg-white/80 backdrop-blur-sm py-2">
          Your memories, beautifully organized
        </div>
      </motion.div>

      <motion.div
        className="absolute inset-0 bg-linear-to-br from-gray-900 to-gray-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: step === 4 ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence mode="wait">
          {step === 4 && (
            <motion.div
              key={carouselIndex}
              className="absolute inset-0 flex items-center justify-center p-4"
              initial={{ scale: 0.8, rotateY: -90, opacity: 0 }}
              animate={{ scale: 1, rotateY: 0, opacity: 1 }}
              exit={{ scale: 0.8, rotateY: 90, opacity: 0 }}
              transition={{
                duration: 0.6,
                ease: [0.34, 1.56, 0.64, 1],
              }}
            >
              <div className="relative w-full h-full max-w-sm max-h-[85%] rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={
                    [
                      "/images/gallery1.png",
                      "/images/gallery2.jpg",
                      "/images/gallery3.png",
                      "/images/gallery4.png",
                    ][carouselIndex]
                  }
                  alt={`Featured memory ${carouselIndex + 1}`}
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />

                <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold text-[#5B1A57]">
                  {carouselIndex + 1} / 4
                </div>

                <motion.div
                  className="absolute inset-0 border-4 border-[#A1349A] rounded-3xl"
                  animate={{
                    opacity: [0.5, 1, 0.5],
                    scale: [1, 1.02, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="absolute bottom-8 left-0 right-0 text-center text-white font-semibold px-4">
          Every moment, captured perfectly
        </div>
      </motion.div>
    </div>
  );
};

export default AnimatedPhoneContent;
