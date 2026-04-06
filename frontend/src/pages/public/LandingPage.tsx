import { Hero } from '../../sections/Hero';
import { Marquee, MarqueeSeparator } from '../../components/Marquee';
import { Features } from '../../sections/Features';
import { CTASection } from '../../sections/CTASection';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen" id="top">
      <div className="grain-overlay" />

      <Hero
        title="Des tables qui"
        accentWord="marquent"
        subtitle="Traiteur premium pour entreprises, receptions privees et moments de vie, avec une execution culinaire precise et chaleureuse."
      />

      <MarqueeSeparator
        items={['Cuisine Signature', 'Service Premium', 'Evenements Sur Mesure', 'Livraison Soignee']}
        variant="light"
      />

      <Features />

      <Marquee
        items={['Mariages', 'Corporate', 'Cocktails', 'Buffets', 'Chef a Domicile', 'Devis Instantane']}
        direction="reverse"
        speed={34}
      />

      <CTASection />
    </div>
  );
};
