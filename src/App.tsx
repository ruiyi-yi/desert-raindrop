import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SoundProvider } from './context/SoundContext';
import Opening from './components/Opening';
import Entry from './components/Entry';
import Timeline from './components/Timeline';
import Preface from './components/Preface';
import ReversePage from './components/ReversePage';
import SoundToggle from './components/SoundToggle';
import Preloader from './components/Preloader';
import type { PageState } from './types';

const App: React.FC = () => {
  const [page, setPage] = useState<PageState>('preloading');
  const [easterEggCount, setEasterEggCount] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const easterEggTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Update browser tab title per page
  useEffect(() => {
    const titles: Record<PageState, string> = {
      preloading: '💧 沙漠一粒雨',
      opening: '💧 沙漠一粒雨',
      entry: '💧 沙漠一粒雨',
      preface: '📖 翻开记忆',
      timeline: '🌧️ 雨中漫步',
      reverse: '⏳ 如果时间倒流',
    };
    document.title = titles[page] || '沙漠一粒雨';
  }, [page]);

  const handlePreloadingReady = useCallback(() => {
    setPage('opening');
  }, []);

  const handleOpeningComplete = useCallback(() => {
    setPage('entry');
  }, []);

  const handleEnter = useCallback(() => {
    setPage('preface');
  }, []);

  const handlePrefaceContinue = useCallback(() => {
    setPage('timeline');
  }, []);

  const handleReverse = useCallback(() => {
    setPage('reverse');
  }, []);

  const handleBackToEntry = useCallback(() => {
    setPage('entry');
  }, []);

  // Easter egg: hidden text reveal area in the top-left corner
  const handleCornerClick = useCallback(() => {
    if (page === 'entry') {
      const newCount = easterEggCount + 1;
      setEasterEggCount(newCount);

      // Clear previous timer
      if (easterEggTimerRef.current) {
        clearTimeout(easterEggTimerRef.current);
      }

      if (newCount >= 3) {
        setShowEasterEgg(true);
        setEasterEggCount(0);
        easterEggTimerRef.current = setTimeout(() => {
          setShowEasterEgg(false);
        }, 4000);
      }
    }
  }, [page, easterEggCount]);

  return (
    <SoundProvider>
      <div className="relative w-full h-screen overflow-hidden bg-sky-pale">
        <AnimatePresence mode="wait">
          {page === 'preloading' && (
            <Preloader key="preloader" onReady={handlePreloadingReady} />
          )}

          {page === 'opening' && (
            <Opening key="opening" onComplete={handleOpeningComplete} />
          )}

          {page === 'entry' && (
            <Entry
              key="entry"
              onEnter={handleEnter}
              onReverse={handleReverse}
            />
          )}

          {page === 'preface' && (
            <Preface key="preface" onContinue={handlePrefaceContinue} />
          )}

          {page === 'timeline' && (
            <Timeline key="timeline" onBack={handleBackToEntry} />
          )}

          {page === 'reverse' && (
            <ReversePage key="reverse" onBack={handleBackToEntry} />
          )}
        </AnimatePresence>

        {/* Sound toggle - shown on all pages except opening */}
        {page !== 'opening' && <SoundToggle />}

        {/* Hidden corner easter egg area */}
        {page === 'entry' && (
          <div
            className="fixed top-0 left-0 w-12 h-12 z-50 cursor-default"
            onClick={handleCornerClick}
            title=""
          />
        )}

        {/* Easter egg text */}
        <AnimatePresence>
          {showEasterEgg && (
            <motion.div
              key="easter-egg"
              className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
            >
              <div className="text-center px-8">
                <p className="text-diary text-lg md:text-xl text-ink/80 leading-relaxed">
                  <span className="inline-block animate-[shimmer_3s_ease-in-out_infinite]">
                    有些雨滴很小很小，
                  </span>
                  <br />
                  <span className="inline-block animate-[shimmer_3s_ease-in-out_0.5s_infinite]">
                    但它们记得所有的经过。
                  </span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SoundProvider>
  );
};

export default App;
