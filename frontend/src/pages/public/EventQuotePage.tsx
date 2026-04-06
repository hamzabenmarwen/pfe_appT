import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Users, MapPin, FileText, DollarSign, Send } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { eventsApi } from '../../services/events';
import { EventType } from '../../types';
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

const eventTypeLabels: Record<EventType, string> = {
  [EventType.WEDDING]: 'Mariage',
  [EventType.SEMINAR]: 'Séminaire',
  [EventType.BIRTHDAY]: 'Anniversaire',
  [EventType.CORPORATE]: 'Entreprise',
  [EventType.OTHER]: 'Autre',
};

export const EventQuotePage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    eventType: EventType.WEDDING,
    title: '',
    eventDate: '',
    guestCount: 50,
    venue: '',
    budget: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Le titre est requis';
    if (!formData.eventDate) newErrors.eventDate = 'La date est requise';
    if (formData.guestCount < 1) newErrors.guestCount = 'Le nombre d\'invités doit être supérieur à 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await eventsApi.createEvent({
        eventType: formData.eventType,
        title: formData.title,
        eventDate: formData.eventDate,
        guestCount: formData.guestCount,
        venue: formData.venue,
        notes: formData.notes,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
      });
      toast.success('Demande de devis envoyée avec succès !');
      navigate('/my-events');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f8] pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="mb-10 text-center"
        >
          <motion.p variants={itemVariant} className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8614a] mb-3">
            Devis Gratuit
          </motion.p>
          <motion.h1 variants={fadeUp} className="font-[Playfair_Display] text-4xl md:text-5xl font-semibold text-[#3f404c] mb-3">
            Demande de Devis
          </motion.h1>
          <motion.p variants={itemVariant} className="text-lg text-[#6f7286]">
            Décrivez votre événement pour recevoir un devis personnalisé
          </motion.p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/70 backdrop-blur border border-[#d9dae0] rounded-2xl overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="font-[Playfair_Display] text-xl text-[#3f404c]">
                Détails de l'événement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Event Type Grid */}
                <div>
                  <label className="block text-sm font-semibold text-[#3f404c] mb-3">
                    Type d'événement
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(eventTypeLabels).map(([type, label]) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, eventType: type as EventType })}
                        className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          formData.eventType === type
                            ? 'bg-[#e8614a] text-white shadow-lg shadow-[#e8614a]/25'
                            : 'bg-[#f8f8f9] text-[#6f7286] hover:bg-[#fde8e1] hover:text-[#e8614a]'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <Input
                  label="Titre de l'événement"
                  placeholder="Ex: Mariage de Jean et Marie"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  error={errors.title}
                  leftIcon={FileText}
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Date de l'événement"
                    type="datetime-local"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    error={errors.eventDate}
                    leftIcon={Calendar}
                  />
                  <Input
                    label="Nombre d'invités"
                    type="number"
                    min="1"
                    value={formData.guestCount}
                    onChange={(e) => setFormData({ ...formData, guestCount: parseInt(e.target.value) || 0 })}
                    error={errors.guestCount}
                    leftIcon={Users}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Lieu / Salle"
                    placeholder="Adresse ou nom de la salle"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    leftIcon={MapPin}
                  />
                  <Input
                    label="Budget estimé (TND)"
                    type="number"
                    min="0"
                    placeholder="Optionnel"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    leftIcon={DollarSign}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#3f404c] mb-2">
                    Notes supplémentaires
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Décrivez vos besoins spécifiques, préférences alimentaires, restrictions..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 bg-white/70 border border-[#d9dae0] rounded-xl text-[#3f404c] placeholder-[#8e91a1] focus:outline-none focus:border-[#e8614a] focus:ring-2 focus:ring-[#e8614a]/10 transition-all resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  leftIcon={Send}
                  isLoading={isSubmitting}
                >
                  Envoyer la demande
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
