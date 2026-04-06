import React, { useState, useEffect } from 'react';
import { Search, Calendar, Plus, FileText, CheckCircle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { eventsApi } from '../../services/events';
import { Event, EventStatus, EventType, DevisStatus } from '../../types';
import toast from 'react-hot-toast';

const statusConfig: Record<EventStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' }> = {
  [EventStatus.PENDING]: { label: 'En attente', variant: 'warning' },
  [EventStatus.QUOTED]: { label: 'Devis envoyé', variant: 'info' },
  [EventStatus.CONFIRMED]: { label: 'Confirmé', variant: 'success' },
  [EventStatus.COMPLETED]: { label: 'Terminé', variant: 'success' },
  [EventStatus.CANCELLED]: { label: 'Annulé', variant: 'error' },
};

const eventTypeLabels: Record<EventType, string> = {
  [EventType.WEDDING]: 'Mariage',
  [EventType.SEMINAR]: 'Séminaire',
  [EventType.BIRTHDAY]: 'Anniversaire',
  [EventType.CORPORATE]: 'Entreprise',
  [EventType.OTHER]: 'Autre',
};

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [isDevisModalOpen, setIsDevisModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [devisForm, setDevisForm] = useState({
    items: [{ description: '', quantity: 1, unitPrice: 0 }],
    validUntil: '',
    notes: '',
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const response = await eventsApi.getEvents({ limit: 100 });
      setEvents(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error('Erreur lors du chargement des événements');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDevis = async () => {
    if (!selectedEvent) return;
    try {
      await eventsApi.createDevis(selectedEvent.id, {
        items: devisForm.items.filter((i) => i.description.trim()),
        validUntil: devisForm.validUntil,
        notes: devisForm.notes,
      });
      toast.success('Devis créé avec succès');
      setIsDevisModalOpen(false);
      loadEvents();
    } catch (error) {
      toast.error('Erreur lors de la création du devis');
    }
  };

  const handleUpdateStatus = async (eventId: string, status: EventStatus) => {
    try {
      await eventsApi.updateEvent(eventId, { status });
      toast.success('Statut mis à jour');
      loadEvents();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="admin-page-title">Gestion des Événements</h1>
          <p className="admin-page-subtitle">Devis, confirmations et clôture des événements</p>
        </div>
        <div className="w-full sm:w-72">
          <Input
            type="text"
            placeholder="Rechercher..."
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
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              Aucun événement trouvé.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredEvents.map((event) => {
                const status = statusConfig[event.status];
                const isExpanded = expandedEvent === event.id;
                const latestDevis = event.devis?.[event.devis.length - 1];

                return (
                  <div key={event.id} className={`transition-all ${isExpanded ? 'bg-gray-50/50' : 'hover:bg-gray-50/50'}`}>
                    <div 
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 cursor-pointer"
                      onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                          <Calendar size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                             <span className="font-semibold text-gray-900">{event.title}</span>
                             <Badge variant={status.variant}>{status.label}</Badge>
                          </div>
                          <span className="text-xs font-medium text-orange-500 bg-orange-100 px-2 py-0.5 rounded-full mt-1.5 inline-block">
                             {eventTypeLabels[event.eventType]}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 flex-1 text-sm text-gray-600">
                        <div className="font-medium">
                          {event.user?.firstName} {event.user?.lastName}
                        </div>
                        <div className="font-medium">
                          {formatDate(event.eventDate)}
                        </div>
                        <div className="hidden sm:block text-gray-400">
                          {event.guestCount} invités
                        </div>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-6 pt-2 bg-gray-50/50 border-t border-gray-100/50">
                        <div className="grid md:grid-cols-2 gap-8">
                           <div className="space-y-4">
                              <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Détails de l'événement</h4>
                              <div className="bg-white p-4 rounded-xl border border-gray-100 space-y-3">
                                {event.venue && (
                                  <div className="flex gap-2">
                                    <span className="font-semibold text-gray-600 text-sm w-20">Lieu:</span>
                                    <span className="text-sm text-gray-900">{event.venue}</span>
                                  </div>
                                )}
                                {event.budget && (
                                  <div className="flex gap-2">
                                    <span className="font-semibold text-gray-600 text-sm w-20">Budget:</span>
                                    <span className="text-sm text-[#e8614a] font-bold">{event.budget.toFixed(2)} TND</span>
                                  </div>
                                )}
                                {event.notes && (
                                  <div className="mt-3 bg-yellow-50/50 border border-yellow-100 p-3 rounded-lg">
                                     <span className="font-bold text-gray-600 text-xs uppercase mb-1 block">Notes:</span>
                                     <p className="text-sm text-gray-700">{event.notes}</p>
                                  </div>
                                )}
                              </div>
                           </div>

                           <div className="space-y-4">
                             {latestDevis && (
                               <div>
                                  <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2">Dernier Devis</h4>
                                  <div className="bg-white p-4 rounded-xl border border-gray-100 space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                      <span className="text-gray-600">Numéro:</span>
                                      <span className="font-semibold">#{latestDevis.devisNumber}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                      <span className="text-gray-600">Montant:</span>
                                      <span className="font-bold text-[#e8614a]">{latestDevis.totalAmount.toFixed(2)} TND</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                      <span className="text-gray-600">Statut:</span>
                                      <Badge variant={latestDevis.status === DevisStatus.ACCEPTED ? 'success' : 'default'}>{latestDevis.status}</Badge>
                                    </div>
                                  </div>
                               </div>
                             )}

                             <div className="flex gap-3 pt-4">
                               {event.status === EventStatus.PENDING && (
                                 <Button
                                   variant="primary"
                                   size="sm"
                                   leftIcon={FileText}
                                   onClick={() => { setSelectedEvent(event); setIsDevisModalOpen(true); }}
                                 >
                                   Créer un devis
                                 </Button>
                               )}
                               {event.status === EventStatus.QUOTED && (
                                 <>
                                   <Button
                                     variant="outline"
                                     size="sm"
                                     leftIcon={CheckCircle}
                                     onClick={() => handleUpdateStatus(event.id, EventStatus.CONFIRMED)}
                                   >
                                     Confirmer
                                   </Button>
                                   <Button
                                     variant="ghost"
                                     size="sm"
                                     leftIcon={X}
                                     onClick={() => handleUpdateStatus(event.id, EventStatus.CANCELLED)}
                                   >
                                     Annuler
                                   </Button>
                                 </>
                               )}
                               {event.status === EventStatus.CONFIRMED && (
                                 <Button
                                   variant="primary"
                                   size="sm"
                                   onClick={() => handleUpdateStatus(event.id, EventStatus.COMPLETED)}
                                 >
                                   Marquer terminé
                                 </Button>
                               )}
                             </div>
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

      <Modal
        isOpen={isDevisModalOpen}
        onClose={() => setIsDevisModalOpen(false)}
        title="Créer un devis"
        size="lg"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="ghost" onClick={() => setIsDevisModalOpen(false)}>Annuler</Button>
            <Button variant="primary" onClick={handleCreateDevis}>Mettre à jour le devis</Button>
          </div>
        }
      >
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
               <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Articles du devis</h4>
               <Button
                 variant="outline"
                 size="sm"
                 onClick={() => setDevisForm({ ...devisForm, items: [...devisForm.items, { description: '', quantity: 1, unitPrice: 0 }] })}
               >
                 <Plus size={16} className="mr-2" /> Ajouter un article
               </Button>
            </div>
            
            <div className="space-y-3">
              {devisForm.items.map((item, idx) => (
                <div key={idx} className="flex gap-3 items-center bg-gray-50 p-2 rounded-xl border border-gray-100">
                  <div className="flex-1">
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => {
                        const newItems = [...devisForm.items];
                        newItems[idx].description = e.target.value;
                        setDevisForm({ ...devisForm, items: newItems });
                      }}
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      placeholder="Qté"
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...devisForm.items];
                        newItems[idx].quantity = parseInt(e.target.value) || 0;
                        setDevisForm({ ...devisForm, items: newItems });
                      }}
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      type="number"
                      placeholder="Prix/u"
                      value={item.unitPrice}
                      onChange={(e) => {
                        const newItems = [...devisForm.items];
                        newItems[idx].unitPrice = parseFloat(e.target.value) || 0;
                        setDevisForm({ ...devisForm, items: newItems });
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              type="datetime-local"
              label="Valide jusqu'au"
              value={devisForm.validUntil}
              onChange={(e) => setDevisForm({ ...devisForm, validUntil: e.target.value })}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Notes ou conditions</label>
              <textarea
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-[#e8614a] focus:border-[#e8614a] outline-none transition-all placeholder:text-gray-400"
                rows={3}
                placeholder="Ex. 50% d'acompte à la commande..."
                value={devisForm.notes}
                onChange={(e) => setDevisForm({ ...devisForm, notes: e.target.value })}
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
