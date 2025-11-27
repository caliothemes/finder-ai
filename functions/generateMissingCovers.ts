import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Vérifier l'authentification admin
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🖼️ Starting cover image generation for services without covers...');

    // Récupérer tous les services approuvés sans image de couverture
    const allServices = await base44.asServiceRole.entities.AIService.filter({ status: 'approved' });
    
    const servicesWithoutCover = allServices.filter(s => !s.cover_image_url || s.cover_image_url.trim() === '');
    
    console.log(`Found ${servicesWithoutCover.length} services without cover images`);

    let generated = 0;
    let failed = 0;

    for (const service of servicesWithoutCover) {
      try {
        console.log(`🎨 Generating cover for: ${service.name}`);
        
        // Créer un prompt basé sur le service
        const serviceInfo = `${service.name} - ${service.tagline || ''} ${service.description?.substring(0, 150) || ''}`;
        
        const imagePrompt = `Professional modern banner for AI tool "${service.name}". ${service.tagline || 'Innovative AI technology'}. Abstract futuristic design with gradient colors (purple, pink, blue, cyan), neural network patterns, geometric shapes, technology aesthetic, clean minimal style, high quality digital art. No text, no logos, no words.`;
        
        const imageResult = await base44.asServiceRole.integrations.Core.GenerateImage({
          prompt: imagePrompt
        });
        
        if (imageResult && imageResult.url) {
          await base44.asServiceRole.entities.AIService.update(service.id, {
            cover_image_url: imageResult.url
          });
          generated++;
          console.log(`✅ Cover generated for: ${service.name}`);
        } else {
          failed++;
          console.log(`❌ No image returned for: ${service.name}`);
        }
      } catch (error) {
        failed++;
        console.error(`❌ Error generating cover for ${service.name}: ${error.message}`);
      }
      
      // Pause entre les générations pour éviter le rate limiting
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    console.log(`✅ Cover generation complete! Generated: ${generated}, Failed: ${failed}`);

    return Response.json({
      success: true,
      total_without_cover: servicesWithoutCover.length,
      generated,
      failed,
      message: `Generated ${generated} cover images for AI services`
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});