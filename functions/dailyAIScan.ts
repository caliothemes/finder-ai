import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    console.log('🔍 Starting AI scan...');

    // Récupérer les services existants pour éviter les doublons
    const existingServices = await base44.asServiceRole.entities.AIService.list();
    const existingUrls = existingServices.map(s => 
      s.website_url?.toLowerCase().replace(/\/$/, '')
    ).filter(Boolean);

    const existingDiscoveries = await base44.asServiceRole.entities.AIServiceDiscovery.list();
    const existingDiscoveryUrls = existingDiscoveries.map(d => 
      d.website_url?.toLowerCase().replace(/\/$/, '')
    ).filter(Boolean);

    const allExistingUrls = [...new Set([...existingUrls, ...existingDiscoveryUrls])];

    // Sources de recherche variées et spécifiques
    const searchQueries = [
      "top 30 AI tools 2025 complete list with official websites URLs",
      "new AI startups launched 2024 2025 product hunt",
      "best free AI tools online websites list",
      "AI image generators DALL-E Stable Diffusion Leonardo Ideogram websites",
      "AI video generators Runway Pika Luma Kling HeyGen websites",
      "AI writing assistants Jasper Copy.ai Writesonic Rytr websites",
      "AI coding tools GitHub Copilot Cursor Codeium Tabnine websites",
      "AI chatbots Claude ChatGPT Gemini Perplexity Pi websites",
      "AI voice cloning ElevenLabs Resemble Murf Play.ht websites",
      "AI music generators Suno Udio Soundraw AIVA websites",
      "AI presentation tools Gamma Beautiful.ai Tome Decktopus websites",
      "AI avatar generators D-ID Synthesia HeyGen Colossyan websites",
      "AI logo design Looka Brandmark Designs.ai Hatchful websites",
      "AI photo editing tools Remove.bg Photoroom Remini Lensa websites",
      "AI transcription Otter.ai Whisper Descript Rev websites",
      "AI meeting assistants Fireflies Krisp Fathom tl;dv websites",
      "AI research tools Elicit Consensus Scite Semantic Scholar websites",
      "AI email assistants Lavender Smartwriter Mailmeteor websites",
      "AI social media tools Ocoya Predis Publer Lately websites",
      "AI SEO tools Surfer SEO Clearscope Frase MarketMuse websites"
    ];

    const allDiscoveries = [];
    const categories = await base44.asServiceRole.entities.Category.list();

    // Scanner chaque source
    for (const query of searchQueries) {
      console.log(`🔎 Searching: ${query}`);

      try {
        const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Tu es un expert en recherche d'outils IA. Cherche sur le web des outils IA sur: "${query}"

TÂCHE: Trouve 15-20 outils IA RÉELS avec ces informations:

Pour CHAQUE outil:
- name: Nom exact (ex: "ChatGPT", "Midjourney")
- website_url: URL complète (ex: "https://openai.com/chatgpt")
- description: Ce que fait l'outil en détail (100-150 mots, en français)
- tagline: Phrase d'accroche courte (français, max 60 caractères)
- features: Liste de 4-5 fonctionnalités clés (en français)
- pricing: "gratuit", "freemium", "payant" ou "abonnement"

EXEMPLES CONCRETS À INCLURE:
- ChatGPT (https://chat.openai.com)
- Midjourney (https://midjourney.com)
- Claude (https://claude.ai)
- Jasper (https://jasper.ai)
- Copy.ai (https://copy.ai)
- Runway (https://runwayml.com)
- ElevenLabs (https://elevenlabs.io)
- Synthesia (https://synthesia.io)
- Notion AI (https://notion.so)

RÈGLES STRICTES:
1. Cherche de VRAIS outils qui existent maintenant
2. Vérifie que les URLs sont correctes
3. Mélange outils connus ET nouveaux
4. Varie les catégories (image, texte, vidéo, code, etc.)
5. Descriptions en français, complètes et détaillées
6. Retourne minimum 15 outils différents

Ne JAMAIS inventer. Utilise la recherche web pour trouver des outils réels.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              services: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    website_url: { type: "string" },
                    description: { type: "string" },
                    tagline: { type: "string" },
                    features: { 
                      type: "array",
                      items: { type: "string" }
                    },
                    pricing: { 
                      type: "string",
                      enum: ["gratuit", "freemium", "payant", "abonnement"]
                    }
                  },
                  required: ["name", "website_url"]
                }
              }
            }
          }
        });

        if (response && response.services) {
          console.log(`✅ Found ${response.services.length} services for: ${query}`);
          
          // Filtrer et ajouter les découvertes
          for (const service of response.services) {
            if (!service.website_url || !service.name) continue;

            const normalizedUrl = service.website_url.toLowerCase().replace(/\/$/, '');
            
            // Vérifier si existe déjà
            if (allExistingUrls.includes(normalizedUrl)) {
              continue;
            }

            // Catégoriser automatiquement
            const suggestedCategories = [];
            const desc = (service.description || '').toLowerCase();
            const name = service.name.toLowerCase();
            
            if (desc.includes('image') || desc.includes('photo') || desc.includes('design') || desc.includes('visual')) {
              const imageCat = categories.find(c => c.slug === 'image-generation');
              if (imageCat) suggestedCategories.push(imageCat.id);
            }
            if (desc.includes('video') || desc.includes('film')) {
              const videoCat = categories.find(c => c.slug === 'video');
              if (videoCat) suggestedCategories.push(videoCat.id);
            }
            if (desc.includes('chat') || desc.includes('conversation') || desc.includes('assistant')) {
              const chatCat = categories.find(c => c.slug === 'chatbots');
              if (chatCat) suggestedCategories.push(chatCat.id);
            }
            if (desc.includes('write') || desc.includes('writing') || desc.includes('content') || desc.includes('text')) {
              const writeCat = categories.find(c => c.slug === 'writing');
              if (writeCat) suggestedCategories.push(writeCat.id);
            }
            if (desc.includes('code') || desc.includes('programming') || desc.includes('developer')) {
              const codeCat = categories.find(c => c.slug === 'code-assistant');
              if (codeCat) suggestedCategories.push(codeCat.id);
            }

            // Extraire le domaine pour récupérer le favicon
            let logoUrl = '';
            try {
              const url = new URL(service.website_url);
              logoUrl = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=128`;
            } catch (error) {
              console.log(`Invalid URL for ${service.name}`);
            }

            allDiscoveries.push({
              name: service.name,
              website_url: service.website_url,
              description: service.description || '',
              tagline: service.tagline || '',
              features: service.features || [],
              suggested_pricing: service.pricing || 'freemium',
              suggested_categories: suggestedCategories,
              cover_image_url: '',
              logo_url: logoUrl,
              status: 'new',
              source: `Auto scan: ${query}`
            });

            // Ajouter à la liste des URLs existantes pour éviter doublons dans ce scan
            allExistingUrls.push(normalizedUrl);
          }
        }
      } catch (error) {
        console.error(`Error scanning ${query}:`, error.message);
      }

      // Petite pause entre les requêtes
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Créer les découvertes en batch et générer les images en parallèle
    if (allDiscoveries.length > 0) {
      console.log(`📝 Creating ${allDiscoveries.length} new discoveries...`);
      
      // Créer par batch de 20 pour éviter timeout
      for (let i = 0; i < allDiscoveries.length; i += 20) {
        const batch = allDiscoveries.slice(i, i + 20);
        
        // Créer les discoveries
        const createdDiscoveries = await base44.asServiceRole.entities.AIServiceDiscovery.bulkCreate(batch);
        
        // Récupérer screenshots ou générer images en parallèle pour ce batch
        const imagePromises = createdDiscoveries.map(async (discovery) => {
          try {
            // Essayer de prendre un screenshot du site web
            const screenshotUrl = `https://api.screenshotone.com/take?access_key=nLFJt8mJUUt2uw&url=${encodeURIComponent(discovery.website_url)}&format=jpg&image_quality=80&viewport_width=1200&viewport_height=630&full_page=false&device_scale_factor=1&cache=true`;
            
            const screenshotResponse = await fetch(screenshotUrl);
            
            if (screenshotResponse.ok) {
              const imageBlob = await screenshotResponse.blob();
              const file = new File([imageBlob], `${discovery.name.replace(/[^a-z0-9]/gi, '-')}-cover.jpg`, { type: 'image/jpeg' });
              
              // Upload l'image
              const { file_url } = await base44.asServiceRole.integrations.Core.UploadFile({ file });
              
              await base44.asServiceRole.entities.AIServiceDiscovery.update(discovery.id, {
                cover_image_url: file_url
              });
              
              console.log(`✅ Screenshot captured for ${discovery.name}`);
            } else {
              throw new Error('Screenshot failed, using AI generation');
            }
          } catch (error) {
            // Fallback: générer une image IA
            try {
              const imagePrompt = `Modern professional banner image for ${discovery.name} - ${discovery.tagline}. Technology, AI theme, vibrant purple and pink gradient, minimalist design, futuristic. No text overlay.`;
              const imageResult = await base44.asServiceRole.integrations.Core.GenerateImage({
                prompt: imagePrompt
              });
              
              await base44.asServiceRole.entities.AIServiceDiscovery.update(discovery.id, {
                cover_image_url: imageResult.url
              });
              
              console.log(`✅ AI image generated for ${discovery.name}`);
            } catch (genError) {
              console.log(`❌ Could not get image for ${discovery.name}:`, genError.message);
            }
          }
        });
        
        // Attendre que toutes les images du batch soient générées
        await Promise.all(imagePromises);
      }
    }

    console.log('✅ Scan complete!');
    
    return Response.json({
      success: true,
      discovered: allDiscoveries.length,
      total_discoveries: existingDiscoveries.length + allDiscoveries.length,
      message: `Scan completed: ${allDiscoveries.length} new AI services discovered`
    });

  } catch (error) {
    console.error('Scan error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});