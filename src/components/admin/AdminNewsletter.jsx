import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Users, Download, Plus, Send, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function AdminNewsletter() {
  const [showNewsletterForm, setShowNewsletterForm] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [newsletterData, setNewsletterData] = useState({ subject: '', content: '' });
  const [templateData, setTemplateData] = useState({ name: '', subject: '', content: '' });
  const queryClient = useQueryClient();

  const { data: subscribers = [], isLoading } = useQuery({
    queryKey: ['newsletterSubscribers'],
    queryFn: () => base44.entities.NewsletterSubscriber.list('-created_date'),
  });

  const { data: newsletters = [] } = useQuery({
    queryKey: ['newsletters'],
    queryFn: () => base44.entities.Newsletter.list('-created_date'),
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['newsletterTemplates'],
    queryFn: () => base44.entities.NewsletterTemplate.list('-created_date'),
  });

  const createNewsletterMutation = useMutation({
    mutationFn: (data) => base44.entities.Newsletter.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletters'] });
      setShowNewsletterForm(false);
      setNewsletterData({ subject: '', content: '' });
      toast.success('Newsletter créée');
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: (data) => base44.entities.NewsletterTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletterTemplates'] });
      setShowTemplateForm(false);
      setTemplateData({ name: '', subject: '', content: '' });
      toast.success('Modèle créé');
    },
  });

  const sendNewsletterMutation = useMutation({
    mutationFn: async (newsletter) => {
      const activeSubscribers = subscribers.filter(s => s.active);
      
      for (const sub of activeSubscribers) {
        await base44.integrations.Core.SendEmail({
          to: sub.email,
          subject: newsletter.subject,
          body: newsletter.content
        });
      }
      
      await base44.entities.Newsletter.update(newsletter.id, {
        status: 'sent',
        sent_to: activeSubscribers.length,
        sent_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletters'] });
      toast.success('Newsletter envoyée à tous les abonnés');
    },
  });

  const activeSubscribers = subscribers.filter(s => s.active);

  const exportCSV = () => {
    const csv = [
      ['Email', 'Nom', 'Date inscription', 'Actif'],
      ...subscribers.map(s => [
        s.email,
        s.name || '',
        new Date(s.created_date).toLocaleDateString('fr-FR'),
        s.active ? 'Oui' : 'Non'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
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
    <Tabs defaultValue="newsletters" className="space-y-6">
      <TabsList>
        <TabsTrigger value="newsletters">Newsletters</TabsTrigger>
        <TabsTrigger value="templates">Modèles</TabsTrigger>
        <TabsTrigger value="subscribers">Abonnés</TabsTrigger>
      </TabsList>

      <TabsContent value="newsletters" className="space-y-6">
        {/* Create Newsletter Form */}
        {showNewsletterForm && (
          <Card>
            <CardHeader>
              <CardTitle>Créer une newsletter</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); createNewsletterMutation.mutate(newsletterData); }} className="space-y-4">
                <Input
                  placeholder="Sujet"
                  value={newsletterData.subject}
                  onChange={(e) => setNewsletterData({...newsletterData, subject: e.target.value})}
                  required
                />
                <Textarea
                  placeholder="Contenu HTML"
                  value={newsletterData.content}
                  onChange={(e) => setNewsletterData({...newsletterData, content: e.target.value})}
                  className="min-h-64 font-mono text-sm"
                  required
                />
                <div className="flex gap-2">
                  <Button type="submit">Créer</Button>
                  <Button type="button" variant="outline" onClick={() => setShowNewsletterForm(false)}>Annuler</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Newsletters</CardTitle>
              <Button onClick={() => setShowNewsletterForm(!showNewsletterForm)}>
                <Plus className="w-4 h-4 mr-2" />
                Créer une newsletter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {newsletters.map((newsletter) => (
                <div key={newsletter.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{newsletter.subject}</h3>
                    <p className="text-sm text-slate-600">
                      {newsletter.status === 'sent' ? `Envoyée à ${newsletter.sent_to} abonnés` : 'Brouillon'}
                    </p>
                  </div>
                  {newsletter.status === 'draft' && (
                    <Button
                      onClick={() => {
                        if (confirm(`Envoyer à ${activeSubscribers.length} abonnés ?`)) {
                          sendNewsletterMutation.mutate(newsletter);
                        }
                      }}
                      disabled={sendNewsletterMutation.isPending}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Envoyer
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="templates" className="space-y-6">
        {/* Create Template Form */}
        {showTemplateForm && (
          <Card>
            <CardHeader>
              <CardTitle>Créer un modèle</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); createTemplateMutation.mutate(templateData); }} className="space-y-4">
                <Input
                  placeholder="Nom du modèle"
                  value={templateData.name}
                  onChange={(e) => setTemplateData({...templateData, name: e.target.value})}
                  required
                />
                <Input
                  placeholder="Sujet par défaut"
                  value={templateData.subject}
                  onChange={(e) => setTemplateData({...templateData, subject: e.target.value})}
                  required
                />
                <Textarea
                  placeholder="Contenu HTML du template"
                  value={templateData.content}
                  onChange={(e) => setTemplateData({...templateData, content: e.target.value})}
                  className="min-h-64 font-mono text-sm"
                  required
                />
                <div className="flex gap-2">
                  <Button type="submit">Créer</Button>
                  <Button type="button" variant="outline" onClick={() => setShowTemplateForm(false)}>Annuler</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Modèles de newsletter</CardTitle>
              <Button onClick={() => setShowTemplateForm(!showTemplateForm)}>
                <Plus className="w-4 h-4 mr-2" />
                Créer un modèle
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {templates.map((template) => (
                <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{template.name}</h3>
                    <p className="text-sm text-slate-600">{template.subject}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setNewsletterData({ subject: template.subject, content: template.content, template_id: template.id });
                      setShowNewsletterForm(true);
                    }}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Utiliser
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="subscribers" className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Total Inscrits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-purple-500" />
              <span className="text-3xl font-bold">{subscribers.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Mail className="w-8 h-8 text-green-500" />
              <span className="text-3xl font-bold">{activeSubscribers.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>Gérez vos abonnés newsletter</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={exportCSV} className="bg-purple-600 hover:bg-purple-700">
            <Download className="w-4 h-4 mr-2" />
            Exporter en CSV
          </Button>
        </CardContent>
      </Card>

      {/* Subscribers List */}
      <Card>
        <CardHeader>
          <CardTitle>Derniers abonnés</CardTitle>
          <CardDescription>Liste des abonnés récents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {subscribers.slice(0, 10).map((subscriber) => (
              <div
                key={subscriber.id}
                className="flex items-center justify-between p-3 border border-slate-200 rounded-lg"
              >
                <div>
                  <p className="font-medium text-slate-900">{subscriber.email}</p>
                  {subscriber.name && (
                    <p className="text-sm text-slate-600">{subscriber.name}</p>
                  )}
                  <p className="text-xs text-slate-500">
                    {new Date(subscriber.created_date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${subscriber.active ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </TabsContent>
    </Tabs>
  );
}