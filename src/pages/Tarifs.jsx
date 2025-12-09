import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Zap, Crown, Loader2 } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { useTheme } from '@/components/ThemeProvider';
import { toast } from 'sonner';

export default function Tarifs() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState({});
  const { language, t } = useLanguage();
  const { theme } = useTheme();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  const handleCheckout = async (priceId, type) => {
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }

    setLoading({ ...loading, [priceId]: true });
    try {
      const response = await base44.functions.invoke('createCheckout', {
        priceId,
        mode: type === 'subscription' ? 'subscription' : 'payment',
        userEmail: user.email
      });

      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      toast.error(language === 'fr' ? 'Erreur lors du paiement' : 'Payment error');
    } finally {
      setLoading({ ...loading, [priceId]: false });
    }
  };

  const creditPacks = [
    {
      name: { fr: '10 Crédits', en: '10 Credits' },
      price: '5€',
      credits: 10,
      priceId: 'price_1SY0XVHi2Io4SvfQtq9NBCMD',
      features: [
        { fr: '10 générations IA', en: '10 AI generations' },
        { fr: 'Historique sauvegardé', en: 'Saved history' },
        { fr: 'Valable à vie', en: 'Lifetime validity' }
      ]
    },
    {
      name: { fr: '50 Crédits', en: '50 Credits' },
      price: '20€',
      credits: 50,
      priceId: 'price_1SY0Y9Hi2Io4SvfQyuu2ZnfA',
      popular: true,
      features: [
        { fr: '50 générations IA', en: '50 AI generations' },
        { fr: 'Historique sauvegardé', en: 'Saved history' },
        { fr: 'Valable à vie', en: 'Lifetime validity' },
        { fr: 'Meilleur rapport qualité/prix', en: 'Best value' }
      ]
    },
    {
      name: { fr: '100 Crédits', en: '100 Credits' },
      price: '30€',
      credits: 100,
      priceId: 'price_1SY0YkHi2Io4SvfQQbmdiOH7',
      features: [
        { fr: '100 générations IA', en: '100 AI generations' },
        { fr: 'Historique sauvegardé', en: 'Saved history' },
        { fr: 'Valable à vie', en: 'Lifetime validity' },
        { fr: 'Maximum de crédits', en: 'Maximum credits' }
      ]
    }
  ];

  const subscriptions = [
    {
      name: { fr: 'Starter', en: 'Starter' },
      price: { fr: '5€/mois', en: '€5/month' },
      credits: 20,
      priceId: 'price_1SY0aKHi2Io4SvfQIoyodFt5',
      features: [
        { fr: '20 crédits par mois', en: '20 credits per month' },
        { fr: 'Historique illimité', en: 'Unlimited history' },
        { fr: 'Tous les services IA', en: 'All AI services' },
        { fr: 'Sans engagement', en: 'No commitment' }
      ]
    },
    {
      name: { fr: 'Pro', en: 'Pro' },
      price: { fr: '20€/mois', en: '€20/month' },
      credits: 100,
      priceId: 'price_1SY0b2Hi2Io4SvfQ6jhRiZPy',
      popular: true,
      features: [
        { fr: '100 crédits par mois', en: '100 credits per month' },
        { fr: 'Historique illimité', en: 'Unlimited history' },
        { fr: 'Tous les services IA', en: 'All AI services' },
        { fr: 'Support prioritaire', en: 'Priority support' },
        { fr: 'Sans engagement', en: 'No commitment' }
      ]
    }
  ];

  return (
    <div className="min-h-screen py-12 px-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{ backgroundColor: theme === 'dark' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)' }}>
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">
              {language === 'fr' ? 'Services IA illimités' : 'Unlimited AI Services'}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            {language === 'fr' ? 'Tarifs & Abonnements' : 'Pricing & Plans'}
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            {language === 'fr' 
              ? 'Choisissez la formule qui vous convient pour accéder aux services IA'
              : 'Choose the plan that suits you to access AI services'
            }
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            ✨ {language === 'fr' ? '10 générations gratuites offertes !' : '10 free generations included!'}
          </p>
        </div>

        {/* Packs de crédits */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: 'var(--text-primary)' }}>
            {language === 'fr' ? 'Packs de crédits' : 'Credit Packs'}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {creditPacks.map((pack) => (
              <div
                key={pack.priceId}
                className={`rounded-2xl p-6 transition-all ${
                  pack.popular ? 'ring-2 ring-purple-500 shadow-xl scale-105' : 'shadow-lg'
                }`}
                style={{ 
                  backgroundColor: 'var(--bg-card)', 
                  borderColor: 'var(--border-color)',
                  border: pack.popular ? undefined : '1px solid var(--border-color)'
                }}
              >
                {pack.popular && (
                  <div className="text-center mb-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold">
                      <Crown className="w-3 h-3" />
                      {language === 'fr' ? 'POPULAIRE' : 'POPULAR'}
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {pack.name[language]}
                  </h3>
                  <div className="text-4xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                    {pack.price}
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {language === 'fr' ? 'Paiement unique' : 'One-time payment'}
                  </p>
                </div>
                <ul className="space-y-3 mb-6">
                  {pack.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {feature[language]}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handleCheckout(pack.priceId, 'payment')}
                  disabled={loading[pack.priceId]}
                  className={`w-full ${
                    pack.popular
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  {loading[pack.priceId] ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4 mr-2" />
                  )}
                  {language === 'fr' ? 'Acheter' : 'Buy now'}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Abonnements */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: 'var(--text-primary)' }}>
            {language === 'fr' ? 'Abonnements mensuels' : 'Monthly Subscriptions'}
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {subscriptions.map((sub) => (
              <div
                key={sub.priceId}
                className={`rounded-2xl p-8 transition-all ${
                  sub.popular ? 'ring-2 ring-purple-500 shadow-xl scale-105' : 'shadow-lg'
                }`}
                style={{ 
                  backgroundColor: 'var(--bg-card)', 
                  borderColor: 'var(--border-color)',
                  border: sub.popular ? undefined : '1px solid var(--border-color)'
                }}
              >
                {sub.popular && (
                  <div className="text-center mb-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold">
                      <Crown className="w-3 h-3" />
                      {language === 'fr' ? 'RECOMMANDÉ' : 'RECOMMENDED'}
                    </span>
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {sub.name[language]}
                  </h3>
                  <div className="text-5xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {sub.price[language].split('/')[0]}
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {language === 'fr' ? 'par mois' : 'per month'}
                  </p>
                </div>
                <ul className="space-y-4 mb-8">
                  {sub.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {feature[language]}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handleCheckout(sub.priceId, 'subscription')}
                  disabled={loading[sub.priceId]}
                  className={`w-full py-6 text-lg ${
                    sub.popular
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  {loading[sub.priceId] ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Crown className="w-5 h-5 mr-2" />
                  )}
                  {language === 'fr' ? 'S\'abonner' : 'Subscribe'}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: 'var(--text-primary)' }}>
            {language === 'fr' ? 'Questions fréquentes' : 'FAQ'}
          </h2>
          <div className="space-y-4">
            <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                {language === 'fr' ? 'Qu\'est-ce qu\'un crédit ?' : 'What is a credit?'}
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {language === 'fr' 
                  ? '1 crédit = 1 génération IA (image, texte, logo, etc.). Les 10 premières générations sont gratuites.'
                  : '1 credit = 1 AI generation (image, text, logo, etc.). The first 10 generations are free.'
                }
              </p>
            </div>
            <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                {language === 'fr' ? 'Les crédits expirent-ils ?' : 'Do credits expire?'}
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {language === 'fr' 
                  ? 'Les packs de crédits sont valables à vie. Les abonnements se renouvellent chaque mois.'
                  : 'Credit packs are valid for life. Subscriptions renew monthly.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}