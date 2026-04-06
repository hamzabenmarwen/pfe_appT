import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, X, FileText, Plus } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { eventsApi } from '../../services/events';
import { Event, EventStatus, DevisStatus } from '../../types';
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

const statusConfig: Record<EventStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' }> = {
  [EventStatus.PENDING]: { label: 'En attente', variant: 'warning' },
  [EventStatus.QUOTED]: { label: 'Devis envoyé', variant: 'info' },
  [EventStatus.CONFIRMED]: { label: 'Confirmé', variant: 'success' },
  [EventStatus.COMPLETED]: { label: 'Terminé', variant: 'success' },
  [EventStatus.CANCELLED]: { label: 'Annulé', variant: 'error' },
};

const devisStatusConfig: Record<DevisStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' }> = {
  [DevisStatus.DRAFT]: { label: 'Brouillon', variant: 'default' },
  [DevisStatus.SENT]: { label: 'Envoyé', variant: 'info' },
  [DevisStatus.ACCEPTED]: { label: 'Accepté', variant: 'success' },
  [DevisStatus.REJECTED]: { label: 'Refusé', variant: 'error' },
};

const eventTypeLabels: Record<string, string> = {
  WEDDING: 'Mariage',
  SEMINAR: 'Séminaire',
  BIRTHDAY: 'Anniversaire',
  CORPORATE: 'Entreprise',
  OTHER: 'Autre',
};

export const MyEventsPage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const response = await eventsApi.getEvents();
      setEvents(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error('Erreur lors du chargement des événements');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptDevis = async (devisId: string) => {
    try {
      await eventsApi.acceptDevis(devisId);
      toast.success('Devis accepté avec succès');
      loadEvents();
    } catch (error) {
      toast.error('Erreur lors de l\'acceptation');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="w-full">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10"
      >
        <div>
          <motion.p variants={itemVariant} className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8614a] mb-3">
            Gestion
          </motion.p>
          <motion.h1 variants={fadeUp} className="font-[Playfair_Display] text-3xl font-semibold text-[#3f404c] mb-2">
            Mes Événements
          </motion.h1>
        </div>
        <motion.div variants={itemVariant}>
          <Button variant="primary" leftIcon={Plus} onClick={() => navigate('/events/quote')}>
            Nouvelle demande
          </Button>
        </motion.div>
      </motion.div>

      {/* Events List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="bg-white/70 border border-[#d9dae0] rounded-2xl p-6">
              <Skeleton width="40%" height="1.5rem" />
              <Skeleton width="60%" height="1rem" className="mt-2" />
            </Card>
          ))}
        </div>
      ) : events.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-[#eeeef1] rounded-2xl flex items-center justify-center text-[#8e91a1]">
            <Calendar size={40} />
          </div>
          <h3 className="font-[Playfair_Display] text-2xl font-semibold text-[#3f404c] mb-2">
            Aucun événement
          </h3>
          <p className="text-[#6f7286] mb-6">Vous n'avez pas encore demandé de devis</p>
          <Button variant="primary" onClick={() => navigate('/events/quote')}>
            Demander un devis
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="space-y-4"
        >
          {events.map((event) => {
            const status = statusConfig[event.status];
            const latestDevis = event.devis?.[event.devis.length - 1];

            return (
              <motion.div
                key={event.id}
                variants={itemVariant}
                className="bg-white/70 backdrop-blur border border-[#d9dae0] rounded-2xl overflow-hidden hover:border-[#f8a992] transition-all"
              >
                {/* Header */}
                <div className="p-6 pb-4">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-[#f8f8f9] rounded-full text-xs font-medium text-[#6f7286]">
                          {eventTypeLabels[event.eventType]}
                        </span>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <h3 className="font-[Playfair_Display] text-xl font-semibold text-[#3f404c] mb-2">
                        {event.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#6f7286]">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} /> {formatDate(event.eventDate)}
                        </span>
                        <span>{event.guestCount} invités</span>
                        {event.venue && <span>• {event.venue}</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Devis Section */}
                {latestDevis && (
                  <div className="px-6 pb-6">
                    <div className="bg-[#f8f8f9] border border-[#eeeef1] rounded-xl p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <FileText size={18} className="text-[#e8614a]" />
                          <span className="font-medium text-[#3f404c]">Devis #{latestDevis.devisNumber}</span>
                          <Badge variant={devisStatusConfig[latestDevis.status].variant}>
                            {devisStatusConfig[latestDevis.status].label}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <span className="font-[Playfair_Display] text-2xl font-bold text-[#e8614a]">
                            {latestDevis.totalAmount.toFixed(2)} TND
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-[#6f7286] mb-3">
                        Valide jusqu'au: <span className="font-medium text-[#3f404c]">{formatDate(latestDevis.validUntil)}</span>
                      </p>
                      {latestDevis.status === DevisStatus.SENT && (
                        <div className="flex gap-3">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleAcceptDevis(latestDevis.id)}
                          >
                            Accepter le devis
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toast.success('Contactez-nous pour discuter du devis', { icon: '📞' })}
                          >
                            Négocier
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};
