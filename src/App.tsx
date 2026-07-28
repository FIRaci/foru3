import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { ChevronUp, ChevronDown, Lock, Unlock, Sparkles } from 'lucide-react';

const WORDS = [
  'beautiful',
  'gorgeous',
  'stunning',
  'radiant',
  'angelic',
  'ethereal',
  'captivating',
  'elegant',
  'lovely',
  'adorable',
  'cute',
  'charming',
  'precious',
  'divine',
  'heavenly',
  'mesmerizing',
  'flawless',
  'perfect',
  'incomparable',
  'breathtaking',
  'exquisite',
  'luminous',
  'graceful',
  'dazzling',
  'beloved',
  'magnificent',
  'sweet',
];

const CORRECT_PASSWORD = [2, 8, 0, 4];

export default function App() {
  const [wordIndex, setWordIndex] = useState(0);
  const [code, setCode] = useState([0, 0, 0, 0]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isWrong, setIsWrong] = useState(false);

  const lidRef = useRef<HTMLDivElement>(null);
  const giftRef = useRef<HTMLDivElement>(null);
  const lockRef = useRef<HTMLButtonElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % WORDS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const handleLockClick = () => {
    if (isUnlocked) return;

    if (code.join('') === CORRECT_PASSWORD.join('')) {
      setIsUnlocked(true);
      triggerUnlockAnimation();
    } else {
      // Wrong password — shake and flash red
      setIsWrong(true);
      gsap.fromTo(
        lockRef.current,
        { x: -6, rotate: -8 },
        {
          x: 6,
          rotate: 8,
          duration: 0.06,
          yoyo: true,
          repeat: 7,
          ease: 'power1.inOut',
          onComplete: () => {
            gsap.set(lockRef.current, { x: 0, rotate: 0 });
            setTimeout(() => setIsWrong(false), 400);
          },
        }
      );
    }
  };

  const triggerUnlockAnimation = () => {
    const tl = gsap.timeline();

    // Lock turns green then disappears
    tl.to(lockRef.current, {
      scale: 1.2,
      duration: 0.2,
    })
      .to(lockRef.current, {
        scale: 0,
        opacity: 0,
        duration: 0.35,
        ease: 'back.in(2)',
      })
      // Lid slides up and away
      .to(
        lidRef.current,
        {
          y: -220,
          rotation: -12,
          opacity: 0,
          duration: 1,
          ease: 'power3.inOut',
        },
        '-=0.1'
      )
      // Gift pops up
      .fromTo(
        giftRef.current,
        { y: 80, scale: 0, opacity: 0 },
        {
          y: -40,
          scale: 1,
          opacity: 1,
          duration: 1.4,
          ease: 'elastic.out(1, 0.55)',
        },
        '-=0.6'
      );

    setTimeout(() => {
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.55 },
        colors: ['#f43f5e', '#ec4899', '#fde047', '#3b82f6', '#10b981'],
        zIndex: 100,
      });
    }, 900);
  };

  const handleDial = (index: number, direction: 1 | -1) => {
    if (isUnlocked) return;
    setCode((prev) => {
      const newCode = [...prev];
      let val = newCode[index] + direction;
      if (val > 9) val = 0;
      if (val < 0) val = 9;
      newCode[index] = val;
      return newCode;
    });
  };

  // ─── Isometric box dimensions ───────────────────────────
  // We draw three visible faces: Top, Front, Right
  // using clip-path parallelograms — no preserve-3d, no translateZ.
  const W = 260;   // box width (front face px)
  const H = 170;   // box height (front face px)
  const D = 100;   // depth offset in pixels (isometric slant)

  // Lid dimensions (slightly larger)
  const LW = W + 16;
  const LH = 36;
  const LD = D + 8;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans overflow-hidden relative">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="w-[60vw] h-[60vw] bg-pink-100/60 blur-[140px] rounded-full absolute -top-20 -left-20" />
        <div className="w-[50vw] h-[50vw] bg-blue-100/60 blur-[140px] rounded-full absolute bottom-0 right-0" />
        <div className="w-[35vw] h-[35vw] bg-yellow-50/40 blur-[100px] rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-20 lg:gap-36 w-full max-w-6xl z-10 px-4">

        {/* ─── MAGIC PAPER ─────────────────────────────────── */}
        <div
          className="relative w-full max-w-[360px] aspect-[3/4] bg-[#fdf9f0] border border-[#e5dac8] rounded-sm p-8 flex flex-col justify-center flex-shrink-0"
          style={{
            boxShadow: '6px 10px 30px rgba(0,0,0,0.1), inset 0 0 100px rgba(180,155,110,0.08)',
            transform: 'rotate(-2.5deg)',
          }}
        >
          {/* Lines */}
          <div
            className="absolute inset-0 opacity-[0.18] pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #8b7355 31px, #8b7355 32px)',
              backgroundPosition: '0 44px',
            }}
          />
          <div
            className="relative z-10 text-slate-800 flex flex-col items-center text-center"
            style={{ fontFamily: "'Homemade Apple', cursive", fontSize: '1.5rem', lineHeight: '1.9' }}
          >
            <p>The password is</p>
            <p>day of birth of</p>
            <p>the most</p>

            <div className="h-24 w-full flex justify-center items-center relative my-3">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={wordIndex}
                  initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)', color: '#be185d' }}
                  exit={{ opacity: 0, y: -16, filter: 'blur(6px)' }}
                  transition={{ duration: 0.65, ease: 'easeOut' }}
                  className="absolute text-5xl font-bold whitespace-nowrap"
                  style={{ fontFamily: "'Cedarville Cursive', cursive", transform: 'rotate(-4deg)' }}
                >
                  {WORDS[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </div>

            <p>girl in this world.</p>
          </div>
        </div>

        {/* ─── ISOMETRIC BOX ───────────────────────────────── */}
        {/* 
          We draw the box using 3 plain divs arranged like an isometric cube:
            - Front face  (rectangle, bottom-left)
            - Right face  (skewed parallelogram, bottom-right)
            - Top face    (skewed parallelogram, top)
            - Lid         (separate element on top, animates away)
          No preserve-3d. No translateZ. Just math.
        */}
        <div
          ref={boxRef}
          className="relative flex-shrink-0"
          style={{
            // Total canvas: W + D wide, H + D tall (+ some extra for lid and gift overflow)
            width: W + D + 40,
            height: H + D + 160,
          }}
        >
          {/* Gift image (hidden, pops up from center of box) */}
          <div
            ref={giftRef}
            className="absolute z-30 flex items-center justify-center"
            style={{
              width: W,
              left: 20,
              // Vertically centered in the box front face area
              top: D + 20,
              opacity: 0,
              pointerEvents: isUnlocked ? 'auto' : 'none',
            }}
          >
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-yellow-300/50 blur-[50px] scale-150 rounded-full" />
              <img
                src="/A gift.png"
                alt="A magical gift"
                className="w-48 h-48 object-contain relative z-10"
                style={{ filter: 'drop-shadow(0 0 30px rgba(250,204,21,0.9))' }}
                onError={(e) => {
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=400&auto=format&fit=crop';
                }}
              />
              {isUnlocked &&
                Array.from({ length: 10 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-yellow-300"
                    style={{
                      left: `${50 + (Math.random() - 0.5) * 160}%`,
                      top: `${50 + (Math.random() - 0.5) * 160}%`,
                    }}
                    animate={{ y: [0, -40, 0], opacity: [0, 1, 0], scale: [0.5, 1.4, 0.5] }}
                    transition={{ duration: 1.5 + Math.random(), repeat: Infinity, delay: Math.random() }}
                  >
                    <Sparkles size={14 + Math.random() * 18} />
                  </motion.div>
                ))}
            </div>
          </div>

          {/* ── LID (sits above the box body, animates away on unlock) ── */}
          <div
            ref={lidRef}
            className="absolute z-20"
            style={{
              top: 0,
              left: 0,
              width: LW + LD,
              height: LH + LD,
              // This wrapper will be animated by GSAP (y, opacity)
            }}
          >
            {/* Lid Top face */}
            <div
              className="absolute"
              style={{
                width: LW,
                height: LD,
                top: 0,
                left: LD,
                background: 'linear-gradient(135deg, #64748b, #334155)',
                clipPath: `polygon(0 ${LD}px, ${LW}px ${LD}px, ${LW + LD}px 0, ${LD}px 0)`,
                // That gives a top-face parallelogram
              }}
            />
            {/* Lid Right face */}
            <div
              className="absolute"
              style={{
                width: LD,
                height: LH,
                top: LD,
                left: LW,
                background: 'linear-gradient(180deg, #475569, #1e293b)',
                clipPath: `polygon(0 0, ${LD}px -${LD}px, ${LD}px ${LH}px, 0 ${LH + LD}px)`,
              }}
            />
            {/* Lid Front face */}
            <div
              className="absolute flex items-center justify-center"
              style={{
                width: LW,
                height: LH,
                top: LD,
                left: 0,
                background: 'linear-gradient(180deg, #64748b, #334155)',
                border: '1px solid rgba(250,204,21,0.5)',
                boxShadow: 'inset 0 2px 8px rgba(255,255,255,0.1)',
              }}
            >
              {/* Gold decorative strip */}
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

              {/* LOCK BUTTON — centered on front of lid */}
              <button
                ref={lockRef}
                onClick={handleLockClick}
                disabled={isUnlocked}
                className="absolute -bottom-8 w-16 h-16 rounded-full flex items-center justify-center z-30 cursor-pointer outline-none transition-transform hover:scale-110 active:scale-90"
                style={{
                  background: isWrong
                    ? 'linear-gradient(135deg, #ef4444, #b91c1c)'
                    : 'linear-gradient(135deg, #fbbf24, #d97706)',
                  border: '4px solid #1e293b',
                  boxShadow: isWrong
                    ? '0 8px 20px rgba(220,38,38,0.7), inset 0 3px 8px rgba(255,255,255,0.5)'
                    : '0 8px 20px rgba(0,0,0,0.6), inset 0 3px 8px rgba(255,255,255,0.6)',
                  color: '#1e293b',
                }}
              >
                <div className="absolute inset-1 rounded-full border border-white/30 pointer-events-none" />
                {isUnlocked ? <Unlock size={24} strokeWidth={3} /> : <Lock size={24} strokeWidth={3} />}
              </button>
            </div>
          </div>

          {/* ── BOX BODY ── */}
          {/* Positioned below the lid */}
          <div
            className="absolute"
            style={{
              top: LH + LD - 2, // -2 so lid and body overlap by 2px (seamless)
              left: 0,
              width: W + D,
              height: H + D,
            }}
          >
            {/* Top face of box body (visible when lid is off) */}
            <div
              className="absolute"
              style={{
                width: W,
                height: D,
                top: 0,
                left: D,
                background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                clipPath: `polygon(0 ${D}px, ${W}px ${D}px, ${W + D}px 0, ${D}px 0)`,
                boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8)',
              }}
            />

            {/* Right face */}
            <div
              className="absolute"
              style={{
                width: D,
                height: H,
                top: D,
                left: W,
                background: 'linear-gradient(180deg, #334155, #0f172a)',
                clipPath: `polygon(0 0, ${D}px -${D}px, ${D}px ${H}px, 0 ${H + D}px)`,
                boxShadow: 'inset -10px 0 20px rgba(0,0,0,0.6)',
              }}
            />

            {/* Front face */}
            <div
              className="absolute flex items-center justify-center"
              style={{
                width: W,
                height: H,
                top: D,
                left: 0,
                background: 'linear-gradient(180deg, #475569 0%, #1e293b 60%, #0f172a 100%)',
                border: '1px solid rgba(250,204,21,0.35)',
                boxShadow:
                  'inset 0 0 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1), 0 20px 40px rgba(0,0,0,0.4)',
              }}
            >
              {/* Gold trim lines */}
              <div className="absolute inset-3 border border-amber-500/25 pointer-events-none" />
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

              {/* ── MECHANICAL DIALS ── */}
              <div
                className="flex gap-3 items-center p-4 rounded-xl"
                style={{
                  background: '#0a0f1a',
                  boxShadow: 'inset 0 8px 30px rgba(0,0,0,1), 0 2px 0 rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {code.map((num, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1.5">
                    <button
                      onClick={() => handleDial(idx, 1)}
                      className="text-slate-500 hover:text-amber-400 transition-colors p-1 disabled:opacity-40"
                      disabled={isUnlocked}
                    >
                      <ChevronUp size={20} strokeWidth={4} />
                    </button>

                    {/* Wheel */}
                    <div
                      className="w-12 h-16 flex items-center justify-center overflow-hidden relative rounded"
                      style={{
                        background: 'linear-gradient(180deg, #cbd5e1 0%, #f8fafc 40%, #f1f5f9 60%, #94a3b8 100%)',
                        border: '2px solid #334155',
                        boxShadow: 'inset 0 6px 12px rgba(0,0,0,0.5), inset 0 -6px 12px rgba(0,0,0,0.5)',
                      }}
                    >
                      <AnimatePresence mode="popLayout">
                        <motion.span
                          key={num}
                          initial={{ y: 22, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -22, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                          className="text-3xl font-black font-mono text-slate-800 relative z-10"
                          style={{ textShadow: '0 1px 0 rgba(255,255,255,0.9)' }}
                        >
                          {num}
                        </motion.span>
                      </AnimatePresence>
                    </div>

                    <button
                      onClick={() => handleDial(idx, -1)}
                      className="text-slate-500 hover:text-amber-400 transition-colors p-1 disabled:opacity-40"
                      disabled={isUnlocked}
                    >
                      <ChevronDown size={20} strokeWidth={4} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom face */}
            <div
              className="absolute"
              style={{
                width: W,
                height: D,
                top: H + D,
                left: D,
                background: 'linear-gradient(135deg, #0f172a, #020617)',
                clipPath: `polygon(0 0, ${W}px 0, ${W + D}px -${D}px, ${D}px -${D}px)`,
                boxShadow: '0 20px 40px rgba(0,0,0,0.9)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
