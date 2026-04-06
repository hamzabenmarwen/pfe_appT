import { motion } from 'framer-motion';

interface MarqueeProps {
  items?: string[];
  direction?: 'normal' | 'reverse';
  speed?: number;
}

export function Marquee({ 
  items = ['Editorial', 'Stories', 'Design', 'Culture', 'Arts', 'Literature'],
  direction = 'normal',
  speed = 30
}: MarqueeProps) {
  const duplicatedItems = [...items, ...items, ...items, ...items];
  
  return (
    <div className="py-8 bg-white border-y border-secondary-200 overflow-hidden">
      <div className="marquee-wrap">
        <motion.div 
          className={direction === 'reverse' ? 'marquee-track-reverse' : 'marquee-track'}
          style={{ animationDuration: `${speed}s` }}
        >
          {duplicatedItems.map((item, index) => (
            <div key={`${item}-${index}`} className="marquee-item">
              <span className="text-secondary-400">{item}</span>
              <span className="mx-8 text-primary-300">•</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// Separator variant
export function MarqueeSeparator({ 
  items = ['Editorial Excellence', 'Curated Stories', 'Visual Design'],
  variant = 'light' 
}: { items?: string[]; variant?: 'light' | 'dark' }) {
  return (
    <div className={`py-6 ${variant === 'dark' ? 'bg-secondary-900' : 'bg-white'} overflow-hidden`}>
      <div className="marquee-wrap">
        <div className="marquee-track" style={{ animationDuration: '40s' }}>
          {[...items, ...items, ...items, ...items].map((item, index) => (
            <div key={index} className="marquee-item">
              <span className={variant === 'dark' ? 'text-secondary-400' : 'text-secondary-300'}>
                {item}
              </span>
              <div className={`w-12 h-px mx-8 ${variant === 'dark' ? 'bg-secondary-700' : 'bg-secondary-200'}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
