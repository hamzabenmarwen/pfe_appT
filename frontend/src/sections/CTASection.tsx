import { motion } from 'framer-motion';
import { fadeUpVariants, staggerContainer, staggerItem, viewportSettings, easing } from '../lib/animations';

interface CTASectionProps {
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  secondaryCta?: string;
}

export function CTASection({
  title = 'Transformons votre prochain evenement',
  subtitle = 'Partagez votre vision, nous composons une experience culinaire complete avec elegance, precision et chaleur.',
  primaryCta = 'Planifier un appel',
  secondaryCta = 'Voir les menus',
}: CTASectionProps) {
  return (
    <section id="moments" className="section-shell relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50" />
      
      {/* Decorative blobs */}
      <motion.div
        className="absolute top-0 right-0 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 20, 0],
        }}
        transition={{
          duration: 10,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-80 h-80 bg-secondary-200/30 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 8,
          ease: 'easeInOut',
          repeat: Infinity,
          delay: 2,
        }}
      />

      <div className="container-editorial relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportSettings}
          variants={staggerContainer}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.p variants={staggerItem} className="micro-label mb-4">
            Experience Signature
          </motion.p>
          
          <motion.h2 
            variants={fadeUpVariants}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-[var(--secondary-900)] mb-6 tracking-tight"
          >
            {title}
          </motion.h2>
          
          <motion.p 
            variants={staggerItem}
            className="text-lg text-[var(--secondary-500)] mb-10 leading-relaxed"
          >
            {subtitle}
          </motion.p>
          
          <motion.div 
            variants={staggerItem}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              className="btn-primary-luxury btn-sheen px-8 py-4 text-lg"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2, ease: easing.gentle }}
            >
              {primaryCta}
            </motion.button>
            
            <motion.button
              className="btn-outline-luxury px-8 py-4 text-lg"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2, ease: easing.gentle }}
            >
              {secondaryCta}
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
