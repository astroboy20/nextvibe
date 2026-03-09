"use client";

import  { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Camera,
  Heart,
} from "lucide-react";

const StakeholdersSection = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const stakeholders = [
    {
      title: "For Organizers",
      icon: TrendingUp,
      description:
        "Sell out your event with NextvibePilot. Track real engagement, not just attendance with VibeTag Analytics. Create a content goldmine.",
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "For Attendees/Creators",
      icon: Camera,
      description:
        "Find all your photos and videos. Discover and engage with content hassle-free.",
      color: "from-[#A1349A] to-purple-600",
    },
    {
      title: "For Brands",
      icon: Heart,
      description:
        "Sponsor moments, not just banners. Get authentic engagement. Drive event content.",
      color: "from-[#5B1A57] to-pink-600",
    },
  ];

  return (
    <>
      <div className="relative py-10 bg-white  overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-10 w-64 h-64 bg-purple-300 rounded-full blur-3xl opacity-20"
            animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl font-bold md:text-4xl lg:text-5xl">
              Built For Everyone <br className="hidden sm:block" />
              <span className="text-gradient">with the Vibe.</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {stakeholders.map((stakeholder, index) => {
              const Icon = stakeholder.icon;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="group"
                >
                  <div className="relative h-full bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                    <motion.div
                      className={`absolute inset-0 bg-linear-to-br ${stakeholder.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                    />

                    <div className="relative">
                      <div className="relative mb-6 h-24 flex items-center justify-center">
                        <motion.div
                          className={`w-20 h-20 bg-linear-to-br ${stakeholder.color} rounded-2xl flex items-center justify-center`}
                          animate={
                            hoveredCard === index ? { scale: [1, 1.1, 1] } : {}
                          }
                          transition={{
                            duration: 0.6,
                            repeat: hoveredCard === index ? Infinity : 0,
                          }}
                        >
                          <Icon className="w-10 h-10 text-white" />
                        </motion.div>

                        {index === 0 && hoveredCard === 0 && (
                          <motion.div
                            className="absolute"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <svg className="w-full h-24" viewBox="0 0 100 50">
                              <motion.path
                                d="M 10 40 L 30 20 L 50 30 L 70 10 L 90 15"
                                stroke="#A1349A"
                                strokeWidth="3"
                                fill="none"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              />
                            </svg>
                          </motion.div>
                        )}

                        {index === 1 && hoveredCard === 1 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            {[...Array(4)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="absolute w-8 h-8 bg-[#A1349A] opacity-20 rounded"
                                initial={{ scale: 0, x: 0, y: 0 }}
                                animate={{
                                  scale: 1,
                                  x: (i % 2 === 0 ? 1 : -1) * 30,
                                  y: Math.floor(i / 2) * 30 - 15,
                                }}
                                transition={{ duration: 0.6, delay: i * 0.1 }}
                              />
                            ))}
                          </div>
                        )}

                        {index === 2 && hoveredCard === 2 && (
                          <motion.div
                            className="absolute w-24 h-24 border-4 border-[#5B1A57] rounded-full"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        )}
                      </div>

                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        {stakeholder.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed mb-6">
                        {stakeholder.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Memory Bank Timeline */}
      {/* <MemoryBankTimeline /> */}
    </>
  );
};

// const MemoryBankTimeline = () => {
//   const timelineSteps = [
//     {
//       phase: "The Spark",
//       subtitle: "Pre-Event",
//       icon: Sparkles,
//       description:
//         "Build anticipation with gamified challenges and drive ticket sales",
//       items: ["Challenges", "Tickets", "Hype Building"],
//       color: "from-purple-400 to-pink-400",
//     },
//     {
//       phase: "The Pulse",
//       subtitle: "Live Event",
//       icon: Radio,
//       description: "Real-time capture of every magical moment as they happen",
//       items: ["Live Capture", "Auto-Curation", "Real-time Feed"],
//       color: "from-[#A1349A] to-purple-500",
//     },
//     {
//       phase: "The Echo",
//       subtitle: "Post-Event",
//       icon: Archive,
//       description:
//         "Your memories live on, beautifully organized and ready to share",
//       items: ["Gallery", "Sharing", "Analytics"],
//       color: "from-[#5B1A57] to-pink-500",
//     },
//   ];

//   return (
//     <div className="relative py-24 bg-gradient-to-b from-white to-purple-50 overflow-hidden">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.8 }}
//           className="text-center"
//         >
//           <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
//             The Memory Bank{" "}
//             <span className="bg-gradient-to-r from-[#A1349A] to-[#5B1A57] bg-clip-text text-transparent">
//               Timeline
//             </span>
//           </h2>
//         </motion.div>
//       </div>

//       {/* Grid Layout instead of horizontal scroll */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="grid md:grid-cols-3 gap-8">
//           {timelineSteps.map((step, index) => {
//             const Icon = step.icon;
//             return (
//               <motion.div
//                 key={index}
//                 initial={{ opacity: 0, y: 50 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true, margin: "-50px" }}
//                 transition={{ duration: 0.6, delay: index * 0.2 }}
//                 className="w-full"
//               >
//                 <div className="relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 h-full">
//                   {/* Step Number */}
//                   <div
//                     className={`absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg`}
//                   >
//                     {index + 1}
//                   </div>

//                   {/* Icon */}
//                   <motion.div
//                     className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mb-6 mx-auto`}
//                     whileHover={{ rotate: 360, scale: 1.1 }}
//                     transition={{ duration: 0.6 }}
//                   >
//                     <Icon className="w-10 h-10 text-white" />
//                   </motion.div>

//                   {/* Content */}
//                   <div className="text-center">
//                     <h3 className="text-3xl font-bold text-gray-900 mb-2">
//                       {step.phase}
//                     </h3>
//                     <p className="text-lg text-[#A1349A] font-semibold mb-4">
//                       {step.subtitle}
//                     </p>
//                     <p className="text-gray-600 mb-6 leading-relaxed">
//                       {step.description}
//                     </p>

//                     {/* Items */}
//                     <div className="flex flex-wrap justify-center gap-2">
//                       {step.items.map((item, i) => (
//                         <motion.span
//                           key={i}
//                           className={`px-4 py-2 bg-gradient-to-r ${step.color} text-white rounded-full text-sm font-medium`}
//                           whileHover={{ scale: 1.1 }}
//                           initial={{ opacity: 0, y: 10 }}
//                           whileInView={{ opacity: 1, y: 0 }}
//                           viewport={{ once: true }}
//                           transition={{ delay: i * 0.1 }}
//                         >
//                           {item}
//                         </motion.span>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>
//             );
//           })}
//         </div>
//       </div>

//       {/* Tagline */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         whileInView={{ opacity: 1, y: 0 }}
//         viewport={{ once: true }}
//         transition={{ duration: 0.8 }}
//         className="text-center mt-16 px-4"
//       >
//         <p className="text-2xl sm:text-3xl font-bold text-gray-800 italic">
//           "The lights turn on. The crowd goes home.{" "}
//           <span className="bg-gradient-to-r from-[#A1349A] to-[#5B1A57] bg-clip-text text-transparent">
//             Your vibe lives on."
//           </span>
//         </p>
//       </motion.div>
//     </div>
//   );
// };

export default StakeholdersSection;
