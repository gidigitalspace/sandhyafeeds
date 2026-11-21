import React from 'react';
import { X, MessageCircle } from 'lucide-react';
import { GI_CREATIVE_WHATSAPP } from '../constants/feedData';

export default function WhatsAppModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const handleWhatsAppClick = () => {
    const text = encodeURIComponent('Hello GI Creative Space! I would like to contact you regarding digital solutions & web applications.');
    window.open(`https://wa.me/${GI_CREATIVE_WHATSAPP}?text=${text}`, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-sm bg-white dark:bg-[#0c1f2b] border border-cyan-200/90 dark:border-[#193a4f] rounded-2xl p-6 shadow-2xl text-slate-800 dark:text-slate-100 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#142e3f] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* GI Creative Space Tag */}
        <p className="text-xs font-black uppercase tracking-wider text-[#0096c7] dark:text-[#38bdf8] mb-1">
          GI Creative Space
        </p>

        {/* Clean Message */}
        <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
          For Your Digital Needs Contact Us
        </h3>

        {/* Chat Now Button (Direct WhatsApp Link - Number Hidden) */}
        <div className="pt-5">
          <button
            onClick={handleWhatsAppClick}
            className="w-full group flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-black text-sm shadow-md shadow-emerald-600/25 active:scale-[0.98] transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
            <span>Chat Now</span>
          </button>
        </div>

      </div>
    </div>
  );
}
