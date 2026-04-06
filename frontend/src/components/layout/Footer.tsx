import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-[var(--secondary-900)] text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="inline-flex items-center gap-3 font-[Playfair_Display] text-2xl font-semibold text-white">
              <ChefHat size={32} />
              <span>Assiette GA.Ala Sfaxienne</span>
            </Link>
            <p className="mt-4 max-w-sm text-[var(--secondary-300)] leading-relaxed">
              Service traiteur d'excellence pour vos événements. Des créations
              gastronomiques sur mesure pour des moments inoubliables.
            </p>
            <div className="mt-5 flex gap-3">
              <a href="#" aria-label="Instagram" className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--secondary-800)] text-[var(--secondary-300)] transition hover:bg-[var(--primary-500)] hover:text-white">
                <Instagram size={20} />
              </a>
              <a href="#" aria-label="Facebook" className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--secondary-800)] text-[var(--secondary-300)] transition hover:bg-[var(--primary-500)] hover:text-white">
                <Facebook size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--secondary-400)]">Liens rapides</h4>
            <ul className="space-y-2">
              <li><Link className="text-[var(--secondary-300)] transition hover:text-[var(--primary-300)]" to="/">Accueil</Link></li>
              <li><Link className="text-[var(--secondary-300)] transition hover:text-[var(--primary-300)]" to="/catalogue">Catalogue</Link></li>
              <li><Link className="text-[var(--secondary-300)] transition hover:text-[var(--primary-300)]" to="/events">Événements</Link></li>
              <li><Link className="text-[var(--secondary-300)] transition hover:text-[var(--primary-300)]" to="/login">Connexion</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--secondary-400)]">Services</h4>
            <ul className="space-y-2">
              <li><Link className="text-[var(--secondary-300)] transition hover:text-[var(--primary-300)]" to="/catalogue">Commandes quotidiennes</Link></li>
              <li><Link className="text-[var(--secondary-300)] transition hover:text-[var(--primary-300)]" to="/events">Mariages</Link></li>
              <li><Link className="text-[var(--secondary-300)] transition hover:text-[var(--primary-300)]" to="/events">Séminaires</Link></li>
              <li><Link className="text-[var(--secondary-300)] transition hover:text-[var(--primary-300)]" to="/events">Anniversaires</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--secondary-400)]">Contact</h4>
            <ul className="space-y-3 text-[var(--secondary-300)]">
              <li className="flex items-center gap-2">
                <Phone size={16} />
                <span>24 230 587</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} />
                <span>assiestte.sfaxienne@gmail.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} />
                <span>route mahdia km 1</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-[var(--secondary-800)] pt-6 text-sm text-[var(--secondary-400)] md:flex md:items-center md:justify-between">
          <p>&copy; {currentYear} Assiette GA.Ala Sfaxienne. Tous droits réservés.</p>
          <p>PFE - Master Informatique, ISET Sfax 2025-2026</p>
        </div>
      </div>
    </footer>
  );
};
