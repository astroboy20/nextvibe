
import {
    MessageCircle,
    Mail,
    MessageSquare,
    HelpCircle,
  } from "lucide-react";
import Link from "next/link";
import FAQs from "./component/faq";
  
  const items = [
    {
      title: "Live Chat",
      desc: "Start a conversation with our customer care representative via live chat",
      icon: <MessageCircle size={22} />,
    },
    {
      title: "Chat via Email",
      desc: "Send us a message via email and we'll respond to you within 24 hours",
      icon: <Mail size={22} />,
    },
    {
      title: "Chat via Social Media",
      desc: "Start a conversation with us on any of our social media handles",
      icon: <MessageSquare size={22} />,
    },
    {
      title: "FAQs",
      desc: "Check our FAQs for similar issues and see how you can resolve them",
      icon: <HelpCircle size={22} />,
    },
  ];
  
  export default function ReachOut() {
    return (
      <div className="pt-40">
        <div className="max-w-5xl mx-auto px-4 mb-24">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-[35px] font-semibold text-[#5B1A57] leading-tight">
              Reach out to Our Team
            </h2>
            <p className="text-base md:text-[22px] font-medium text-[#45413C] mt-2">
              Let us know how we can help
            </p>
          </div>
  
          {/* Contact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
            {items.map((item, index) => (
              <div
                key={index}
                className="group relative rounded-2xl border border-[#5B1A57]/25 bg-transparent p-5 hover:border-[#5B1A57] hover:shadow-lg hover:shadow-[#5B1A57]/10 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Top accent bar */}
                <div className="absolute top-0 left-6 right-6 h-0.5 rounded-b-full bg-linear-to-r from-[#5B1A57] to-[#C00096] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
  
                {/* Icon */}
                <div className="w-11 h-11 rounded-xl border border-[#5B1A57] text-[#5B1A57] flex items-center justify-center mb-5 group-hover:bg-[#5B1A57] group-hover:text-white transition-all duration-300">
                  {item.icon}
                </div>
  
                <p className="font-semibold text-base mb-3 text-gray-900">
                  {item.title}
                </p>
                <p className="text-sm text-gray-500 leading-relaxed mb-5">
                  {item.desc}
                </p>
                <Link
                  href="mailto:hi@nextvibe.com"
                  className="text-sm font-medium text-[#5B1A57] hover:text-[#C00096] underline underline-offset-2 transition-colors"
                >
                  hi@nextvibe.com
                </Link>
              </div>
            ))}
          </div>
  
          {/* FAQ Section Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-[#FFEBEB] text-[#5B1A57] text-xs font-semibold px-3 py-1 rounded-full mb-4">
              FAQ
            </div>
            <h2 className="text-2xl md:text-[35px] font-semibold text-[#5B1A57] leading-tight">
              Your burning questions, answered
            </h2>
            <p className="mt-3 text-gray-500 text-base max-w-xl mx-auto">
              If you have any question that isn&apos;t answered below, please get in
              touch with us and let us know.
            </p>
          </div>
  
          <FAQs />
        </div>
      </div>
    );
  }