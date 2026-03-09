"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";

const MemoryOfTheWeek = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative"
    >
      <div className="text-center mb-8">
        <h3 className="text-3xl sm:text-4xl font-bold mb-2">
          <span className="bg-linear-to-rrom-[#A1349A] to-[#5B1A57] bg-clip-text text-transparent">
            Memory of the Week
          </span>
        </h3>
        <p className="text-gray-600">Captured moments that made the magic</p>
      </div>

      <motion.div
        className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl group"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        {/* Image Placeholder */}
        <div className="relative h-96 bg-linear-to-br from-purple-200 via-pink-200 to-purple-300">
          {/* Placeholder content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Heart className="w-24 h-24 text-white opacity-50" />
            </motion.div>
          </div>

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

          {/* Caption */}
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <motion.p
              className="text-xl sm:text-2xl font-semibold mb-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              This moment was captured at Summer Music Festival 2025 using a
              VibeTag.
            </motion.p>
            <motion.p
              className="text-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <span className="font-bold text-pink-300">
                Yours could be next.
              </span>
            </motion.p>
          </div>

          {/* Floating Badge */}
          <motion.div
            className="absolute top-4 right-4 bg-white rounded-full px-4 py-2 shadow-lg"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-[#5B1A57] font-semibold flex items-center gap-2">
              <Heart className="w-4 h-4 fill-[#5B1A57]" />
              2.4K Likes
            </span>
          </motion.div>
        </div>

        {/* Hover Overlay */}
        <motion.div className="absolute inset-0 bg-linear-to-br from-[#A1349A]/0 to-[#5B1A57]/0 group-hover:from-[#A1349A]/20 group-hover:to-[#5B1A57]/20 transition-all duration-300 pointer-events-none" />
      </motion.div>

      {/* CTA Below */}
      <motion.div
        className="text-center mt-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
      >
        <motion.a
          href="/auth/register"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="inline-block bg-linear-to-r from-[#A1349A] to-[#5B1A57] text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          Create Your Memory
        </motion.a>
      </motion.div>
    </motion.div>
  );
};

export default MemoryOfTheWeek;
