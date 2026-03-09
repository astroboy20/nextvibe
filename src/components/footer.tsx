"use client";

import { Facebook, Twitter, Instagram } from "lucide-react";
import Link from "next/link";
import {motion} from "framer-motion"

const Footer = () => {
  const footerLinks = [
    {
      title: "Product",
      links: [
        { name: "Events", href: "/" },
        { name: "Tickets", href: "/" },
        { name: "How It Works", href: "/" },
        { name: "Pricing", href: "/pricing" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Contact", href: "/contact" },
        { name: "Careers", href: "/" },
        { name: "Blog", href: "/" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Help Center", href: "/" },
        { name: "Community", href: "/" },
        { name: "Partner Program", href: "/" },
        { name: "Become a Sponsor", href: "/" },
      ],
    },
  ];

  const socialLinks = [
    {
      icon: Facebook,
      href: "https://www.facebook.com/profile.php?id=61572512998064",
      name: "Facebook",
    },
    { icon: Twitter, href: "https://x.com/mynextvibe", name: "Twitter" },
    {
      icon: Instagram,
      href: "https://www.instagram.com/mynextvibe/",
      name: "Instagram",
    },
  ];

  return (
    <footer className="bg-[#5B1A57] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <h3 className="text-3xl font-bold mb-4">NextVibe</h3>
              <p className="text-white/80 mb-6 leading-relaxed">
                The world&apos;s first platform that transforms events into a shared,
                digital legacy. Capture every moment with the power of VibeTag.
              </p>
            </motion.div>
          </div>

          {footerLinks.map((column, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <h4 className="font-bold text-lg mb-4">{column.title}</h4>
              <ul className="space-y-3">
                {column.links.map((link, linkIndex) => (
                  <motion.li key={linkIndex} whileHover={{ x: 5 }}>
                    <Link
                      href={link.href}
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="border-t border-white/20 mb-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-white/70 text-sm"
          >
            © {new Date().getFullYear()} NextVibe. All rights reserved.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex gap-4"
          >
            {socialLinks.map((social, index) => {
              const Icon = social.icon;
              return (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label={social.name}
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              );
            })}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex gap-6 text-sm"
          >
            <Link
              href="/"
              className="text-white/70 hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/"
              className="text-white/70 hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
