import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Vérifier que c'est un admin
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Accès admin requis' }, { status: 403 });
    }

    console.log('🔄 Début export backup...');

    // Récupérer toutes les données de toutes les entités
    const backup = {
      exportDate: new Date().toISOString(),
      exportedBy: user.email,
      data: {}
    };

    const entities = [
      'User',
      'AIService',
      'Category',
      'BannerReservation',
      'Banner',
      'ProAccount',
      'Story',
      'Review',
      'FinderAIReview',
      'FinderAIReviewRequest',
      'Favorite',
      'AINews',
      'AINewsDiscovery',
      'AIServiceDiscovery',
      'Newsletter',
      'NewsletterSubscriber',
      'NewsletterTemplate',
      'EmailTemplate',
      'LegalSection',
      'AIToolGeneration',
      'PageView',
      'AIOwnershipClaim',
      'AutopilotConfig',
      'NewsReview',
      'GPTChat',
      'ServiceClick',
      'AIVideoNews',
      'AIVideoDiscovery',
      'YouTubeChannel'
    ];

    for (const entityName of entities) {
      try {
        const data = await base44.asServiceRole.entities[entityName].list(undefined, 10000);
        backup.data[entityName] = data;
        console.log(`✅ ${entityName}: ${data.length} entrées`);
      } catch (error) {
        console.log(`⚠️ ${entityName}: ${error.message}`);
        backup.data[entityName] = [];
      }
    }

    const totalEntries = Object.values(backup.data).reduce((sum, arr) => sum + arr.length, 0);
    backup.totalEntries = totalEntries;

    console.log(`🎉 Export terminé: ${totalEntries} entrées au total`);

    return Response.json(backup);
  } catch (error) {
    console.error('❌ Erreur export:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});