import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { memories, loadingLyrics } from '../data/memories';

interface PreloaderProps {
  onReady: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ onReady }) => {
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef(Date.now());
  const MIN_DISPLAY_MS = 5500; // loading screen shows at least 5.5 seconds

  // Rich rain canvas — more drops, mist, ripple
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };
    window.addEventListener('resize', resize);

    // Raindrops
    const drops: Array<{ x: number; y: number; speed: number; len: number; wd: number; op: number }> = [];
    for (let i = 0; i < 80; i++) {
      drops.push({
        x: Math.random() * w,
        y: Math.random() * h,
        speed: 0.3 + Math.random() * 2.2,
        len: 6 + Math.random() * 28,
        wd: 0.3 + Math.random() * 1.4,
        op: 0.08 + Math.random() * 0.28,
      });
    }

    // Mist particles
    const mists: Array<{ x: number; y: number; r: number; op: number; vx: number; vy: number }> = [];
    for (let i = 0; i < 15; i++) {
      mists.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 40 + Math.random() * 90,
        op: 0.015 + Math.random() * 0.04,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.15,
      });
    }

    let raf = 0;
    const draw = () => {
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      // Mist
      mists.forEach((m) => {
        m.x += m.vx; m.y += m.vy;
        if (m.x < -100) m.x = w + 100;
        if (m.x > w + 100) m.x = -100;
        if (m.y < -100) m.y = h + 100;
        if (m.y > h + 100) m.y = -100;
        const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r);
        g.addColorStop(0, `rgba(190,220,240,${m.op})`);
        g.addColorStop(0.5, `rgba(200,225,240,${m.op * 0.5})`);
        g.addColorStop(1, 'rgba(200,225,240,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2); ctx.fill();
      });

      // Raindrops
      drops.forEach((d) => {
        d.y += d.speed;
        if (d.y > h + 30) { d.y = -30; d.x = Math.random() * w; }
        // Tail
        ctx.strokeStyle = `rgba(150,210,235,${d.op})`;
        ctx.lineWidth = d.wd;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x, d.y + d.len);
        ctx.stroke();
        // Head dot
        ctx.fillStyle = `rgba(175,220,242,${d.op * 0.7})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.wd * 1.3, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Pick ONE random lyric + ONE random loading phrase each visit
  const [chosen] = useState(() => {
    const filled = loadingLyrics.filter((item) => {
      const lyric = typeof item === 'string' ? item : item.lyric;
      return lyric && lyric.trim().length > 0;
    });
    if (filled.length === 0) return { lyric: '正在收集雨滴…', song: '' };
    const item = filled[Math.floor(Math.random() * filled.length)];
    if (typeof item === 'string') return { lyric: item, song: '' };
    return item;
  });
  const lyric = chosen.lyric;
  const song = chosen.song;

  const loadingPhrases = [
    '—— 雨滴正在落下来 ——',
    '—— 请稍等，雨还在下 ——',
    '—— 正在收集这些雨水 ——',
    '—— 记忆在雨中慢慢浮现 ——',
    '—— 那些日子正在加载 ——',
    '—— 很快就能见面了 ——',
  ];

  const [loadingPhrase] = useState(() => {
    return loadingPhrases[Math.floor(Math.random() * loadingPhrases.length)];
  });

  // Preload assets — BGM + images
  useEffect(() => {
    const imagesToPreload = memories.filter((m) => m.image).map((m) => m.image!);
    const BGM_URL = import.meta.env.BASE_URL + 'bgm.mp3';
    const total = imagesToPreload.length + 1;
    let loaded = 0;

    const tick = () => {
      loaded++;
      setProgress(Math.min(1, loaded / total));
    };

    // BGM: preload with Audio element, then cache in global for SoundContext
    const bgm = new Audio();
    bgm.preload = 'auto';
    bgm.volume = 0;
    bgm.src = BGM_URL;
    bgm.addEventListener('canplaythrough', () => {
      (window as any).__bgmReady = true;
      tick();
    }, { once: true });
    bgm.addEventListener('error', () => tick(), { once: true });
    bgm.load();
    // Store reference so SoundContext can reuse
    (window as any).__bgmAudio = bgm;
    setTimeout(() => { if (!(window as any).__bgmReady) tick(); }, 10000);

    // Images
    imagesToPreload.forEach((src) => {
      const img = new Image();
      img.onload = tick;
      img.onerror = tick;
      img.src = src;
    });

    const safety = setTimeout(() => {
      if (loaded < total) { setProgress(1); }
    }, 25000);

    return () => clearTimeout(safety);
  }, []);

  // Trigger transition only when assets loaded AND minimum display time passed
  useEffect(() => {
    if (progress < 1) return;
    const elapsed = Date.now() - startTimeRef.current;
    const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
    const t = setTimeout(onReady, remaining + 600);
    return () => clearTimeout(t);
  }, [progress, onReady]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #B8D5E8 0%, #C8DFEE 25%, #D8E9F4 50%, #E8F4FD 80%, #DCEBF4 100%)' }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Rain canvas */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Central content */}
      <div className="relative z-10 flex flex-col items-center px-8">
        {/* Lyrics — large, poetic, cycling */}
        <div className="min-h-[120px] flex items-center justify-center mb-12">
          <motion.p
            className="text-title text-xl md:text-3xl text-ink-dark/80 text-center leading-relaxed"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          >
            {lyric.split('').map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.09, duration: 0.3 }}
                style={{ display: 'inline-block' }}
              >
                {char === ' ' ? ' ' : char}
              </motion.span>
            ))}
          </motion.p>
        </div>

        {/* Song title */}
        {song && (
          <motion.p
            className="text-diary text-xs md:text-sm text-ink-light/50 text-center mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.8 }}
          >
            {song}
          </motion.p>
        )}

        {/* Loading subtitle */}
        <motion.p
          className="text-subtle text-xs md:text-sm tracking-[0.2em] text-ink-light/35 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          {loadingPhrase}
        </motion.p>

        {/* Subtle progress */}
        <motion.div
          className="w-36 h-[2px] rounded-full overflow-hidden bg-white/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, rgba(126,200,227,0.5), rgba(91,155,213,0.6))',
              width: `${Math.round(progress * 100)}%`,
            }}
            transition={{ duration: 0.4 }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Preloader;
