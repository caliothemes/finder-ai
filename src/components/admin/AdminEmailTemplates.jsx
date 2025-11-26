import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Mail, Edit, Save, X, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminEmailTemplates() {
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({ subject: '', content: '' });
  const [showPreview, setShowPreview] = useState(false);
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['emailTemplates'],
    queryFn: () => base44.entities.EmailTemplate.list(),
  });

  const createOrUpdateMutation = useMutation({
    mutationFn: async (data) => {
      if (editingTemplate) {
        await base44.entities.EmailTemplate.update(editingTemplate.id, data);
      } else {
        await base44.entities.EmailTemplate.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
      setEditingTemplate(null);
      setFormData({ subject: '', content: '' });
      toast.success('Template enregistré');
    },
  });

  const templateTypes = [
    { key: 'welcome', label: 'Bienvenue', vars: ['{{user_name}}', '{{user_email}}'] },
    { key: 'registration', label: 'Inscription', vars: ['{{user_name}}', '{{login_url}}'] },
    { key: 'password_reset', label: 'Mot de passe oublié', vars: ['{{user_name}}', '{{reset_link}}'] },
    { key: 'purchase_thank_you', label: 'Merci achat', vars: ['{{user_name}}', '{{credits}}', '{{amount}}'] },
    { key: 'ai_approved', label: 'IA validée', vars: ['{{user_name}}', '{{service_name}}', '{{service_url}}'] },
    { key: 'ai_rejected', label: 'IA refusée', vars: ['{{user_name}}', '{{service_name}}', '{{reason}}'] },
    { key: 'banner_reserved', label: 'Bannière réservée', vars: ['{{user_name}}', '{{date}}', '{{position}}'] },
    { key: 'banner_expiring', label: 'Bannière expire', vars: ['{{user_name}}', '{{expiry_date}}', '{{banner_title}}'] },
    { key: 'ai_revision_requested', label: '🔄 Révision demandée (Admin)', vars: ['{{service_name}}', '{{user_email}}', '{{submitted_at}}'] },
    { key: 'ai_revision_approved', label: '✅ Révision approuvée (Client)', vars: ['{{user_name}}', '{{service_name}}', '{{service_url}}'] },
    { key: 'ai_revision_rejected', label: '❌ Révision refusée (Client)', vars: ['{{user_name}}', '{{service_name}}'] }
  ];

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({ subject: template.subject, content: template.content });
  };

  const handleCreateNew = (templateKey) => {
    const type = templateTypes.find(t => t.key === templateKey);
    setEditingTemplate({ template_key: templateKey, isNew: true });
    setFormData({
      subject: `Nouveau: ${type.label}`,
      content: `<p>Bonjour {{user_name}},</p><p>Contenu de votre email...</p>`
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Templates d'emails
          </CardTitle>
          <CardDescription>
            Gérez les emails automatiques envoyés aux utilisateurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {editingTemplate ? (
            <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">
                  {editingTemplate.isNew ? 'Créer' : 'Modifier'} - {templateTypes.find(t => t.key === editingTemplate.template_key)?.label}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditingTemplate(null);
                    setFormData({ subject: '', content: '' });
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Variables disponibles:</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {templateTypes.find(t => t.key === editingTemplate.template_key)?.vars.map(v => (
                    <Badge key={v} variant="outline" className="text-xs">{v}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Sujet</label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Sujet de l'email"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Contenu HTML</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                    {showPreview ? 'Code' : 'Aperçu'}
                  </Button>
                </div>
                
                {showPreview ? (
                  <div className="border rounded-lg bg-white overflow-hidden">
                    <div className="bg-slate-100 px-4 py-2 border-b text-sm text-slate-600">
                      Aperçu de l'email
                    </div>
                    <iframe
                      srcDoc={formData.content}
                      className="w-full min-h-[500px] border-0"
                      title="Email Preview"
                    />
                  </div>
                ) : (
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Contenu HTML de l'email"
                    className="min-h-64 font-mono text-xs"
                  />
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => createOrUpdateMutation.mutate({
                    template_key: editingTemplate.template_key,
                    subject: formData.subject,
                    content: formData.content,
                    variables: templateTypes.find(t => t.key === editingTemplate.template_key)?.vars || []
                  })}
                  disabled={createOrUpdateMutation.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {templateTypes.map((type) => {
                const existing = templates.find(t => t.template_key === type.key);
                return (
                  <div
                    key={type.key}
                    className="p-4 border rounded-lg hover:border-purple-300 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{type.label}</h3>
                        <p className="text-xs text-slate-500 mt-1">
                          {existing ? `Sujet: ${existing.subject}` : 'Non configuré'}
                        </p>
                      </div>
                      {existing ? (
                        <Badge className="bg-green-100 text-green-800">Actif</Badge>
                      ) : (
                        <Badge variant="outline">À créer</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {type.vars.map(v => (
                        <span key={v} className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {v}
                        </span>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      variant={existing ? "outline" : "default"}
                      onClick={() => existing ? handleEdit(existing) : handleCreateNew(type.key)}
                      className="w-full"
                    >
                      <Edit className="w-3 h-3 mr-2" />
                      {existing ? 'Modifier' : 'Créer'}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}