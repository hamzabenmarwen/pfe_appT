import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { catalogueApi } from '../../services/catalogue';
import { resolveUploadUrl } from '../../services/api';
import { Category, Plat } from '../../types';
import { useCart } from '../../contexts/CartContext';
import toast from 'react-hot-toast';

const fadeUp = { 
  hidden: { opacity: 0, y: 40 }, 
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const } } 
};

const stagger = { 
  hidden: { opacity: 0 }, 
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } } 
};

const item = { 
  hidden: { opacity: 0, y: 30 }, 
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } } 
};

export const CataloguePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [plats, setPlats] = useState<Plat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [categoriesData, platsData] = await Promise.all([
        catalogueApi.getCategories(),
        catalogueApi.getPlats({ limit: 100 }),
      ]);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setPlats(Array.isArray(platsData.data) ? platsData.data : []);
    } catch (error) {
      toast.error('Erreur lors du chargement du catalogue');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPlats = (plats || []).filter((plat) => {
    const matchesCategory = selectedCategory ? plat.categoryId === selectedCategory : true;
    const matchesSearch = plat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          plat.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && plat.available;
  });

  const handleAddToCart = (plat: Plat) => {
    addToCart(plat);
    toast.success(`${plat.name} ajouté au panier`);
  };

  return (
    <div className="min-h-screen bg-[#faf9f8] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={stagger}
          className="mb-12"
        >
          <motion.p variants={item} className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8614a] mb-3">
            Notre Sélection
          </motion.p>
          <motion.h1 variants={fadeUp} className="font-[Playfair_Display] text-4xl md:text-5xl font-semibold text-[#3f404c] mb-3">
            Notre Catalogue
          </motion.h1>
          <motion.p variants={item} className="text-lg text-[#6f7286]">
            Découvrez notre sélection de plats raffinés
          </motion.p>
        </motion.div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-10 space-y-4"
        >
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8e91a1]" size={20} />
            <input
              type="text"
              placeholder="Rechercher un plat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/70 backdrop-blur border border-[#d9dae0] rounded-xl text-[#3f404c] placeholder-[#8e91a1] focus:outline-none focus:border-[#e8614a] focus:ring-2 focus:ring-[#e8614a]/10 transition-all"
            />
          </div>
          
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === null 
                  ? 'bg-[#e8614a] text-white shadow-lg shadow-[#e8614a]/25' 
                  : 'bg-white/70 text-[#6f7286] border border-[#d9dae0] hover:border-[#e8614a] hover:text-[#e8614a]'
              }`}
            >
              Tous
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category.id 
                    ? 'bg-[#e8614a] text-white shadow-lg shadow-[#e8614a]/25' 
                    : 'bg-white/70 text-[#6f7286] border border-[#d9dae0] hover:border-[#e8614a] hover:text-[#e8614a]'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Plats Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/70 backdrop-blur border border-[#d9dae0] rounded-2xl h-96 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {filteredPlats.filter(p => p.isPlatDuJour).length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Star className="text-yellow-500" fill="currentColor" size={24} />
                  <h2 className="font-[Playfair_Display] text-2xl font-bold text-[#3f404c]">Aujourd'hui à l'Honneur</h2>
                </div>
                <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={stagger}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8"
                >
                  {filteredPlats.filter(p => p.isPlatDuJour).map((plat) => (
                    <motion.div 
                      key={plat.id} 
                      variants={item}
                      onClick={() => navigate(`/plats/${plat.id}`)}
                      className="group flex flex-col sm:flex-row bg-white rounded-2xl shadow-xl shadow-orange-100/50 border border-orange-100 overflow-hidden hover:border-[#e8614a] transition-all duration-500 cursor-pointer"
                    >
                      <div className="sm:w-2/5 h-48 sm:h-auto relative bg-[#f8f8f9]">
                        {plat.image ? (
                           <img 
                            src={resolveUploadUrl(plat.image)} 
                            alt={plat.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#b6b8c3]">
                            <ShoppingCart size={40} />
                          </div>
                        )}
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur rounded-full px-3 py-1 shadow-sm font-bold text-xs text-yellow-600 flex items-center gap-1.5 uppercase tracking-wider">
                           <Star size={12} fill="currentColor" /> Plat du Jour
                        </div>
                      </div>
                      <div className="p-6 flex flex-col justify-between flex-1">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-[#e8614a] mb-2">{plat.category?.name}</p>
                          <h3 className="font-[Playfair_Display] text-2xl font-semibold text-[#3f404c] mb-2 group-hover:text-[#e8614a] transition-colors">{plat.name}</h3>
                          <p className="text-sm text-[#6f7286] mb-4 line-clamp-2">{plat.description}</p>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-[#eeeef1]">
                          <span className="font-[Playfair_Display] text-2xl font-bold text-[#e8614a]">{plat.price.toFixed(2)} TND</span>
                          <motion.button
                            onClick={(e) => { e.stopPropagation(); handleAddToCart(plat); }}
                            className="px-5 py-2.5 bg-[#e8614a] text-white font-medium rounded-full text-sm flex items-center gap-2 shadow-md shadow-[#e8614a]/20"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <ShoppingCart size={18} /> Ajouter
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            )}
            
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredPlats.filter(p => !p.isPlatDuJour).map((plat) => (
                <motion.div 
                  key={plat.id} 
                  variants={item}
                  whileHover={{ y: -8 }}
                  onClick={() => navigate(`/plats/${plat.id}`)}
                  style={{ cursor: 'pointer' }}
                  className="group bg-white/70 backdrop-blur border border-[#d9dae0] rounded-2xl overflow-hidden hover:border-[#f8a992] hover:shadow-xl transition-all duration-500"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-[#f8f8f9]">
                    {plat.image ? (
                      <img 
                        src={resolveUploadUrl(plat.image)} 
                        alt={plat.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#b6b8c3]">
                        <ShoppingCart size={40} />
                      </div>
                    )}
                    {plat.allergens.length > 0 && (
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                        {plat.allergens.map((allergen) => (
                          <span key={allergen} className="px-2 py-1 bg-[#f59e0b]/15 text-[#f59e0b] text-xs font-medium rounded-full border border-[#f59e0b]/30">
                            {allergen}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#e8614a] mb-2">
                      {plat.category?.name}
                    </p>
                    <h3 className="font-[Playfair_Display] text-xl font-semibold text-[#3f404c] mb-2 group-hover:text-[#e8614a] transition-colors">
                      {plat.name}
                    </h3>
                    <p className="text-sm text-[#6f7286] mb-4 line-clamp-2">
                      {plat.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-[#8e91a1] mb-4">
                      {plat.preparationTime && (
                        <span>{plat.preparationTime} min</span>
                      )}
                      {plat.averageRating && (
                        <span className="flex items-center gap-1 text-[#f59e0b]">
                          <Star size={14} fill="currentColor" />
                          {plat.averageRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    
                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-[#eeeef1]">
                      <span className="font-[Playfair_Display] text-2xl font-semibold text-[#e8614a]">
                        {plat.price.toFixed(2)} TND
                      </span>
                      <motion.button
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(plat); }}
                        className="px-4 py-2 bg-[#e8614a] text-white font-medium rounded-full text-sm flex items-center gap-2 shadow-md shadow-[#e8614a]/20"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ShoppingCart size={16} />
                        Ajouter
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            
            {filteredPlats.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-[#eeeef1] rounded-2xl flex items-center justify-center text-[#8e91a1]">
                  <ShoppingCart size={40} />
                </div>
                <h3 className="font-[Playfair_Display] text-2xl font-semibold text-[#3f404c] mb-2">
                  Aucun plat trouvé
                </h3>
                <p className="text-[#6f7286]">
                  Essayez de modifier vos critères de recherche
                </p>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
