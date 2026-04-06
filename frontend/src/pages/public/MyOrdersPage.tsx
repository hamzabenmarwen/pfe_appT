import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, X, ChevronRight, ShoppingBag } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { ordersApi } from '../../services/orders';
import { Order, OrderStatus } from '../../types';
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

const statusConfig: Record<OrderStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info'; icon: typeof Package }> = {
  [OrderStatus.PENDING]: { label: 'En attente', variant: 'warning', icon: Clock },
  [OrderStatus.PREPARING]: { label: 'En préparation', variant: 'info', icon: Package },
  [OrderStatus.DELIVERING]: { label: 'En livraison', variant: 'info', icon: Package },
  [OrderStatus.DELIVERED]: { label: 'Livrée', variant: 'success', icon: CheckCircle },
  [OrderStatus.CANCELLED]: { label: 'Annulée', variant: 'error', icon: X },
};

export const MyOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const response = await ordersApi.getOrders();
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error('Erreur lors du chargement des commandes');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="w-full">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="mb-10"
      >
        <motion.p variants={itemVariant} className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8614a] mb-3">
          Suivi
        </motion.p>
        <motion.h1 variants={fadeUp} className="font-[Playfair_Display] text-3xl font-semibold text-[#3f404c] mb-3">
          Mes Commandes
        </motion.h1>
      </motion.div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="bg-white/70 border border-[#d9dae0] rounded-2xl p-6">
              <Skeleton width="30%" height="1.5rem" />
              <Skeleton width="50%" height="1rem" className="mt-2" />
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-[#eeeef1] rounded-2xl flex items-center justify-center text-[#8e91a1]">
            <Package size={40} />
          </div>
          <h3 className="font-[Playfair_Display] text-2xl font-semibold text-[#3f404c] mb-2">
            Aucune commande
          </h3>
          <p className="text-[#6f7286] mb-6">Vous n'avez pas encore passé de commande</p>
          <Button variant="primary" onClick={() => navigate('/catalogue')}>
            Découvrir le catalogue
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="space-y-4"
        >
          {orders.map((order) => {
            const status = statusConfig[order.status];
            const StatusIcon = status.icon;

            return (
              <motion.div
                key={order.id}
                variants={itemVariant}
                className="bg-white/70 backdrop-blur border border-[#d9dae0] rounded-2xl overflow-hidden hover:border-[#f8a992] transition-all"
              >
                {/* Header */}
                <div className="p-6 border-b border-[#eeeef1]">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="font-[Playfair_Display] text-lg font-semibold text-[#3f404c] mb-1">
                        Commande #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-[#6f7286]">{formatDate(order.createdAt)}</p>
                    </div>
                    <Badge variant={status.variant} leftIcon={StatusIcon}>
                      {status.label}
                    </Badge>
                  </div>
                </div>

                {/* Items */}
                <div className="p-6">
                  <div className="space-y-2 mb-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-[#f8f8f9] rounded-lg flex items-center justify-center text-[#8e91a1]">
                            <ShoppingBag size={20} />
                          </div>
                          <div>
                            <span className="font-medium text-[#3f404c]">
                              {item.quantity}x {item.plat?.name || 'Plat'}
                            </span>
                            <p className="text-sm text-[#6f7286]">{item.unitPrice.toFixed(2)} TND / unité</p>
                          </div>
                        </div>
                        <span className="font-semibold text-[#3f404c]">
                          {(item.unitPrice * item.quantity).toFixed(2)} TND
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t border-[#eeeef1]">
                    <div>
                      <span className="text-sm text-[#6f7286]">Total</span>
                      <p className="font-[Playfair_Display] text-2xl font-bold text-[#e8614a]">
                        {order.totalAmount.toFixed(2)} TND
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Détails
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};
