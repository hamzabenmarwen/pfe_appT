import React, { useState, useEffect } from 'react';
import { Search, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { ordersApi } from '../../services/orders';
import { Order, OrderStatus } from '../../types';
import toast from 'react-hot-toast';

const statusConfig: Record<OrderStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' }> = {
  [OrderStatus.PENDING]: { label: 'En attente', variant: 'warning' },
  [OrderStatus.PREPARING]: { label: 'En préparation', variant: 'info' },
  [OrderStatus.DELIVERING]: { label: 'En livraison', variant: 'info' },
  [OrderStatus.DELIVERED]: { label: 'Livrée', variant: 'success' },
  [OrderStatus.CANCELLED]: { label: 'Annulée', variant: 'error' },
};

const statusFlow: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.PREPARING,
  OrderStatus.DELIVERING,
  OrderStatus.DELIVERED,
];

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const response = await ordersApi.getOrders({ limit: 100 });
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error('Erreur lors du chargement des commandes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await ordersApi.updateOrderStatus(orderId, status);
      toast.success('Statut mis à jour');
      loadOrders();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex >= 0 && currentIndex < statusFlow.length - 1) {
      return statusFlow[currentIndex + 1];
    }
    return null;
  };

  const filteredOrders = orders.filter((order) =>
    order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Gestion des Commandes</h1>
          <p className="admin-page-subtitle">Suivi des statuts et des livraisons</p>
        </div>
        <div className="w-full sm:w-72">
          <Input
            type="text"
            placeholder="Rechercher par n° ou client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={Search}
          />
        </div>
      </div>

      <Card className="admin-surface border rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} width="100%" height="4rem" className="rounded-xl" />)}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              Aucune commande trouvée.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredOrders.map((order) => {
                const status = statusConfig[order.status];
                const nextStatus = getNextStatus(order.status);
                const isExpanded = expandedOrder === order.id;

                return (
                  <div key={order.id} className={`transition-all ${isExpanded ? 'bg-gray-50/50' : 'hover:bg-gray-50/50'}`}>
                    <div 
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 cursor-pointer"
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                          <Package size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                             <span className="font-semibold text-gray-900">#{order.orderNumber}</span>
                             <Badge variant={status.variant}>{status.label}</Badge>
                          </div>
                          <span className="text-xs text-gray-500">{formatDate(order.createdAt)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-6 flex-1">
                        <div className="text-sm text-gray-600 font-medium">
                          {order.user?.firstName} {order.user?.lastName}
                        </div>
                        <div className="font-bold text-[#e8614a]">
                          {order.totalAmount.toFixed(2)} TND
                        </div>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-6 pt-2 bg-gray-50/50 border-t border-gray-100/50">
                        <div className="grid md:grid-cols-2 gap-8">
                          <div>
                            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">Articles commandés</h4>
                            <div className="space-y-3">
                              {order.items.map((item) => (
                                <div key={item.id} className="flex justify-between items-center text-sm">
                                  <span className="text-gray-600 font-medium">{item.quantity}x {item.plat?.name}</span>
                                  <span className="text-gray-900 font-semibold">{(item.unitPrice * item.quantity).toFixed(2)} TND</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="space-y-6">
                            <div>
                              <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2">Informations de livraison</h4>
                              {order.deliveryAddress ? (
                                <p className="text-sm text-gray-600 leading-relaxed bg-white p-3 rounded-lg border border-gray-200">{order.deliveryAddress}</p>
                              ) : (
                                <p className="text-sm text-gray-400">Aucune adresse fournie.</p>
                              )}
                              
                              {order.notes && (
                                <div className="mt-3">
                                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Notes du client</h4>
                                  <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-yellow-100 bg-yellow-50/30">{order.notes}</p>
                                </div>
                              )}
                            </div>

                            {nextStatus && (
                              <div className="flex gap-3">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order.id, nextStatus); }}
                                >
                                  Passer à: {statusConfig[nextStatus].label}
                                </Button>
                                {order.status !== OrderStatus.CANCELLED && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order.id, OrderStatus.CANCELLED); }}
                                  >
                                    Annuler commande
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
