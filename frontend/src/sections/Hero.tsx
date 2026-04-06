import { motion } from 'framer-motion';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { heroTextVariants, fadeUpVariants, staggerContainer, staggerItem, viewportSettings, easing, duration } from '../lib/animations';

interface HeroProps {
  label?: string;
  title: string;
  accentWord?: string;
  subtitle: string;
  primaryCta?: string;
  secondaryCta?: string;
}

export function Hero({
  label = 'Traiteur Signature',
  title,
  accentWord,
  subtitle,
  primaryCta = 'Voir le catalogue',
  secondaryCta = 'Demander un devis',
}: HeroProps) {
  return (
    <section id="top" className="relative min-h-screen pt-20 flex items-center justify-center overflow-hidden gradient-bg">
      {/* Floating Decorative Blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="blob blob-primary w-96 h-96 top-20 -left-20"
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
        />
        <motion.div
          className="blob blob-secondary w-80 h-80 bottom-20 -right-20"
          animate={{
            y: [0, 20, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 10,
            ease: 'easeInOut',
            repeat: Infinity,
            delay: 2,
          }}
        />
        <motion.div
          className="blob blob-primary w-64 h-64 top-1/2 left-1/3 opacity-30"
          style={{ filter: 'blur(80px)' }}
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 12,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
        />
      </div>

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Content */}
      <motion.div
        className="container-editorial relative z-10 text-center px-4"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* Label */}
        <motion.p
          variants={staggerItem}
          className="micro-label mb-6"
        >
          {label}
        </motion.p>

        {/* Main Title */}
        <motion.h1
          variants={heroTextVariants}
          className="font-display text-5xl md:text-7xl lg:text-8xl font-semibold text-[var(--secondary-900)] mb-6 tracking-tight text-balance"
        >
          {accentWord ? (
            <>
              {title}{' '}
              <span className="text-[var(--primary-500)] italic">{accentWord}</span>
            </>
          ) : (
            title
          )}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeUpVariants}
          className="text-lg md:text-xl text-[var(--secondary-500)] max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          {subtitle}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={staggerItem}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/catalogue">
            <motion.button
              className="btn-primary-luxury btn-sheen flex items-center gap-2"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2, ease: easing.gentle }}
            >
              {primaryCta}
              <ArrowRight size={18} />
            </motion.button>
          </Link>
          
          <Link to="/events/quote">
            <motion.button
              className="btn-outline-luxury"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2, ease: easing.gentle }}
            >
              {secondaryCta}
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[var(--secondary-400)]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6, ease: easing.smooth }}
      >
        <span className="text-xs uppercase tracking-[0.3em] font-medium">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, ease: 'easeInOut', repeat: Infinity }}
        >
          <ChevronDown size={20} />
        </motion.div>
      </motion.div>
    </section>
  );
}
