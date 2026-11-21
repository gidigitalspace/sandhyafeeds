import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import WhatsAppModal from './WhatsAppModal';

export default function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <footer className="mt-auto border-t border-cyan-200/80 dark:border-cyan-950 bg-white/95 dark:bg-[#07131b]/95 py-4 px-4 text-xs transition-colors backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-600 dark:text-slate-400">
          
          {/* SANDHYA MARINES LTD • © All Rights Reserved */}
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="font-extrabold text-slate-800 dark:text-slate-200">
              SANDHYA MARINES LTD
            </span>
            <span className="text-slate-400 dark:text-slate-600">•</span>
            <span className="font-semibold text-slate-500 dark:text-slate-400">
              © All Rights Reserved
            </span>
          </div>

          {/* Powered by © GI Creative Space */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Powered by</span>
            <button
              onClick={() => setIsModalOpen(true)}
              className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-slate-800 dark:text-slate-100 bg-cyan-50/80 hover:bg-cyan-100/90 dark:bg-[#0e2230] dark:hover:bg-[#142e3f] border border-cyan-300/80 dark:border-cyan-800 hover:border-cyan-500 transition-all shadow-xs active:scale-95 cursor-pointer"
              title="Click to contact for digital needs"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 group-hover:rotate-12 transition-transform" />
              <span className="group-hover:text-[#0096c7] dark:group-hover:text-cyan-400 transition-colors">
                © GI Creative Space
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </button>
          </div>

        </div>
      </footer>

      {/* WhatsApp Modal */}
      <WhatsAppModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}