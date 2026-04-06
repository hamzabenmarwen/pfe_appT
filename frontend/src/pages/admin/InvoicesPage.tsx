import React, { useState, useEffect } from 'react';
import { Search, FileText, Download, Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { invoicesApi } from '../../services/invoices';
import { ordersApi } from '../../services/orders';
import { eventsApi } from '../../services/events';
import { Invoice, InvoiceStatus, Order, Event } from '../../types';
import toast from 'react-hot-toast';

const statusConfig: Record<InvoiceStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'error' }> = {
  [InvoiceStatus.PENDING]: { label: 'En attente', variant: 'warning' },
  [InvoiceStatus.PAID]: { label: 'Payée', variant: 'success' },
  [InvoiceStatus.OVERDUE]: { label: 'En retard', variant: 'error' },
};

export const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState<{ orderId?: string; devisId?: string; dueDate?: string }>({
    orderId: '',
    dueDate: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [invoicesRes, ordersRes, eventsRes] = await Promise.all([
        invoicesApi.getInvoices({ limit: 100 }),
        ordersApi.getOrders({ limit: 100 }),
        eventsApi.getEvents({ limit: 100 }),
      ]);
      const invoicesData = Array.isArray(invoicesRes.data) ? invoicesRes.data : [];
      const ordersData = Array.isArray(ordersRes.data) ? ordersRes.data : [];
      const eventsData = Array.isArray(eventsRes.data) ? eventsRes.data : [];
      setInvoices(invoicesData);
      setOrders(ordersData.filter((o) => !o.invoice));
      setEvents(eventsData.filter((e) => e.status === 'CONFIRMED' && !e.devis?.some((d) => d.invoice)));
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInvoice = async () => {
    try {
      if (invoiceForm.orderId) {
        await invoicesApi.createFromOrder(invoiceForm.orderId);
      } else if (invoiceForm.devisId) {
        await invoicesApi.createFromDevis(invoiceForm.devisId);
      } else {
        toast.error('Veuillez sélectionner une commande');
        return;
      }
      toast.success('Facture créée avec succès');
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      toast.error('Erreur lors de la création de la facture');
    }
  };

  const handleDownloadPdf = async (id: string, invoiceNumber: string) => {
    try {
      const blob = await invoicesApi.downloadPdf(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `facture-${invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      await invoicesApi.markAsPaid(id);
      toast.success('Facture marquée comme payée');
      loadData();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const filteredInvoices = invoices.filter((invoice) =>
    invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="admin-page-title">Gestion des Factures</h1>
          <p className="admin-page-subtitle">Emission, suivi des paiements et relances</p>
        </div>
        <div className="admin-actions">
          <div className="w-full sm:w-64">
            <Input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={Search}
            />
          </div>
          <Button variant="primary" leftIcon={Plus} onClick={() => setIsModalOpen(true)}>
            Nouvelle facture
          </Button>
        </div>
      </div>

      <Card className="admin-surface border rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} width="100%" height="4rem" className="rounded-xl" />)}
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              Aucune facture trouvée.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Numéro</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Montant</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Échéance</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredInvoices.map((invoice) => {
                    const status = statusConfig[invoice.status];
                    return (
                      <tr key={invoice.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-6 font-semibold text-gray-900">#{invoice.invoiceNumber}</td>
                        <td className="py-4 px-6 text-gray-600 font-medium">{invoice.user?.firstName} {invoice.user?.lastName}</td>
                        <td className="py-4 px-6 font-bold text-[#e8614a]">{invoice.amount.toFixed(2)} TND</td>
                        <td className="py-4 px-6 text-gray-500 text-sm">{formatDate(invoice.createdAt)}</td>
                        <td className="py-4 px-6 text-gray-500 text-sm">{invoice.dueDate ? formatDate(invoice.dueDate) : '-'}</td>
                        <td className="py-4 px-6">
                           <Badge variant={status.variant}>{status.label}</Badge>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2">
                             <Button
                               variant="outline"
                               size="sm"
                               leftIcon={Download}
                               onClick={() => handleDownloadPdf(invoice.id, invoice.invoiceNumber)}
                             >
                               PDF
                             </Button>
                             {invoice.status === InvoiceStatus.PENDING && (
                               <Button
                                 variant="primary"
                                 size="sm"
                                 leftIcon={CheckCircle}
                                 onClick={() => handleMarkAsPaid(invoice.id)}
                               >
                                 Marquer payée
                               </Button>
                             )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Créer une facture"
        size="md"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button variant="primary" onClick={handleCreateInvoice}>Générer la facture</Button>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Commande associée</label>
            <select
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-[#e8614a] focus:border-[#e8614a] outline-none transition-all placeholder:text-gray-400 bg-white"
              value={invoiceForm.orderId}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, orderId: e.target.value, devisId: undefined })}
            >
              <option value="">Sélectionner une commande prête</option>
              {orders.map((order) => (
                <option key={order.id} value={order.id}>
                  #{order.orderNumber} - {order.user?.firstName} {order.user?.lastName} ({order.totalAmount.toFixed(2)} TND)
                </option>
              ))}
            </select>
          </div>
          <Input
            type="date"
            label="Date d'échéance"
            value={invoiceForm.dueDate}
            onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
          />
        </div>
      </Modal>
    </div>
  );
};
