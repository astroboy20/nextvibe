"use client";

import { motion } from "framer-motion";
import { Users, Building2 } from "lucide-react";
import Link from "next/link";

const JoinMovement = () => {
  return (
    <div className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl font-bold md:text-4xl lg:text-5xl mb-6">
            Ready to <br className="hidden sm:block" />
            <span className="text-gradient">Make Moments Last?</span>
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Whether you&apos;re planning a massive festival or an intimate gathering,
            it&apos;s time to build a legacy.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Attendees/Creators */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-linear-to-br from-purple-50 to-pink-50 rounded-3xl p-8"
          >
            <Users className="w-16 h-16 text-[#A1349A] mb-6" />
            <h3 className="text-2xl font-bold mb-4">
              For Attendees & Creators
            </h3>
            <p className="text-gray-700 mb-6">
              Capture memories, earn from your content, and never lose track of
              your event experiences.
            </p>
            <Link
              href="/auth/register"
              className="inline-block bg-linear-to-r from-[#A1349A] to-[#5B1A57] text-white px-8 py-3 rounded-full font-semibold"
            >
              Claim Your VibeTag
            </Link>
          </motion.div>

          {/* Brands */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-linear-to-br from-purple-50 to-pink-50 rounded-3xl p-8"
          >
            <Building2 className="w-16 h-16 text-[#5B1A57] mb-6" />
            <h3 className="text-2xl font-bold mb-4">
              For Brands (Sponsorship)
            </h3>
            <p className="text-gray-700 mb-6">
              Sponsor authentic moments and get meaningful engagement with your
              target audience.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-linear-to-r from-[#A1349A] to-[#5B1A57] text-white px-8 py-3 rounded-full font-semibold"
            >
              Partner With Us
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default JoinMovement;
