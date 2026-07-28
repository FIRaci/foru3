import { useState, useRef, useEffect } from 'react';
import { Sparkles, PenTool, Eraser, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
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
      className="relative w-full max-w-[340px] sm:max-w-[420px] p-6 sm:p-8 pb-10 sm:pb-12 bg-[#fdfbf7] shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-sm flex-shrink-0 z-20 mx-auto lg:mx-0"
      style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}
    >
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-28 h-10 bg-white/40 backdrop-blur-md shadow-sm rotate-1 border border-white/50 z-10" />
      <div className="absolute top-0 bottom-0 left-8 w-px bg-red-400/50" />
      <div className="absolute top-0 bottom-0 left-9 w-px bg-red-400/50" />
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
  const [code, setCode] = useState([0, 0, 0, 0]);
  const [currentImage, setCurrentImage] = useState(0);
  const images = ['1.png', '2.png'];

  const frontRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleDigitChange = (e: React.MouseEvent, index: number, delta: number) => {
    e.stopPropagation();
    if (isBurst) return;
    
    // Play a tiny click sound for the dial
    const clickAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
    clickAudio.volume = 0.2;
    clickAudio.play().catch(() => {});

    const newCode = [...code];
    newCode[index] = (newCode[index] + delta + 10) % 10;
    setCode(newCode);

    // Subtle jiggle on click
    if (frontRef.current) {
      gsap.killTweensOf(frontRef.current);
      gsap.fromTo(
        frontRef.current,
        { x: (Math.random() - 0.5) * 4, y: (Math.random() - 0.5) * 4 },
        { x: 0, y: 0, duration: 0.2, ease: 'power2.out' }
      );
    }
  };

  useEffect(() => {
    if (code.join('') === CORRECT_PASSWORD && !isBurst) {
      setIsBurst(true);
      triggerBurst();
    }
  }, [code, isBurst]);

  const triggerBurst = () => {
    // 1. Play massive celebration sounds
    // Achievement/Success sound
    const audioWin = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
    audioWin.volume = 0.7;
    audioWin.play().catch(() => {});
    
    // Party Popper sound
    setTimeout(() => {
        const audioPop = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');
        audioPop.volume = 1.0;
        audioPop.play().catch(() => {});
    }, 200);

    // 2. Confetti Cannons from BOTH sides continuously
    const duration = 4000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({ particleCount: 8, angle: 60, spread: 55, origin: { x: 0, y: 0.8 }, colors: ['#f43f5e', '#ec4899', '#ffffff', '#fbbf24'] });
      confetti({ particleCount: 8, angle: 120, spread: 55, origin: { x: 1, y: 0.8 }, colors: ['#f43f5e', '#ec4899', '#ffffff', '#fbbf24'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();

    // Big center burst
    confetti({ particleCount: 250, spread: 160, origin: { y: 0.5 }, colors: ['#f43f5e', '#ec4899', '#ffffff', '#fbbf24', '#fcd34d'], zIndex: 100 });

    // 3. Shatter the Safe (animate the oblique faces away)
    if (frontRef.current) gsap.to(frontRef.current, { x: -400, y: 500, rotationZ: -45, opacity: 0, duration: 1.2, ease: 'power3.in' });
    if (topRef.current) gsap.to(topRef.current, { x: 0, y: -500, rotationZ: 45, opacity: 0, duration: 1.2, ease: 'power3.in' });
    if (rightRef.current) gsap.to(rightRef.current, { x: 500, y: 200, rotationZ: 60, opacity: 0, duration: 1.2, ease: 'power3.in' });
    
    // Panel flies off separately
    if (panelRef.current) gsap.to(panelRef.current, { x: -200, y: 600, rotationZ: -90, opacity: 0, duration: 1.0, ease: 'power3.in' });
    
    gsap.to('.box-shadow', { opacity: 0, scale: 0, duration: 0.5 });
  };

  // Safe Dimensions
  const W = 320; // Width of front face
  const H = 280; // Height of front face
  const D = 140; // Depth (for oblique projection)

  return (
    <div className="min-h-screen bg-white relative font-sans flex items-center justify-center overflow-hidden w-full">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="w-[60vw] h-[60vw] bg-pink-100/60 blur-[140px] rounded-full absolute -top-20 -left-20" />
        <div className="w-[50vw] h-[50vw] bg-blue-100/50 blur-[140px] rounded-full absolute bottom-0 right-0" />
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-12 sm:gap-24 w-full max-w-7xl mx-auto px-4 sm:px-8 z-20 mt-12 lg:mt-0">
        <MagicNote />

        {/* ─── 2.5D OBLIQUE SAFE SCENE ─── */}
        <div className="scale-[0.65] sm:scale-[0.8] lg:scale-100 origin-center transition-transform -mt-16 sm:-mt-8 lg:mt-0">
          <div
            className={`relative flex-shrink-0 transition-all duration-1000 ${isBurst ? 'z-50' : 'z-20'}`}
            style={{ width: W + D, height: H + D }}
          >
          {/* Drop shadow on the floor */}
          <div
            className="box-shadow absolute bg-black/20 blur-xl rounded-full pointer-events-none"
            style={{ left: D/2, top: D + H - 20, width: W, height: 60 }}
          />

          {/* Gift Image Gallery — appears from behind the front face after unlock */}
          <div className="absolute z-50 flex items-center justify-center pointer-events-none" style={{ left: 0, top: D - 60, width: W, height: H }}>
            <AnimatePresence>
              {isBurst && (
                <motion.div
                  initial={{ scale: 0, y: 100, opacity: 0 }}
                  animate={{ scale: 1, y: -20, opacity: 1 }}
                  transition={{ type: 'spring', bounce: 0.4, duration: 1.2, delay: 0.2 }}
                  className="relative group cursor-pointer pointer-events-auto"
                >
                  <div className="relative p-3 sm:p-5 bg-white rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.4)] border-4 border-slate-50 hover:-translate-y-2 hover:shadow-[0_40px_80px_rgba(0,0,0,0.6)] transition-all duration-300 group/gallery">
                    <img
                      src={`${import.meta.env.BASE_URL}${images[currentImage]}`}
                      alt="A magical gift for you"
                      className="w-[90vw] max-w-[500px] sm:max-w-[650px] lg:max-w-[800px] xl:max-w-[900px] h-auto max-h-[75vh] rounded-xl object-contain transition-opacity duration-300"
                    />
                    
                    {/* Navigation Arrows */}
                    {currentImage > 0 && (
                      <button onClick={(e) => { e.preventDefault(); setCurrentImage(prev => prev - 1); }} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/60 text-white rounded-full backdrop-blur-sm transition-all shadow-lg z-10 opacity-0 group-hover/gallery:opacity-100">
                         <ChevronLeft size={36} />
                      </button>
                    )}
                    {currentImage < images.length - 1 && (
                      <button onClick={(e) => { e.preventDefault(); setCurrentImage(prev => prev + 1); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/60 text-white rounded-full backdrop-blur-sm transition-all shadow-lg z-10 opacity-0 group-hover/gallery:opacity-100">
                         <ChevronRight size={36} />
                      </button>
                    )}

                    <a href={`${import.meta.env.BASE_URL}${images[currentImage]}`} download={images[currentImage]} className="block text-center mt-4">
                      <p className="mb-2 text-rose-500 font-bold animate-pulse text-xl sm:text-3xl hover:text-rose-600 transition-colors" style={{ fontFamily: "'Caveat', cursive" }}>
                         ✨ Click here to claim and download! ✨
                      </p>
                    </a>

                    <Sparkles className="absolute -top-8 -right-8 text-amber-400 w-16 h-16 animate-pulse pointer-events-none" />
                    <Sparkles className="absolute -bottom-6 -left-6 text-rose-400 w-12 h-12 animate-pulse pointer-events-none" style={{ animationDelay: '200ms' }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── SAFE TOP FACE ── */}
          <div
            ref={topRef}
            className="absolute z-20 rounded-sm overflow-hidden"
            style={{
              left: 0, top: 0, width: W, height: D,
              transformOrigin: 'bottom left',
              transform: 'skewX(-45deg)',
              background: 'linear-gradient(135deg, #d1d5db, #9ca3af)',
              border: '2px solid #6b7280',
              borderBottom: 'none',
              borderRight: 'none',
            }}
          >
             <div className="absolute inset-0 opacity-5 pointer-events-none mix-blend-multiply" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, black 2px, black 4px)' }} />
             <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]" />
          </div>

          {/* ── SAFE RIGHT FACE ── */}
          <div
            ref={rightRef}
            className="absolute z-10 rounded-sm overflow-hidden"
            style={{
              left: W, top: D, width: D, height: H,
              transformOrigin: 'top left',
              transform: 'skewY(-45deg)',
              background: 'linear-gradient(135deg, #6b7280, #374151)',
              border: '2px solid #4b5563',
              borderLeft: 'none',
              borderTop: 'none',
            }}
          >
             <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-multiply" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, black 2px, black 4px)' }} />
             <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]" />
          </div>

          {/* ── SAFE FRONT FACE ── */}
          <div
            ref={frontRef}
            className="absolute z-30 flex items-center justify-center rounded-sm overflow-hidden"
            style={{
              left: 0, top: D, width: W, height: H,
              background: 'linear-gradient(135deg, #9ca3af, #6b7280)',
              border: '2px solid #4b5563',
              boxShadow: 'inset 0 0 40px rgba(0,0,0,0.3), -10px 10px 20px rgba(0,0,0,0.4)',
            }}
          >
            {/* Brushed metal pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-multiply" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, black 2px, black 4px)' }} />
            
            {/* Frame lines */}
            <div className="absolute inset-3 border-2 border-slate-500/50 rounded pointer-events-none" />

            {/* Rivets */}
            {['top-4 left-4', 'top-4 right-4', 'bottom-4 left-4', 'bottom-4 right-4'].map((pos) => (
              <div key={pos} className={`absolute ${pos} w-4 h-4 rounded-full bg-slate-300 shadow-[inset_1px_1px_3px_white,_2px_2px_5px_rgba(0,0,0,0.6)]`} />
            ))}

            {/* ── THE DIAL PANEL ── */}
            <div ref={panelRef} className="relative w-[85%] h-[55%] bg-[#0f172a] rounded-xl shadow-[inset_0_10px_30px_rgba(0,0,0,1),_0_10px_20px_rgba(0,0,0,0.6)] border border-slate-700 flex items-center justify-center pointer-events-auto">
               
               {/* Dials */}
               <div className="flex gap-4">
                 {code.map((num, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <button onClick={(e) => handleDigitChange(e, idx, 1)} className="text-slate-400 hover:text-white pb-1 disabled:opacity-30" disabled={isBurst}>
                         <ChevronUp size={24} strokeWidth={3} />
                      </button>
                      <div className="relative w-12 h-16 bg-gradient-to-b from-slate-200 via-slate-100 to-slate-300 rounded shadow-[inset_0_3px_8px_rgba(0,0,0,0.5),_0_2px_5px_rgba(0,0,0,0.8)] text-center leading-[64px] font-mono font-bold text-slate-800 text-3xl overflow-hidden border border-slate-400">
                        <div className="absolute top-1/2 left-0 w-full h-px bg-black/20 shadow-[0_1px_0_rgba(255,255,255,0.8)]" />
                        <AnimatePresence mode="popLayout">
                          <motion.span
                            key={num}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="block"
                          >
                            {num}
                          </motion.span>
                        </AnimatePresence>
                      </div>
                      <button onClick={(e) => handleDigitChange(e, idx, -1)} className="text-slate-400 hover:text-white pt-1 disabled:opacity-30" disabled={isBurst}>
                         <ChevronDown size={24} strokeWidth={3} />
                      </button>
                    </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
        </div>

      </div>
    </div>
  );
}
