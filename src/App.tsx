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

  const lidRef = useRef<HTMLDivElement>(null);
  const giftRef = useRef<HTMLDivElement>(null);
  const lockRef = useRef<HTMLButtonElement>(null);
  const boxContainerRef = useRef<HTMLDivElement>(null);

  // Magic word interval
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % WORDS.length);
    }, 1800); // Slightly longer for the longer phrases
    return () => clearInterval(interval);
  }, []);

  const handleLockClick = () => {
    if (isUnlocked) return;
    
    // Play a tiny click animation on the button itself
    gsap.fromTo(lockRef.current, { scale: 0.9 }, { scale: 1, duration: 0.1 });

    if (code.join('') === CORRECT_PASSWORD.join('')) {
      setIsUnlocked(true);
      triggerUnlockAnimation();
    } else {
      // Wrong password animation (Shake and flash red)
      gsap.fromTo(lockRef.current, 
        { x: -5, rotate: -10 },
        { 
          x: 5, rotate: 10, 
          duration: 0.05, 
          yoyo: true, 
          repeat: 7, 
          ease: "power1.inOut",
          onComplete: () => {
            gsap.set(lockRef.current, { x: 0, rotate: 0 });
          }
        }
      );
      
      // Flash red color
      gsap.to(lockRef.current, {
        backgroundColor: '#dc2626', // red-600
        borderColor: '#991b1b',
        boxShadow: '0 0 20px rgba(220, 38, 38, 0.8)',
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          gsap.set(lockRef.current, { clearProps: 'backgroundColor,borderColor,boxShadow' });
        }
      });
    }
  };

  const triggerUnlockAnimation = () => {
    const tl = gsap.timeline();

    // 1. Lock turns green & pops
    tl.to(lockRef.current, {
      scale: 1.15,
      backgroundColor: '#10b981',
      borderColor: '#059669',
      boxShadow: '0 0 30px rgba(16,185,129,0.8), inset 0 2px 5px rgba(255,255,255,0.6)',
      duration: 0.2,
    })
    .to(lockRef.current, {
      scale: 0,
      opacity: 0,
      duration: 0.4,
      ease: 'back.in(1.5)',
    })
    // 2. Shake the whole box slightly with glowing effects
    .to(boxContainerRef.current, {
      x: 4,
      duration: 0.05,
      yoyo: true,
      repeat: 4,
    }, "-=0.2")
    // Reset rotation back to center for dramatic effect
    .to(boxContainerRef.current, {
      rotateX: -10,
      rotateY: -20,
      duration: 0.5,
    }, "-=0.2")
    // 3. Lid opens backwards (hinge at the back)
    .to(lidRef.current, {
      rotateX: 115,
      duration: 1.5,
      ease: 'power3.inOut',
    })
    // 4. Gift pops out from inside
    .to(
      giftRef.current,
      {
        scale: 1.2, // slightly bigger
        opacity: 1,
        y: -100, // Move up out of the box
        rotateY: 720, // Spin multiple times
        duration: 2.5,
        ease: 'elastic.out(1, 0.6)',
      },
      '-=1'
    );

    setTimeout(() => {
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.5 },
        colors: ['#f43f5e', '#ec4899', '#fde047', '#3b82f6', '#10b981'],
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

  // Remove mouse parallax, just keep a static beautiful angle
  // 3D CSS values for the box body (Cube)
  const w = 260, h = 160, d = 220;
  // Lid overlaps slightly
  const lw = 270, lh = 30, ld = 230;

  return (
    <div 
      className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans overflow-hidden relative"
    >
      {/* Ambient background light */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0">
        <div className="w-[60vw] h-[60vw] bg-pink-100/50 blur-[120px] rounded-full absolute -top-20 -left-20" />
        <div className="w-[50vw] h-[50vw] bg-blue-100/50 blur-[120px] rounded-full absolute bottom-0 right-0" />
        <div className="w-[40vw] h-[40vw] bg-yellow-100/30 blur-[100px] rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-20 lg:gap-32 w-full max-w-6xl z-10 px-4">
        
        {/* ─── MAGIC PAPER ─────────────────────────────────────────────────── */}
        <div
          className="relative w-full max-w-[360px] lg:max-w-[400px] aspect-[3/4] bg-[#fcf9f2] border border-[#e3dac9] rounded-sm p-8 lg:p-12 flex flex-col justify-center"
          style={{
            boxShadow:
              '4px 8px 24px rgba(0,0,0,0.1), inset 0 0 120px rgba(180,160,120,0.12)',
            transform: 'rotate(-3deg)',
          }}
        >
          {/* Paper texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-multiply"
            style={{
              backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")',
            }}
          />
          {/* Paper lines */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #64748b 31px, #64748b 32px)',
              backgroundPosition: '0 40px',
            }}
          />

          <div
            className="relative z-10 text-slate-800 flex flex-col items-center text-center"
            style={{ 
              fontFamily: "'Homemade Apple', cursive", 
              fontSize: '1.6rem', 
              lineHeight: '1.8',
              textShadow: '0.5px 0.5px 1px rgba(0,0,0,0.05)'
            }}
          >
            <p className="whitespace-nowrap -ml-4">The password is</p>
            <p className="whitespace-nowrap ml-6">day of birth of</p>
            <p className="whitespace-nowrap -ml-8">the most</p>
            
            <div className="h-20 w-full flex justify-center relative my-4">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={wordIndex}
                  initial={{ opacity: 0, scale: 0.8, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', color: '#be185d' }}
                  exit={{ opacity: 0, scale: 1.1, filter: 'blur(8px)' }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className="absolute text-5xl font-bold tracking-wider pt-2 whitespace-nowrap"
                  style={{ fontFamily: "'Cedarville Cursive', cursive", transform: 'rotate(-5deg)' }}
                >
                  {WORDS[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
            
            <p className="mt-2 ml-4">girl in this world.</p>
          </div>
        </div>

        {/* ─── 3D PUZZLE BOX ──────────────────────────────────────────────────── */}
        <div 
          className="relative flex items-center justify-center perspective-[1500px]"
          style={{ width: w + 100, height: h + 200, perspective: '1500px' }}
        >
          {/* 3D Scene Container */}
          <div 
            ref={boxContainerRef}
            className="relative"
            style={{ 
              width: w, height: h, 
              transformStyle: 'preserve-3d',
              transform: 'rotateX(-15deg) rotateY(-25deg)',
            }}
          >
            
            {/* ================= BOX BODY ================= */}
            
            {/* Bottom (Inner Floor) */}
            <div className="absolute left-1/2 top-1/2 bg-slate-950 shadow-[0_0_100px_rgba(0,0,0,0.8)]"
                 style={{ 
                   width: w, height: d, 
                   transform: `translate(-50%, -50%) translateY(${h/2}px) rotateX(-90deg)`,
                   border: '2px solid rgba(250,204,21,0.2)',
                 }} />
            
            {/* Top (Open Opening) */}
            <div className="absolute left-1/2 top-1/2 border-4 border-amber-500/50 bg-slate-900/90"
                 style={{ 
                   width: w, height: d, 
                   transform: `translate(-50%, -50%) translateY(${-h/2}px) rotateX(90deg)`,
                   boxShadow: 'inset 0 0 80px rgba(0,0,0,1)'
                 }} />

            {/* Back */}
            <div className="absolute left-1/2 top-1/2 bg-gradient-to-t from-slate-950 to-slate-800"
                 style={{ 
                   width: w, height: h, 
                   transform: `translate(-50%, -50%) translateZ(${-d/2}px) rotateY(180deg)`,
                   border: '1px solid rgba(250,204,21,0.3)',
                 }} />
            
            {/* Right */}
            <div className="absolute left-1/2 top-1/2 bg-gradient-to-bl from-slate-800 to-slate-950"
                 style={{ 
                   width: d, height: h, 
                   transform: `translate(-50%, -50%) translateX(${w/2}px) rotateY(90deg)`,
                   border: '1px solid rgba(250,204,21,0.3)',
                 }} />
            
            {/* Left */}
            <div className="absolute left-1/2 top-1/2 bg-gradient-to-br from-slate-700 to-slate-900"
                 style={{ 
                   width: d, height: h, 
                   transform: `translate(-50%, -50%) translateX(${-w/2}px) rotateY(-90deg)`,
                   border: '1px solid rgba(250,204,21,0.3)',
                   boxShadow: 'inset -20px 0 50px rgba(0,0,0,0.5)'
                 }} />
            
            {/* Front */}
            <div className="absolute left-1/2 top-1/2 bg-gradient-to-b from-slate-800 to-slate-950 flex flex-col items-center justify-center z-10"
                 style={{ 
                   width: w, height: h, 
                   transform: `translate(-50%, -50%) translateZ(${d/2}px)`,
                   border: '1px solid rgba(250,204,21,0.4)',
                   boxShadow: '0 40px 80px rgba(0,0,0,0.6), inset 0 0 30px rgba(250,204,21,0.1)'
                 }}>
              
              {/* Luxury Frame Trim */}
              <div className="absolute inset-2 border-2 border-amber-500/30 rounded-sm" style={{ boxShadow: 'inset 0 0 10px rgba(250,204,21,0.2)' }} />
              
              {/* Mechanical Dials Container */}
              <div 
                className="bg-slate-900 p-4 rounded-xl flex gap-3 items-center relative z-20 border border-slate-700"
                style={{ 
                  boxShadow: 'inset 0 20px 40px rgba(0,0,0,1), 0 2px 0 rgba(255,255,255,0.1), 0 0 15px rgba(0,0,0,0.8)',
                  transform: 'translateZ(5px)' // push out to avoid z-fighting and look 3D
                }}
              >
                {code.map((num, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1.5">
                    <button 
                      onClick={() => handleDial(idx, 1)}
                      className="text-slate-500 hover:text-amber-400 active:text-amber-300 transition-colors p-1"
                      disabled={isUnlocked}
                    >
                      <ChevronUp size={20} strokeWidth={4} />
                    </button>
                    
                    {/* The Metallic Wheel */}
                    <div className="w-12 h-16 bg-gradient-to-b from-slate-400 via-slate-100 to-slate-500 rounded border-[2px] border-slate-800 shadow-[0_4px_10px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden relative">
                      {/* Inner wheel shadow for depth */}
                      <div className="absolute inset-0 shadow-[inset_0_8px_15px_rgba(0,0,0,0.6),_inset_0_-8px_15px_rgba(0,0,0,0.6)] pointer-events-none rounded z-10" />
                      
                      <AnimatePresence mode="popLayout">
                        <motion.span
                          key={num}
                          initial={{ y: 25, opacity: 0, rotateX: -45 }}
                          animate={{ y: 0, opacity: 1, rotateX: 0 }}
                          exit={{ y: -25, opacity: 0, rotateX: 45 }}
                          transition={{ duration: 0.2, ease: "circOut" }}
                          className="text-3xl font-black font-mono text-slate-800 relative z-0"
                          style={{ textShadow: '0 1px 0 rgba(255,255,255,0.8)' }}
                        >
                          {num}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                    
                    <button 
                      onClick={() => handleDial(idx, -1)}
                      className="text-slate-500 hover:text-amber-400 active:text-amber-300 transition-colors p-1"
                      disabled={isUnlocked}
                    >
                      <ChevronDown size={20} strokeWidth={4} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
                 
            {/* The Gift inside (hidden initially inside the box) */}
            <div 
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ 
                transformStyle: 'preserve-3d',
                pointerEvents: isUnlocked ? 'auto' : 'none',
              }}
            >
              <div 
                ref={giftRef} 
                className="relative flex items-center justify-center"
                style={{
                  scale: 0,
                  opacity: 0,
                  transform: `rotateY(20deg) rotateX(10deg)` 
                }}
              >
                <div className="absolute inset-0 bg-yellow-300/60 blur-[60px] rounded-full scale-[2]" />
                <img 
                  src="/A gift.png" 
                  alt="A magical gift" 
                  className="w-56 h-56 object-contain filter drop-shadow-[0_0_40px_rgba(250,204,21,1)] relative z-10" 
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop'; }}
                />
                
                {/* Sparkles effect */}
                <div className="absolute inset-0 pointer-events-none">
                  {isUnlocked && Array.from({ length: 15 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute text-yellow-200"
                      style={{ 
                        left: `${50 + (Math.random() - 0.5) * 180}%`, 
                        top: `${50 + (Math.random() - 0.5) * 180}%` 
                      }}
                      animate={{ 
                        y: [0, -50, 0], 
                        opacity: [0, 1, 0], 
                        scale: [0.5, 1.5, 0.5], 
                        rotate: [0, 180] 
                      }}
                      transition={{ 
                        duration: 1.2 + Math.random() * 2, 
                        repeat: Infinity, 
                        delay: Math.random() 
                      }}
                    >
                      <Sparkles size={16 + Math.random() * 24} />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* ================= BOX LID ================= */}
            <div 
              ref={lidRef}
              className="absolute left-1/2 top-1/2" 
              style={{ 
                width: lw, 
                height: ld,
                // Move the lid container to sit on top of the box body, hinged at the back edge
                // The center of this container is shifted up by h/2 and back by d/2
                transform: `translate(-50%, -50%) translateY(${-h/2}px) translateZ(${-d/2}px)`,
                transformStyle: 'preserve-3d',
                transformOrigin: `50% 50% 0`, // Hinge at the back
              }}
            >
              <div 
                className="absolute left-1/2 top-1/2"
                style={{
                   width: '100%', height: '100%',
                   transformStyle: 'preserve-3d',
                   // The lid geometry is centered on this container. We need to shift it forward by ld/2 so it covers the box.
                   transform: `translate(-50%, -50%) translateZ(${ld/2}px)`
                }}
              >
                  {/* Lid Top */}
                  <div className="absolute left-1/2 top-1/2 bg-gradient-to-br from-slate-700 to-slate-900 shadow-[0_-15px_30px_rgba(0,0,0,0.4)]"
                      style={{ 
                        width: lw, height: ld, 
                        transform: `translate(-50%, -50%) translateY(${-lh/2}px) rotateX(90deg)`,
                        border: '1px solid rgba(250,204,21,0.5)',
                      }}>
                    <div className="absolute inset-3 border-2 border-amber-500/40 rounded-sm" style={{ boxShadow: 'inset 0 0 20px rgba(250,204,21,0.2)' }} />
                    <div className="absolute inset-10 border border-amber-500/20 rounded-sm" />
                  </div>
                  
                  {/* Lid Bottom (Inner lid) */}
                  <div className="absolute left-1/2 top-1/2 border border-slate-900 bg-slate-950 shadow-[inset_0_0_50px_rgba(0,0,0,1)]"
                      style={{ 
                        width: lw, height: ld, 
                        transform: `translate(-50%, -50%) translateY(${lh/2}px) rotateX(-90deg)` 
                      }} />
                      
                  {/* Lid Front */}
                  <div className="absolute left-1/2 top-1/2 bg-gradient-to-b from-slate-700 to-slate-900 flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                      style={{ 
                        width: lw, height: lh, 
                        transform: `translate(-50%, -50%) translateZ(${ld/2}px)`,
                        border: '1px solid rgba(250,204,21,0.4)',
                      }}>
                    <div className="absolute inset-1 border border-amber-500/30 rounded-sm" />
                    
                    {/* The Clickable Lock Button */}
                    <button 
                      ref={lockRef}
                      onClick={handleLockClick}
                      className="absolute -bottom-8 w-16 h-16 bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 rounded-full flex items-center justify-center text-slate-900 border-[4px] border-slate-900 shadow-[0_10px_25px_rgba(0,0,0,0.8),_inset_0_4px_10px_rgba(255,255,255,0.7)] z-50 transition-transform hover:scale-105 active:scale-95 cursor-pointer outline-none"
                      style={{ transform: 'translateZ(10px)' }}
                      disabled={isUnlocked}
                    >
                      <div className="absolute inset-0.5 rounded-full border border-amber-200/60 pointer-events-none" />
                      {isUnlocked ? <Unlock size={24} strokeWidth={3} /> : <Lock size={24} strokeWidth={3} />}
                    </button>
                  </div>
                  
                  {/* Lid Back */}
                  <div className="absolute left-1/2 top-1/2 bg-slate-900"
                      style={{ 
                        width: lw, height: lh, 
                        transform: `translate(-50%, -50%) translateZ(${-ld/2}px) rotateY(180deg)`,
                        border: '1px solid rgba(250,204,21,0.3)',
                      }} />
                      
                  {/* Lid Right */}
                  <div className="absolute left-1/2 top-1/2 bg-gradient-to-bl from-slate-700 to-slate-900"
                      style={{ 
                        width: ld, height: lh, 
                        transform: `translate(-50%, -50%) translateX(${lw/2}px) rotateY(90deg)`,
                        border: '1px solid rgba(250,204,21,0.3)',
                      }} />
                      
                  {/* Lid Left */}
                  <div className="absolute left-1/2 top-1/2 bg-gradient-to-br from-slate-600 to-slate-800"
                      style={{ 
                        width: ld, height: lh, 
                        transform: `translate(-50%, -50%) translateX(${-lw/2}px) rotateY(-90deg)`,
                        border: '1px solid rgba(250,204,21,0.3)',
                      }} />
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
