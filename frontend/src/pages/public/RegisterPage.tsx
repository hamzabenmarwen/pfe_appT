import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, User, Phone, MapPin, ChefHat } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
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

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'Le prénom est requis';
    if (!formData.lastName.trim()) newErrors.lastName = 'Le nom est requis';
    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Le téléphone est requis';
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        password: formData.password,
      });
      toast.success('Compte créé avec succès !');
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f8] flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-[#6f7286] hover:text-[#e8614a] transition-colors">
            <ArrowLeft size={20} />
            <span>Retour à l'accueil</span>
          </Link>
        </motion.div>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#e8614a] to-[#f28068] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#e8614a]/25">
            <ChefHat size={32} />
          </div>
          <h1 className="font-[Playfair_Display] text-3xl font-semibold text-[#3f404c]">
            Assiette GA.Ala Sfaxienne
          </h1>
        </motion.div>

        {/* Card */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <Card className="bg-white/70 backdrop-blur border border-[#d9dae0] rounded-2xl overflow-hidden shadow-xl shadow-[#3f404c]/5">
            <CardHeader className="text-center pb-2">
              <motion.p variants={itemVariant} className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8614a] mb-2">
                Inscription
              </motion.p>
              <motion.div variants={fadeUp}>
                <CardTitle className="font-[Playfair_Display] text-2xl text-[#3f404c]">
                  Créer un compte
                </CardTitle>
              </motion.div>
              <motion.p variants={itemVariant} className="text-sm text-[#6f7286] mt-1">
                Rejoignez-nous pour des expériences culinaires uniques
              </motion.p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <motion.div variants={itemVariant}>
                    <Input
                      label="Prénom"
                      placeholder="Jean"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      error={errors.firstName}
                      leftIcon={User}
                    />
                  </motion.div>
                  <motion.div variants={itemVariant}>
                    <Input
                      label="Nom"
                      placeholder="Dupont"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      error={errors.lastName}
                      leftIcon={User}
                    />
                  </motion.div>
                </div>

                <motion.div variants={itemVariant}>
                  <Input
                    type="email"
                    label="Email"
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    error={errors.email}
                    leftIcon={Mail}
                  />
                </motion.div>

                <motion.div variants={itemVariant}>
                  <Input
                    label="Téléphone"
                    placeholder="+216 XX XXX XXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    error={errors.phone}
                    leftIcon={Phone}
                  />
                </motion.div>

                <motion.div variants={itemVariant}>
                  <Input
                    label="Adresse"
                    placeholder="Votre adresse"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    leftIcon={MapPin}
                  />
                </motion.div>

                <motion.div variants={itemVariant} className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    label="Mot de passe"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    error={errors.password}
                    leftIcon={Lock}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[38px] text-[#8e91a1] hover:text-[#e8614a] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </motion.div>

                <motion.div variants={itemVariant}>
                  <Input
                    type="password"
                    label="Confirmer le mot de passe"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    error={errors.confirmPassword}
                    leftIcon={Lock}
                  />
                </motion.div>

                <motion.div variants={itemVariant}>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={isLoading}
                  >
                    Créer mon compte
                  </Button>
                </motion.div>
              </form>

              <motion.p variants={itemVariant} className="text-center text-sm text-[#6f7286] mt-6">
                Déjà un compte ?{' '}
                <Link to="/login" className="text-[#e8614a] hover:text-[#d14f3d] font-semibold">
                  Se connecter
                </Link>
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
