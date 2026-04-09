import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Clock, AlertTriangle, ChevronLeft, Send, Minus, Plus, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';
import { catalogueApi } from '../../services/catalogue';
import { resolveUploadUrl } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { Plat, Review } from '../../types';
import toast from 'react-hot-toast';

export const PlatDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [plat, setPlat] = useState<Plat | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // Review form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  useEffect(() => {
    if (id) loadPlat();
  }, [id]);

  const loadPlat = async () => {
    try {
      setIsLoading(true);
      const data = await catalogueApi.getPlatById(id!);
      setPlat(data);
      const reviewsData = await catalogueApi.getReviews(id!);
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
    } catch (error) {
      toast.error('Plat introuvable');
      navigate('/catalogue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!plat) return;
    if (!isAuthenticated) {
      toast.error('Connectez-vous pour ajouter au panier');
      navigate('/login');
      return;
    }
    for (let i = 0; i < quantity; i++) {
      addToCart(plat);
    }
    toast.success(`${quantity}x ${plat.name} ajouté au panier`);
  };

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      toast.error('Connectez-vous pour laisser un avis');
      navigate('/login');
      return;
    }
    try {
      setIsSubmittingReview(true);
      await catalogueApi.createReview(id!, { rating: reviewRating, comment: reviewComment || undefined });
      toast.success('Avis publié avec succès');
      setReviewComment('');
      setReviewRating(5);
      // Reload reviews
      const reviewsData = await catalogueApi.getReviews(id!);
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'Erreur lors de la publication';
      toast.error(msg);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (isLoading) {
    return (
      <div className="container-editorial section-shell">
        <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 400px', height: '420px', borderRadius: '1.5rem', background: 'var(--secondary-100)', animation: 'shimmer 1.8s linear infinite' }} />
          <div style={{ flex: '1 1 400px' }}>
            <div style={{ height: '2rem', width: '60%', background: 'var(--secondary-100)', borderRadius: '8px', marginBottom: '16px' }} />
            <div style={{ height: '1rem', width: '40%', background: 'var(--secondary-100)', borderRadius: '8px', marginBottom: '32px' }} />
            <div style={{ height: '6rem', width: '100%', background: 'var(--secondary-100)', borderRadius: '8px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!plat) return null;

  return (
    <div className="container-editorial section-shell" style={{ paddingTop: '2rem' }}>
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/catalogue')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--secondary-500)', fontSize: '0.9rem', fontWeight: 500,
          marginBottom: '24px', padding: '8px 0',
          transition: 'color 0.3s',
        }}
        whileHover={{ x: -4 }}
      >
        <ChevronLeft size={18} /> Retour au catalogue
      </motion.button>

      <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            flex: '1 1 420px', maxWidth: '520px', borderRadius: '1.5rem', overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
          }}
        >
          {plat.image ? (
            <img
              src={resolveUploadUrl(plat.image)}
              alt={plat.name}
              style={{ width: '100%', height: '420px', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div style={{
              width: '100%', height: '420px',
              background: 'linear-gradient(135deg, var(--primary-100), var(--primary-50))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '4rem', color: 'var(--primary-300)',
            }}>
              <Leaf size={80} />
            </div>
          )}
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={{ flex: '1 1 400px' }}
        >
          {/* Category badge */}
          {plat.category && (
            <span style={{
              display: 'inline-block', padding: '4px 14px', borderRadius: '999px',
              background: 'var(--primary-50)', color: 'var(--primary-600)',
              fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em',
              textTransform: 'uppercase', marginBottom: '12px',
            }}>
              {plat.category.name}
            </span>
          )}

          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: '2.2rem',
            color: 'var(--secondary-900)', marginBottom: '8px', lineHeight: 1.1,
          }}>
            {plat.name}
          </h1>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            {avgRating ? (
              <>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} size={16} fill={s <= Math.round(parseFloat(avgRating)) ? '#F59E0B' : 'none'} color={s <= Math.round(parseFloat(avgRating)) ? '#F59E0B' : '#D1D5DB'} />
                  ))}
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--secondary-700)' }}>{avgRating}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--secondary-400)' }}>({reviews.length} avis)</span>
              </>
            ) : (
              <span style={{ fontSize: '0.85rem', color: 'var(--secondary-400)' }}>Aucun avis</span>
            )}
          </div>

          {/* Price */}
          <div style={{
            fontSize: '2rem', fontWeight: 700, color: 'var(--primary-600)',
            marginBottom: '20px', fontFamily: 'var(--font-display)',
          }}>
            {plat.price.toFixed(2)} <span style={{ fontSize: '1rem', fontWeight: 500 }}>TND</span>
          </div>

          {/* Description */}
          {plat.description && (
            <p style={{
              color: 'var(--secondary-500)', lineHeight: 1.7, fontSize: '0.95rem',
              marginBottom: '24px',
            }}>
              {plat.description}
            </p>
          )}

          {/* Info row */}
          <div style={{ display: 'flex', gap: '24px', marginBottom: '28px', flexWrap: 'wrap' }}>
            {plat.preparationTime && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--secondary-500)', fontSize: '0.85rem' }}>
                <Clock size={16} />
                <span>{plat.preparationTime} min</span>
              </div>
            )}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem',
              color: plat.stockQuantity <= 5 ? '#EF4444' : 'var(--secondary-500)',
            }}>
              {plat.stockQuantity <= 5 && <AlertTriangle size={16} />}
              <span>{plat.stockQuantity > 0 ? `${plat.stockQuantity} en stock` : 'Rupture de stock'}</span>
            </div>
          </div>

          {/* Allergens */}
          {plat.allergens && plat.allergens.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--secondary-600)', display: 'block', marginBottom: '8px' }}>
                Allergènes :
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {plat.allergens.map((a, i) => (
                  <span key={i} style={{
                    padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem',
                    background: '#FEF3C7', color: '#92400E', fontWeight: 500,
                  }}>
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + Add to cart */}
          {plat.available && plat.stockQuantity > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{
                display: 'flex', alignItems: 'center', border: '1px solid var(--secondary-200)',
                borderRadius: '12px', overflow: 'hidden',
              }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{
                    width: '44px', height: '44px', border: 'none', background: 'var(--bg-warm)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--secondary-600)', transition: 'background 0.2s',
                  }}
                >
                  <Minus size={16} />
                </button>
                <span style={{
                  width: '48px', textAlign: 'center', fontWeight: 600, fontSize: '1rem',
                  color: 'var(--secondary-800)',
                }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(plat.stockQuantity, quantity + 1))}
                  style={{
                    width: '44px', height: '44px', border: 'none', background: 'var(--bg-warm)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--secondary-600)', transition: 'background 0.2s',
                  }}
                >
                  <Plus size={16} />
                </button>
              </div>
              <button onClick={handleAddToCart} className="btn-primary-luxury btn-sheen" style={{ flex: '1', maxWidth: '320px' }}>
                <ShoppingCart size={18} />
                Ajouter au panier — {(plat.price * quantity).toFixed(2)} TND
              </button>
            </div>
          )}

          {(!plat.available || plat.stockQuantity === 0) && (
            <div style={{
              padding: '16px 20px', borderRadius: '12px', background: '#FEF2F2',
              color: '#991B1B', fontSize: '0.9rem', fontWeight: 500,
            }}>
              Ce plat n'est actuellement pas disponible.
            </div>
          )}
        </motion.div>
      </div>

      {/* Reviews Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{ marginTop: '64px', maxWidth: '800px' }}
      >
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: '1.5rem',
          color: 'var(--secondary-900)', marginBottom: '32px',
        }}>
          Avis clients
          {reviews.length > 0 && <span style={{ fontSize: '0.9rem', color: 'var(--secondary-400)', fontWeight: 400, marginLeft: '10px' }}>({reviews.length})</span>}
        </h2>

        {/* Write a review */}
        {isAuthenticated && (
          <div style={{
            padding: '24px', borderRadius: '1rem', marginBottom: '32px',
            background: 'var(--bg-card)', border: '1px solid var(--secondary-200)',
          }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--secondary-700)', marginBottom: '16px' }}>
              Laisser un avis
            </h4>
            {/* Star rating */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
              {[1, 2, 3, 4, 5].map(s => (
                <button
                  key={s}
                  onMouseEnter={() => setHoveredStar(s)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setReviewRating(s)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                    transition: 'transform 0.2s',
                    transform: (hoveredStar >= s || reviewRating >= s) ? 'scale(1.15)' : 'scale(1)',
                  }}
                >
                  <Star
                    size={24}
                    fill={(hoveredStar >= s || (hoveredStar === 0 && reviewRating >= s)) ? '#F59E0B' : 'none'}
                    color={(hoveredStar >= s || (hoveredStar === 0 && reviewRating >= s)) ? '#F59E0B' : '#D1D5DB'}
                  />
                </button>
              ))}
            </div>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Partagez votre expérience..."
              rows={3}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '10px',
                border: '1px solid var(--secondary-200)', resize: 'vertical',
                fontFamily: 'var(--font-body)', fontSize: '0.9rem',
                background: 'var(--bg-base)', color: 'var(--secondary-800)',
                transition: 'border-color 0.3s',
                outline: 'none',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--primary-400)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--secondary-200)')}
            />
            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleSubmitReview}
                disabled={isSubmittingReview}
                className="btn-primary-luxury"
                style={{
                  padding: '10px 24px', fontSize: '0.85rem',
                  opacity: isSubmittingReview ? 0.6 : 1,
                }}
              >
                <Send size={15} />
                {isSubmittingReview ? 'Publication...' : 'Publier'}
              </button>
            </div>
          </div>
        )}

        {/* Reviews list */}
        {reviews.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '48px 24px',
            color: 'var(--secondary-400)', fontSize: '0.9rem',
          }}>
            Aucun avis pour le moment. Soyez le premier !
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reviews.map((review) => (
              <div key={review.id} style={{
                padding: '20px', borderRadius: '1rem',
                background: 'var(--bg-card)', border: '1px solid var(--secondary-200)',
                transition: 'border-color 0.3s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--secondary-800)', fontSize: '0.9rem' }}>
                      {(review as any).user?.firstName} {(review as any).user?.lastName}
                    </span>
                    <div style={{ display: 'flex', gap: '2px', marginTop: '4px' }}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} size={14} fill={s <= review.rating ? '#F59E0B' : 'none'} color={s <= review.rating ? '#F59E0B' : '#D1D5DB'} />
                      ))}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--secondary-400)' }}>
                    {new Date(review.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                {review.comment && (
                  <p style={{ color: 'var(--secondary-600)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
