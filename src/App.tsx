import { useState, useRef, useEffect } from 'react';
import { Sparkles, RefreshCcw, PenTool, Eraser, ChevronUp, ChevronDown, Unlock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import confetti from 'canvas-confetti';

const WORDS = [
  'beautiful', 'gorgeous', 'stunning', 'radiant', 'angelic',
  'ethereal', 'captivating', 'elegant', 'lovely', 'adorable',
  'cute', 'charming', 'precious', 'divine', 'heavenly',
  'mesmerizing', 'flawless', 'perfect', 'incomparable',
  'breathtaking', 'exquisite', 'luminous', 'graceful',
  'dazzling', 'beloved', 'magnificent', 'sweet',
];

const CORRECT_PASSWORD = '2804';

// ─── Face Component ───────────────────────────────────────────────────────────
const Face = ({ bg, transform, w, h, children, isFront = false }: {
  bg: string; transform: string; w: number; h: number;
  children?: React.ReactNode; isFront?: boolean;
}) => (
  <div className="shatter-piece absolute" style={{ transform, width: w, height: h, transformStyle: 'preserve-3d' }}>
    <div className="absolute inset-0 overflow-hidden rounded-md" style={{ backgroundColor: bg }}>
      {isFront ? (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-400 via-slate-500 to-slate-700" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-black/40 mix-blend-overlay" />
      )}
      <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.7)] border-2 border-slate-700/80 z-10 pointer-events-none" />
      {/* Brushed metal texture */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none mix-blend-multiply"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, black 2px, black 4px)' }}
      />
      {isFront && (
        <>
          {/* Rivets */}
          {['top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3'].map((pos) => (
            <div key={pos} className={`absolute ${pos} w-3 h-3 rounded-full bg-slate-400 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.8),_inset_-1px_-1px_2px_rgba(0,0,0,0.5),_0_1px_3px_rgba(0,0,0,0.5)]`} />
          ))}
        </>
      )}
      {children}
    </div>
  </div>
);

// ─── Magic Note (Typewriter Effect) ──────────────────────────────────────────
const MagicNote = () => {
  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = WORDS[wordIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (isDeleting) {
      if (text === '') {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % WORDS.length);
      } else {
        timeout = setTimeout(() => setText(text.substring(0, text.length - 1)), 50);
      }
    } else {
      if (text === currentWord) {
        timeout = setTimeout(() => setIsDeleting(true), 1500);
      } else {
        timeout = setTimeout(() => setText(currentWord.substring(0, text.length + 1)), 100);
      }
    }

    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex]);

  return (
    <motion.div
      initial={{ rotate: -4, opacity: 0, x: -30 }}
      animate={{ rotate: -2, opacity: 1, x: 0 }}
      transition={{ type: 'spring', delay: 0.2 }}
      className="relative w-[340px] sm:w-[420px] p-8 pb-12 bg-[#fdfbf7] shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-sm origin-bottom-left flex-shrink-0 z-20"
      style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}
    >
      {/* Tape */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-28 h-10 bg-white/40 backdrop-blur-md shadow-sm rotate-1 border border-white/50 z-10" />
      {/* Red vertical lines */}
      <div className="absolute top-0 bottom-0 left-8 w-px bg-red-400/50" />
      <div className="absolute top-0 bottom-0 left-9 w-px bg-red-400/50" />
      {/* Horizontal lines */}
      <div className="absolute inset-0 pt-16 flex flex-col pointer-events-none overflow-hidden opacity-30">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="w-full h-[48px] border-b border-blue-500/50" />
        ))}
      </div>

      <div
        className="relative z-10 pl-8 mt-10 text-slate-800 text-[32px] leading-[48px]"
        style={{ fontFamily: "'Caveat', cursive" }}
      >
        The password is the day of birth of the most
        <br />
        <span className="inline-flex relative min-w-[140px] items-center text-rose-600 font-bold italic align-middle px-2 drop-shadow-sm h-[48px]">
          <span>{text}</span>
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="ml-1 text-2xl -translate-y-1"
          >
            {isDeleting
              ? <Eraser size={24} className="text-slate-400" />
              : <PenTool size={24} className="text-rose-600" />}
          </motion.span>
        </span>
        <br />
        girl in this world.
      </div>
    </motion.div>
  );
};

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [isBurst, setIsBurst] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [code, setCode] = useState([0, 0, 0, 0]);

  const safeRef = useRef<HTMLDivElement>(null);

  const handleDigitChange = (e: React.MouseEvent, index: number, delta: number) => {
    e.stopPropagation();
    if (isBurst) return;
    const newCode = [...code];
    newCode[index] = (newCode[index] + delta + 10) % 10;
    setCode(newCode);

    // Subtle jiggle on click
    if (safeRef.current) {
      gsap.killTweensOf(safeRef.current);
      gsap.fromTo(
        safeRef.current,
        { rotateX: -15 + (Math.random() - 0.5) * 2, rotateY: -25 + (Math.random() - 0.5) * 2 },
        { rotateX: -15, rotateY: -25, duration: 0.3, ease: 'power2.out' }
      );
    }
  };

  const handleUnlock = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (code.join('') === CORRECT_PASSWORD && !isBurst) {
      setIsBurst(true);
      triggerBurst();
    } else if (!isBurst) {
      // Shake for wrong password
      if (safeRef.current) {
        gsap.killTweensOf(safeRef.current);
        gsap.fromTo(
          safeRef.current,
          { rotateZ: -5 },
          { rotateZ: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' }
        );
      }
    }
  };

  const triggerBurst = () => {
    // Continuous confetti cannons
    const duration = 3000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({ particleCount: 8, angle: 60, spread: 80, origin: { x: 0, y: 0.8 }, colors: ['#f43f5e', '#ec4899', '#ffffff', '#fbbf24'] });
      confetti({ particleCount: 8, angle: 120, spread: 80, origin: { x: 1, y: 0.8 }, colors: ['#f43f5e', '#ec4899', '#ffffff', '#fbbf24'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();

    // Big center burst
    confetti({ particleCount: 250, spread: 160, origin: { y: 0.4 }, colors: ['#f43f5e', '#ec4899', '#ffffff', '#fbbf24', '#fcd34d'] });

    // Shatter each face
    document.querySelectorAll('.shatter-piece').forEach((face) => {
      gsap.to(face, {
        x: (Math.random() - 0.5) * 3000,
        y: (Math.random() - 0.5) * 3000 - 1000,
        z: (Math.random() - 0.5) * 3000,
        rotateX: Math.random() * 1440,
        rotateY: Math.random() * 1440,
        rotateZ: Math.random() * 1440,
        opacity: 0,
        scale: Math.random() * 0.5 + 0.5,
        duration: 1.5 + Math.random(),
        ease: 'power4.out',
      });
    });

    // Hide shadow
    gsap.to('.box-shadow', { opacity: 0, scale: 0, duration: 0.3 });
  };

  const reset = () => {
    setCode([0, 0, 0, 0]);
    setIsBurst(false);
    setResetKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-white relative font-sans flex items-center justify-center overflow-hidden w-full">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="w-[60vw] h-[60vw] bg-pink-100/60 blur-[140px] rounded-full absolute -top-20 -left-20" />
        <div className="w-[50vw] h-[50vw] bg-blue-100/50 blur-[140px] rounded-full absolute bottom-0 right-0" />
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-24 w-full max-w-7xl mx-auto px-8 z-20">
        <MagicNote />

        {/* 3D Scene */}
        <div
          className="relative w-[300px] h-[400px] flex items-center justify-center z-20"
          style={{ perspective: '4000px' }}
        >
          {/* Gift Image — appears after unlock */}
          <AnimatePresence>
            {isBurst && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center z-10"
              >
                <motion.div
                  initial={{ scale: 0, y: 100, opacity: 0, rotateZ: -10 }}
                  animate={{ scale: 1, y: -40, opacity: 1, rotateZ: 0 }}
                  transition={{ type: 'spring', bounce: 0.5, duration: 1, delay: 0.1 }}
                  className="relative group cursor-pointer"
                >
                  <div className="relative p-2 bg-white rounded-xl shadow-2xl border-4 border-slate-50 hover:-translate-y-3 hover:shadow-[0_30px_60px_rgba(0,0,0,0.2)] transition-all duration-300">
                    <img
                      src="/A gift.png"
                      alt="A gift"
                      className="w-[280px] sm:w-[360px] h-auto rounded-lg object-contain"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=400&auto=format&fit=crop';
                      }}
                    />
                    <Sparkles className="absolute -top-6 -right-6 text-amber-400 w-12 h-12 animate-pulse" />
                    <Sparkles className="absolute -bottom-4 -left-4 text-rose-400 w-8 h-8 animate-pulse" style={{ animationDelay: '200ms' }} />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* The 3D Safe */}
          <div
            key={resetKey}
            className="relative w-[240px] h-[240px] z-30"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div
              ref={safeRef}
              className="absolute inset-0"
              style={{ transformStyle: 'preserve-3d', transform: 'rotateX(-15deg) rotateY(-25deg)' }}
            >
              {/* Drop shadow */}
              <div
                className="box-shadow absolute top-1/2 left-1/2 w-[350px] h-[350px] bg-black/15 blur-2xl rounded-full pointer-events-none"
                style={{ transform: 'translate(-50%, -50%) translateY(120px) rotateX(90deg)' }}
              />

              {/* Safe Body (240×240×240) */}
              <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
                {/* Front face (+Z) */}
                <Face bg="#94a3b8" isFront transform="translateZ(120px)" w={240} h={240}>
                  {/* Safe Door Inner Frame */}
                  <div className="absolute inset-5 border-[3px] border-slate-600/50 rounded shadow-[0_0_20px_rgba(0,0,0,0.4)] pointer-events-none bg-slate-400/10" />
                  {/* Hinges */}
                  <div className="absolute left-0 top-12 w-2 h-10 bg-slate-600 border-r border-slate-800 shadow-md" />
                  <div className="absolute left-0 bottom-12 w-2 h-10 bg-slate-600 border-r border-slate-800 shadow-md" />

                  {/* Digit Dials */}
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center justify-center gap-1.5 bg-slate-900 p-3 rounded-lg shadow-[inset_0_4px_15px_rgba(0,0,0,0.9),_0_2px_0_rgba(255,255,255,0.2)] border border-slate-700 pointer-events-auto z-20">
                    {code.map((num, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <button
                          onClick={(e) => handleDigitChange(e, idx, 1)}
                          className="w-full text-slate-400 hover:text-white pb-1 flex justify-center"
                        >
                          <ChevronUp size={16} strokeWidth={3} />
                        </button>
                        <div className="relative w-8 h-10 bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 rounded-sm text-center leading-[40px] font-mono font-bold text-slate-900 text-2xl shadow-[inset_0_2px_5px_rgba(0,0,0,0.4)] select-none border-b border-slate-500 overflow-hidden">
                          <div className="absolute top-1/2 left-0 w-full h-px bg-black/20 pointer-events-none shadow-[0_1px_0_rgba(255,255,255,0.5)]" />
                          {num}
                        </div>
                        <button
                          onClick={(e) => handleDigitChange(e, idx, -1)}
                          className="w-full text-slate-400 hover:text-white pt-1 flex justify-center"
                        >
                          <ChevronDown size={16} strokeWidth={3} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Safe Handle / Unlock Button */}
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 w-16 h-16 flex items-center justify-center pointer-events-auto drop-shadow-2xl z-20">
                    <button
                      onClick={handleUnlock}
                      className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 border-4 border-slate-600 shadow-[0_5px_15px_rgba(0,0,0,0.5),_inset_0_2px_5px_rgba(255,255,255,0.6)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all group"
                    >
                      <div className="w-6 h-6 rounded-full bg-slate-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] flex items-center justify-center group-active:bg-green-500 transition-colors">
                        <Unlock size={12} className="text-slate-300 group-active:text-white" />
                      </div>
                    </button>
                  </div>
                </Face>

                {/* Right face (+X) */}
                <Face bg="#64748b" transform="rotateY(90deg) translateZ(120px)" w={240} h={240} />
                {/* Back face (-Z) */}
                <Face bg="#475569" transform="rotateY(180deg) translateZ(120px)" w={240} h={240} />
                {/* Left face (-X) */}
                <Face bg="#cbd5e1" transform="rotateY(-90deg) translateZ(120px)" w={240} h={240} />
                {/* Top face (-Y) */}
                <Face bg="#e2e8f0" transform="rotateX(90deg) translateZ(120px)" w={240} h={240} />
                {/* Bottom face (+Y) */}
                <Face bg="#334155" transform="rotateX(-90deg) translateZ(120px)" w={240} h={240} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reset button */}
      <AnimatePresence>
        {isBurst && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            onClick={reset}
            className="absolute bottom-12 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg rounded-full transition-all shadow-2xl z-50 cursor-pointer flex items-center gap-3 hover:-translate-y-1"
          >
            <RefreshCcw size={24} />
            Khóa Lại
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
