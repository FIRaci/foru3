import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { ChevronUp, ChevronDown, Lock, Unlock, Sparkles } from 'lucide-react';

const WORDS = [
  'beautiful',
  'gorgeous',
  'elegant',
  'cutest',
  'stunning',
  'charming',
  'precious',
  'angelic',
];

const CORRECT_PASSWORD = [1, 5, 0, 8];

export default function App() {
  const [wordIndex, setWordIndex] = useState(0);
  const [code, setCode] = useState([0, 0, 0, 0]);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const boxRef = useRef<HTMLDivElement>(null);
  const lidRef = useRef<HTMLDivElement>(null);
  const giftRef = useRef<HTMLDivElement>(null);
  const lockRef = useRef<HTMLDivElement>(null);

  // Magic word interval
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % WORDS.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Check password
  useEffect(() => {
    if (code.join('') === CORRECT_PASSWORD.join('') && !isUnlocked) {
      setIsUnlocked(true);
      triggerUnlockAnimation();
    }
  }, [code, isUnlocked]);

  const triggerUnlockAnimation = () => {
    const tl = gsap.timeline();

    // 1. Shake the lock
    tl.to(lockRef.current, {
      x: 3,
      duration: 0.05,
      yoyo: true,
      repeat: 6,
    })
      // 2. Lock turns green & pops
      .to(lockRef.current, {
        scale: 1.1,
        color: '#10b981',
        duration: 0.2,
      })
      .to(lockRef.current, {
        scale: 0,
        opacity: 0,
        duration: 0.4,
        ease: 'back.in(1.5)',
      })
      // 3. Lid opens
      .to(lidRef.current, {
        y: -150,
        opacity: 0,
        rotate: -5,
        duration: 1.2,
        ease: 'power3.inOut',
      })
      // 4. Gift pops out
      .to(
        giftRef.current,
        {
          scale: 1,
          opacity: 1,
          y: -40,
          duration: 1.5,
          ease: 'elastic.out(1, 0.5)',
        },
        '-=0.6'
      );

    setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#ec4899', '#fde047'],
      });
    }, 1000);
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

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 lg:p-12 font-sans overflow-hidden relative">
      
      {/* Background ambient elements */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <div className="w-[60vw] h-[60vw] bg-pink-100/40 blur-[120px] rounded-full absolute -top-20 -left-20" />
        <div className="w-[50vw] h-[50vw] bg-blue-100/40 blur-[120px] rounded-full absolute bottom-0 right-0" />
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-32 w-full max-w-6xl z-10">
        
        {/* ─── MAGIC PAPER ─────────────────────────────────────────────────── */}
        <div
          className="relative w-full max-w-[360px] aspect-[3/4] bg-[#fcfaf2] border border-[#e8e4d3] rounded-sm p-10 lg:p-12 flex flex-col justify-center"
          style={{
            boxShadow:
              '2px 4px 16px rgba(0,0,0,0.06), inset 0 0 80px rgba(0,0,0,0.02)',
            transform: 'rotate(-2deg)',
          }}
        >
          {/* Paper lines overlay */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #94a3b8 31px, #94a3b8 32px)',
              backgroundPosition: '0 40px',
            }}
          />

          <div
            className="relative z-10 text-slate-700 font-medium flex flex-col items-center text-center"
            style={{ fontFamily: "'Caveat', cursive", fontSize: '2.5rem', lineHeight: '1.4' }}
          >
            <p>The password is</p>
            <p>day of birth of</p>
            <p>the most</p>
            
            <div className="h-16 w-full flex justify-center relative my-1">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={wordIndex}
                  initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)', color: '#e11d48' }}
                  exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="absolute text-5xl lg:text-6xl font-bold tracking-wide"
                >
                  {WORDS[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
            
            <p className="mt-2">girl in this world.</p>
          </div>
        </div>

        {/* ─── PUZZLE BOX ──────────────────────────────────────────────────── */}
        <div className="relative flex flex-col items-center justify-center">
          
          <div ref={boxRef} className="relative w-72 h-80 lg:w-80 lg:h-96">
            
            {/* Box Body */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-[60%] rounded-xl border border-slate-700 bg-gradient-to-b from-slate-800 to-slate-900 shadow-2xl flex items-center justify-center z-10"
              style={{
                boxShadow: '0 20px 40px rgba(0,0,0,0.3), inset 0 2px 0 rgba(255,255,255,0.1)'
              }}
            >
              {/* Dials UI */}
              <div 
                className="bg-slate-950 p-4 rounded-lg flex gap-3 items-center"
                style={{ boxShadow: 'inset 0 10px 20px rgba(0,0,0,0.5)' }}
              >
                {code.map((num, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <button 
                      onClick={() => handleDial(idx, 1)}
                      className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                      disabled={isUnlocked}
                    >
                      <ChevronUp size={24} />
                    </button>
                    <div className="w-12 h-16 bg-gradient-to-b from-slate-200 via-white to-slate-300 rounded border-2 border-slate-700 shadow-md flex items-center justify-center overflow-hidden">
                      <AnimatePresence mode="popLayout">
                        <motion.span
                          key={num}
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -20, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-3xl font-bold font-mono text-slate-800"
                        >
                          {num}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                    <button 
                      onClick={() => handleDial(idx, -1)}
                      className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                      disabled={isUnlocked}
                    >
                      <ChevronDown size={24} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Box Lid */}
            <div 
              ref={lidRef}
              className="absolute top-0 left-0 right-0 h-[45%] rounded-xl border border-slate-700 bg-gradient-to-b from-slate-700 to-slate-800 shadow-xl z-30 flex justify-center"
              style={{
                boxShadow: '0 10px 30px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.15)'
              }}
            >
              {/* Lock Icon */}
              <div 
                ref={lockRef}
                className="absolute -bottom-8 w-16 h-16 bg-gradient-to-br from-amber-300 to-amber-500 rounded-full flex items-center justify-center text-slate-900 border-4 border-slate-800 shadow-lg"
              >
                {isUnlocked ? <Unlock size={28} strokeWidth={2.5} /> : <Lock size={28} strokeWidth={2.5} />}
              </div>
            </div>

            {/* The Gift inside (hidden initially) */}
            <div 
              ref={giftRef}
              className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20"
              style={{ scale: 0.5, opacity: 0, pointerEvents: isUnlocked ? 'auto' : 'none' }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full" />
                <img 
                  src="/A gift.png" 
                  alt="A magical gift" 
                  className="w-48 h-48 object-contain filter drop-shadow-2xl relative z-10" 
                />
                
                {/* Sparkles effect behind gift */}
                <div className="absolute inset-0 pointer-events-none">
                  {isUnlocked && Array.from({ length: 8 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute text-yellow-500"
                      style={{ 
                        left: `${50 + (Math.random() - 0.5) * 120}%`, 
                        top: `${50 + (Math.random() - 0.5) * 120}%` 
                      }}
                      animate={{ 
                        y: [0, -10, 0], 
                        opacity: [0, 1, 0], 
                        scale: [0.5, 1, 0.5], 
                        rotate: [0, 90] 
                      }}
                      transition={{ 
                        duration: 1.5 + Math.random(), 
                        repeat: Infinity, 
                        delay: Math.random() 
                      }}
                    >
                      <Sparkles size={16 + Math.random() * 12} />
                    </motion.div>
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
