"use client";
import { ArrowRight, Sparkles, Calendar, Camera, QrCode } from "lucide-react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import AnimatedPhoneContent from "../components/animated-phone";
import DynamicHeadline from "../components/dynamic-header";

const HeroSection = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  return (
    <section className="relative min-h-screen flex  overflow-hidden bg-background">
      <div className="absolute inset-0 bg-linear-to-br from-vibe-plum-light via-background to-vibe-cyan/5" />

      <div className="absolute left-10 top-20 h-32 w-32 rounded-full bg-vibe-pink/10 blur-3xl animate-float" />
      <div
        className="absolute right-20 top-40 h-40 w-40 rounded-full bg-vibe-cyan/10 blur-3xl animate-float"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute bottom-40 left-1/4 h-48 w-48 rounded-full bg-primary/10 blur-3xl animate-float"
        style={{ animationDelay: "2s" }}
      />

      <div className="relative max-w-7xl mx-auto  sm:px-6 lg:px-8 pt-32 pb-16  z-10 flex  min-h-screen flex-col items-center justify-center px-4 py-20 ">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="mb-6 animate-fade-in">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                The future of event memories
              </span>
            </div>

            <h1 className="animate-fade-up font-display text-4xl font-bold leading-tight md:text-6xl lg:text-7xl">
              <DynamicHeadline />
            </h1>

            <p
              className="mt-6 max-w-xl animate-fade-up  text-lg text-muted-foreground md:text-xl"
              style={{ animationDelay: "100ms" }}
            >
              Discover events, play games, capture memories, and connect with
              your tribe. The YouTube + Google for events.
            </p>

            <div
              className="mt-10 flex flex-col gap-4 sm:flex-row animate-fade-up"
              style={{ animationDelay: "200ms" }}
            >
              <Link
                href="/auth/register"
                data-tour="hero-cta"
                className="w-full sm:w-auto bg-linear-to-br from-[hsl(316,62%,20%)] to-[hsl(280,60%,35%)] text-white shadow-elevated hover:shadow-card-hover hover:opacity-95 flex gap-2 items-center justify-center h-16 px-6 text-lg rounded-md"
              >
                <Calendar className="h-5 w-5" />
                Get Started
              </Link>

              <Link
                href="/explore"
                data-tour="explore-btn"
                className="w-full sm:w-auto border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-white flex gap-2 items-center justify-center h-16 px-6 text-lg rounded-md"
              >
                Explore Events
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            <div
              className="mt-16 flex flex-wrap gap-8 animate-fade-up"
              style={{ animationDelay: "300ms" }}
            >
              {[
                { label: "Events Created", value: "10K+" },
                { label: "Memories Captured", value: "500K+" },
                { label: "Happy Users", value: "50K+" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-display text-3xl font-bold text-primary">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            style={{ y }}
          >
            <div className="relative">
              <div className="relative mx-auto w-70 sm:w-[320px] h-142.5 sm:h-162.5 bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-gray-900 rounded-b-3xl z-10" />

                <div className="relative w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                  <AnimatedPhoneContent />
                </div>
              </div>

              <motion.div
                className="absolute -left-8 top-1/4 bg-white p-4 rounded-2xl shadow-xl hidden lg:block"
                animate={{
                  y: [0, -10, 0],
                  rotate: [-5, 5, -5],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Camera className="w-8 h-8 text-[#A1349A]" />
              </motion.div>

              <motion.div
                className="absolute -right-8 top-1/3 bg-white p-4 rounded-2xl shadow-xl hidden lg:block"
                animate={{
                  y: [0, 10, 0],
                  rotate: [5, -5, 5],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <QrCode className="w-8 h-8 text-[#5B1A57]" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
