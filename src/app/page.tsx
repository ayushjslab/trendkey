"use client"
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Search, Zap, Crown, Flame } from 'lucide-react';

const Trenkey = () => {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTrending = async () => {
    if (!keyword) return;
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/domain?keyword=${keyword}`);
      const data = await response.json();
      // Expecting data.keywords to be a simple string array like ["Trend1", "Trend2"]
      setResults(data.keywords || []);
    } catch (error) {
      console.error("Failed to fetch trends", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden relative font-sans selection:bg-purple-500/30">
      

      <main className="relative z-10 flex flex-col items-center justify-start px-6 pt-20">
        
        {/* Floating Brand Badge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md flex items-center gap-2"
        >
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400">Next-Gen Discovery</span>
        </motion.div>

        {/* Hero Title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-8xl font-black tracking-[ -0.05em] mb-4 bg-linear-to-b from-white to-white/40 bg-clip-text text-transparent italic">
            Trenkey
          </h1>
          <p className="text-gray-500 text-lg font-medium max-w-md mx-auto leading-relaxed">
            Type one word. Get the <span className="text-white">vibe</span> of the world.
          </p>
        </motion.div>

        {/* The "Sexy" Search Bar */}
        <div className="relative w-full max-w-xl group mb-20">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileFocus={{ scale: 1.02 }}
            className="relative flex items-center bg-[#111] rounded-[2rem] border border-white/10 p-2 pl-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] group-focus-within:border-purple-500/50 transition-all duration-500"
          >
            <input 
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchTrending()}
              placeholder="Search a keyword..."
              className="w-full bg-transparent border-none focus:outline-none text-lg py-4 text-white placeholder-gray-700 font-medium"
            />
            <button 
              onClick={fetchTrending}
              disabled={isLoading}
              className="relative overflow-hidden bg-white text-black h-14 w-14 md:w-auto md:px-8 rounded-full font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all active:scale-90 disabled:opacity-50"
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    <Zap size={20} fill="black" />
                  </motion.div>
                ) : (
                  <motion.div key="text" className="flex items-center gap-2">
                    <span className="hidden md:inline">Generate</span>
                    <Sparkles size={18} fill="black" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </motion.div>
        </div>

        {/* Results: The "Cute & Sexy" Way */}
        <div className="w-full max-w-4xl flex flex-wrap justify-center gap-4 pb-32">
          <AnimatePresence>
            {results.map((item, index) => (
              <motion.div
                key={item + index}
                layout
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 260, 
                  damping: 20,
                  delay: index * 0.05 
                }}
                whileHover={{ 
                  scale: 1.05, 
                  rotate: index % 2 === 0 ? 2 : -2,
                  transition: { duration: 0.2 }
                }}
                className="relative"
              >
                {/* Randomly appearing icons for "Cute" factor */}
                {index % 3 === 0 && (
                   <div className="absolute -top-2 -right-2 bg-yellow-400 text-black p-1 rounded-full z-20 shadow-lg scale-75 rotate-12">
                     <Flame size={12} fill="currentColor" />
                   </div>
                )}

                <div className="px-8 py-5 rounded-[2rem] bg-gradient-to-b from-white/[0.08] to-transparent border border-white/10 backdrop-blur-md hover:border-purple-500/40 transition-colors cursor-pointer group shadow-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold tracking-tight text-white/90 group-hover:text-white transition-colors">
                      {item}
                    </span>
                    <TrendingUp className="text-white/20 group-hover:text-purple-400 transition-colors" size={16} />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* Decorative Floating Elements */}
      <AnimatePresence>
        {results.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
          >
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <motion.div 
                  key={i}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                  className="w-1.5 h-1.5 rounded-full bg-white/20"
                />
              ))}
            </div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-bold">
              Feed the machine
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Trenkey;