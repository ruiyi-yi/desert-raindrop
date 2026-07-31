import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { memories } from '../data/memories';

interface PreloaderProps {
  onReady: () => void;
}

const LOADING_TEXTS = [
  '正在收集雨滴…',
  '正在翻阅记忆…',
  '快要好了…',
];

const Preloader: React.FC<PreloaderProps> = ({ onReady }) => {
  const [progress, setProgress] = useState(0);
  const [textIdx, setTextIdx] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Canvas rain
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    const drops: Array<{ x: number; y: number; speed: number; len: number; op: number }> = [];
    for (let i = 0; i < 60; i++) {
      drops.push({
        x: Math.random() * w,
        y: Math.random() * h,
        speed: 0.5 + Math.random() * 1.5,
        len: 10 + Math.random() * 20,
        op: 0.1 + Math.random() * 0.25,
      });
    }

    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      drops.forEach((d) => {
        d.y += d.speed;
        if (d.y > h + 20) { d.y = -20; d.x = Math.random() * w; }
        ctx.strokeStyle = `rgba(160,210,235,${d.op})`;
        ctx.lineWidth = 0.8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x, d.y + d.len);
        ctx.stroke();
        ctx.fillStyle = `rgba(180,220,240,${d.op * 0.6})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  // Progressive loading text changes
  useEffect(() => {
    if (progress < 0.5) setTextIdx(0);
    else if (progress < 0.85) setTextIdx(1);
    else setTextIdx(2);
  }, [progress]);

  // Preload all images + BGM
  useEffect(() => {
    const imagesToPreload = memories
      .filter((m) => m.image)
      .map((m) => m.image!);

    const BGM_URL = import.meta.env.BASE_URL + 'bgm.mp3';
    const total = imagesToPreload.length + 1; // +1 for BGM
    let loaded = 0;

    const tick = () => {
      loaded++;
      setProgress(Math.min(1, loaded / total));
    };

    const bgm = new Audio(BGM_URL);
    bgm.preload = 'auto';
    bgm.volume = 0;
    bgm.addEventListener('canplaythrough', tick, { once: true });
    bgm.addEventListener('error', tick, { once: true });
    bgm.load();
    // Safety: if BGM doesn't trigger canplaythrough in 8s, count it anyway
    setTimeout(() => { if (bgm.readyState < 2) tick(); }, 8000);

    imagesToPreload.forEach((src) => {
      const img = new Image();
      img.onload = tick;
      img.onerror = tick;
      img.src = src;
    });

    // Safety timeout: 15s max, then proceed anyway
    const safety = setTimeout(() => {
      if (loaded < total) {
        setProgress(1);
        setTimeout(onReady, 600);
      }
    }, 15000);

    return () => clearTimeout(safety);
  }, []);

  // When all loaded, trigger transition
  useEffect(() => {
    if (progress >= 1) {
      const t = setTimeout(onReady, 800);
      return () => clearTimeout(t);
    }
  }, [progress, onReady]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #C5DFF0 0%, #DCEBF4 30%, #E8F4FD 60%, #DCEBF4 100%)' }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Rain canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Progress bar */}
      <motion.div
        className="relative w-48 md:w-64 h-[2px] mb-8 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-white/30 rounded-full" />
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: 'linear-gradient(90deg, rgba(126,200,227,0.6), rgba(91,155,213,0.5))',
            width: `${Math.round(progress * 100)}%`,
          }}
          transition={{ duration: 0.3 }}
        />
        {/* Raindrop at tip */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
          style={{
            left: `${Math.round(progress * 100)}%`,
            background: 'rgba(126,200,227,0.8)',
            boxShadow: '0 0 6px rgba(126,200,227,0.5)',
          }}
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.div>

      {/* Text */}
      <motion.p
        key={textIdx}
        className="relative z-10 text-subtle text-xs md:text-sm tracking-[0.2em] text-ink-light/60"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        {LOADING_TEXTS[textIdx]}
      </motion.p>
    </motion.div>
  );
};

export default Preloader;
