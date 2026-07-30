import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { memories } from '../data/memories';
import MemoryCard from './MemoryCard';
import MessageDrop from './MessageDrop';
import { useSound } from '../context/SoundContext';
import RainCanvas, { RainCanvasHandle } from './RainCanvas';
import type { Memory } from '../types';

const Timeline: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [scrolledFar, setScrolledFar] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [scrollPct, setScrollPct] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const rainCanvasRef = useRef<RainCanvasHandle>(null);
  const tagTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { playGlassChime } = useSound();

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    memories.forEach((m) => m.tags?.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet);
  }, []);

  const stats = useMemo(() => {
    const dates = memories.map((m) => m.date).filter(Boolean).sort();
    return {
      count: memories.length,
      firstDate: dates[0] || '',
      lastDate: dates[dates.length - 1] || '',
      tagsCount: allTags.length,
    };
  }, [allTags]);

  // Scroll tracking (for progress droplet + back-to-top visibility)
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const max = scrollHeight - clientHeight;
      setScrolledFar(scrollTop > 400);
      setScrollPct(max > 0 ? scrollTop / max : 0);
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  // Tag click → flash matching nodes briefly
  const handleTagClick = useCallback((tag: string) => {
    if (tagTimerRef.current) clearTimeout(tagTimerRef.current);
    setActiveTag(tag);
    playGlassChime();
    tagTimerRef.current = setTimeout(() => setActiveTag(null), 1600);
  }, [playGlassChime]);

  const handleNodeClick = useCallback((memory: Memory, e: React.MouseEvent) => {
    rainCanvasRef.current?.addRipple(e.clientX, e.clientY);
    setSelectedMemory(memory);
  }, []);

  const handleCloseCard = useCallback(() => {
    playGlassChime();
    setSelectedMemory(null);
  }, [playGlassChime]);

  const handleBackClick = () => { playGlassChime(); onBack(); };
  const scrollToTop = () => { scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); };
  const openRandomMemory = () => { setSelectedMemory(memories[Math.floor(Math.random() * memories.length)]); playGlassChime(); };

  // Check if a memory matches the active tag
  const memoryMatchesTag = (memory: Memory) => {
    return activeTag && memory.tags?.includes(activeTag);
  };

  return (
    <motion.div
      className="fixed inset-0 z-20 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <RainCanvas ref={rainCanvasRef} density={0.4} speed={0.3} />

      {/* Back button */}
      <motion.button onClick={handleBackClick}
        className="absolute top-6 left-6 z-30 glass rounded-full w-10 h-10 flex items-center justify-center text-ink-light/50 hover:text-ink-light transition-colors"
        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.button>

      {/* Title */}
      <motion.div className="absolute top-6 left-1/2 -translate-x-1/2 text-center z-20"
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      >
        <p className="text-subtle text-[10px] tracking-[0.2em] text-ink-light/50">MEMORIES IN THE RAIN</p>
      </motion.div>

      {/* Scroll progress droplet — right edge */}
      <div className="absolute right-3 top-0 bottom-0 w-4 z-30 pointer-events-none" style={{ paddingTop: '6rem', paddingBottom: '6rem' }}>
        <motion.div
          className="relative w-full h-full"
          style={{ position: 'relative' }}
        >
          <motion.div
            className="absolute left-0 w-full flex justify-center"
            style={{ top: `${scrollPct * 100}%` }}
            transition={{ duration: 0.05, ease: 'linear' }}
          >
            <svg width="6" height="9" viewBox="0 0 6 9" fill="none" className="opacity-30">
              <path d="M3 0C3 0 0 4.5 0 6.4C0 7.8 1.3 9 3 9C4.7 9 6 7.8 6 6.4C6 4.5 3 0 3 0Z"
                fill="rgba(126,200,227,0.6)" />
            </svg>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating action buttons */}
      <AnimatePresence>
        {scrolledFar && (
          <motion.div className="fixed bottom-24 right-6 z-40 flex flex-col gap-3"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
          >
            <motion.button onClick={scrollToTop}
              className="glass rounded-full w-9 h-9 flex items-center justify-center text-ink-light/40 hover:text-ink-light transition-colors shadow-soft"
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} title="回到第一滴雨"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 9L7 5L11 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.button>
            <motion.button onClick={openRandomMemory}
              className="glass rounded-full w-9 h-9 flex items-center justify-center text-ink-light/40 hover:text-sky-deep transition-colors shadow-soft"
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} title="随机雨滴"
            >
              <svg width="13" height="13" viewBox="0 0 20 24" fill="none">
                <path d="M10 0C10 0 0 12 0 17C0 20.866 4.477 24 10 24C15.523 24 20 20.866 20 17C20 12 10 0 10 0Z" fill="currentColor" opacity="0.5" />
              </svg>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline scroll container */}
      <div ref={scrollContainerRef} className="h-full overflow-y-auto overflow-x-hidden pt-24 pb-32 px-4">
        <div className="relative max-w-lg mx-auto">
          {/* Water line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] -translate-x-1/2">
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(160,210,230,0.3) 5%, rgba(126,200,227,0.5) 50%, rgba(160,210,230,0.3) 95%, transparent 100%)' }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(180,220,240,0.6) 10%, rgba(160,210,230,0.8) 50%, rgba(180,220,240,0.6) 90%, transparent 100%)', backgroundSize: '100% 60px', animation: 'flowLine 4s linear infinite' }} />
          </div>

          {/* Memory nodes */}
          {memories.map((memory, index) => {
            const isLeft = index % 2 === 0;
            const matched = memoryMatchesTag(memory);
            return (
              <motion.div
                key={memory.id}
                className={`relative flex items-center mb-20 md:mb-24 flex-row ${!isLeft ? 'md:flex-row-reverse' : ''}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                {/* Center node */}
                <div className="absolute left-1/2 -translate-x-1/2 z-10">
                  <motion.button
                    onClick={(e) => handleNodeClick(memory, e)}
                    onMouseEnter={() => setHoveredId(memory.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className="relative block"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    animate={matched ? { scale: [1, 1.3, 1, 1.2, 1] } : {}}
                    transition={matched ? { duration: 0.8, ease: 'easeInOut' } : {}}
                  >
                    {/* Glow ring — brighter when matched */}
                    <motion.div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full"
                      style={{ background: matched ? 'rgba(126,200,227,0.35)' : 'rgba(160,210,235,0.15)' }}
                      animate={
                        matched
                          ? { scale: [1, 1.8, 1], opacity: [0.4, 0.8, 0.4] }
                          : hoveredId === memory.id ? { scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] } : {}
                      }
                      transition={{ duration: matched ? 0.8 : 2, repeat: matched ? 1 : Infinity, ease: 'easeInOut' }}
                    />
                    <div className="relative w-5 h-6">
                      <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
                        <motion.path
                          d="M10 0C10 0 0 12 0 17C0 20.866 4.477 24 10 24C15.523 24 20 20.866 20 17C20 12 10 0 10 0Z"
                          fill={matched ? 'rgba(91,155,213,0.8)' : hoveredId === memory.id ? 'rgba(126,200,227,0.7)' : 'rgba(160,210,235,0.5)'}
                          stroke="rgba(180,220,240,0.6)" strokeWidth="0.5"
                          animate={matched ? { fill: ['rgba(91,155,213,0.8)', 'rgba(126,200,227,0.9)', 'rgba(91,155,213,0.8)'] }
                            : hoveredId === memory.id ? { fill: ['rgba(126,200,227,0.7)', 'rgba(91,155,213,0.6)', 'rgba(126,200,227,0.7)'] } : {}}
                          transition={{ duration: matched ? 0.4 : 2, repeat: matched ? 2 : Infinity, ease: 'easeInOut' }}
                        />
                      </svg>
                      {(hoveredId === memory.id || matched) && (
                        <motion.div
                          className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-white/80 rounded-full"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
                          transition={{ duration: matched ? 0.6 : 1.5, repeat: matched ? 2 : Infinity }}
                        />
                      )}
                    </div>
                  </motion.button>
                </div>

                {/* Preview snippet */}
                <motion.div
                  className={`w-[42%] ${isLeft ? 'pr-6 md:pr-10 text-right' : 'pr-6 md:pl-10 text-right md:text-left'}`}
                  whileHover={{ x: isLeft ? -3 : 3 }}
                  animate={matched ? { x: [0, isLeft ? -4 : 4, 0] } : {}}
                >
                  <p className="text-subtle text-[9px] tracking-[0.2em] text-ink-light/40 mb-1">{memory.date}</p>
                  <p className={`text-title text-sm leading-snug transition-colors duration-500 ${matched ? 'text-sky-deep' : 'text-ink/70'}`}>
                    {memory.title}
                  </p>
                  {memory.image && hoveredId === memory.id && (
                    <motion.div className="mt-2 ml-auto" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <div className="w-16 h-10 rounded overflow-hidden shadow-soft">
                        <img src={memory.image} alt="" className="w-full h-full object-cover opacity-60" />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            );
          })}

          {/* Tag cloud */}
          <motion.div className="relative flex flex-wrap justify-center gap-2 px-4 mb-10"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          >
            {allTags.map((tag) => (
              <motion.button key={tag} onClick={() => handleTagClick(tag)}
                className={`rounded-full px-3 py-1.5 text-subtle text-[10px] tracking-[0.08em] transition-all duration-300 cursor-pointer ${
                  activeTag === tag
                    ? 'bg-sky-deep/15 text-sky-deep/80 border border-sky-deep/25'
                    : 'glass-blue text-ink-light/50 hover:text-ink-light/70 hover:bg-white/20'
                }`}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
              >
                {tag}
              </motion.button>
            ))}
          </motion.div>

          {/* Statistics footer */}
          <motion.div className="relative flex flex-col items-center pb-8"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          >
            <div className="glass rounded-2xl px-8 py-6 text-center shadow-soft">
              <div className="flex items-center justify-center gap-6 md:gap-10 mb-3">
                <div className="text-center">
                  <p className="text-title text-lg md:text-xl text-ink/70">{stats.count}</p>
                  <p className="text-subtle text-[9px] tracking-[0.15em] text-ink-light/40 mt-0.5">个瞬间</p>
                </div>
                <div className="w-[1px] h-8 bg-sky-rain/20" />
                <div className="text-center">
                  <p className="text-title text-lg md:text-xl text-ink/70">{stats.tagsCount}</p>
                  <p className="text-subtle text-[9px] tracking-[0.15em] text-ink-light/40 mt-0.5">个标签</p>
                </div>
                <div className="w-[1px] h-8 bg-sky-rain/20" />
                <div className="text-center">
                  <p className="text-subtle text-[10px] text-ink/60 leading-tight">{stats.firstDate}</p>
                  <p className="text-subtle text-[8px] text-ink-light/30 my-0.5">至</p>
                  <p className="text-subtle text-[10px] text-ink/60 leading-tight">{stats.lastDate}</p>
                </div>
              </div>
              <p className="text-subtle text-[10px] tracking-[0.2em] text-ink-light/40">· 雨还在下 ·</p>
            </div>
          </motion.div>

          {/* Message drop — leave a note */}
          <MessageDrop />
        </div>
      </div>

      {selectedMemory && (
        <MemoryCard memory={selectedMemory} isOpen={!!selectedMemory} onClose={handleCloseCard} />
      )}
    </motion.div>
  );
};

export default Timeline;
