import { useState, useRef } from 'react';
import gsap from 'gsap';
import confetti from 'canvas-confetti';
import { Sparkles, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ─── Constants & Generators ────────────────────────────────────────────────
const ITEM_WIDTH = 140; 
const ITEM_GAP = 12;
const TOTAL_WIDTH = ITEM_WIDTH + ITEM_GAP;
const TARGET_INDEX = 75; // Vị trí của món đồ vàng
const TOTAL_ITEMS = 100;

// Các độ hiếm theo style CS:GO
const RARITIES = [
  { color: '#4b69ff', bg: 'bg-blue-500', name: 'Mil-Spec' },
  { color: '#8847ff', bg: 'bg-purple-500', name: 'Restricted' },
  { color: '#d32ce6', bg: 'bg-pink-500', name: 'Classified' },
  { color: '#eb4b4b', bg: 'bg-red-500', name: 'Covert' },
];

function generateItems() {
  return Array.from({ length: TOTAL_ITEMS }, (_, i) => {
    // Luôn luôn là vàng ở vị trí target
    if (i === TARGET_INDEX) {
      return { id: i, color: '#ffd700', bg: 'bg-yellow-400', name: '★ Special Item ★', isGold: true };
    }
    // Random các món khác
    const r = Math.random();
    let rarity;
    if (r < 0.6) rarity = RARITIES[0];
    else if (r < 0.85) rarity = RARITIES[1];
    else if (r < 0.96) rarity = RARITIES[2];
    else rarity = RARITIES[3];
    
    return { id: i, ...rarity, isGold: false };
  });
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function App() {
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'winner' | 'claimed'>('idle');
  const [items, setItems] = useState(() => generateItems());
  
  const containerRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const spin = () => {
    if (phase !== 'idle') return;
    if (!containerRef.current || !stripRef.current) return;

    setPhase('spinning');

    // Generate bộ item mới để nhìn nó xịn hơn mỗi lần quay (nhưng giữ vàng ở target)
    setItems(generateItems());
    
    // Reset vị trí về 0
    gsap.set(stripRef.current, { x: 0 });

    const containerWidth = containerRef.current.clientWidth;
    // Tính toán tọa độ của item vàng
    const itemCenterOffset = (TARGET_INDEX * TOTAL_WIDTH) + (ITEM_WIDTH / 2);
    // Để item vàng nằm chính giữa container
    const baseTranslate = itemCenterOffset - (containerWidth / 2);
    
    // Thêm random offset xê dịch trong phạm vi chiều rộng của item (trừ đi 10px lề cho an toàn)
    // Random từ -(ITEM_WIDTH/2 - 10) đến +(ITEM_WIDTH/2 - 10)
    const randomOffset = (Math.random() - 0.5) * (ITEM_WIDTH - 20);
    
    const finalTranslate = -(baseTranslate + randomOffset);

    // Tính thời gian chậm dần đều của GSAP power4.out
    gsap.to(stripRef.current, {
      x: finalTranslate,
      duration: 8,
      ease: 'power4.out',
      onComplete: () => {
        setPhase('winner');
        triggerWin();
      }
    });
  };

  const triggerWin = () => {
    // Play win audio
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 0.6;
      audioRef.current.play().catch(() => {});
    }

    const launch = (opts: confetti.Options) => confetti({ ...opts, zIndex: 9999 });

    // Center explosion
    launch({ particleCount: 150, spread: 100, origin: { y: 0.5 }, colors: ['#fde047', '#fbbf24', '#ffffff'] });

    // Side cannons
    const end = Date.now() + 3500;
    const frame = () => {
      launch({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors: ['#fde047', '#fbbf24'] });
      launch({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors: ['#fde047', '#fbbf24'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  const reset = () => {
    setPhase('idle');
    gsap.set(stripRef.current, { x: 0 });
    setItems(generateItems());
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center font-sans overflow-hidden relative select-none">
      
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[800px] h-[300px] bg-slate-800 opacity-50 blur-[100px] rounded-full" />
      </div>

      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3" preload="auto" />

      <AnimatePresence mode="wait">
        {phase !== 'claimed' ? (
          <motion.div
            key="unbox-screen"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(5px)' }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center z-10 w-full max-w-6xl px-4"
          >
            {/* Title */}
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                Mystery Case
              </h1>
              <p className="text-slate-400 mt-3 text-lg font-medium">
                {phase === 'idle' && 'Mở hòm nhận quà ngay!'}
                {phase === 'spinning' && 'Đang tìm kiếm vận may...'}
                {phase === 'winner' && '🎉 Vàng rồi!!! Chúc mừng bạn!'}
              </p>
            </div>

            {/* CSGO Case Container */}
            <div className="w-full relative py-6">
              
              {/* Center Line Pointer */}
              <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-amber-400 -translate-x-1/2 z-30 shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-2 border-[10px] border-transparent border-t-amber-400 z-30" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 -mb-2 border-[10px] border-transparent border-b-amber-400 z-30" />

              {/* Gradient Overlay for Fade Edges */}
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-900 to-transparent z-20 pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-900 to-transparent z-20 pointer-events-none" />

              {/* Items Container */}
              <div 
                ref={containerRef}
                className="w-full h-40 overflow-hidden bg-slate-800/80 border-y-2 border-slate-700/50 shadow-2xl relative"
                style={{
                  boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5)'
                }}
              >
                {/* Rolling Strip */}
                <div 
                  ref={stripRef}
                  className="flex h-full items-center absolute left-0"
                  style={{ gap: `${ITEM_GAP}px`, paddingLeft: '50vw' }} // Padding trái để khởi đầu mượt nếu cần, hoặc ta ko xài
                >
                  {items.map((item, index) => (
                    <div 
                      key={`${item.id}-${index}`}
                      className="flex-shrink-0 h-32 relative rounded-md overflow-hidden bg-slate-800 flex flex-col justify-end"
                      style={{ 
                        width: `${ITEM_WIDTH}px`,
                        boxShadow: `inset 0 -4px 0 ${item.color}, 0 4px 6px rgba(0,0,0,0.3)`,
                      }}
                    >
                      {/* Bức ảnh hoặc logo ẩn dụ bên trong */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-30">
                         <div className="w-16 h-16 rounded-full bg-slate-600/30" />
                      </div>

                      {item.isGold && (
                         <div className="absolute inset-0 bg-yellow-500/10 flex items-center justify-center">
                            <Sparkles size={48} className="text-yellow-400 opacity-80" />
                         </div>
                      )}

                      <div className="p-2 z-10 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent pt-6">
                        <div 
                           className="text-[10px] font-bold uppercase tracking-wider text-center line-clamp-1"
                           style={{ color: item.color }}
                        >
                          {item.name}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-12">
              {phase === 'winner' ? (
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', bounce: 0.6 }}
                  onClick={() => setPhase('claimed')}
                  className="px-12 py-4 rounded-lg font-black text-xl text-slate-900 uppercase tracking-widest cursor-pointer shadow-[0_0_40px_rgba(251,191,36,0.6)] bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500"
                  whileHover={{ scale: 1.05, filter: 'brightness(1.1)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  🎁 Lấy Đồ Vàng Ngay
                </motion.button>
              ) : (
                <motion.button
                  onClick={spin}
                  disabled={phase === 'spinning'}
                  className="px-16 py-4 rounded-lg font-black text-xl text-white uppercase tracking-widest cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-500 to-teal-600 border border-emerald-400/30 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  whileHover={phase !== 'spinning' ? { scale: 1.05, filter: 'brightness(1.1)' } : {}}
                  whileTap={phase !== 'spinning' ? { scale: 0.95 } : {}}
                >
                  {phase === 'spinning' ? 'Opening...' : 'Mở Hòm'}
                </motion.button>
              )}
            </div>

          </motion.div>
        ) : (
          // ── Reward Claim Screen ──────────────────────────────────────────────
          <motion.div
            key="reward-screen"
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', bounce: 0.45, duration: 0.8 }}
            className="flex flex-col items-center gap-6 z-20 px-4 w-full max-w-xl"
          >
            <div className="text-center">
              <h2 className="text-5xl md:text-6xl font-black text-amber-400 mb-2 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] uppercase tracking-wider">
                Special Item
              </h2>
              <p className="text-slate-300 font-medium text-lg">Bạn đã unbox được một siêu phẩm!</p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="relative rounded-2xl overflow-hidden bg-slate-800"
              style={{ boxShadow: '0 30px 60px rgba(0,0,0,0.4), 0 0 0 2px #334155, 0 0 0 8px #fde047' }}
            >
              <img
                src="/A gift.png"
                alt="A special gift"
                className="w-full max-w-lg h-auto object-contain bg-slate-900"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop';
                }}
              />
            </motion.div>

            {/* Vòng lặp sparkle bay bay ở màn nhận quà */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 15 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-yellow-400/70"
                  style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
                  animate={{ y: [0, -20, 0], opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5], rotate: [0, 180] }}
                  transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
                >
                  <Sparkles size={16 + Math.random() * 16} />
                </motion.div>
              ))}
            </div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              onClick={reset}
              className="flex items-center gap-2 px-8 py-3 rounded-md font-bold text-slate-300 border border-slate-600 hover:border-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer mt-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw size={18} />
              Mở hòm tiếp
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
