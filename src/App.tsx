import { useState, useRef } from 'react';
import gsap from 'gsap';
import confetti from 'canvas-confetti';
import { Gift, Heart, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [spinning, setSpinning] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [claimed, setClaimed] = useState(false);
  
  const wheelRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const SLICES = 10;
  const TARGET_INDEX = 0; // Index 0 will be our yellow, smaller one
  
  // Create conic gradient string for the wheel background
  // Offset by -18deg so that slice 0 is perfectly centered at the top
  const conicColors = Array.from({ length: SLICES }).map((_, i) => {
    const isTarget = i === TARGET_INDEX;
    const color = isTarget ? '#fde047' : (i % 2 === 0 ? '#f8fafc' : '#f1f5f9');
    return `${color} ${i * 36}deg ${(i + 1) * 36}deg`;
  }).join(', ');

  const spin = () => {
    if (spinning || showReward) return;
    setSpinning(true);

    const spins = 6; 
    const finalRotation = 360 * spins; 

    gsap.to(wheelRef.current, {
      rotation: finalRotation,
      duration: 6,
      ease: "power4.out",
      onComplete: () => {
        setSpinning(false);
        setShowReward(true);
        triggerWin();
      }
    });
  };

  const triggerWin = () => {
    // Play audio
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(e => console.log("Audio play blocked", e));
    }

    // Confetti
    const duration = 4000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.8 },
        colors: ['#fde047', '#ef4444', '#ec4899', '#3b82f6', '#10b981']
      });
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.8 },
        colors: ['#fde047', '#ef4444', '#ec4899', '#3b82f6', '#10b981']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans overflow-hidden relative">
      {/* Free clapping/cheering sound from mixkit */}
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3" preload="auto" />

      {/* Floating Hearts for atmosphere */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
         {Array.from({ length: 15 }).map((_, i) => (
           <Heart 
             key={i}
             className="absolute text-rose-500 animate-pulse"
             style={{
               top: `${Math.random() * 100}%`,
               left: `${Math.random() * 100}%`,
               transform: `scale(${Math.random() * 0.5 + 0.5})`,
               animationDuration: `${Math.random() * 3 + 2}s`,
               animationDelay: `${Math.random() * 2}s`
             }}
             fill="currentColor"
           />
         ))}
      </div>

      <AnimatePresence mode="wait">
        {!showReward ? (
          <motion.div 
            key="wheel"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center z-10"
          >
            <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-2 drop-shadow-sm text-center">
              Vòng Quay May Mắn
            </h1>
            <p className="text-slate-500 mb-10 font-medium">Nhấn vào vòng quay để thử vận may của bạn!</p>
            
            <div className="relative w-80 h-80 md:w-96 md:h-96 cursor-pointer group" onClick={spin}>
              {/* Pointer */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[18px] border-r-[18px] border-t-[36px] border-l-transparent border-r-transparent border-t-rose-500 z-20 filter drop-shadow-lg"></div>
              
              {/* The Wheel */}
              <div 
                ref={wheelRef} 
                className="w-full h-full rounded-full shadow-2xl relative overflow-hidden border-8 border-white transition-transform duration-300 group-hover:scale-105"
                style={{ 
                  background: `conic-gradient(from -18deg, ${conicColors})`,
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 0 20px rgba(0,0,0,0.1)'
                }}
              >
                {/* Lines separating slices */}
                {Array.from({ length: SLICES }).map((_, i) => (
                   <div 
                     key={`line-${i}`}
                     className="absolute top-0 left-1/2 w-[2px] h-1/2 bg-white/50 origin-bottom"
                     style={{ transform: `translateX(-50%) rotate(${i * 36 + 18}deg)` }}
                   ></div>
                ))}

                {/* Slices Text */}
                {Array.from({ length: SLICES }).map((_, i) => {
                  const isTarget = i === TARGET_INDEX;
                  const rotation = i * 36;
                  return (
                    <div 
                      key={`text-${i}`} 
                      className="absolute top-0 left-0 w-full h-full origin-center flex justify-center pointer-events-none"
                      style={{ transform: `rotate(${rotation}deg)` }}
                    >
                      <div className={`mt-8 md:mt-10 font-black uppercase tracking-widest ${
                        isTarget 
                          ? 'text-amber-600 text-xs scale-75' 
                          : 'text-slate-400 text-sm'
                      }`}>
                        Hidden
                      </div>
                    </div>
                  )
                })}

                {/* Center knob */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-lg border-4 border-slate-100 flex items-center justify-center">
                  <div className="w-6 h-6 bg-rose-500 rounded-full shadow-inner"></div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="reward"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="flex flex-col items-center justify-center z-20"
          >
            {!claimed ? (
              <motion.div 
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => setClaimed(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <h2 className="text-4xl font-black text-slate-800 mb-8 animate-bounce text-center">
                  Click to claim your reward!
                </h2>
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-400 blur-3xl opacity-30 rounded-full animate-pulse"></div>
                  <Gift size={120} strokeWidth={1} className="text-rose-500 relative z-10 drop-shadow-2xl" />
                  <Sparkles size={40} className="absolute -top-4 -right-4 text-amber-400 animate-spin-slow z-20" />
                </div>
                <p className="mt-8 text-slate-500 font-medium">Bấm vào hộp quà để mở!</p>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="flex flex-col items-center"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-8 border-white bg-white max-w-lg w-full px-4">
                   {/* We will load the user's A gift.png here */}
                   <img 
                     src="/A gift.png" 
                     alt="A special gift" 
                     className="w-full h-auto object-contain rounded-xl"
                     onError={(e) => {
                       // Fallback if image not found
                       e.currentTarget.src = "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=2040&auto=format&fit=crop";
                     }}
                   />
                </div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 text-center"
                >
                  <h2 className="text-3xl font-black text-rose-500 mb-2">Chúc Mừng!</h2>
                  <p className="text-slate-600 font-medium text-lg">Bạn đã nhận được phần quà đặc biệt!</p>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
