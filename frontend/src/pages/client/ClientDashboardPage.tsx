import React from 'react';
import { motion } from 'framer-motion';
import { Award, Package, Calendar, Star, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export const ClientDashboardPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-8">
      {/* Header */}
      <div>
        <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-wider text-[#e8614a] mb-2">
          Vue d'ensemble
        </motion.p>
        <motion.h1 variants={fadeUp} className="font-[Playfair_Display] text-4xl font-semibold text-[#3f404c]">
          Bonjour, {user.firstName} !
        </motion.h1>
        <motion.p variants={fadeUp} className="text-[#6f7286] mt-2">
          Bienvenue dans votre espace client personnel.
        </motion.p>
      </div>

      <motion.div variants={fadeUp} className="grid md:grid-cols-3 gap-6">
        {/* Loyalty Points */}
        <Card className="bg-gradient-to-br from-[#f8a992] to-[#e8614a] border-none text-white rounded-2xl overflow-hidden shadow-lg shadow-red-500/20">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                <Award size={24} className="text-white" />
              </div>
            </div>
            <div>
              <p className="text-white/80 font-medium mb-1">Points de fidélité</p>
              <h3 className="font-[Playfair_Display] text-4xl font-bold">{user.loyaltyPoints}</h3>
              <p className="text-sm text-white/70 mt-2">10 TND achetés = 1 point</p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="bg-white/70 backdrop-blur border border-[#d9dae0] rounded-2xl overflow-hidden hover:border-[#f8a992] transition-colors">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-[#fde8e1] rounded-xl flex items-center justify-center mb-6 text-[#e8614a]">
              <Package size={24} />
            </div>
            <div>
              <p className="text-[#6f7286] font-medium mb-1">Total Commandes</p>
              <h3 className="font-[Playfair_Display] text-3xl font-bold text-[#3f404c]">{user._count?.orders || 0}</h3>
            </div>
            <Link to="/portal/orders" className="text-sm text-[#e8614a] font-medium inline-flex items-center gap-1 mt-4 hover:underline">
              Voir l'historique <ArrowRight size={16} />
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur border border-[#d9dae0] rounded-2xl overflow-hidden hover:border-[#f8a992] transition-colors">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-[#eeeef1] rounded-xl flex items-center justify-center mb-6 text-[#8e91a1]">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-[#6f7286] font-medium mb-1">Événements organisés</p>
              <h3 className="font-[Playfair_Display] text-3xl font-bold text-[#3f404c]">{user._count?.events || 0}</h3>
            </div>
            <Link to="/portal/events" className="text-sm text-[#8e91a1] font-medium inline-flex items-center gap-1 mt-4 hover:underline">
              Gérer vos événements <ArrowRight size={16} />
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recommended Actions */}
      <motion.div variants={fadeUp} className="mt-8">
        <h2 className="font-[Playfair_Display] text-2xl font-semibold text-[#3f404c] mb-4">Actions Rapides</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link to="/catalogue" className="flex items-center gap-4 p-5 bg-white border border-[#d9dae0] rounded-xl hover:border-[#e8614a] transition-all group">
            <div className="w-10 h-10 bg-[#f8f8f9] rounded-lg flex items-center justify-center text-[#6f7286] group-hover:bg-[#fde8e1] group-hover:text-[#e8614a] transition-colors">
              <Package size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-[#3f404c]">Lancer une commande</h4>
              <p className="text-sm text-[#6f7286]">Parcourir le catalogue de plats quotidiens</p>
            </div>
            <ArrowRight size={20} className="ml-auto text-[#d9dae0] group-hover:text-[#e8614a] transition-colors" />
          </Link>
          
          <Link to="/events/quote" className="flex items-center gap-4 p-5 bg-white border border-[#d9dae0] rounded-xl hover:border-[#e8614a] transition-all group">
            <div className="w-10 h-10 bg-[#f8f8f9] rounded-lg flex items-center justify-center text-[#6f7286] group-hover:bg-[#fde8e1] group-hover:text-[#e8614a] transition-colors">
              <Star size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-[#3f404c]">Préparer un événement</h4>
              <p className="text-sm text-[#6f7286]">Demander un devis sur mesure avec notre traiteur</p>
            </div>
            <ArrowRight size={20} className="ml-auto text-[#d9dae0] group-hover:text-[#e8614a] transition-colors" />
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
};
