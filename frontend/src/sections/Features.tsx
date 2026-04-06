import { motion } from 'framer-motion';
import { fadeUpVariants, staggerContainer, staggerItem, lineGrowVariants, viewportSettings, easing } from '../lib/animations';
import { Sparkles, Truck, CalendarHeart, Leaf } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'Cuisine Signature',
    description: 'Menus premium construits autour de produits saisonniers et d une execution minutieuse.',
  },
  {
    icon: Truck,
    title: 'Livraison Orches tree',
    description: 'Logistique maitrisee pour garantir ponctualite, temperature ideale et presentation intacte.',
  },
  {
    icon: CalendarHeart,
    title: 'Evenements Sur Mesure',
    description: 'Mariages, entreprises et celebrations privees avec direction culinaire adaptee a chaque moment.',
  },
  {
    icon: Leaf,
    title: 'Fraicheur Responsable',
    description: 'Selection locale, circuits courts et approche raffinee pour une table elegante et consciente.',
  },
];

interface FeaturesProps {
  label?: string;
  title?: string;
  description?: string;
}

export function Features({
  label = 'Nos Services',
  title = 'Une experience culinaire editoriale',
  description = 'Chaque prestation est composee comme une narration: rythme, matiere, surprise et finale memorables.',
}: FeaturesProps) {
  return (
    <section id="services" className="section-shell bg-[var(--secondary-50)]/60">
      <div className="container-editorial">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportSettings}
          variants={staggerContainer}
          className="text-center mb-20"
        >
          <motion.p variants={staggerItem} className="micro-label mb-4">
            {label}
          </motion.p>
          
          <motion.h2 
            variants={fadeUpVariants}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-[var(--secondary-900)] mb-6 tracking-tight"
          >
            {title}
          </motion.h2>
          
          <motion.div 
            variants={lineGrowVariants}
            className="hr-editorial mx-auto mb-6"
          />
          
          <motion.p 
            variants={staggerItem}
            className="text-lg text-[var(--secondary-500)] max-w-2xl mx-auto"
          >
            {description}
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportSettings}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={staggerItem}
              custom={index}
              whileHover={{ y: -8, transition: { duration: 0.3, ease: easing.smooth } }}
              className="glass-card p-8 group cursor-pointer"
            >
              <motion.div 
                className="feature-icon mb-6"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <feature.icon size={32} />
              </motion.div>
              
              <h3 className="font-display text-xl font-semibold text-[var(--secondary-900)] mb-3 group-hover:text-[var(--primary-600)] transition-colors duration-300">
                {feature.title}
              </h3>
              
              <p className="text-sm text-[var(--secondary-500)] leading-relaxed line-clamp-3">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
