import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, MapPin, FileText } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { ordersApi } from '../../services/orders';
import { resolveUploadUrl } from '../../services/api';
import toast from 'react-hot-toast';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } }
};

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, totalAmount, clearCart } = useCart();
  const { isAuthenticated, user, refreshUser } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [notes, setNotes] = useState('');

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error('Veuillez vous connecter pour passer une commande');
      navigate('/login');
      return;
    }

    if (items.length === 0) {
      toast.error('Votre panier est vide');
      return;
    }

    if (!deliveryAddress.trim()) {
      toast.error('Veuillez entrer une adresse de livraison');
      return;
    }

    setIsCheckingOut(true);
    try {
      const orderData = {
        items: items.map((item) => ({
          platId: item.plat.id,
          quantity: item.quantity,
        })),
        deliveryAddress,
        notes: notes.trim() || undefined,
      };

      await ordersApi.createOrder(orderData);
      toast.success('Commande passée avec succès !');
      clearCart();
      await refreshUser(); // Update orders count
      navigate('/portal/orders');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la commande');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#faf9f8] pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <motion.div variants={itemVariant} className="w-24 h-24 bg-[#eeeef1] rounded-2xl flex items-center justify-center mb-6 text-[#8e91a1]">
              <ShoppingBag size={48} />
            </motion.div>
            <motion.h2 variants={fadeUp} className="font-[Playfair_Display] text-3xl font-semibold text-[#3f404c] mb-3">
              Votre panier est vide
            </motion.h2>
            <motion.p variants={itemVariant} className="text-[#6f7286] mb-8 max-w-md">
              Découvrez notre catalogue et ajoutez des plats à votre panier
            </motion.p>
            <motion.div variants={itemVariant}>
              <Button variant="primary" onClick={() => navigate('/catalogue')}>
                Découvrir le catalogue
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f8] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="mb-8"
        >
          <motion.button
            variants={itemVariant}
            onClick={() => navigate('/catalogue')}
            className="flex items-center gap-2 text-[#6f7286] hover:text-[#e8614a] transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Continuer les achats</span>
          </motion.button>

          <motion.p variants={itemVariant} className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8614a] mb-3">
            Panier
          </motion.p>
          <motion.h1 variants={fadeUp} className="font-[Playfair_Display] text-4xl md:text-5xl font-semibold text-[#3f404c] mb-3">
            Mon Panier
          </motion.h1>
          <motion.p variants={itemVariant} className="text-lg text-[#6f7286]">
            {items.length} article(s) dans votre panier
          </motion.p>
        </motion.div>

        {/* Cart Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="lg:col-span-2 space-y-4"
          >
            {items.map((item) => (
              <motion.div
                key={item.plat.id}
                variants={itemVariant}
                className="bg-white/70 backdrop-blur border border-[#d9dae0] rounded-2xl p-4 hover:border-[#f8a992] transition-all duration-300"
              >
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="w-24 h-24 bg-[#f8f8f9] rounded-xl overflow-hidden flex-shrink-0">
                    {item.plat.image ? (
                      <img
                        src={resolveUploadUrl(item.plat.image)}
                        alt={item.plat.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#b6b8c3]">
                        <ShoppingBag size={24} />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#e8614a] mb-1">
                          {item.plat.category?.name}
                        </p>
                        <h3 className="font-[Playfair_Display] text-lg font-semibold text-[#3f404c] truncate">
                          {item.plat.name}
                        </h3>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.plat.id)}
                        className="p-2 text-[#8e91a1] hover:text-[#e8614a] hover:bg-[#fde8e1] rounded-lg transition-all"
                        aria-label="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <p className="text-[#e8614a] font-semibold mb-3">
                      {item.plat.price.toFixed(2)} TND
                    </p>

                    {/* Quantity & Total */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-[#f8f8f9] rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.plat.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-[#6f7286] hover:text-[#e8614a] hover:bg-white rounded-md transition-all"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center font-semibold text-[#3f404c]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.plat.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-[#6f7286] hover:text-[#e8614a] hover:bg-white rounded-md transition-all"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <span className="font-[Playfair_Display] text-xl font-semibold text-[#3f404c]">
                        {(item.plat.price * item.quantity).toFixed(2)} TND
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:sticky lg:top-24 h-fit"
          >
            <Card className="bg-white/70 backdrop-blur border border-[#d9dae0] rounded-2xl overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="font-[Playfair_Display] text-xl text-[#3f404c]">
                  Récapitulatif
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-[#6f7286]">
                  <span>Sous-total</span>
                  <span className="font-medium text-[#3f404c]">{totalAmount.toFixed(2)} TND</span>
                </div>
                <div className="flex justify-between text-[#6f7286]">
                  <span>Livraison</span>
                  <span className="text-green-600 font-medium">Gratuite</span>
                </div>
                <div className="h-px bg-[#d9dae0]" />
                <div className="flex justify-between">
                  <span className="font-[Playfair_Display] text-lg font-semibold text-[#3f404c]">Total</span>
                  <span className="font-[Playfair_Display] text-2xl font-semibold text-[#e8614a]">
                    {totalAmount.toFixed(2)} TND
                  </span>
                </div>

                <div className="pt-4 space-y-4">
                  <Input
                    label="Adresse de livraison"
                    placeholder="Entrez votre adresse"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    leftIcon={MapPin}
                  />
                  <Input
                    label="Notes (optionnel)"
                    placeholder="Instructions spéciales..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    leftIcon={FileText}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={isCheckingOut}
                  onClick={handleCheckout}
                >
                  Passer la commande
                </Button>
                <p className="text-xs text-center text-[#8e91a1]">
                  Paiement à la livraison
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
