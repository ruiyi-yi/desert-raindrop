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

  const ensureChimeCtx = useCallback((): AudioContext => {
    if (!chimeCtxRef.current) {
      chimeCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (chimeCtxRef.current.state === 'suspended') chimeCtxRef.current.resume();
    return chimeCtxRef.current;
  }, []);

  // Pre-unlock AudioContext on first user click
  useEffect(() => {
    const handler = () => { ensureChimeCtx(); };
    window.addEventListener('click', handler, { once: true });
    window.addEventListener('touchend', handler, { once: true });
    return () => {
      window.removeEventListener('click', handler);
      window.removeEventListener('touchend', handler);
    };
  }, [ensureChimeCtx]);

  // === Rain loop — plain HTML Audio ===
  const startRain = useCallback(() => {
    const a = new Audio(import.meta.env.BASE_URL + 'rain-ambient.wav');
    a.loop = true;
    a.volume = 0.1;
    a.play().catch(() => {});
    rainAudioRef.current = a;
  }, []);

  const stopRain = useCallback(() => {
    if (rainAudioRef.current) {
      rainAudioRef.current.pause();
      rainAudioRef.current.currentTime = 0;
      rainAudioRef.current = null;
    }
  }, []);

  // === BGM ===
  const startBGM = useCallback(() => {
    if (bgmAudioRef.current) { bgmAudioRef.current.pause(); bgmAudioRef.current = null; }
    const a = new Audio(import.meta.env.BASE_URL + 'bgm.mp3');
    a.loop = true;
    a.volume = 0.15;
    a.play().catch(() => {});
    bgmAudioRef.current = a;
  }, []);

  const stopBGM = useCallback(() => {
    if (bgmAudioRef.current) {
      bgmAudioRef.current.pause();
      bgmAudioRef.current.currentTime = 0;
      bgmAudioRef.current = null;
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

  // === Click effects (still Web Audio — short sounds work reliably) ===
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
      stopRain(); stopBGM();
      chimeCtxRef.current?.close().catch(() => {});
    };
  }, [stopRain, stopBGM]);

  return (
    <SoundContext.Provider value={{ isSoundEnabled, toggleSound, playRaindropSound, playGlassChime }}>
      {children}
    </SoundContext.Provider>
  );
};
