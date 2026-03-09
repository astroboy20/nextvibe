/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, Play, ChevronLeft, ChevronRight } from "lucide-react";
import MemoryOfTheWeek from "./memory";

const SocialProofSection = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const partners = [
    { name: "Ashluxe", src: "/partners/ashluxe.png" },
    { name: "ISWIS", src: "/partners/partner1.jpeg" },
    { name: "TribaPay", src: "/partners/tribapay.png" },
    { name: "Experience", src: "/partners/partner2.jpeg" },
    // { name: "Partner 5", src: "/partners/partner5.png" },
    // { name: "Partner 6", src: "/partners/partner6.png" },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Festival Attendee, Gen Z",
      quote:
        "I found, like, 20 amazing videos of me and my friends I never knew existed! The VibeTag was everything.",
      highlight: "NextVibe captured what hashtags never could.",
      type: "attendee",
      rating: 5,
    },
    {
      name: "Michael Roberts",
      role: "Corporate Conference Planner",
      quote:
        "NextVibe provided more authentic content and engagement data in one weekend than we'd gathered in the past five years. It's a game-changer.",
      highlight: "5 years of data in one weekend.",
      type: "organizer",
      rating: 5,
    },
    {
      name: "Aisha Mohammed",
      role: "Concert Organizer",
      quote:
        "The pre-event hype from NextvibePilot drove 40% more ticket sales. Our attendees were engaged before they even walked through the door.",
      highlight: "40% increase in ticket sales.",
      type: "organizer",
      rating: 5,
    },
    {
      name: "David Kim",
      role: "Brand Marketing Director",
      quote:
        "We sponsored one event with NextVibe and got more authentic brand impressions than six months of traditional event sponsorships. The ROI is incredible.",
      highlight: "6 months of ROI in one event.",
      type: "brand",
      rating: 5,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  return (
    <div className="relative py-10 bg-white overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-pink-200 rounded-full blur-3xl opacity-20"
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-20"
          animate={{ scale: [1, 1.3, 1], x: [0, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl font-bold md:text-4xl lg:text-5xl">
            Trusted by{" "}
            <span className="bg-linear-to-r from-[#A1349A] to-[#5B1A57] bg-clip-text text-transparent">
              Visionaries.
            </span>
          </h2>
        </motion.div>

        {/* Partner Logos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 items-center justify-center">
            {partners.map((partner, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.1 }}
                className="flex items-center justify-center"
              >
                <div className="w-full h-20 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center p-4">
                  <img
                    src={partner.src}
                    alt={partner.name}
                    className="max-h-12 object-contain"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials Carousel */}
        <div className="max-w-5xl mx-auto mb-20">
          <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Video Placeholder Background */}
            <div className="absolute inset-0 bg-linear-to-br from-purple-100 to-pink-100 opacity-50" />

            <div className="relative p-8 sm:p-12 md:p-16">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  {/* Quote Icon */}
                  <motion.div
                    className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-[#A1349A] to-[#5B1A57] rounded-full mb-6"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Quote className="w-8 h-8 text-white" />
                  </motion.div>

                  {/* Rating */}
                  <div className="flex justify-center gap-1 mb-4">
                    {[...Array(testimonials[activeTestimonial].rating)].map(
                      (_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 fill-yellow-400 text-yellow-400"
                        />
                      )
                    )}
                  </div>

                  {/* Highlight Quote */}
                  <motion.p
                    className="text-2xl sm:text-3xl font-bold text-[#5B1A57] mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    &quot;{testimonials[activeTestimonial].highlight}&quot;
                  </motion.p>

                  {/* Full Quote */}
                  <motion.p
                    className="text-lg sm:text-xl text-gray-700 mb-8 leading-relaxed max-w-3xl mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {testimonials[activeTestimonial].quote}
                  </motion.p>

                  {/* Author */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <p className="font-bold text-gray-900 text-lg">
                      {testimonials[activeTestimonial].name}
                    </p>
                    <p className="text-gray-600">
                      {testimonials[activeTestimonial].role}
                    </p>
                  </motion.div>

                  {/* Play Button Overlay */}
                  <motion.button
                    className="mt-6 inline-flex items-center gap-2 text-[#A1349A] font-semibold hover:text-[#5B1A57] transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-12 h-12 bg-linear-to-br from-[#A1349A] to-[#5B1A57] rounded-full flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 text-white ml-1" />
                    </div>
                    <span>Watch Video</span>
                  </motion.button>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Arrows */}
              <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex justify-between pointer-events-none">
                <motion.button
                  onClick={prevTestimonial}
                  whileHover={{ scale: 1.1, x: -5 }}
                  whileTap={{ scale: 0.9 }}
                  className="pointer-events-auto w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-[#5B1A57]" />
                </motion.button>
                <motion.button
                  onClick={nextTestimonial}
                  whileHover={{ scale: 1.1, x: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="pointer-events-auto w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-[#5B1A57]" />
                </motion.button>
              </div>

              {/* Dots Indicator */}
              <div className="flex justify-center gap-2 mt-8">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === activeTestimonial
                        ? "w-8 bg-[#5B1A57]"
                        : "w-2 bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Memory of the Week */}
        <MemoryOfTheWeek />
      </div>
    </div>
  );
};

export default SocialProofSection;
