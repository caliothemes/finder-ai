import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Mail, Users, Download, Plus, Send, FileText, Edit, Trash2, 
  Eye, EyeOff, Sparkles, Zap, Calendar, PlayCircle, PauseCircle,
  RefreshCw, CheckCircle, Clock, Loader2, X, Save, CheckCircle2, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

export default function AdminNewsletter() {
  const [activeTab, setActiveTab] = useState('newsletters');
  const [showNewsletterForm, setShowNewsletterForm] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingNewsletter, setEditingNewsletter] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [newsletterData, setNewsletterData] = useState({ subject: '', content: '' });
  const [templateData, setTemplateData] = useState({ name: '', subject: '', content: '' });
  const [showPreview, setShowPreview] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedTemplateForGenerate, setSelectedTemplateForGenerate] = useState('');
  
  // Send modal state
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [sendingNewsletter, setSendingNewsletter] = useState(null);
  const [sendProgress, setSendProgress] = useState(0);
  const [sendStatus, setSendStatus] = useState('idle'); // idle, confirming, sending, success, error
  const [sentCount, setSentCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  
  const queryClient = useQueryClient();

  // Fetch subscribers newsletter
  const { data: newsletterSubscribers = [] } = useQuery({
    queryKey: ['newsletterSubscribers'],
    queryFn: () => base44.entities.NewsletterSubscriber.list('-created_date'),
  });

  // Fetch all users (they are also subscribers)
  const { data: users = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list(),
  });

  // Merge subscribers: newsletter subscribers + users with unique emails
  const allSubscribers = React.useMemo(() => {
    const emailSet = new Set();
    const merged = [];
    
    // Add newsletter subscribers first
    newsletterSubscribers.filter(s => s.active).forEach(s => {
      if (!emailSet.has(s.email)) {
        emailSet.add(s.email);
        merged.push({ email: s.email, name: s.name, source: 'newsletter', created_date: s.created_date });
      }
    });
    
    // Add users
    users.forEach(u => {
      if (!emailSet.has(u.email)) {
        emailSet.add(u.email);
        merged.push({ email: u.email, name: u.full_name, source: 'user', created_date: u.created_date });
      }
    });
    
    return merged;
  }, [newsletterSubscribers, users]);

  const { data: newsletters = [], isLoading } = useQuery({
    queryKey: ['newsletters'],
    queryFn: () => base44.entities.Newsletter.list('-created_date'),
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['newsletterTemplates'],
    queryFn: () => base44.entities.NewsletterTemplate.list('-created_date'),
  });

  // Autopilot config
  const { data: autopilotConfig } = useQuery({
    queryKey: ['autopilotConfig'],
    queryFn: async () => {
      const configs = await base44.entities.AutopilotConfig.filter({ feature: 'newsletter' });
      return configs[0] || null;
    },
  });

  // Fetch latest content for generation
  const { data: latestNews = [] } = useQuery({
    queryKey: ['latestNews'],
    queryFn: () => base44.entities.AINews.filter({ status: 'published' }, '-created_date', 8),
  });

  const { data: latestServices = [] } = useQuery({
    queryKey: ['latestServicesNewsletter'],
    queryFn: () => base44.entities.AIService.filter({ status: 'approved' }, '-created_date', 8),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categoriesNewsletter'],
    queryFn: () => base44.entities.Category.list(),
  });

  // Mutations
  const createNewsletterMutation = useMutation({
    mutationFn: (data) => base44.entities.Newsletter.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletters'] });
      resetNewsletterForm();
      toast.success('Newsletter créée');
    },
  });

  const updateNewsletterMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Newsletter.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletters'] });
      resetNewsletterForm();
      toast.success('Newsletter mise à jour');
    },
  });

  const deleteNewsletterMutation = useMutation({
    mutationFn: (id) => base44.entities.Newsletter.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletters'] });
      toast.success('Newsletter supprimée');
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: (data) => base44.entities.NewsletterTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletterTemplates'] });
      resetTemplateForm();
      toast.success('Modèle créé');
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.NewsletterTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletterTemplates'] });
      resetTemplateForm();
      toast.success('Modèle mis à jour');
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id) => base44.entities.NewsletterTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletterTemplates'] });
      toast.success('Modèle supprimé');
    },
  });

  const updateAutopilotMutation = useMutation({
    mutationFn: async (data) => {
      if (autopilotConfig) {
        await base44.entities.AutopilotConfig.update(autopilotConfig.id, data);
      } else {
        await base44.entities.AutopilotConfig.create({ feature: 'newsletter', ...data });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autopilotConfig'] });
      toast.success('Configuration autopilot mise à jour');
    },
  });

  // Open send modal
  const openSendModal = (newsletter) => {
    setSendingNewsletter(newsletter);
    setSendProgress(0);
    setSendStatus('confirming');
    setSentCount(0);
    setErrorCount(0);
    setSendModalOpen(true);
  };

  // Close send modal
  const closeSendModal = () => {
    if (sendStatus !== 'sending') {
      setSendModalOpen(false);
      setSendingNewsletter(null);
      setSendStatus('idle');
    }
  };

  // Send newsletter with progress
  const sendNewsletter = async () => {
    if (!sendingNewsletter) return;
    
    setSendStatus('sending');
    setSendProgress(0);
    setSentCount(0);
    setErrorCount(0);
    
    const total = allSubscribers.length;
    let sent = 0;
    let errors = 0;
    
    for (let i = 0; i < allSubscribers.length; i++) {
      const sub = allSubscribers[i];
      try {
        await base44.integrations.Core.SendEmail({
          to: sub.email,
          subject: sendingNewsletter.subject,
          body: sendingNewsletter.content
        });
        sent++;
        setSentCount(sent);
      } catch (e) {
        console.error('Failed to send to', sub.email, e);
        errors++;
        setErrorCount(errors);
      }
      setSendProgress(Math.round(((i + 1) / total) * 100));
    }
    
    await base44.entities.Newsletter.update(sendingNewsletter.id, {
      status: 'sent',
      sent_to: sent,
      sent_date: new Date().toISOString()
    });
    
    queryClient.invalidateQueries({ queryKey: ['newsletters'] });
    setSendStatus('success');
  };

  const resetNewsletterForm = () => {
    setShowNewsletterForm(false);
    setEditingNewsletter(null);
    setNewsletterData({ subject: '', content: '' });
    setShowPreview(false);
  };

  const resetTemplateForm = () => {
    setShowTemplateForm(false);
    setEditingTemplate(null);
    setTemplateData({ name: '', subject: '', content: '' });
    setShowPreview(false);
  };

  const handleEditNewsletter = (newsletter) => {
    setEditingNewsletter(newsletter);
    setNewsletterData({ subject: newsletter.subject, content: newsletter.content });
    setShowNewsletterForm(true);
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setTemplateData({ name: template.name, subject: template.subject, content: template.content });
    setShowTemplateForm(true);
  };

  const handleSaveNewsletter = () => {
    if (editingNewsletter) {
      updateNewsletterMutation.mutate({ id: editingNewsletter.id, data: newsletterData });
    } else {
      createNewsletterMutation.mutate(newsletterData);
    }
  };

  const handleSaveTemplate = () => {
    if (editingTemplate) {
      updateTemplateMutation.mutate({ id: editingTemplate.id, data: templateData });
    } else {
      createTemplateMutation.mutate(templateData);
    }
  };

  // Generate newsletter from template
  const generateNewsletter = async () => {
    if (!selectedTemplateForGenerate) {
      toast.error('Sélectionnez un modèle');
      return;
    }

    setGenerating(true);
    try {
      const template = templates.find(t => t.id === selectedTemplateForGenerate);
      if (!template) throw new Error('Modèle non trouvé');

      // Get random 10 categories
      const randomCategories = [...categories].sort(() => Math.random() - 0.5).slice(0, 10);

      // Build newsletter content
      const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      
      const newsHtml = latestNews.map(news => `
        <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 10px;">
          ${news.cover_image_url ? `<img src="${news.cover_image_url}" alt="${news.title}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;" />` : ''}
          <h3 style="margin: 0 0 8px 0; color: #1a1a2e; font-size: 16px;">${news.title}</h3>
          <p style="margin: 0 0 10px 0; color: #666; font-size: 14px; line-height: 1.5;">${news.summary?.substring(0, 120)}...</p>
          <a href="https://finderai.app.base44.dev/AINewsDetail?slug=${news.slug}" style="display: inline-block; padding: 8px 16px; background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: white; text-decoration: none; border-radius: 20px; font-size: 12px; font-weight: 600;">Lire l'article →</a>
        </div>
      `).join('');

      const servicesHtml = latestServices.map((service, index) => {
        const isLarge = index < 2;
        if (isLarge) {
          return `
            <div style="display: block; margin-bottom: 20px; padding: 20px; background: linear-gradient(135deg, #f5f3ff 0%, #fdf2f8 100%); border-radius: 12px;">
              <div style="display: flex; align-items: flex-start; gap: 15px;">
                ${service.logo_url ? `<img src="${service.logo_url}" alt="${service.name}" style="width: 70px; height: 70px; border-radius: 12px; object-fit: cover; flex-shrink: 0;" />` : ''}
                <div style="flex: 1;">
                  <h4 style="margin: 0 0 8px 0; color: #1a1a2e; font-size: 18px; font-weight: 700;">${service.name}</h4>
                  <p style="margin: 0 0 12px 0; color: #666; font-size: 14px; line-height: 1.6;">${service.description?.substring(0, 250) || service.tagline || ''}...</p>
                  <a href="https://finderai.app.base44.dev/AIDetail?slug=${service.slug}" style="display: inline-block; padding: 10px 20px; background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: white; text-decoration: none; border-radius: 20px; font-size: 13px; font-weight: 600;">Découvrir cet outil →</a>
                </div>
              </div>
            </div>
          `;
        } else {
          return `
            <div style="display: inline-block; width: 30%; margin: 1%; padding: 15px; background: linear-gradient(135deg, #f5f3ff 0%, #fdf2f8 100%); border-radius: 10px; vertical-align: top; box-sizing: border-box;">
              ${service.logo_url ? `<img src="${service.logo_url}" alt="${service.name}" style="width: 50px; height: 50px; border-radius: 10px; object-fit: cover; margin-bottom: 10px;" />` : ''}
              <h4 style="margin: 0 0 5px 0; color: #1a1a2e; font-size: 14px;">${service.name}</h4>
              <p style="margin: 0 0 8px 0; color: #666; font-size: 12px;">${service.tagline?.substring(0, 60) || ''}...</p>
              <a href="https://finderai.app.base44.dev/AIDetail?slug=${service.slug}" style="display: inline-block; padding: 6px 12px; background: #9333ea; color: white; text-decoration: none; border-radius: 15px; font-size: 11px; font-weight: 600;">Découvrir →</a>
            </div>
          `;
        }
      }).join('');

      const categoriesHtml = randomCategories.map(cat => `
        <a href="https://finderai.app.base44.dev/Category?slug=${cat.slug}" style="display: inline-block; padding: 8px 16px; margin: 5px; background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: white; border-radius: 20px; font-size: 13px; text-decoration: none;">${cat.name}</a>
      `).join('');

      // Build the generated content block - Services first, then News
      const generatedContent = `
        <div style="margin-top: 30px;">
          <h2 style="color: #9333ea; font-size: 22px; margin-bottom: 20px; font-weight: 700;">Nouveaux outils IA</h2>
          <div>
            ${servicesHtml || '<p style="color: #666;">Aucun nouveau service cette semaine.</p>'}
          </div>
        </div>
        <div style="margin-top: 30px;">
          <h2 style="color: #9333ea; font-size: 22px; margin-bottom: 20px; font-weight: 700;">Actualités IA de la semaine</h2>
          ${newsHtml || '<p style="color: #666;">Aucune actualité cette semaine.</p>'}
        </div>
        <div style="margin-top: 30px; text-align: center;">
          <h2 style="color: #9333ea; font-size: 22px; margin-bottom: 20px; font-weight: 700;">Catégories à explorer</h2>
          ${categoriesHtml || ''}
        </div>
      `;

      // Replace placeholders in template
      let content = template.content
        .replace(/{{date}}/g, today)
        .replace(/{{contenu_genere}}/g, generatedContent);

      // If template doesn't have {{contenu_genere}}, append at the end
      if (!template.content.includes('{{contenu_genere}}')) {
        content = template.content.replace(/{{date}}/g, today) + generatedContent;
      }

      const subject = template.subject.replace(/{{date}}/g, today);

      setNewsletterData({ subject, content });
      setShowNewsletterForm(true);
      setSelectedTemplateForGenerate('');
      toast.success('Newsletter générée ! Vérifiez et envoyez.');
    } catch (error) {
      toast.error('Erreur lors de la génération');
    } finally {
      setGenerating(false);
    }
  };

  const exportCSV = () => {
    const csv = [
      ['Email', 'Nom', 'Source', 'Date inscription'],
      ...allSubscribers.map(s => [
        s.email,
        s.name || '',
        s.source === 'newsletter' ? 'Newsletter' : 'Compte utilisateur',
        new Date(s.created_date).toLocaleDateString('fr-FR')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
    {/* Send Newsletter Modal */}
    <Dialog open={sendModalOpen} onOpenChange={closeSendModal}>
      <DialogContent className="sm:max-w-lg">
        {sendStatus === 'confirming' && (
          <div className="text-center py-6">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
              <Send className="w-10 h-10 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Confirmer l'envoi</h2>
            <p className="text-slate-600 mb-6">
              Vous êtes sur le point d'envoyer cette newsletter à <span className="font-bold text-purple-600">{allSubscribers.length}</span> destinataires.
            </p>
            <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-slate-500 mb-1">Sujet :</p>
              <p className="font-medium text-slate-900">{sendingNewsletter?.subject}</p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={closeSendModal}>
                Annuler
              </Button>
              <Button 
                onClick={sendNewsletter}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Envoyer maintenant
              </Button>
            </div>
          </div>
        )}

        {sendStatus === 'sending' && (
          <div className="text-center py-6">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center relative">
              <Mail className="w-10 h-10 text-purple-600" />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Envoi en cours...</h2>
            <p className="text-slate-600 mb-6">
              Veuillez patienter, ne fermez pas cette fenêtre.
            </p>
            
            <div className="mb-4">
              <Progress value={sendProgress} className="h-3" />
            </div>
            
            <div className="flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-slate-600"><span className="font-bold text-green-600">{sentCount}</span> envoyés</span>
              </div>
              {errorCount > 0 && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-slate-600"><span className="font-bold text-red-600">{errorCount}</span> erreurs</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600"><span className="font-bold">{allSubscribers.length}</span> total</span>
              </div>
            </div>
            
            <p className="text-xs text-slate-400 mt-4">
              {sendProgress}% complété
            </p>
          </div>
        )}

        {sendStatus === 'success' && (
          <div className="text-center py-6">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200 animate-pulse">
              <CheckCircle2 className="w-14 h-14 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Newsletter envoyée !</h2>
            <p className="text-slate-600 mb-6">
              Votre newsletter a été envoyée avec succès.
            </p>
            
            <div className="bg-green-50 rounded-xl p-4 mb-6">
              <div className="flex justify-center gap-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{sentCount}</p>
                  <p className="text-sm text-green-700">Emails envoyés</p>
                </div>
                {errorCount > 0 && (
                  <div className="text-center">
                    <p className="text-3xl font-bold text-red-500">{errorCount}</p>
                    <p className="text-sm text-red-600">Erreurs</p>
                  </div>
                )}
              </div>
            </div>
            
            <Button 
              onClick={closeSendModal}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Terminé
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>

    <div className="space-y-6">
      {/* Header with Autopilot */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>Système Newsletter Pro</CardTitle>
                <CardDescription>Gérez vos newsletters, modèles et abonnés</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-slate-600">Total destinataires</p>
                <p className="text-2xl font-bold text-purple-600">{allSubscribers.length}</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-white rounded-xl p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {autopilotConfig?.enabled ? (
                  <PlayCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <PauseCircle className="w-6 h-6 text-slate-400" />
                )}
                <div>
                  <h3 className="font-semibold">Pilote Automatique</h3>
                  <p className="text-sm text-slate-600">
                    {autopilotConfig?.enabled 
                      ? `Envoi automatique chaque dimanche matin` 
                      : 'Désactivé - Les newsletters sont envoyées manuellement'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Select 
                  value={autopilotConfig?.template_id || ''} 
                  onValueChange={(v) => updateAutopilotMutation.mutate({ template_id: v })}
                  disabled={!templates.length}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Modèle autopilot" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Switch
                  checked={autopilotConfig?.enabled || false}
                  onCheckedChange={(checked) => updateAutopilotMutation.mutate({ enabled: checked })}
                />
              </div>
            </div>
            {autopilotConfig?.last_run && (
              <p className="text-xs text-slate-500 mt-2">
                Dernière exécution: {new Date(autopilotConfig.last_run).toLocaleString('fr-FR')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border">
          <TabsTrigger value="newsletters" className="gap-2">
            <Send className="w-4 h-4" />
            Newsletters
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="w-4 h-4" />
            Modèles
          </TabsTrigger>
          <TabsTrigger value="subscribers" className="gap-2">
            <Users className="w-4 h-4" />
            Abonnés ({allSubscribers.length})
          </TabsTrigger>
        </TabsList>

        {/* NEWSLETTERS TAB */}
        <TabsContent value="newsletters" className="space-y-6">
          {/* Generate Section */}
          <Card className="border-dashed border-2 border-purple-300 bg-purple-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold">Générer une newsletter automatiquement</h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    Crée une newsletter avec les 8 derniers outils IA, 8 dernières actualités et 3 catégories aléatoires
                  </p>
                </div>
                <Select value={selectedTemplateForGenerate} onValueChange={setSelectedTemplateForGenerate}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Choisir un modèle" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={generateNewsletter} 
                  disabled={generating || !selectedTemplateForGenerate}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                  Générer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Newsletter Form */}
          {showNewsletterForm && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{editingNewsletter ? 'Modifier la newsletter' : 'Créer une newsletter'}</CardTitle>
                  <Button variant="ghost" size="icon" onClick={resetNewsletterForm}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Sujet de la newsletter"
                  value={newsletterData.subject}
                  onChange={(e) => setNewsletterData({...newsletterData, subject: e.target.value})}
                />
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Contenu HTML</label>
                  <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
                    {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                    {showPreview ? 'Code' : 'Aperçu'}
                  </Button>
                </div>
                {showPreview ? (
                  <div className="border rounded-lg overflow-hidden bg-white">
                    <div className="bg-slate-100 px-4 py-2 border-b text-sm text-slate-600">Aperçu</div>
                    <iframe srcDoc={newsletterData.content} className="w-full min-h-[500px] border-0" title="Preview" />
                  </div>
                ) : (
                  <Textarea
                    placeholder="Contenu HTML"
                    value={newsletterData.content}
                    onChange={(e) => setNewsletterData({...newsletterData, content: e.target.value})}
                    className="min-h-[400px] font-mono text-sm"
                  />
                )}
                <div className="flex gap-2">
                  <Button onClick={handleSaveNewsletter} disabled={createNewsletterMutation.isPending || updateNewsletterMutation.isPending}>
                    <Save className="w-4 h-4 mr-2" />
                    {editingNewsletter ? 'Mettre à jour' : 'Créer'}
                  </Button>
                  <Button variant="outline" onClick={resetNewsletterForm}>Annuler</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Newsletters List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Newsletters</CardTitle>
                <Button onClick={() => { resetNewsletterForm(); setShowNewsletterForm(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle newsletter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {newsletters.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">Aucune newsletter</p>
                ) : (
                  newsletters.map((newsletter) => (
                    <div key={newsletter.id} className="flex items-center justify-between p-4 border rounded-xl hover:border-purple-200 transition-all">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{newsletter.subject}</h3>
                          {newsletter.status === 'sent' ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Envoyée
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              <Clock className="w-3 h-3 mr-1" />
                              Brouillon
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mt-1">
                          {newsletter.status === 'sent' 
                            ? `Envoyée à ${newsletter.sent_to} destinataires le ${new Date(newsletter.sent_date).toLocaleDateString('fr-FR')}`
                            : `Créée le ${new Date(newsletter.created_date).toLocaleDateString('fr-FR')}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditNewsletter(newsletter)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        {newsletter.status === 'draft' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (confirm('Supprimer cette newsletter ?')) {
                                  deleteNewsletterMutation.mutate(newsletter.id);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                            <Button
                              onClick={() => openSendModal(newsletter)}
                              className="bg-gradient-to-r from-purple-600 to-pink-600"
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Envoyer
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TEMPLATES TAB */}
        <TabsContent value="templates" className="space-y-6">
          {/* Template Form */}
          {showTemplateForm && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{editingTemplate ? 'Modifier le modèle' : 'Créer un modèle'}</CardTitle>
                  <Button variant="ghost" size="icon" onClick={resetTemplateForm}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Nom du modèle"
                  value={templateData.name}
                  onChange={(e) => setTemplateData({...templateData, name: e.target.value})}
                />
                <Input
                  placeholder="Sujet par défaut (utilisez {{date}} pour la date)"
                  value={templateData.subject}
                  onChange={(e) => setTemplateData({...templateData, subject: e.target.value})}
                />
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-purple-800 mb-2">Variables disponibles :</p>
                  <div className="flex flex-wrap gap-2">
                    {['{{date}}', '{{contenu_genere}}'].map(v => (
                      <Badge key={v} variant="outline" className="bg-white">{v}</Badge>
                    ))}
                  </div>
                  <p className="text-xs text-purple-600 mt-2">
                    <code>{'{{contenu_genere}}'}</code> = 8 outils IA + 8 actualités + 3 catégories
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Contenu HTML du modèle</label>
                  <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
                    {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                    {showPreview ? 'Code' : 'Aperçu'}
                  </Button>
                </div>
                {showPreview ? (
                  <div className="border rounded-lg overflow-hidden bg-white">
                    <div className="bg-slate-100 px-4 py-2 border-b text-sm text-slate-600">Aperçu</div>
                    <iframe srcDoc={templateData.content} className="w-full min-h-[500px] border-0" title="Preview" />
                  </div>
                ) : (
                  <Textarea
                    placeholder="Contenu HTML du modèle"
                    value={templateData.content}
                    onChange={(e) => setTemplateData({...templateData, content: e.target.value})}
                    className="min-h-[400px] font-mono text-sm"
                  />
                )}
                <div className="flex gap-2">
                  <Button onClick={handleSaveTemplate} disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}>
                    <Save className="w-4 h-4 mr-2" />
                    {editingTemplate ? 'Mettre à jour' : 'Créer'}
                  </Button>
                  <Button variant="outline" onClick={resetTemplateForm}>Annuler</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Templates List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Modèles de newsletter</CardTitle>
                <Button onClick={() => { resetTemplateForm(); setShowTemplateForm(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau modèle
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {templates.length === 0 ? (
                  <p className="text-center text-slate-500 py-8 col-span-2">Aucun modèle - Créez votre premier modèle !</p>
                ) : (
                  templates.map((template) => (
                    <div key={template.id} className="p-4 border rounded-xl hover:border-purple-200 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{template.name}</h3>
                          <p className="text-sm text-slate-600">{template.subject}</p>
                        </div>
                        {autopilotConfig?.template_id === template.id && (
                          <Badge className="bg-green-100 text-green-800">
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Autopilot
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm" onClick={() => handleEditTemplate(template)}>
                          <Edit className="w-3 h-3 mr-1" />
                          Modifier
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm('Supprimer ce modèle ?')) {
                              deleteTemplateMutation.mutate(template.id);
                            }
                          }}
                        >
                          <Trash2 className="w-3 h-3 mr-1 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SUBSCRIBERS TAB */}
        <TabsContent value="subscribers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Total Destinataires</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-purple-500" />
                  <span className="text-3xl font-bold">{allSubscribers.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Inscrits Newsletter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Mail className="w-8 h-8 text-blue-500" />
                  <span className="text-3xl font-bold">{newsletterSubscribers.filter(s => s.active).length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Utilisateurs avec compte</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-green-500" />
                  <span className="text-3xl font-bold">{users.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Liste des destinataires</CardTitle>
                <Button onClick={exportCSV} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Exporter CSV
                </Button>
              </div>
              <CardDescription>
                Fusion des inscrits newsletter + utilisateurs avec compte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {allSubscribers.map((sub, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${sub.source === 'newsletter' ? 'bg-blue-500' : 'bg-green-500'}`} />
                      <div>
                        <p className="font-medium">{sub.email}</p>
                        {sub.name && <p className="text-sm text-slate-600">{sub.name}</p>}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {sub.source === 'newsletter' ? 'Newsletter' : 'Compte'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </>
  );
}