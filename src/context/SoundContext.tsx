import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

interface SoundContextType {
  isSoundEnabled: boolean;
  toggleSound: () => void;
  playRaindropSound: () => void;
  playGlassChime: () => void;
}

const SoundContext = createContext<SoundContextType>({
  isSoundEnabled: false,
  toggleSound: () => {},
  playRaindropSound: () => {},
  playGlassChime: () => {},
});

export const useSound = () => useContext(SoundContext);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const rainAudioRef = useRef<HTMLAudioElement | null>(null);
  const bgmAudioRef = useRef<HTMLAudioElement | null>(null);
  const chimeCtxRef = useRef<AudioContext | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const ensureChimeCtx = useCallback((): AudioContext => {
    if (!chimeCtxRef.current) {
      chimeCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (chimeCtxRef.current.state === 'suspended') chimeCtxRef.current.resume();
    return chimeCtxRef.current;
  }, []);

  // Pre-unlock AudioContext + preload BGM on first user click
  useEffect(() => {
    const handler = () => {
      ensureChimeCtx();
      // Reuse preloaded BGM Audio element if available
      if (!bgmAudioRef.current && (window as any).__bgmAudio) {
        const el = (window as any).__bgmAudio as HTMLAudioElement;
        el.loop = true;
        el.volume = 0.15;
        bgmAudioRef.current = el;
      }
    };
    window.addEventListener('click', handler, { once: true });
    window.addEventListener('touchend', handler, { once: true });
    return () => {
      window.removeEventListener('click', handler);
      window.removeEventListener('touchend', handler);
    };
  }, [ensureChimeCtx]);

  // === Rain ===
  const startRain = useCallback(() => {
    // Reuse preloaded rain audio if available
    if (!rainAudioRef.current && (window as any).__rainAudio) {
      const el = (window as any).__rainAudio as HTMLAudioElement;
      el.loop = true;
      el.volume = 0.1;
      rainAudioRef.current = el;
    }
    if (rainAudioRef.current) {
      rainAudioRef.current.play().catch(() => {});
      return;
    }
    // Fallback: create new
    const a = new Audio(import.meta.env.BASE_URL + 'rain-ambient.wav');
    a.loop = true;
    a.volume = 0.1;
    a.play().catch(() => {});
    rainAudioRef.current = a;
  }, []);

  const stopRain = useCallback(() => {
    if (rainAudioRef.current) { rainAudioRef.current.pause(); rainAudioRef.current.currentTime = 0; rainAudioRef.current = null; }
  }, []);

  // === BGM ===
  const startBGM = useCallback(() => {
    // Reuse preloaded element if available
    if (!bgmAudioRef.current && (window as any).__bgmAudio) {
      const el = (window as any).__bgmAudio as HTMLAudioElement;
      el.loop = true;
      el.volume = 0.15;
      bgmAudioRef.current = el;
    }
    if (bgmAudioRef.current) {
      bgmAudioRef.current.play().catch(() => {});
      return;
    }
    // Fallback: create new
    const el = document.createElement('audio');
    el.src = import.meta.env.BASE_URL + 'bgm.mp3';
    el.loop = true;
    el.volume = 0.15;
    el.style.display = 'none';
    document.body.appendChild(el);
    el.play().catch(() => {});
    bgmAudioRef.current = el;
  }, []);

  const stopBGM = useCallback(() => {
    if (bgmAudioRef.current) {
      bgmAudioRef.current.pause();
      // Keep DOM element — already buffered, ready for next play
    }
  }, []);

  // === Toggle ===
  const toggleSound = useCallback(() => {
    setIsSoundEnabled((prev) => {
      const next = !prev;
      if (next) { startRain(); startBGM(); }
      else { stopRain(); stopBGM(); }
      return next;
    });
  }, [startRain, startBGM, stopRain, stopBGM]);

  // === Click effects ===
  const playRaindropSound = useCallback(() => {
    if (!isSoundEnabled) return;
    try {
      const ctx = ensureChimeCtx();
      const t = ctx.currentTime;
      const o = ctx.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(600, t);
      o.frequency.exponentialRampToValueAtTime(180, t + 0.6);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.06, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
      o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t + 0.9);
    } catch {}
  }, [isSoundEnabled, ensureChimeCtx]);

  const playGlassChime = useCallback(() => {
    if (!isSoundEnabled) return;
    try {
      const ctx = ensureChimeCtx();
      const t = ctx.currentTime;
      [1047, 1319].forEach((f, i) => {
        const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
        const g = ctx.createGain();
        const st = t + i * 0.06;
        g.gain.setValueAtTime(0.04, st);
        g.gain.exponentialRampToValueAtTime(0.001, st + 1.0);
        o.connect(g); g.connect(ctx.destination);
        o.start(st); o.stop(st + 1.0);
      });
    } catch {}
  }, [isSoundEnabled, ensureChimeCtx]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopRain();
      if (bgmAudioRef.current) { bgmAudioRef.current.pause(); bgmAudioRef.current = null; }
      if ((window as any).__bgmAudio) { delete (window as any).__bgmAudio; }
      if ((window as any).__rainAudio) { delete (window as any).__rainAudio; }
      chimeCtxRef.current?.close().catch(() => {});
    };
  }, [stopRain]);

  return (
    <SoundContext.Provider value={{ isSoundEnabled, toggleSound, playRaindropSound, playGlassChime }}>
      {children}
    </SoundContext.Provider>
  );
};
