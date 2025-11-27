import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Crown, Sparkles, Check, Zap, TrendingUp, Image, Calendar, CreditCard, LayoutGrid, Loader2, XCircle, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageProvider';

export default function ProAccount() {
  const [user, setUser] = useState(null);
  const [loadingCheckout, setLoadingCheckout] = useState(null);
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const [showCanceledModal, setShowCanceledModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Vérifier si paiement réussi ou annulé
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      setShowSuccessModal(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (urlParams.get('canceled') === 'true') {
      setShowCanceledModal(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: proAccount, isLoading } = useQuery({
    queryKey: ['proAccount', user?.email],
    queryFn: async () => {
      const accounts = await base44.entities.ProAccount.filter({ user_email: user.email });
      return accounts[0] || null;
    },
    enabled: !!user,
  });

  const { data: myAIServices = [] } = useQuery({
    queryKey: ['myAIServices', user?.email],
    queryFn: () => base44.entities.AIService.filter({ submitted_by: user.email }),
    enabled: !!user,
  });

  const createProAccountMutation = useMutation({
    mutationFn: async (planType) => {
      await base44.entities.ProAccount.create({
        user_email: user.email,
        company_name: user.full_name || user.email.split('@')[0],
        plan_type: planType,
        credits: planType === 'starter' ? 20 : planType === 'pro' ? 100 : 0,
        status: 'active'
      });
      
      toast.success('Compte Pro créé avec succès ! 🎉');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proAccount'] });
    },
  });

  const upgradePlanMutation = useMutation({
    mutationFn: async (planType) => {
      const newCredits = planType === 'starter' ? 20 : planType === 'pro' ? 100 : 0;
      
      await base44.entities.ProAccount.update(proAccount.id, {
        plan_type: planType,
        credits: (proAccount.credits || 0) + newCredits
      });
      
      toast.success('Plan mis à niveau avec succès ! ✨');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proAccount'] });
    },
  });

  if (!user || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const plans = [
    {
      name: 'Free',
      price: '0€',
      period: t('pro_always'),
      credits: 0,
      costPerCredit: null,
      features: [
        'Soumettre des outils IA',
        'Profil public',
        'Support communautaire'
      ],
      color: 'from-slate-600 to-slate-700',
      current: proAccount?.plan_type === 'free'
    },
    {
      name: 'Starter',
      price: '5€',
      period: t('pro_per_month'),
      credits: 20,
      costPerCredit: '0.25€',
      features: [
        'Tout du plan Free',
        '20 crédits publicitaires/mois',
        '1 crédit = 1 jour bannière',
        'Support prioritaire'
      ],
      color: 'from-blue-600 to-cyan-600',
      popular: !proAccount || proAccount.plan_type === 'free',
      current: proAccount?.plan_type === 'starter'
    },
    {
      name: 'Pro',
      price: '20€',
      period: t('pro_per_month'),
      credits: 100,
      costPerCredit: '0.20€',
      features: [
        'Tout du plan Starter',
        '100 crédits publicitaires/mois',
        'Badge Pro',
        'Analytics détaillés',
        'Support premium'
      ],
      color: 'from-purple-600 to-pink-600',
      popular: true,
      current: proAccount?.plan_type === 'pro'
    }
  ];

  const creditPacks = [
    { credits: 10, price: '5€', costPerCredit: '0.50€', priceId: 'price_1SY0XVHi2Io4SvfQtq9NBCMD' },
    { credits: 50, price: '20€', costPerCredit: '0.40€', priceId: 'price_1SY0Y9Hi2Io4SvfQyuu2ZnfA' },
    { credits: 100, price: '30€', costPerCredit: '0.30€', priceId: 'price_1SY0YkHi2Io4SvfQQbmdiOH7' }
  ];

  // Stripe Price IDs pour les abonnements
  const planPriceIds = {
    starter: 'price_1SY0aKHi2Io4SvfQIoyodFt5',
    pro: 'price_1SY0b2Hi2Io4SvfQ6jhRiZPy'
  };

  const handleCheckout = async (priceId, mode = 'payment') => {
    setLoadingCheckout(priceId);
    try {
      const response = await base44.functions.invoke('createCheckout', {
        priceId,
        mode
      });
      
      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        toast.error('Erreur lors de la création du paiement');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Erreur lors de la création du paiement');
    } finally {
      setLoadingCheckout(null);
    }
  };

  return (
    <>
      {/* Modal Paiement Annulé */}
      <Dialog open={showCanceledModal} onOpenChange={setShowCanceledModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <DialogTitle className="text-center text-2xl">Paiement non effectué</DialogTitle>
            <DialogDescription className="text-center text-base">
              Votre paiement a été annulé. Aucun montant n'a été débité de votre compte.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button 
              onClick={() => setShowCanceledModal(false)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Réessayer
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowCanceledModal(false)}
            >
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Paiement Réussi */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <DialogTitle className="text-center text-2xl">Paiement réussi ! 🎉</DialogTitle>
            <DialogDescription className="text-center text-base">
              Merci pour votre achat ! Vos crédits ont été ajoutés à votre compte.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Button 
              onClick={() => {
                setShowSuccessModal(false);
                queryClient.invalidateQueries({ queryKey: ['proAccount'] });
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              C'est parti !
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-purple-700 text-sm mb-6">
            <Crown className="w-4 h-4" />
            <span>{t('pro_professional')}</span>
          </div>
          
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {t('pro_title')}
          </h1>
          
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            {t('pro_subtitle')}
          </p>
        </div>

        {/* Current Account Status */}
        {proAccount && (
          <Card className="mb-12 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Crown className="w-6 h-6 text-purple-600" />
                {t('pro_your_account')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <div className="text-sm text-slate-600 mb-1">{t('pro_current_plan')}</div>
                  <div className="text-2xl font-bold text-purple-600 capitalize">
                    {proAccount.plan_type}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">{t('pro_credits_available')}</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {proAccount.credits || 0}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">{t('pro_tools_managed')}</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {myAIServices.length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* How it works */}
        <div className="mb-12 bg-white rounded-3xl p-8 border border-slate-200 shadow-lg">
          <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-600" />
            {t('pro_how_it_works')}
          </h2>
          <p className="text-center text-slate-600 mb-8 max-w-2xl mx-auto">
            {t('pro_how_it_works_intro')}
          </p>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl">
              <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                <CreditCard className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{t('pro_how_step1_title')}</h3>
              <p className="text-sm text-slate-600">{t('pro_how_step1_desc')}</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
              <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Image className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{t('pro_how_step2_title')}</h3>
              <p className="text-sm text-slate-600">{t('pro_how_step2_desc')}</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
              <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{t('pro_how_step3_title')}</h3>
              <p className="text-sm text-slate-600">{t('pro_how_step3_desc')}</p>
            </div>
          </div>

          {/* Positions preview */}
          <h3 className="text-xl font-bold text-slate-900 mb-6 text-center flex items-center justify-center gap-2">
            <LayoutGrid className="w-5 h-5 text-purple-600" />
            {t('pro_positions_title')}
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            {/* Hero */}
            <div className="bg-slate-100 rounded-xl p-4">
              <div className="w-full h-20 bg-slate-200 rounded-lg mb-2 relative overflow-hidden">
                <div className="absolute top-1 left-1 right-1 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center text-white text-[8px] font-bold">
                  HERO
                </div>
                <div className="absolute bottom-1 left-1 right-1 flex gap-1">
                  <div className="h-6 flex-1 bg-slate-300 rounded" />
                  <div className="h-6 flex-1 bg-slate-300 rounded" />
                  <div className="h-6 flex-1 bg-slate-300 rounded" />
                </div>
              </div>
              <h4 className="font-semibold text-sm text-slate-900">{t('pro_position_hero')}</h4>
              <p className="text-xs text-slate-500">{t('pro_position_hero_desc')}</p>
            </div>

            {/* Sidebar Card */}
            <div className="bg-slate-100 rounded-xl p-4">
              <div className="w-full h-20 bg-slate-200 rounded-lg mb-2 relative overflow-hidden p-1">
                <div className="flex gap-1 h-full">
                  <div className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center text-white text-[8px] font-bold border-2 border-purple-400">
                    CARD
                  </div>
                  <div className="flex-1 bg-slate-300 rounded" />
                  <div className="flex-1 bg-slate-300 rounded" />
                </div>
              </div>
              <h4 className="font-semibold text-sm text-slate-900">{t('pro_position_sidebar')}</h4>
              <p className="text-xs text-slate-500">{t('pro_position_sidebar_desc')}</p>
            </div>

            {/* Category bottom */}
            <div className="bg-slate-100 rounded-xl p-4">
              <div className="w-full h-20 bg-slate-200 rounded-lg mb-2 relative overflow-hidden p-1">
                <div className="grid grid-cols-4 gap-1 mb-1">
                  <div className="h-4 bg-slate-300 rounded" />
                  <div className="h-4 bg-slate-300 rounded" />
                  <div className="h-4 bg-slate-300 rounded" />
                  <div className="h-4 bg-slate-300 rounded" />
                </div>
                <div className="h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center text-white text-[8px] font-bold">
                  BANNIÈRE
                </div>
                <div className="flex justify-center mt-1">
                  <div className="h-3 w-12 bg-slate-400 rounded" />
                </div>
              </div>
              <h4 className="font-semibold text-sm text-slate-900">{t('pro_position_category')}</h4>
              <p className="text-xs text-slate-500">{t('pro_position_category_desc')}</p>
            </div>

            {/* Explore */}
            <div className="bg-slate-100 rounded-xl p-4">
              <div className="w-full h-20 bg-slate-200 rounded-lg mb-2 relative overflow-hidden p-1">
                <div className="h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center text-white text-[8px] font-bold mb-1">
                  TOP
                </div>
                <div className="flex gap-1">
                  <div className="flex-1 h-8 bg-slate-300 rounded" />
                  <div className="flex-1 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded flex items-center justify-center text-white text-[6px] font-bold">
                    CARD
                  </div>
                  <div className="flex-1 h-8 bg-slate-300 rounded" />
                </div>
              </div>
              <h4 className="font-semibold text-sm text-slate-900">{t('pro_position_explore')}</h4>
              <p className="text-xs text-slate-500">{t('pro_position_explore_desc')}</p>
            </div>
          </div>
        </div>

        {/* Credit Packs */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            {t('pro_buy_credits')}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {creditPacks.map((pack) => (
              <div key={pack.credits} className="bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-purple-400 transition-all">
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-slate-900 mb-2">
                    {pack.credits}
                  </div>
                  <div className="text-slate-600 mb-4">{t('pro_credits')}</div>
                  <div className="text-4xl font-bold text-purple-600 mb-2">
                    {pack.price}
                  </div>
                  <div className="text-sm text-green-600 font-medium">
                    {pack.costPerCredit} {t('pro_cost_per_credit')}
                  </div>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  onClick={() => handleCheckout(pack.priceId, 'payment')}
                  disabled={loadingCheckout === pack.priceId}
                >
                  {loadingCheckout === pack.priceId ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  {t('pro_buy_now')}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-3xl p-8 border-2 transition-all ${
                plan.popular
                  ? 'border-purple-300 shadow-2xl scale-105'
                  : plan.current
                  ? 'border-green-300'
                  : 'border-slate-200 hover:border-purple-200 hover:shadow-lg'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {t('pro_popular')}
                  </Badge>
                </div>
              )}

              {plan.current && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-green-600 text-white border-0">
                    <Check className="w-3 h-3 mr-1" />
                    {t('pro_active')}
                  </Badge>
                </div>
              )}

              <div className="text-center mb-6">
                <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                  <Crown className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                  <span className="text-slate-600">{plan.period}</span>
                </div>
                
                {plan.credits > 0 && (
                  <div className="mt-2 text-sm text-purple-600 font-medium">
                    + {plan.credits} {t('pro_credits_per_month')}
                  </div>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => {
                  const planKey = plan.name.toLowerCase();
                  if (planKey === 'free') {
                    if (!proAccount) {
                      createProAccountMutation.mutate('free');
                    }
                  } else if (planPriceIds[planKey]) {
                    handleCheckout(planPriceIds[planKey], 'subscription');
                  }
                }}
                disabled={plan.current || loadingCheckout === planPriceIds[plan.name.toLowerCase()] || createProAccountMutation.isPending}
                className={`w-full ${
                  plan.current
                    ? 'bg-green-100 text-green-700 hover:bg-green-100'
                    : `bg-gradient-to-r ${plan.color} hover:opacity-90 text-white`
                }`}
              >
                {loadingCheckout === planPriceIds[plan.name.toLowerCase()] ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : plan.current ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {t('pro_plan_active')}
                  </>
                ) : proAccount ? (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    {t('pro_upgrade')}
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    {t('pro_choose_plan')}
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="bg-gradient-to-br from-purple-950 via-slate-950 to-purple-950 rounded-3xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-8 text-center">
            {t('pro_why_pro')}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-purple-300" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('pro_visibility_title')}</h3>
              <p className="text-slate-300">
                {t('pro_visibility_desc')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-pink-500/20 rounded-2xl flex items-center justify-center">
                <Zap className="w-8 h-8 text-pink-300" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('pro_credits_title')}</h3>
              <p className="text-slate-300">
                {t('pro_credits_desc')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-blue-300" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('pro_badges_title')}</h3>
              <p className="text-slate-300">
                {t('pro_badges_desc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}