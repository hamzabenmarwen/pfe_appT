import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Clock3, PackageCheck, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { ordersApi } from '../../services/orders';
import { OrderStatus, ProductionBoardData, ProductionBoardOrder } from '../../types';
import toast from 'react-hot-toast';

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  [OrderStatus.PENDING]: OrderStatus.PREPARING,
  [OrderStatus.PREPARING]: OrderStatus.DELIVERING,
  [OrderStatus.DELIVERING]: OrderStatus.DELIVERED,
  [OrderStatus.DELIVERED]: null,
  [OrderStatus.CANCELLED]: null,
};

const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  [OrderStatus.PENDING]: 'Passer en preparation',
  [OrderStatus.PREPARING]: 'Passer en livraison',
  [OrderStatus.DELIVERING]: 'Marquer livree',
};

export const ProductionBoardPage: React.FC = () => {
  const [data, setData] = useState<ProductionBoardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [mode, setMode] = useState<'active' | 'range'>('active');
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [windowDays, setWindowDays] = useState<number>(1);

  const loadBoard = async () => {
    try {
      setIsLoading(true);
      const params = mode === 'active'
        ? { mode }
        : { mode, date: selectedDate, windowDays };
      const result = await ordersApi.getProductionBoard(params);
      setData(result);
    } catch {
      toast.error('Impossible de charger le planning de production');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBoard();
  }, [mode, selectedDate, windowDays]);

  const overloadedSlots = useMemo(() => data?.slotWorkload.filter((s) => s.isOverCapacity) || [], [data]);

  const handleAdvance = async (order: ProductionBoardOrder) => {
    const nextStatus = NEXT_STATUS[order.status];
    if (!nextStatus) return;

    try {
      setUpdatingOrderId(order.id);
      await ordersApi.updateOrderStatus(order.id, nextStatus);
      toast.success('Statut mis a jour');
      await loadBoard();
    } catch {
      toast.error('Echec de la mise a jour du statut');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Planning de production</h1>
          <p className="admin-page-subtitle">Vue cuisine en temps reel avec charge par tranche horaire</p>
        </div>
        <div className="admin-actions">
          <div className="inline-flex rounded-full border border-gray-200 overflow-hidden">
            <button
              type="button"
              className={`px-3 py-1.5 text-sm font-semibold transition-colors ${mode === 'active' ? 'bg-[var(--primary-600)] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              onClick={() => setMode('active')}
            >
              Actives
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 text-sm font-semibold transition-colors ${mode === 'range' ? 'bg-[var(--primary-600)] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              onClick={() => setMode('range')}
            >
              Plage datee
            </button>
          </div>

          {mode === 'range' && (
            <>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-full border border-gray-200 px-3 py-2 text-sm"
              />
              <select
                value={windowDays}
                onChange={(e) => setWindowDays(Number(e.target.value))}
                className="rounded-full border border-gray-200 px-3 py-2 text-sm"
              >
                <option value={1}>1 jour</option>
                <option value={3}>3 jours</option>
                <option value={7}>7 jours</option>
              </select>
            </>
          )}

          <Button variant="outline" leftIcon={RefreshCcw} onClick={loadBoard}>
            Actualiser
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <Card className="admin-surface border rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary-50)] text-[var(--primary-600)] flex items-center justify-center">
              <PackageCheck size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {mode === 'active' ? 'Commandes actives' : 'Commandes sur plage'}
              </p>
              <p className="text-2xl font-bold text-gray-900">{isLoading ? '...' : data?.summary.totalOrders || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="admin-surface border rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Clock3 size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Backlog actif</p>
              <p className="text-2xl font-bold text-gray-900">{isLoading ? '...' : data?.summary.backlogCount || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="admin-surface border rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tranches surchargees</p>
              <p className="text-2xl font-bold text-gray-900">{isLoading ? '...' : data?.summary.overloadedSlots || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {overloadedSlots.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 text-sm font-medium">
          Attention: {overloadedSlots.length} tranche(s) depassent la capacite de preparation.
        </div>
      )}

      <div className="admin-surface border rounded-2xl p-6 mb-8">
        <h3 className="font-[Playfair_Display] text-xl font-bold text-[#1F2937] mb-4">Charge par tranche horaire</h3>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} width="100%" height="2.5rem" className="rounded-xl" />)}
          </div>
        ) : data?.slotWorkload.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {data.slotWorkload.map((slot) => (
              <div
                key={slot.slot}
                className={`rounded-xl border p-3 ${slot.isOverCapacity ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900">{slot.slot}</p>
                  <p className={`text-xs font-semibold ${slot.isOverCapacity ? 'text-red-600' : 'text-gray-500'}`}>
                    {slot.workloadPoints}/{slot.capacity} pts
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-1">{slot.ordersCount} commande(s)</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500">
            <p>Aucune commande trouvee pour ce mode.</p>
            <p className="text-sm mt-2">
              Astuce: si rien n apparait en mode Actives, cela signifie qu il n y a actuellement aucune commande en attente/preparation/livraison.
            </p>
            <p className="text-sm mt-2">
              Vous pouvez consulter l historique dans <Link to="/admin/orders" className="text-[var(--primary-600)] font-semibold">Commandes</Link>.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <Card key={i} className="admin-surface border rounded-2xl p-4">
              <Skeleton width="60%" height="1.25rem" />
              <Skeleton width="100%" height="6rem" className="mt-4 rounded-xl" />
            </Card>
          ))
        ) : (
          data?.lanes.map((lane) => (
            <Card key={lane.status} className="admin-surface border rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{lane.label}</h3>
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                  {lane.orders.length}
                </span>
              </div>

              <div className="space-y-3">
                {lane.orders.length === 0 ? (
                  <div className="text-sm text-gray-400 border border-dashed border-gray-200 rounded-xl p-4 text-center">
                    Rien pour le moment
                  </div>
                ) : lane.orders.map((order) => (
                  <div key={order.id} className="rounded-xl border border-gray-200 bg-white p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm text-gray-900">#{order.orderNumber}</p>
                      <span className="text-[11px] text-gray-500">{order.slotLabel}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {order.user?.firstName} {order.user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Charge: {order.workloadPoints} pts · {order.items.length} article(s)
                    </p>
                    {NEXT_STATUS[order.status] && (
                      <Button
                        size="sm"
                        className="mt-3 w-full"
                        disabled={updatingOrderId === order.id}
                        onClick={() => handleAdvance(order)}
                      >
                        {updatingOrderId === order.id ? 'Mise a jour...' : NEXT_LABEL[order.status]}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
