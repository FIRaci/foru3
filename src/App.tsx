import { useState, useRef, useCallback } from 'react';
import gsap from 'gsap';
import confetti from 'canvas-confetti';
import { Sparkles, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ─── Constants ─────────────────────────────────────────────────────────────
const SLICES = 10;
const TARGET_INDEX = 0; // ô vàng luôn thắng
const SLICE_DEG = 360 / SLICES; // 36° mỗi ô
const MIN_SPINS = 7; // vòng tối thiểu trước khi dừng

// Slice center trong conic-gradient(from -18deg, ...):
// Slice i bắt đầu từ (-18 + i*36)deg, center = (-18 + i*36 + 18) = i*36 deg
// Pointer ở top = 0° → để slice TARGET_INDEX dừng ở top:
// net rotation sau khi GSAP = 0° (mod 360) → wheel ở đúng vị trí ban đầu
// => finalAngle = N * 360 (luôn thắng slice 0)

function getWinningFinalRotation(currentGsapRotation: number): number {
  // làm tròn về bội số 360° gần nhất phía trên currentGsapRotation
  const alreadySpun = Math.abs(currentGsapRotation);
  const base = Math.ceil(alreadySpun / 360) * 360;
  const target = base + MIN_SPINS * 360;
  return target; // luôn dừng tại rotation % 360 === 0 → ô vàng (slice 0) dưới pointer
}

// ─── Slice colors & labels ─────────────────────────────────────────────────
const SLICE_DATA = Array.from({ length: SLICES }, (_, i) => ({
  index: i,
  isTarget: i === TARGET_INDEX,
  color: i === TARGET_INDEX ? '#fde047' : i % 2 === 0 ? '#f8fafc' : '#e2e8f0',
  label: 'HIDDEN',
}));

const conicColors = SLICE_DATA.map(({ color }, i) =>
  `${color} ${i * SLICE_DEG}deg ${(i + 1) * SLICE_DEG}deg`
).join(', ');

// ─── Component ──────────────────────────────────────────────────────────────
export default function App() {
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'winner' | 'claimed'>('idle');
  const wheelRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const spinTweenRef = useRef<gsap.core.Tween | null>(null);
  // Track cumulative GSAP rotation so reset stays consistent
  const cumulativeRotation = useRef(0);

  const spin = useCallback(() => {
    if (phase !== 'idle') return;
    setPhase('spinning');

    const finalRotation = getWinningFinalRotation(cumulativeRotation.current);
    cumulativeRotation.current = finalRotation;

    spinTweenRef.current = gsap.to(wheelRef.current, {
      rotation: finalRotation,
      duration: 7,
      ease: 'power3.inOut',
      onUpdate() {
        // Add subtle wobble near the end (last 20% of duration)
        const progress = this.progress();
        if (progress > 0.82 && progress < 0.98) {
          const wobble = Math.sin(progress * 120) * (1 - progress) * 3;
          gsap.set(wheelRef.current, { skewX: wobble });
        } else if (progress >= 0.98) {
          gsap.set(wheelRef.current, { skewX: 0 });
        }
      },
      onComplete: () => {
        // Satisfying snap + bounce
        gsap.fromTo(
          wheelRef.current,
          { scaleX: 1.04, scaleY: 0.97 },
          {
            scaleX: 1, scaleY: 1,
            duration: 0.5,
            ease: 'elastic.out(1.2, 0.4)',
            onComplete: () => {
              setPhase('winner');
              triggerWin();
            }
          }
        );
      },
    });
  }, [phase]);

  const triggerWin = () => {
    // Audio
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 0.6;
      audioRef.current.play().catch(() => {});
    }

    // Confetti burst
    const launch = (opts: confetti.Options) => confetti({ ...opts, zIndex: 9999 });

    // Center burst
    launch({ particleCount: 120, spread: 100, origin: { y: 0.5 }, colors: ['#fde047', '#ef4444', '#ec4899', '#3b82f6', '#10b981', '#ffffff'] });

    // Continuous side cannons
    const end = Date.now() + 3500;
    const frame = () => {
      launch({ particleCount: 7, angle: 55, spread: 65, origin: { x: 0, y: 0.75 }, colors: ['#fde047', '#ef4444', '#ec4899'] });
      launch({ particleCount: 7, angle: 125, spread: 65, origin: { x: 1, y: 0.75 }, colors: ['#3b82f6', '#10b981', '#fde047'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();

    // Hearts
    launch({ particleCount: 30, spread: 80, origin: { y: 0.3 }, shapes: ['circle'], colors: ['#ec4899', '#f43f5e', '#fb7185'] });
  };

  const reset = () => {
    setPhase('idle');
    // Reset GSAP rotation to 0 without animating
    gsap.set(wheelRef.current, { rotation: 0, skewX: 0, scaleX: 1, scaleY: 1 });
    cumulativeRotation.current = 0;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans overflow-hidden relative select-none">
      {/* Ambient gradient glow behind wheel */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-yellow-100 opacity-40 blur-3xl" />
      </div>

      {/* Audio */}
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3" preload="auto" />

      <AnimatePresence mode="wait">
        {phase !== 'claimed' ? (
          <motion.div
            key="wheel-screen"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, filter: 'blur(8px)' }}
            transition={{ duration: 0.45 }}
            className="flex flex-col items-center gap-6 z-10 w-full max-w-lg px-4"
          >
            {/* Title */}
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">
                Vòng Quay May Mắn 🎡
              </h1>
              <p className="text-slate-500 mt-2 text-base font-medium">
                {phase === 'idle' && 'Nhấn QUAY để thử vận may!'}
                {phase === 'spinning' && 'Đang quay…'}
                {phase === 'winner' && '🎉 Trúng rồi! Nhấn để nhận quà!'}
              </p>
            </div>

            {/* Wheel area */}
            <div className="relative flex items-center justify-center">

              {/* Outer decorative ring */}
              <div
                className="absolute rounded-full"
                style={{
                  width: 'calc(100% + 24px)',
                  height: 'calc(100% + 24px)',
                  background: 'conic-gradient(#fde047, #ef4444, #3b82f6, #10b981, #ec4899, #fde047)',
                  filter: 'blur(1px)',
                  opacity: 0.4,
                }}
              />

              {/* Pointer triangle */}
              <div
                className="absolute z-30"
                style={{
                  top: '-28px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0, height: 0,
                  borderLeft: '18px solid transparent',
                  borderRight: '18px solid transparent',
                  borderTop: '42px solid #ef4444',
                  filter: 'drop-shadow(0 4px 6px rgba(239,68,68,0.5))',
                }}
              />
              {/* Pointer highlight */}
              <div
                className="absolute z-30"
                style={{
                  top: '-22px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0, height: 0,
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderTop: '18px solid rgba(255,255,255,0.5)',
                }}
              />

              {/* The Wheel */}
              <div
                className="relative cursor-pointer rounded-full overflow-hidden"
                style={{
                  width: 340, height: 340,
                  boxShadow: '0 30px 60px -10px rgba(0,0,0,0.25), 0 0 0 8px white, 0 0 0 12px #f1f5f9',
                }}
                onClick={spin}
              >
                {/* Conic wheel disc */}
                <div
                  ref={wheelRef}
                  className="w-full h-full rounded-full"
                  style={{
                    background: `conic-gradient(from -18deg, ${conicColors})`,
                  }}
                >
                  {/* Divider lines */}
                  {SLICE_DATA.map((_, i) => (
                    <div
                      key={`line-${i}`}
                      className="absolute top-0 left-1/2 origin-bottom pointer-events-none"
                      style={{
                        width: 2, height: '50%',
                        marginLeft: -1,
                        background: 'rgba(255,255,255,0.7)',
                        transform: `rotate(${i * SLICE_DEG - 18}deg)`,
                        transformOrigin: 'bottom center',
                        top: 0,
                        left: '50%',
                        position: 'absolute',
                      }}
                    />
                  ))}

                  {/* Slice labels */}
                  {SLICE_DATA.map(({ index, isTarget }) => {
                    // center angle of slice i = i * 36° (because conic starts at -18deg, center at i*36)
                    const angleDeg = index * SLICE_DEG;
                    return (
                      <div
                        key={`label-${index}`}
                        className="absolute inset-0 pointer-events-none"
                        style={{ transform: `rotate(${angleDeg}deg)` }}
                      >
                        {/* Text positioned from top-center going downward */}
                        <div
                          className="absolute w-full flex flex-col items-center"
                          style={{ top: '12%' }}
                        >
                          <span
                            className={`font-black uppercase tracking-widest ${
                              isTarget
                                ? 'text-amber-700 text-[10px] opacity-80'
                                : 'text-slate-500 text-xs'
                            }`}
                            style={{ transform: isTarget ? 'scale(0.85)' : undefined }}
                          >
                            HIDDEN
                          </span>
                          {isTarget && (
                            <span className="text-amber-500 mt-0.5" style={{ fontSize: 10 }}>★</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Center knob */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center z-20"
                  style={{
                    width: 60, height: 60,
                    background: 'white',
                    boxShadow: '0 0 0 4px #f1f5f9, 0 4px 12px rgba(0,0,0,0.2)',
                  }}
                >
                  <div
                    className="rounded-full"
                    style={{ width: 22, height: 22, background: 'radial-gradient(circle at 35% 35%, #f87171, #ef4444)' }}
                  />
                </div>

                {/* Winner glow overlay */}
                <AnimatePresence>
                  {phase === 'winner' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.3, 0.1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 rounded-full pointer-events-none"
                      style={{ background: 'radial-gradient(circle, rgba(253,224,71,0.6) 0%, transparent 70%)' }}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Spin / Claim buttons */}
            <div className="flex flex-col items-center gap-3 mt-2">
              {phase === 'winner' ? (
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', bounce: 0.6, delay: 0.3 }}
                  onClick={() => setPhase('claimed')}
                  className="px-10 py-4 rounded-full font-black text-xl text-white cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                    boxShadow: '0 8px 30px rgba(245,158,11,0.5)',
                  }}
                  whileHover={{ scale: 1.07, boxShadow: '0 12px 40px rgba(245,158,11,0.7)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  🎁 Nhận Quà Ngay!
                </motion.button>
              ) : (
                <motion.button
                  onClick={spin}
                  disabled={phase === 'spinning'}
                  className="px-12 py-4 rounded-full font-black text-xl text-white cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    background: phase === 'spinning'
                      ? 'linear-gradient(135deg, #94a3b8, #64748b)'
                      : 'linear-gradient(135deg, #6366f1, #ec4899)',
                    boxShadow: phase === 'spinning' ? 'none' : '0 8px 30px rgba(99,102,241,0.4)',
                  }}
                  whileHover={phase !== 'spinning' ? { scale: 1.07 } : {}}
                  whileTap={phase !== 'spinning' ? { scale: 0.93 } : {}}
                >
                  {phase === 'spinning' ? '⏳ Đang Quay…' : '🎰 QUAY NGAY!'}
                </motion.button>
              )}

              {phase === 'idle' && (
                <p className="text-slate-400 text-sm">Mỗi lần quay đều có phần thưởng!</p>
              )}
            </div>
          </motion.div>
        ) : (
          // ── Reward Screen ──────────────────────────────────────────────
          <motion.div
            key="reward-screen"
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', bounce: 0.45, duration: 0.8 }}
            className="flex flex-col items-center gap-6 z-20 px-4 w-full max-w-xl"
          >
            <div className="text-center">
              <h2 className="text-5xl font-black text-rose-500 mb-1">Chúc Mừng! 🎉</h2>
              <p className="text-slate-500 font-medium text-lg">Bạn đã nhận được phần quà đặc biệt!</p>
            </div>

            {/* Gift image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="relative rounded-3xl overflow-hidden"
              style={{ boxShadow: '0 30px 60px rgba(0,0,0,0.15), 0 0 0 6px white, 0 0 0 10px #fde047' }}
            >
              <img
                src="/A gift.png"
                alt="A special gift"
                className="w-full max-w-md object-contain"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop';
                }}
              />
            </motion.div>

            {/* Floating sparkles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-yellow-400"
                  style={{ left: `${10 + i * 8}%`, top: `${20 + (i % 3) * 20}%` }}
                  animate={{ y: [0, -15, 0], opacity: [0.5, 1, 0.5], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
                >
                  <Sparkles size={16 + (i % 3) * 8} />
                </motion.div>
              ))}
            </div>

            {/* Reset */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              onClick={reset}
              className="flex items-center gap-2 px-8 py-3 rounded-full font-bold text-slate-600 border-2 border-slate-200 hover:border-slate-400 hover:text-slate-800 transition-all cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw size={18} />
              Quay Lại
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
