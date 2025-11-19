import React, { useState } from 'react';
import { Mail, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageProvider';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const { t } = useLanguage();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error(t('home_newsletter_error_email'));
      return;
    }

    setLoading(true);
    try {
      await base44.entities.NewsletterSubscriber.create({
        email,
        name,
        active: true
      });
      
      setSubscribed(true);
      toast.success(t('home_newsletter_success_toast'));
      setEmail('');
      setName('');
    } catch (error) {
      toast.error(t('home_newsletter_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-24 px-6 bg-gradient-to-br from-purple-950 via-slate-950 to-purple-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(139,92,246,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(236,72,153,0.15),transparent_50%)]" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-sm mb-6 backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            <span>{t('home_newsletter_badge')}</span>
          </div>
          
          <h2 className="text-5xl font-bold mb-4 text-white">
            {t('home_newsletter_title')}
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            {t('home_newsletter_subtitle')}
          </p>
        </div>

        {!subscribed ? (
          <form onSubmit={handleSubscribe} className="max-w-2xl mx-auto">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <Input
                  type="text"
                  placeholder={t('home_newsletter_name')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 h-14 rounded-xl focus-visible:ring-purple-500"
                />
                <Input
                  type="email"
                  placeholder={t('home_newsletter_email')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 h-14 rounded-xl focus-visible:ring-purple-500"
                />
              </div>
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg font-medium rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                {loading ? (
                  t('home_newsletter_loading')
                ) : (
                  <>
                    <Mail className="w-5 h-5 mr-2" />
                    {t('home_newsletter_btn')}
                  </>
                )}
              </Button>

              <div className="mt-6 flex flex-wrap gap-4 justify-center text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>{t('home_newsletter_free')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>{t('home_newsletter_frequency')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>{t('home_newsletter_unsubscribe')}</span>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="max-w-2xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 shadow-2xl text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              {t('home_newsletter_success_title')}
            </h3>
            <p className="text-slate-300 text-lg">
              {t('home_newsletter_success_subtitle')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}