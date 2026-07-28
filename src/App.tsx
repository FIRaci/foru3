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

const CORRECT_PASSWORD = [2, 8, 0, 4];

export default function App() {
  const [wordIndex, setWordIndex] = useState(0);
  const [code, setCode] = useState([0, 0, 0, 0]);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const lidRef = useRef<HTMLDivElement>(null);
  const giftRef = useRef<HTMLDivElement>(null);
  const lockRef = useRef<HTMLDivElement>(null);
  const boxContainerRef = useRef<HTMLDivElement>(null);

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
      // 3. Shake the whole box slightly before opening
      .to(boxContainerRef.current, {
        rotateX: -10,
        rotateY: 20,
        duration: 0.1,
        yoyo: true,
        repeat: 3,
      })
      // Reset rotation back to isometric
      .to(boxContainerRef.current, {
        rotateX: -15,
        rotateY: -25,
        duration: 0.2,
      })
      // 4. Lid opens (rotates backwards like a hinge)
      .to(lidRef.current, {
        rotateX: 110, // open backwards
        duration: 1.2,
        ease: 'power3.inOut',
      })
      // 5. Gift pops out from inside
      .to(
        giftRef.current,
        {
          scale: 1,
          opacity: 1,
          y: -80,
          rotateY: 360,
          duration: 1.8,
          ease: 'elastic.out(1, 0.5)',
        },
        '-=0.8'
      );

    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#f43f5e', '#ec4899', '#fde047'],
        zIndex: 100,
      });
    }, 1200);
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

  // 3D CSS values for the box
  // Size: 240px wide, 240px deep, 180px high
  const w = 240, d = 240, h = 180;
  // Lid: 250px wide, 250px deep, 40px high
  const lw = 250, ld = 250, lh = 50;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 lg:p-12 font-sans overflow-hidden relative">
      
      {/* Background ambient elements */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0">
        <div className="w-[60vw] h-[60vw] bg-pink-100/40 blur-[120px] rounded-full absolute -top-20 -left-20" />
        <div className="w-[50vw] h-[50vw] bg-blue-100/40 blur-[120px] rounded-full absolute bottom-0 right-0" />
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-32 w-full max-w-6xl z-10">
        
        {/* ─── MAGIC PAPER ─────────────────────────────────────────────────── */}
        <div
          className="relative w-full max-w-[380px] aspect-[3/4] bg-[#fcf9f2] border border-[#e3dac9] rounded-sm p-10 lg:p-12 flex flex-col justify-center"
          style={{
            boxShadow:
              '2px 4px 16px rgba(0,0,0,0.08), inset 0 0 100px rgba(180,160,120,0.1)',
            transform: 'rotate(-2deg)',
          }}
        >
          {/* Paper texture overlay (subtle noise) */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")',
            }}
          />
          {/* Paper lines */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #64748b 31px, #64748b 32px)',
              backgroundPosition: '0 40px',
            }}
          />

          <div
            className="relative z-10 text-slate-800 flex flex-col items-center text-center"
            style={{ 
              fontFamily: "'Homemade Apple', cursive", 
              fontSize: '1.8rem', 
              lineHeight: '1.8',
              textShadow: '0.5px 0.5px 1px rgba(0,0,0,0.1)'
            }}
          >
            <p className="whitespace-nowrap -ml-2">The password is</p>
            <p className="whitespace-nowrap ml-4">day of birth of</p>
            <p className="whitespace-nowrap -ml-6">the most</p>
            
            <div className="h-16 w-full flex justify-center relative my-4">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={wordIndex}
                  initial={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', color: '#be185d' }}
                  exit={{ opacity: 0, scale: 1.1, filter: 'blur(4px)' }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="absolute text-5xl lg:text-6xl font-bold tracking-wide"
                  style={{ fontFamily: "'Cedarville Cursive', cursive", transform: 'rotate(-5deg)' }}
                >
                  {WORDS[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
            
            <p className="mt-2 ml-2">girl in this world.</p>
          </div>
        </div>

        {/* ─── 3D PUZZLE BOX ──────────────────────────────────────────────────── */}
        <div 
          className="relative w-80 h-96 flex items-center justify-center perspective-[1200px]"
          style={{ perspective: '1200px' }}
        >
          {/* 3D Scene Container */}
          <div 
            ref={boxContainerRef}
            className="relative transform-style-3d transition-transform duration-500 ease-out"
            style={{ 
              width: w, height: h, 
              transformStyle: 'preserve-3d',
              transform: 'rotateX(-15deg) rotateY(-25deg)',
            }}
          >
            
            {/* --- BOX BODY --- */}
            {/* Front */}
            <div className="absolute border border-slate-700 bg-gradient-to-br from-slate-700 to-slate-900 shadow-2xl flex items-center justify-center"
                 style={{ width: w, height: h, transform: `translateZ(${d/2}px)` }}>
                 
              {/* Dials UI embedded in front face */}
              <div 
                className="bg-slate-950 p-3 rounded-lg flex gap-2 items-center"
                style={{ 
                  boxShadow: 'inset 0 10px 20px rgba(0,0,0,0.8), 0 2px 0 rgba(255,255,255,0.1)',
                  transform: 'translateZ(1px)' // push slightly out
                }}
              >
                {code.map((num, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <button 
                      onClick={() => handleDial(idx, 1)}
                      className="text-slate-500 hover:text-amber-400 transition-colors p-1"
                      disabled={isUnlocked}
                    >
                      <ChevronUp size={20} strokeWidth={3} />
                    </button>
                    <div className="w-10 h-14 bg-gradient-to-b from-slate-200 via-white to-slate-300 rounded border border-slate-700 shadow-md flex items-center justify-center overflow-hidden">
                      <AnimatePresence mode="popLayout">
                        <motion.span
                          key={num}
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -20, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="text-2xl font-black font-mono text-slate-800"
                        >
                          {num}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                    <button 
                      onClick={() => handleDial(idx, -1)}
                      className="text-slate-500 hover:text-amber-400 transition-colors p-1"
                      disabled={isUnlocked}
                    >
                      <ChevronDown size={20} strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Back */}
            <div className="absolute border border-slate-800 bg-slate-900"
                 style={{ width: w, height: h, transform: `translateZ(${-d/2}px) rotateY(180deg)` }} />
            
            {/* Right */}
            <div className="absolute border border-slate-800 bg-gradient-to-bl from-slate-800 to-slate-950"
                 style={{ width: d, height: h, transform: `translateX(${w/2 - d/2}px) translateZ(0) rotateY(90deg)` }} />
            
            {/* Left */}
            <div className="absolute border border-slate-700 bg-gradient-to-br from-slate-600 to-slate-800"
                 style={{ width: d, height: h, transform: `translateX(${-w/2 + d/2}px) translateZ(0) rotateY(-90deg)` }} />
            
            {/* Bottom */}
            <div className="absolute border border-slate-900 bg-slate-950 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
                 style={{ width: w, height: d, transform: `translateY(${h/2 - d/2}px) translateZ(0) rotateX(-90deg)` }} />
            
            {/* Top (Inside floor of the box) */}
            <div className="absolute border border-slate-900 bg-slate-900"
                 style={{ width: w, height: d, transform: `translateY(${-h/2 + d/2}px) translateZ(0) rotateX(90deg)` }} />
                 
            {/* The Gift inside (hidden initially inside the box) */}
            <div 
              ref={giftRef}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ 
                transformStyle: 'preserve-3d',
                scale: 0.2, 
                opacity: 0, 
                pointerEvents: isUnlocked ? 'auto' : 'none',
                // Keep the image facing the camera despite box rotation by reversing the box rotation
                transform: `translate(-50%, -50%) translateZ(0px) rotateX(15deg) rotateY(25deg)` 
              }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400/40 blur-2xl rounded-full scale-150" />
                <img 
                  src="/A gift.png" 
                  alt="A magical gift" 
                  className="w-56 h-56 object-contain filter drop-shadow-[0_0_30px_rgba(250,204,21,0.6)] relative z-10" 
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop'; }}
                />
                
                {/* Sparkles effect behind gift */}
                <div className="absolute inset-0 pointer-events-none">
                  {isUnlocked && Array.from({ length: 12 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute text-yellow-300"
                      style={{ 
                        left: `${50 + (Math.random() - 0.5) * 150}%`, 
                        top: `${50 + (Math.random() - 0.5) * 150}%` 
                      }}
                      animate={{ 
                        y: [0, -30, 0], 
                        opacity: [0, 1, 0], 
                        scale: [0.5, 1.2, 0.5], 
                        rotate: [0, 180] 
                      }}
                      transition={{ 
                        duration: 1.5 + Math.random() * 1.5, 
                        repeat: Infinity, 
                        delay: Math.random() 
                      }}
                    >
                      <Sparkles size={12 + Math.random() * 20} />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* --- BOX LID --- */}
            <div 
              ref={lidRef}
              className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[25px]" // Hinge at the top back
              style={{ 
                width: lw, height: lh,
                transformStyle: 'preserve-3d',
                transformOrigin: `50% 50% ${-ld/2}px`, // hinge at the back edge
              }}
            >
              {/* Lid Top */}
              <div className="absolute border border-slate-600 bg-gradient-to-br from-slate-600 to-slate-800 shadow-md"
                   style={{ width: lw, height: ld, transform: `translateY(${-lh/2 + ld/2}px) translateZ(0) rotateX(90deg)` }}>
                {/* Decoration lines on lid */}
                <div className="absolute inset-4 border-2 border-slate-700/50 rounded-sm" />
              </div>
              
              {/* Lid Bottom (Inner lid) */}
              <div className="absolute border border-slate-900 bg-slate-900"
                   style={{ width: lw, height: ld, transform: `translateY(${lh/2 - ld/2}px) translateZ(0) rotateX(-90deg)` }} />
                   
              {/* Lid Front */}
              <div className="absolute border border-slate-600 bg-gradient-to-b from-slate-600 to-slate-800 flex items-center justify-center"
                   style={{ width: lw, height: lh, transform: `translateZ(${ld/2}px)` }}>
                 {/* Lock Mechanism (Hangs on front of lid) */}
                 <div 
                   ref={lockRef}
                   className="absolute -bottom-8 w-16 h-16 bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 rounded-full flex items-center justify-center text-slate-900 border-[3px] border-amber-800 shadow-[0_10px_20px_rgba(0,0,0,0.5),_inset_0_2px_5px_rgba(255,255,255,0.6)] z-50"
                   style={{ transform: 'translateZ(2px)' }}
                 >
                   <div className="absolute inset-1 rounded-full border border-amber-300/50" />
                   {isUnlocked ? <Unlock size={24} strokeWidth={2.5} /> : <Lock size={24} strokeWidth={2.5} />}
                 </div>
              </div>
              
              {/* Lid Back */}
              <div className="absolute border border-slate-800 bg-slate-900"
                   style={{ width: lw, height: lh, transform: `translateZ(${-ld/2}px) rotateY(180deg)` }} />
                   
              {/* Lid Right */}
              <div className="absolute border border-slate-700 bg-gradient-to-bl from-slate-700 to-slate-900"
                   style={{ width: ld, height: lh, transform: `translateX(${lw/2 - ld/2}px) translateZ(0) rotateY(90deg)` }} />
                   
              {/* Lid Left */}
              <div className="absolute border border-slate-600 bg-gradient-to-br from-slate-500 to-slate-700"
                   style={{ width: ld, height: lh, transform: `translateX(${-lw/2 + ld/2}px) translateZ(0) rotateY(-90deg)` }} />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
