import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { catalogueApi } from '../../services/catalogue';
import { resolveUploadUrl } from '../../services/api';
import { Category, Plat } from '../../types';
import toast from 'react-hot-toast';

export const CataloguePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [plats, setPlats] = useState<Plat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isPlatModalOpen, setIsPlatModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingPlat, setEditingPlat] = useState<Plat | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [platForm, setPlatForm] = useState({ name: '', description: '', price: '', stockQuantity: '', categoryId: '', isPlatDuJour: false });
  const [platImage, setPlatImage] = useState<File | null>(null);

  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [categoryImage, setCategoryImage] = useState<File | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [categoriesData, platsData] = await Promise.all([
        catalogueApi.getCategories(),
        catalogueApi.getPlats({ limit: 100 }),
      ]);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setPlats(Array.isArray(platsData.data) ? platsData.data : []);
    } catch (error) {
      toast.error('Erreur lors du chargement du catalogue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePlat = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce plat ?')) return;
    try {
      await catalogueApi.deletePlat(id);
      toast.success('Plat supprimé avec succès');
      loadData();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;
    try {
      await catalogueApi.deleteCategory(id);
      toast.success('Catégorie supprimée avec succès');
      loadData();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const openPlatModal = (plat: Plat | null = null) => {
    if (plat) {
      setEditingPlat(plat);
      setPlatForm({ 
        name: plat.name, 
        description: plat.description || '', 
        price: plat.price.toString(), 
        stockQuantity: plat.stockQuantity.toString(), 
        categoryId: plat.categoryId,
        isPlatDuJour: plat.isPlatDuJour || false
      });
    } else {
      setEditingPlat(null);
      setPlatForm({ name: '', description: '', price: '', stockQuantity: '', categoryId: '', isPlatDuJour: false });
    }
    setPlatImage(null);
    setIsPlatModalOpen(true);
  };

  const openCategoryModal = (cat: Category | null = null) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryForm({ name: cat.name, description: cat.description || '' });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '', description: '' });
    }
    setCategoryImage(null);
    setIsCategoryModalOpen(true);
  };

  const handlePlatSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('name', platForm.name);
      formData.append('description', platForm.description);
      formData.append('price', platForm.price);
      formData.append('stockQuantity', platForm.stockQuantity);
      formData.append('categoryId', platForm.categoryId);
      formData.append('isPlatDuJour', platForm.isPlatDuJour.toString());
      if (platImage) formData.append('image', platImage);

      if (editingPlat) {
        await catalogueApi.updatePlat(editingPlat.id, formData);
        toast.success('Plat modifié avec succès');
      } else {
        await catalogueApi.createPlat(formData);
        toast.success('Plat créé avec succès');
      }
      setIsPlatModalOpen(false);
      loadData();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde du plat');
    }
  };

  const handleCategorySubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('name', categoryForm.name);
      formData.append('description', categoryForm.description);
      if (categoryImage) formData.append('image', categoryImage);

      if (editingCategory) {
        await catalogueApi.updateCategory(editingCategory.id, formData);
        toast.success('Catégorie modifiée avec succès');
      } else {
        await catalogueApi.createCategory(formData);
        toast.success('Catégorie créée avec succès');
      }
      setIsCategoryModalOpen(false);
      loadData();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde de la catégorie');
    }
  };

  const filteredPlats = plats.filter((plat) => {
    const matchesCategory = selectedCategory ? plat.categoryId === selectedCategory : true;
    const matchesSearch = plat.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Gestion du Catalogue</h1>
          <p className="admin-page-subtitle">Catégories, plats et disponibilité</p>
        </div>
        <div className="admin-actions">
          <Button variant="outline" leftIcon={Plus} onClick={() => openCategoryModal()}>
            Catégorie
          </Button>
          <Button variant="primary" leftIcon={Plus} onClick={() => openPlatModal()}>
            Plat
          </Button>
        </div>
      </div>

      <Card className="admin-surface border rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-4">
          <CardTitle className="text-lg font-bold text-gray-800">Catégories</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === null 
                  ? 'bg-[#e8614a] text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedCategory(null)}
            >
              Tous
            </button>
            {categories.map((category) => (
              <div key={category.id} className="group relative flex items-center">
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all pr-12 ${
                    selectedCategory === category.id 
                      ? 'bg-[#e8614a] text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </button>
                <div className="absolute right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                  <button
                    className={`p-1.5 rounded-full hover:bg-white/20 hover:text-white transition-colors ${
                      selectedCategory === category.id ? 'text-white' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-800'
                    }`}
                    onClick={(e) => { e.stopPropagation(); openCategoryModal(category); }}
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    className={`p-1.5 rounded-full hover:bg-red-500 hover:text-white transition-colors ${
                      selectedCategory === category.id ? 'text-white/80' : 'text-gray-500 hover:bg-red-100 hover:text-red-600'
                    }`}
                    onClick={(e) => { e.stopPropagation(); handleDeleteCategory(category.id); }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="admin-surface border rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg font-bold text-gray-800">Plats</CardTitle>
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
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
               {[...Array(5)].map((_, i) => <Skeleton key={i} width="100%" height="4rem" className="rounded-xl" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Image</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Catégorie</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Prix</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPlats.map((plat) => (
                    <tr key={plat.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-6">
                        {plat.image ? (
                          <img src={resolveUploadUrl(plat.image)} alt={plat.name} className="w-12 h-12 rounded-lg object-cover shadow-sm border border-gray-100" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                            <ImageIcon size={20} />
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-6 font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                           {plat.name}
                           {plat.isPlatDuJour && <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-bold shadow-sm">Du Jour ⭐</span>}
                        </div>
                      </td>
                      <td className="py-3 px-6 text-gray-600">
                         <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                           {plat.category?.name}
                         </span>
                      </td>
                      <td className="py-3 px-6 font-semibold text-[#e8614a]">{plat.price.toFixed(2)} TND</td>
                      <td className="py-3 px-6 text-gray-600">{plat.stockQuantity}</td>
                      <td className="py-3 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            onClick={() => openPlatModal(plat)}
                            title="Modifier"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            onClick={() => handleDeletePlat(plat.id)}
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
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
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={editingCategory ? "Modifier la catégorie" : "Nouvelle catégorie"}
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="ghost" onClick={() => setIsCategoryModalOpen(false)}>Annuler</Button>
            <Button variant="primary" onClick={handleCategorySubmit}>Sauvegarder</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Nom complet de la catégorie"
            value={categoryForm.name}
            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
            placeholder="Ex: Apéritifs salés"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-[#e8614a] focus:border-[#e8614a] outline-none transition-all placeholder:text-gray-400"
              rows={3}
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              placeholder="Description (optionnel)"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Image (Optionnelle)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) setCategoryImage(e.target.files[0]);
              }}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#e8614a]/10 file:text-[#e8614a] hover:file:bg-[#e8614a]/20"
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isPlatModalOpen}
        onClose={() => setIsPlatModalOpen(false)}
        title={editingPlat ? "Modifier le plat" : "Nouveau plat"}
        size="lg"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="ghost" onClick={() => setIsPlatModalOpen(false)}>Annuler</Button>
            <Button variant="primary" onClick={handlePlatSubmit}>Sauvegarder</Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Nom du plat"
              value={platForm.name}
              onChange={(e) => setPlatForm({ ...platForm, name: e.target.value })}
              placeholder="Ex: Couscous au poisson"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Catégorie</label>
              <select
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-[#e8614a] focus:border-[#e8614a] outline-none transition-all bg-white"
                value={platForm.categoryId}
                onChange={(e) => setPlatForm({ ...platForm, categoryId: e.target.value })}
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <Input
              label="Prix unitaire (TND)"
              type="number"
              value={platForm.price}
              onChange={(e) => setPlatForm({ ...platForm, price: e.target.value })}
              placeholder="0.00"
            />
            <Input
              label="Quantité en stock par défaut"
              type="number"
              value={platForm.stockQuantity}
              onChange={(e) => setPlatForm({ ...platForm, stockQuantity: e.target.value })}
              placeholder="0"
            />
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-[#fffaf5] border border-orange-100 rounded-xl my-4">
            <input
              type="checkbox"
              id="platDuJour"
              checked={platForm.isPlatDuJour}
              onChange={(e) => setPlatForm({ ...platForm, isPlatDuJour: e.target.checked })}
              className="w-5 h-5 text-[#e8614a] rounded border-gray-300 focus:ring-[#e8614a] cursor-pointer"
            />
            <label htmlFor="platDuJour" className="text-sm font-semibold text-orange-900 cursor-pointer">
              ⭐ Ce plat est actuellement le Plat du Jour
            </label>
            <span className="text-xs text-orange-600/70 ml-2">Apparaîtra en tête du menu</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Description du plat</label>
            <textarea
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-[#e8614a] focus:border-[#e8614a] outline-none transition-all placeholder:text-gray-400"
              rows={3}
              value={platForm.description}
              onChange={(e) => setPlatForm({ ...platForm, description: e.target.value })}
              placeholder="Ingrédients, taille des portions..."
            />
          </div>
          <div className="flex flex-col gap-1.5 pt-2 border-t border-gray-100">
            <label className="text-sm font-medium text-gray-700">Photo du plat (Optionnelle)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) setPlatImage(e.target.files[0]);
              }}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#e8614a]/10 file:text-[#e8614a] hover:file:bg-[#e8614a]/20"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
