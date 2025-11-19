import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminOwnershipClaims() {
  const queryClient = useQueryClient();

  const { data: claims = [], isLoading } = useQuery({
    queryKey: ['ownershipClaims'],
    queryFn: () => base44.entities.AIOwnershipClaim.list('-created_date'),
  });

  const { data: services = [] } = useQuery({
    queryKey: ['allServices'],
    queryFn: () => base44.entities.AIService.list(),
  });

  const approveMutation = useMutation({
    mutationFn: async (claim) => {
      const service = services.find(s => s.id === claim.ai_service_id);
      
      // Mettre à jour le service avec le nouvel owner
      await base44.entities.AIService.update(claim.ai_service_id, {
        submitted_by: claim.user_email
      });

      // Marquer la revendication comme approuvée
      await base44.entities.AIOwnershipClaim.update(claim.id, {
        status: 'approved'
      });

      // Envoyer email de confirmation
      await base44.integrations.Core.SendEmail({
        to: claim.user_email,
        subject: `Revendication approuvée: ${service.name}`,
        body: `
          <h2>Votre revendication a été approuvée !</h2>
          <p>Bonjour ${claim.first_name},</p>
          <p>Nous avons approuvé votre revendication pour <strong>${service.name}</strong>.</p>
          <p>Vous êtes maintenant propriétaire de cette fiche et pouvez créer des bannières publicitaires.</p>
          <p>Connectez-vous à votre compte pour gérer votre service IA.</p>
        `
      });

      toast.success('Revendication approuvée !');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownershipClaims'] });
      queryClient.invalidateQueries({ queryKey: ['allServices'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ claimId, notes, userEmail, serviceName }) => {
      await base44.entities.AIOwnershipClaim.update(claimId, {
        status: 'rejected',
        admin_notes: notes
      });

      await base44.integrations.Core.SendEmail({
        to: userEmail,
        subject: `Revendication refusée: ${serviceName}`,
        body: `
          <h2>Votre revendication a été refusée</h2>
          <p>Nous avons examiné votre revendication pour <strong>${serviceName}</strong>.</p>
          <p>Malheureusement, nous ne pouvons pas l'approuver pour le moment.</p>
          ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
          <p>Si vous pensez qu'il s'agit d'une erreur, contactez-nous.</p>
        `
      });

      toast.success('Revendication refusée');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownershipClaims'] });
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  const pendingClaims = claims.filter(c => c.status === 'pending');
  const processedClaims = claims.filter(c => c.status !== 'pending');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Revendications de propriété</h2>
        <p className="text-slate-600">Gérer les demandes de revendication d'IA</p>
      </div>

      {/* Pending claims */}
      <div>
        <h3 className="text-xl font-bold mb-4">En attente ({pendingClaims.length})</h3>
        <div className="grid gap-4">
          {pendingClaims.map((claim) => {
            const service = services.find(s => s.id === claim.ai_service_id);
            return (
              <Card key={claim.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{service?.name || 'Service inconnu'}</span>
                    <Badge className="bg-orange-100 text-orange-800">En attente</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Demandeur:</strong> {claim.first_name} {claim.last_name}
                    </div>
                    <div>
                      <strong>Email:</strong> {claim.user_email}
                    </div>
                    <div>
                      <strong>Société:</strong> {claim.company}
                    </div>
                    <div>
                      <strong>Site web:</strong>{' '}
                      <a href={claim.ai_website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                        {claim.ai_website}
                      </a>
                    </div>
                  </div>

                  {claim.id_document_url && (
                    <div>
                      <a
                        href={claim.id_document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-purple-600 hover:underline"
                      >
                        <FileText className="w-4 h-4" />
                        Voir la pièce d'identité
                      </a>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => approveMutation.mutate(claim)}
                      disabled={approveMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approuver
                    </Button>
                    <Button
                      onClick={() => {
                        const notes = prompt('Notes (optionnel):');
                        if (notes !== null) {
                          rejectMutation.mutate({
                            claimId: claim.id,
                            notes,
                            userEmail: claim.user_email,
                            serviceName: service?.name || 'Service'
                          });
                        }
                      }}
                      variant="destructive"
                      disabled={rejectMutation.isPending}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Refuser
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {pendingClaims.length === 0 && (
            <p className="text-center text-slate-500 py-8">Aucune revendication en attente</p>
          )}
        </div>
      </div>

      {/* Processed claims */}
      <div>
        <h3 className="text-xl font-bold mb-4">Historique ({processedClaims.length})</h3>
        <div className="grid gap-4">
          {processedClaims.slice(0, 10).map((claim) => {
            const service = services.find(s => s.id === claim.ai_service_id);
            return (
              <Card key={claim.id} className="opacity-75">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{service?.name || 'Service inconnu'}</div>
                      <div className="text-sm text-slate-600">
                        {claim.first_name} {claim.last_name} • {claim.user_email}
                      </div>
                    </div>
                    <Badge className={claim.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {claim.status === 'approved' ? '✓ Approuvée' : '✗ Refusée'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}