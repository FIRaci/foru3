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
        scale: 1.15,
        color: '#10b981',
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
      // 3. Shake the whole box slightly
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
      // 4. Lid opens backwards (hinge at the back)
      .to(lidRef.current, {
        rotateX: 115,
        duration: 1.5,
        ease: 'power3.inOut',
      })
      // 5. Gift pops out from inside
      .to(
        giftRef.current,
        {
          scale: 1,
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

  // Mouse Parallax Effect for the 3D Box
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!boxContainerRef.current || isUnlocked) return;
    
    // Get mouse position relative to the center of the screen
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 2; // -1 to 1
    const y = (clientY / innerHeight - 0.5) * 2; // -1 to 1
    
    // Apply subtle rotation (base rotation + mouse offset)
    gsap.to(boxContainerRef.current, {
      rotateX: -15 - y * 8, // Base is -15
      rotateY: -25 + x * 12, // Base is -25
      duration: 0.8,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = () => {
    if (!boxContainerRef.current || isUnlocked) return;
    // Reset to base rotation when mouse leaves
    gsap.to(boxContainerRef.current, {
      rotateX: -15,
      rotateY: -25,
      duration: 1.2,
      ease: 'power3.out',
    });
  };

  // 3D CSS values for the box body (Cube)
  const w = 260, h = 160, d = 220;
  // Lid overlaps slightly
  const lw = 270, lh = 30, ld = 230;

  return (
    <div 
      className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans overflow-hidden relative"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background ambient elements */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0">
        <div className="w-[60vw] h-[60vw] bg-pink-100/50 blur-[120px] rounded-full absolute -top-20 -left-20" />
        <div className="w-[50vw] h-[50vw] bg-blue-100/50 blur-[120px] rounded-full absolute bottom-0 right-0" />
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
          {/* Paper texture overlay (subtle noise) */}
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
                  className="absolute text-5xl lg:text-6xl font-bold tracking-wider pt-2"
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
              // Initial base isometric rotation
              transform: 'rotateX(-15deg) rotateY(-25deg)',
            }}
          >
            
            {/* ================= BOX BODY ================= */}
            
            {/* Bottom (Inner Floor) */}
            <div className="absolute border border-slate-900 bg-slate-950 shadow-[0_0_80px_rgba(0,0,0,0.9)]"
                 style={{ 
                   width: w, height: d, 
                   transform: `translateY(${h/2 - d/2}px) translateZ(0) rotateX(-90deg)` 
                 }} />
            
            {/* Top (Open Opening - slightly dark interior) */}
            <div className="absolute border-4 border-amber-600/30 bg-slate-950"
                 style={{ 
                   width: w, height: d, 
                   transform: `translateY(${-h/2 + d/2}px) translateZ(0) rotateX(90deg)`,
                   boxShadow: 'inset 0 0 50px rgba(0,0,0,1)'
                 }} />

            {/* Back */}
            <div className="absolute border border-slate-800 bg-gradient-to-t from-slate-950 to-slate-900"
                 style={{ 
                   width: w, height: h, 
                   transform: `translateZ(${-d/2}px) rotateY(180deg)` 
                 }} />
            
            {/* Right */}
            <div className="absolute border border-slate-800 bg-gradient-to-bl from-slate-800 to-slate-950"
                 style={{ 
                   width: d, height: h, 
                   transform: `translateX(${w/2 - d/2}px) translateZ(0) rotateY(90deg)` 
                 }} />
            
            {/* Left */}
            <div className="absolute border border-slate-700 bg-gradient-to-br from-slate-700 to-slate-900"
                 style={{ 
                   width: d, height: h, 
                   transform: `translateX(${-w/2 + d/2}px) translateZ(0) rotateY(-90deg)` 
                 }} />
            
            {/* Front */}
            <div className="absolute border border-slate-700 bg-gradient-to-b from-slate-700 to-slate-900 shadow-[0_30px_60px_rgba(0,0,0,0.4)] flex flex-col items-center justify-center z-10"
                 style={{ 
                   width: w, height: h, 
                   transform: `translateZ(${d/2}px)` 
                 }}>
              
              {/* Front Face Decoration (Gold trim) */}
              <div className="absolute inset-1 border border-amber-600/30 rounded-[2px]" />
              
              {/* Dials UI */}
              <div 
                className="bg-slate-950 p-3 rounded-lg flex gap-2 items-center relative z-20"
                style={{ 
                  boxShadow: 'inset 0 15px 30px rgba(0,0,0,0.9), 0 2px 0 rgba(255,255,255,0.1)',
                  transform: 'translateZ(2px)' // push slightly out to avoid z-fighting
                }}
              >
                {code.map((num, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <button 
                      onClick={() => handleDial(idx, 1)}
                      className="text-slate-500 hover:text-amber-400 transition-colors p-1"
                      disabled={isUnlocked}
                    >
                      <ChevronUp size={22} strokeWidth={3} />
                    </button>
                    <div className="w-10 h-14 bg-gradient-to-b from-slate-200 via-white to-slate-300 rounded border border-slate-700 shadow-lg flex items-center justify-center overflow-hidden relative">
                      <div className="absolute inset-0 shadow-[inset_0_4px_10px_rgba(0,0,0,0.2)] pointer-events-none" />
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
                      <ChevronDown size={22} strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
                 
            {/* The Gift inside (hidden initially inside the box) */}
            {/* It sits in the exact center of the 3D space */}
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
                  // Reverse the rotation of the box so the image always faces the camera flatly
                  // Note: Since box can rotate dynamically, a true billboard effect is hard without continuous updates.
                  // But we reset the box rotation to (-10, -20) during unlock, so we offset that here:
                  transform: `rotateY(20deg) rotateX(10deg)` 
                }}
              >
                <div className="absolute inset-0 bg-yellow-400/50 blur-[50px] rounded-full scale-150" />
                <img 
                  src="/A gift.png" 
                  alt="A magical gift" 
                  className="w-56 h-56 object-contain filter drop-shadow-[0_0_30px_rgba(250,204,21,0.8)] relative z-10" 
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
                        y: [0, -40, 0], 
                        opacity: [0, 1, 0], 
                        scale: [0.5, 1.5, 0.5], 
                        rotate: [0, 180] 
                      }}
                      transition={{ 
                        duration: 1.5 + Math.random() * 1.5, 
                        repeat: Infinity, 
                        delay: Math.random() 
                      }}
                    >
                      <Sparkles size={16 + Math.random() * 20} />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* ================= BOX LID ================= */}
            {/* The Lid container anchors at the top-back edge of the box body to act as a hinge */}
            <div 
              ref={lidRef}
              className="absolute" 
              style={{ 
                // Position lid at the top-back edge of the body
                left: `50%`, 
                top: `0`, 
                // Move it up by half body height, back by half body depth
                transform: `translate3d(-50%, ${-h/2}px, ${-d/2}px)`,
                width: lw, 
                height: ld, // Depth becomes height when flat? No, it's a cube.
                transformStyle: 'preserve-3d',
                transformOrigin: `50% 50% 0`, // Hinge is at the exact position
              }}
            >
              {/* To make it a box, we construct the lid cube relative to its own center.
                  Wait, if it's placed at the back edge, its center is actually offset.
                  Let's offset the lid faces forward by ld/2 so it covers the box. */}
              <div 
                className="absolute"
                style={{
                   width: '100%', height: '100%',
                   transformStyle: 'preserve-3d',
                   transform: `translateZ(${ld/2}px)` // move lid forward to cover the box
                }}
              >
                  {/* Lid Top */}
                  <div className="absolute border-2 border-slate-700 bg-gradient-to-br from-slate-600 to-slate-800 shadow-[0_-10px_20px_rgba(0,0,0,0.2)]"
                      style={{ 
                        width: lw, height: ld, 
                        transform: `translateY(${-lh/2 + ld/2}px) rotateX(90deg)` 
                      }}>
                    <div className="absolute inset-3 border border-amber-500/40 rounded-sm" />
                    <div className="absolute inset-8 border border-amber-500/20 rounded-sm" />
                  </div>
                  
                  {/* Lid Bottom (Inner lid) */}
                  <div className="absolute border border-slate-900 bg-slate-950"
                      style={{ 
                        width: lw, height: ld, 
                        transform: `translateY(${lh/2 - ld/2}px) rotateX(-90deg)` 
                      }} />
                      
                  {/* Lid Front */}
                  <div className="absolute border-2 border-slate-600 bg-gradient-to-b from-slate-600 to-slate-800 flex items-center justify-center shadow-lg"
                      style={{ 
                        width: lw, height: lh, 
                        transform: `translateZ(${ld/2}px)` 
                      }}>
                    <div className="absolute inset-1 border border-amber-500/30 rounded-sm" />
                    {/* Lock Mechanism on Lid Front */}
                    <div 
                      ref={lockRef}
                      className="absolute -bottom-6 w-14 h-14 bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 rounded-full flex items-center justify-center text-slate-900 border-[3px] border-amber-800 shadow-[0_10px_20px_rgba(0,0,0,0.6),_inset_0_2px_5px_rgba(255,255,255,0.6)] z-50 transition-colors"
                      style={{ transform: 'translateZ(1px)' }}
                    >
                      <div className="absolute inset-0.5 rounded-full border border-amber-200/50" />
                      {isUnlocked ? <Unlock size={22} strokeWidth={2.5} /> : <Lock size={22} strokeWidth={2.5} />}
                    </div>
                  </div>
                  
                  {/* Lid Back */}
                  <div className="absolute border border-slate-800 bg-slate-900"
                      style={{ 
                        width: lw, height: lh, 
                        transform: `translateZ(${-ld/2}px) rotateY(180deg)` 
                      }} />
                      
                  {/* Lid Right */}
                  <div className="absolute border-2 border-slate-700 bg-gradient-to-bl from-slate-700 to-slate-900"
                      style={{ 
                        width: ld, height: lh, 
                        transform: `translateX(${lw/2 - ld/2}px) translateZ(0) rotateY(90deg)` 
                      }} />
                      
                  {/* Lid Left */}
                  <div className="absolute border-2 border-slate-600 bg-gradient-to-br from-slate-500 to-slate-700"
                      style={{ 
                        width: ld, height: lh, 
                        transform: `translateX(${-lw/2 + ld/2}px) translateZ(0) rotateY(-90deg)` 
                      }} />
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
