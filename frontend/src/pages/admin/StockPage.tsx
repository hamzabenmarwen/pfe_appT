import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, Package, CheckCircle, XCircle, Save } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { catalogueApi } from '../../services/catalogue';
import toast from 'react-hot-toast';

interface StockItem {
  id: string;
  name: string;
  stockQuantity: number;
  available: boolean;
  category: { name: string };
}

interface PurchaseSuggestion {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  threshold: number;
  targetStock: number;
  suggestedOrderQty: number;
  urgency: 'critical' | 'warning';
}

export const StockPage: React.FC = () => {
  const [items, setItems] = useState<StockItem[]>([]);
  const [suggestions, setSuggestions] = useState<PurchaseSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');

  useEffect(() => {
    loadStock();
  }, []);

  const loadStock = async () => {
    try {
      setIsLoading(true);
      const data = await catalogueApi.getStockLevels();
      setItems(Array.isArray(data) ? data : []);
      const suggestionsData = await catalogueApi.getPurchaseSuggestions({ threshold: 5, targetStock: 20 });
      setSuggestions(Array.isArray(suggestionsData) ? suggestionsData : []);
    } catch (error) {
      toast.error('Erreur lors du chargement du stock');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveStock = async (id: string) => {
    try {
      await catalogueApi.updateStock(id, editValue);
      toast.success('Stock mis à jour');
      setEditingId(null);
      loadStock();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const startEdit = (item: StockItem) => {
    setEditingId(item.id);
    setEditValue(item.stockQuantity);
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === 'low') return matchesSearch && item.stockQuantity > 0 && item.stockQuantity <= 5;
    if (filter === 'out') return matchesSearch && item.stockQuantity === 0;
    return matchesSearch;
  });

  const totalItems = items.length;
  const lowStockItems = items.filter(i => i.stockQuantity > 0 && i.stockQuantity <= 5).length;
  const outOfStockItems = items.filter(i => i.stockQuantity === 0).length;
  const healthyItems = items.filter(i => i.stockQuantity > 5).length;

  const getStockBadge = (qty: number) => {
    if (qty === 0) return <Badge variant="error">Rupture</Badge>;
    if (qty <= 5) return <Badge variant="warning">Stock faible</Badge>;
    return <Badge variant="success">En stock</Badge>;
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Gestion du Stock</h1>
          <p className="admin-page-subtitle">Surveillez et mettez a jour les niveaux de stock</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div 
          className={`admin-surface admin-kpi-card rounded-2xl p-6 border transition-all cursor-pointer ${filter === 'all' ? 'border-[#e8614a] ring-1 ring-[#e8614a]/30' : 'border-gray-100 hover:border-gray-300'}`}
          onClick={() => setFilter('all')}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
              <Package size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total produits</p>
              <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
            </div>
          </div>
        </div>

        <div 
          className={`admin-surface admin-kpi-card rounded-2xl p-6 border transition-all cursor-pointer ${filter === 'all' ? 'border-[#e8614a] ring-1 ring-[#e8614a]/30' : 'border-gray-100 hover:border-gray-300'}`}
          onClick={() => setFilter('all')}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">En stock</p>
              <p className="text-2xl font-bold text-gray-900">{healthyItems}</p>
            </div>
          </div>
        </div>

        <div 
          className={`admin-surface admin-kpi-card rounded-2xl p-6 border transition-all cursor-pointer ${filter === 'low' ? 'border-orange-500 ring-1 ring-orange-500/30' : 'border-gray-100 hover:border-gray-300'}`}
          onClick={() => setFilter('low')}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Stock faible</p>
              <p className="text-2xl font-bold text-orange-600">{lowStockItems}</p>
            </div>
          </div>
        </div>

        <div 
          className={`admin-surface admin-kpi-card rounded-2xl p-6 border transition-all cursor-pointer ${filter === 'out' ? 'border-red-500 ring-1 ring-red-500/30' : 'border-gray-100 hover:border-gray-300'}`}
          onClick={() => setFilter('out')}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
              <XCircle size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">En rupture</p>
              <p className="text-2xl font-bold text-red-600">{outOfStockItems}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Low stock alerts */}
      {lowStockItems + outOfStockItems > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-orange-50 border border-orange-200 flex items-start sm:items-center gap-3">
          <AlertTriangle size={20} className="text-orange-600 shrink-0 mt-0.5 sm:mt-0" />
          <span className="text-orange-800 text-sm font-medium leading-relaxed">
            {outOfStockItems > 0 && `${outOfStockItems} produit(s) en rupture de stock. `}
            {lowStockItems > 0 && `${lowStockItems} produit(s) avec stock faible (≤ 5 unités limitées).`}
          </span>
        </div>
      )}

      <Card className="admin-surface border overflow-hidden rounded-2xl">
        <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg font-bold text-gray-800">Niveaux de stock</CardTitle>
            <div className="w-full sm:w-72">
              <Input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={Search}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(8)].map((_, i) => <Skeleton key={i} width="100%" height="3.5rem" className="rounded-xl" />)}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              {searchQuery || filter !== 'all' ? 'Aucun résultat correspondant.' : 'Aucun produit dans le stock.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Produit</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Catégorie</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantité</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredItems.map((item) => (
                    <tr 
                      key={item.id} 
                      className={`transition-colors ${
                        item.stockQuantity === 0 ? 'bg-red-50/40 hover:bg-red-50/80' : 
                        item.stockQuantity <= 5 ? 'bg-orange-50/40 hover:bg-orange-50/80' : 
                        'hover:bg-gray-50/50'
                      }`}
                    >
                      <td className="py-4 px-6 font-semibold text-gray-900">{item.name}</td>
                      <td className="py-4 px-6 font-medium text-gray-600 text-sm">
                        <span className="bg-gray-100 px-2 py-1 rounded-md text-xs">{item.category?.name || '-'}</span>
                      </td>
                      <td className="py-4 px-6">
                        {editingId === item.id ? (
                          <input
                            type="number"
                            min="0"
                            value={editValue}
                            onChange={(e) => setEditValue(Math.max(0, parseInt(e.target.value) || 0))}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveStock(item.id); if (e.key === 'Escape') setEditingId(null); }}
                            autoFocus
                            className="w-20 px-3 py-1.5 rounded-lg border-2 border-[#e8614a] text-sm font-bold text-center outline-none focus:ring-2 focus:ring-[#e8614a]/30"
                          />
                        ) : (
                          <span className={`font-bold text-lg ${
                            item.stockQuantity === 0 ? 'text-red-500' : 
                            item.stockQuantity <= 5 ? 'text-orange-500' : 
                            'text-gray-900'
                          }`}>
                            {item.stockQuantity}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">{getStockBadge(item.stockQuantity)}</td>
                      <td className="py-4 px-6 text-right">
                        {editingId === item.id ? (
                          <div className="flex justify-end gap-2">
                            <Button variant="primary" size="sm" onClick={() => handleSaveStock(item.id)}>
                              ✓ Valider
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                              Annuler
                            </Button>
                          </div>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => startEdit(item)}>
                            Mettre à jour
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="admin-surface border overflow-hidden rounded-2xl mt-8">
        <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-4">
          <CardTitle className="text-lg font-bold text-gray-800">Suggestions de reapprovisionnement</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(3)].map((_, i) => <Skeleton key={i} width="100%" height="3.5rem" className="rounded-xl" />)}
            </div>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-10 text-gray-500">Aucune suggestion: les stocks sont au-dessus du seuil.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Produit</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Categorie</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock actuel</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">A commander</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Urgence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {suggestions.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 font-semibold text-gray-900">{s.name}</td>
                      <td className="py-4 px-6 text-gray-600 text-sm">{s.category}</td>
                      <td className="py-4 px-6 font-bold text-gray-900">{s.currentStock}</td>
                      <td className="py-4 px-6 font-bold text-[var(--primary-600)]">{s.suggestedOrderQty}</td>
                      <td className="py-4 px-6">
                        <Badge variant={s.urgency === 'critical' ? 'error' : 'warning'}>
                          {s.urgency === 'critical' ? 'Critique' : 'A surveiller'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
