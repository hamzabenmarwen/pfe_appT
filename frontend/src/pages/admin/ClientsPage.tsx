import React, { useState, useEffect } from 'react';
import { Search, Users, ShoppingBag, Calendar, Star, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { clientsApi } from '../../services/clients';
import { User } from '../../types';
import toast from 'react-hot-toast';

export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientDetails, setClientDetails] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      const response = await clientsApi.getClients({ limit: 100 });
      setClients(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error('Erreur lors du chargement des clients');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = async (client: User) => {
    setSelectedClient(client);
    setIsModalOpen(true);
    setIsLoadingDetails(true);
    try {
      const details = await clientsApi.getClientById(client.id);
      setClientDetails(details);
    } catch (error) {
      toast.error('Erreur lors du chargement des détails');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleUpdateLoyalty = async (clientId: string, points: number) => {
    try {
      await clientsApi.updateLoyaltyPoints(clientId, points);
      toast.success('Points de fidélité mis à jour');
      loadClients();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const filteredClients = clients.filter((client) =>
    client.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Gestion des Clients</h1>
          <p className="admin-page-subtitle">Comptes, adresses et historique de commandes</p>
        </div>
        <div className="w-full sm:w-72">
          <Input
            type="text"
            placeholder="Rechercher un client..."
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
          ) : filteredClients.length === 0 ? (
             <div className="text-center py-16 text-gray-500">
              Aucun client trouvé.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Téléphone</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Points</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Inscrit le</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f8a992] to-[#e8614a] flex items-center justify-center text-white font-bold shadow-sm">
                            {client.firstName?.[0] || ''}{client.lastName?.[0] || ''}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900">{client.firstName} {client.lastName}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">{client.email}</td>
                      <td className="py-4 px-6 text-gray-600">{client.phone || '-'}</td>
                      <td className="py-4 px-6">
                        <Badge variant="default">{client.loyaltyPoints} pts</Badge>
                      </td>
                      <td className="py-4 px-6 text-gray-500 text-sm">{formatDate(client.createdAt)}</td>
                      <td className="py-4 px-6 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(client)}
                        >
                          Détails <ChevronRight size={16} className="ml-1" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Profil Client : ${selectedClient?.firstName} ${selectedClient?.lastName}`}
        size="lg"
      >
        {isLoadingDetails ? (
          <div className="p-6 space-y-4">
            <Skeleton width="50%" height="1.5rem" />
            <Skeleton width="80%" height="1rem" className="mt-4" />
            <Skeleton width="60%" height="1rem" className="mt-2" />
          </div>
        ) : clientDetails ? (
          <div className="p-2 space-y-8">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4 border border-gray-100">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-gray-500 shadow-sm">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <span className="text-2xl font-bold text-gray-900">{clientDetails.orders?.length || 0}</span>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Commandes</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4 border border-gray-100">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-gray-500 shadow-sm">
                  <Calendar size={24} />
                </div>
                <div>
                  <span className="text-2xl font-bold text-gray-900">{clientDetails.events?.length || 0}</span>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Événements</p>
                </div>
              </div>
              <div className="bg-orange-50 rounded-xl p-4 flex items-center gap-4 border border-orange-100">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-orange-500 shadow-sm">
                  <Star size={24} />
                </div>
                <div>
                  <span className="text-2xl font-bold text-orange-600">{clientDetails.loyaltyPoints || 0}</span>
                  <p className="text-xs text-orange-400 uppercase tracking-wider font-semibold">Points</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3">Gestion de la fidélité</h4>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={() => handleUpdateLoyalty(clientDetails.id, (clientDetails.loyaltyPoints || 0) + 10)}>
                  +10 points
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleUpdateLoyalty(clientDetails.id, (clientDetails.loyaltyPoints || 0) + 50)}>
                  +50 points
                </Button>
                <Button variant="secondary" size="sm" onClick={() => handleUpdateLoyalty(clientDetails.id, 0)}>
                  Réinitialiser
                </Button>
              </div>
            </div>

            {clientDetails.orders?.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">Commandes récentes</h4>
                <div className="space-y-3">
                  {clientDetails.orders.slice(0, 5).map((order: any) => (
                    <div key={order.id} className="flex justify-between items-center p-4 bg-gray-50 border border-gray-100 rounded-xl">
                      <span className="font-semibold text-gray-900">#{order.orderNumber}</span>
                      <span className="font-medium text-gray-600">{order.totalAmount?.toFixed(2)} TND</span>
                      <Badge variant={order.status === 'DELIVERED' ? 'success' : 'warning'}>
                        {order.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
