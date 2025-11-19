import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Users, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminNewsletter() {
  const { data: subscribers = [], isLoading } = useQuery({
    queryKey: ['newsletterSubscribers'],
    queryFn: () => base44.entities.NewsletterSubscriber.list('-created_date'),
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
    <div className="space-y-6">
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
    </div>
  );
}