import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Récupérer toutes les données
    const [aiServices, categories] = await Promise.all([
      base44.asServiceRole.entities.AIService.filter({ status: 'approved' }),
      base44.asServiceRole.entities.Category.list()
    ]);

    // URL de base (à adapter selon votre domaine)
    const baseUrl = req.headers.get('origin') || 'https://votre-domaine.com';
    
    // Générer le sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Pages statiques -->
  <url>
    <loc>${baseUrl}/?page=Home</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/?page=Explore</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/?page=Categories</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/?page=SubmitAI</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <!-- Catégories -->
${categories.map(cat => `  <url>
    <loc>${baseUrl}/?page=Category&amp;slug=${encodeURIComponent(cat.slug)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
  
  <!-- Services IA -->
${aiServices.map(service => `  <url>
    <loc>${baseUrl}/?page=AIDetail&amp;slug=${encodeURIComponent(service.slug)}</loc>
    <lastmod>${new Date(service.updated_date || service.created_date).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
</urlset>`;

    return new Response(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});