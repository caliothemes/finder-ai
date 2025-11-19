import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Crown, Sparkles, Check, Zap, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageProvider';

export default function ProAccount() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();
  const { t } = useLanguage();

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
        credits: planType === 'starter' ? 100 : planType === 'pro' ? 500 : planType === 'enterprise' ? 2000 : 0,
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
      const newCredits = planType === 'starter' ? 100 : planType === 'pro' ? 500 : planType === 'enterprise' ? 2000 : 0;
      
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
      price: '9,90€',
      period: t('pro_per_month'),
      credits: 10,
      features: [
        'Tout du plan Free',
        '10 crédits publicitaires/mois',
        '1 crédit = 1 jour bannière',
        'Support prioritaire'
      ],
      color: 'from-blue-600 to-cyan-600',
      popular: !proAccount || proAccount.plan_type === 'free',
      current: proAccount?.plan_type === 'starter'
    },
    {
      name: 'Pro',
      price: '29,90€',
      period: t('pro_per_month'),
      credits: 50,
      features: [
        'Tout du plan Starter',
        '50 crédits publicitaires/mois',
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
    { credits: 10, price: '12,90€' },
    { credits: 50, price: '39,90€' },
    { credits: 100, price: '59,90€' }
  ];

  return (
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
                  if (!proAccount) {
                    createProAccountMutation.mutate(plan.name.toLowerCase());
                  } else if (!plan.current) {
                    upgradePlanMutation.mutate(plan.name.toLowerCase());
                  }
                }}
                disabled={plan.current || createProAccountMutation.isPending || upgradePlanMutation.isPending}
                className={`w-full ${
                  plan.current
                    ? 'bg-green-100 text-green-700 hover:bg-green-100'
                    : `bg-gradient-to-r ${plan.color} hover:opacity-90 text-white`
                }`}
              >
                {plan.current ? (
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
                  <div className="text-4xl font-bold text-purple-600">
                    {pack.price}
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                  {t('pro_buy_now')}
                </Button>
              </div>
            ))}
          </div>
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
  );
}