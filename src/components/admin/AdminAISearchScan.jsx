import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, Check, X, Eye, ExternalLink, 
  Loader2, Pencil, Save, AlertCircle, Sparkles 
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminAISearchScan() {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [isScanning, setIsScanning] = useState(false);
  const queryClient = useQueryClient();

  const { data: discoveries = [], isLoading } = useQuery({
    queryKey: ['discoveries'],
    queryFn: () => base44.entities.AIServiceDiscovery.list('-created_date', 100),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.list(),
  });

  const updateDiscoveryMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AIServiceDiscovery.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discoveries'] });
      setEditingId(null);
      toast.success('Découverte mise à jour');
    },
  });

  const approveDiscoveryMutation = useMutation({
    mutationFn: async (discovery) => {
      const slug = discovery.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const aiServiceData = {
        name: discovery.name,
        slug: slug,
        tagline: discovery.tagline || '',
        description: discovery.description || '',
        categories: discovery.suggested_categories || [],
        logo_url: discovery.logo_url || '',
        cover_image_url: discovery.cover_image_url || '',
        website_url: discovery.website_url,
        pricing: discovery.suggested_pricing || 'freemium',
        features: discovery.features || [],
        tags: discovery.tags || [],
        status: 'approved',
        submitted_by: 'ai_scanner'
      };

      const newService = await base44.entities.AIService.create(aiServiceData);
      
      await base44.entities.AIServiceDiscovery.update(discovery.id, {
        status: 'approved',
        ai_service_id: newService.id
      });

      return newService;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discoveries'] });
      toast.success('Service IA créé et approuvé !');
    },
  });

  const triggerScanMutation = useMutation({
    mutationFn: async () => {
      setIsScanning(true);
      
      // Scan ultra-massif en plusieurs vagues pour découvrir des milliers de services IA
      const scanPrompts = [
        // Vague 1-5: Outils créatifs
        `Recherche et liste 100 services IA dans les domaines suivants: génération d'images (DALL-E, Midjourney, Stable Diffusion, Leonardo.ai, Playground AI, etc.), génération de vidéos (Runway, Synthesia, Pictory, Descript, etc.), génération audio et musique (Mubert, AIVA, Soundraw, etc.), génération de voix (ElevenLabs, Play.ht, Resemble.ai, etc.), avatar IA (Synthesia, D-ID, HeyGen, etc.), art génératif, upscaling d'images, background removal, image editing IA.`,
        `Recherche et liste 100 services IA pour le design: logo generation (Looka, Brandmark, Designs.ai, etc.), UI/UX design (Uizard, Galileo AI, Framer AI, etc.), graphic design (Canva AI, Designify, etc.), 3D modeling IA, interior design IA, fashion design IA, architecture IA, color palette generators, mockup tools IA.`,
        `Recherche et liste 100 services IA vidéo avancés: video editing (Descript, Kapwing, InVideo, etc.), video translation, lip sync IA, video summarization, video transcription, video captions, video generation from text, animated video makers, video enhancement IA, deepfake tools.`,
        `Recherche et liste 100 services IA photo: photo editing, portrait enhancement, age transformation, style transfer, colorization, background change, photo restoration, photo generation, headshot generator, professional photography IA.`,
        `Recherche et liste 100 services IA 3D: 3D model generation, texture generation, 3D animation, CAD IA, game asset generation, virtual try-on, AR/VR content creation, metaverse tools, 3D scanning IA.`,
        
        // Vague 6-10: Communication et contenu
        `Recherche et liste 100 services IA de chatbot et assistants: ChatGPT, Claude, Gemini, Perplexity, You.com, Poe, Character.AI, Replika, customer support bots, sales bots, booking assistants, healthcare chatbots, mental health bots, tutoring bots, companion bots.`,
        `Recherche et liste 100 services IA d'écriture: Jasper, Copy.ai, Writesonic, Rytr, QuillBot, Grammarly, ProWritingAid, article writers, blog generators, social media captions, ad copy, email writers, story generators, novel writing tools, script writers, poetry generators.`,
        `Recherche et liste 100 services IA de traduction: DeepL, Google Translate alternatives, multilingual tools, localization platforms, subtitle translation, document translation, website translation, real-time translation, voice translation, sign language translation.`,
        `Recherche et liste 100 services IA de voix: text-to-speech, voice cloning, voice changing, dubbing, podcast hosting with IA, voice over tools, speech synthesis, voice modulation, audiobook creation, voice memos IA.`,
        `Recherche et liste 100 services IA de transcription: Otter.ai, Rev, Trint, Sonix, Descript, meeting transcription, interview transcription, podcast transcription, legal transcription, medical transcription, multi-language transcription.`,
        
        // Vague 11-15: Code et développement
        `Recherche et liste 100 services IA pour le code: GitHub Copilot, Tabnine, Codeium, Replit Ghostwriter, Amazon CodeWhisperer, code completion, code generation, bug detection, code review, refactoring tools, test generation, documentation generators.`,
        `Recherche et liste 100 services IA DevOps: infrastructure as code IA, deployment automation, monitoring IA, log analysis, security scanning, cloud optimization, container management IA, CI/CD optimization, incident response IA.`,
        `Recherche et liste 100 services IA no-code/low-code: website builders (Wix AI, Webflow AI, etc.), app builders, workflow automation, database builders, API generators, chatbot builders, form builders, landing page builders.`,
        `Recherche et liste 100 services IA pour développeurs: API documentation, code search, dependency management, version control IA, project management for devs, code snippet managers, regex generators, SQL query builders.`,
        `Recherche et liste 100 services IA mobile: mobile app development, mobile testing, mobile analytics, mobile push notification optimization, mobile UX testing, mobile performance monitoring.`,
        
        // Vague 16-20: Business et productivité
        `Recherche et liste 100 services IA business: CRM (Salesforce Einstein, HubSpot AI, etc.), ERP IA, business intelligence, forecasting, financial planning, invoice processing, expense management, contract analysis.`,
        `Recherche et liste 100 services IA productivité: Notion AI, ClickUp AI, Monday.com AI, task management, note-taking (Mem, Reflect, etc.), calendar optimization, meeting schedulers, email management (Superhuman, SaneBox, etc.), smart to-do lists.`,
        `Recherche et liste 100 services IA meeting: meeting recording, meeting summarization (Otter, Fireflies, etc.), meeting transcription, action item extraction, meeting analytics, virtual meeting assistants, presentation creators.`,
        `Recherche et liste 100 services IA email: email writing, email automation, email sequences, cold outreach, newsletter tools, email deliverability, spam filtering, email classification, smart inbox management.`,
        `Recherche et liste 100 services IA collaboration: team communication, document collaboration, knowledge management, wiki builders, internal search, team analytics, remote work tools, virtual whiteboard IA.`,
        
        // Vague 21-25: Marketing et vente
        `Recherche et liste 100 services IA marketing: SEO tools (Surfer SEO, Clearscope, etc.), content marketing, social media management (Hootsuite AI, Buffer AI, etc.), social media content creation, hashtag generators, ad creation, ad optimization.`,
        `Recherche et liste 100 services IA SEO: keyword research, content optimization, backlink analysis, competitor analysis, rank tracking, technical SEO, local SEO, SEO audit tools, SERP analysis.`,
        `Recherche et liste 100 services IA social media: post schedulers, caption writers, image creators for social, video creators for social, analytics, influencer discovery, engagement optimization, hashtag analysis, competitor monitoring.`,
        `Recherche et liste 100 services IA publicité: ad copy generation, ad creative generation, ad targeting optimization, campaign management, A/B testing, landing page optimization, conversion rate optimization, retargeting optimization.`,
        `Recherche et liste 100 services IA sales: lead generation, lead scoring, sales forecasting, sales email automation, outreach automation, proposal generation, pipeline management, sales call analysis, CRM enrichment.`,
        
        // Vague 26-30: Data et analytics
        `Recherche et liste 100 services IA data analysis: data visualization, BI tools, predictive analytics, anomaly detection, data cleaning, data preparation, automated insights, dashboard creation, report generation.`,
        `Recherche et liste 100 services IA analytics: web analytics, mobile analytics, product analytics, user behavior analysis, heatmaps, session recording, funnel analysis, cohort analysis, attribution modeling.`,
        `Recherche et liste 100 services IA research: academic research assistants, literature review, research paper summarization, citation management, research data analysis, survey analysis, experiment design, statistical analysis.`,
        `Recherche et liste 100 services IA finance: algorithmic trading, portfolio management, risk assessment, fraud detection, credit scoring, financial forecasting, expense tracking, investment research, tax optimization.`,
        `Recherche et liste 100 services IA crypto: trading bots, market analysis, portfolio tracking, blockchain analysis, NFT tools, DeFi analytics, price prediction, sentiment analysis for crypto.`,
        
        // Vague 31-35: RH et formation
        `Recherche et liste 100 services IA RH: recruitment platforms (Lever, Greenhouse with AI, etc.), applicant tracking, resume parsing, candidate sourcing, interview scheduling, candidate screening, video interviewing, skill assessment, background checks IA.`,
        `Recherche et liste 100 services IA formation: e-learning platforms, course creation, personalized learning, adaptive learning, language learning (Duolingo, Babbel, etc.), skill development, certification platforms, tutoring platforms, training management.`,
        `Recherche et liste 100 services IA onboarding: employee onboarding, training automation, knowledge base creation, process documentation, compliance training, new hire portals, mentorship matching.`,
        `Recherche et liste 100 services IA performance: performance reviews, goal tracking, feedback collection, 360 reviews, employee engagement, pulse surveys, recognition platforms, talent development.`,
        `Recherche et liste 100 services IA paie: payroll automation, time tracking, attendance management, leave management, benefits administration, expense reimbursement, compliance management.`,
        
        // Vague 36-40: Santé et bien-être
        `Recherche et liste 100 services IA santé: diagnostic assistance, medical imaging analysis, drug discovery, clinical trial matching, patient monitoring, telemedicine platforms, health records management, symptom checkers.`,
        `Recherche et liste 100 services IA fitness: workout planning, nutrition tracking, meal planning, calorie counting, exercise form analysis, fitness coaching, yoga assistants, running coaches, strength training planners.`,
        `Recherche et liste 100 services IA mental health: therapy chatbots, meditation apps, mood tracking, stress management, sleep tracking, anxiety relief, depression support, mindfulness apps, counseling platforms.`,
        `Recherche et liste 100 services IA nutrition: meal planners, recipe generators, diet trackers, food recognition, nutrition analysis, grocery list generators, restaurant nutrition finders, supplement advisors.`,
        `Recherche et liste 100 services IA bien-être: habit tracking, wellness coaching, sleep optimization, hydration tracking, posture correction, ergonomics advisors, break reminders, screen time management.`,
        
        // Vague 41-50: Autres domaines
        `Recherche et liste 100 services IA juridique: contract review, legal research, document drafting, case law analysis, compliance checking, IP management, litigation support, legal chatbots, trademark search.`,
        `Recherche et liste 100 services IA immobilier: property valuation, market analysis, lead generation, virtual tours, property search, investment analysis, rental management, mortgage comparison, home staging IA.`,
        `Recherche et liste 100 services IA e-commerce: product recommendations, dynamic pricing, inventory management, customer segmentation, churn prediction, review analysis, virtual try-on, size recommendation, visual search.`,
        `Recherche et liste 100 services IA gaming: game development, NPC behavior, procedural generation, game testing, player matching, anti-cheat, game analytics, esports analytics, game streaming optimization.`,
        `Recherche et liste 100 services IA sécurité: cybersecurity, threat detection, vulnerability scanning, penetration testing, fraud detection, identity verification, access management, security monitoring, incident response.`,
        `Recherche et liste 100 services IA automobile: autonomous driving, driver assistance, predictive maintenance, route optimization, fleet management, parking assistance, vehicle diagnostics, insurance telematics.`,
        `Recherche et liste 100 services IA agriculture: crop monitoring, yield prediction, pest detection, irrigation optimization, livestock monitoring, soil analysis, weather forecasting for farming, precision agriculture.`,
        `Recherche et liste 100 services IA fashion: style recommendation, virtual try-on, trend forecasting, outfit generation, personal styling, size recommendation, fashion design, textile pattern generation.`,
        `Recherche et liste 100 services IA tourisme: travel planning, itinerary generation, hotel recommendation, flight prediction, tour guides, translation for travelers, attraction recommendation, local experience finders.`,
        `Recherche et liste 100 services IA autres: astrology IA, pet care, dating apps with AI, genealogy research, home automation, smart home, IoT optimization, environmental monitoring, sustainability tools, climate prediction.`
      ];

      const allServices = [];
      
      for (let i = 0; i < scanPrompts.length; i++) {
        try {
          const result = await base44.integrations.Core.InvokeLLM({
            prompt: `${scanPrompts[i]}

Pour chaque service IA trouvé, fournis EXACTEMENT les informations suivantes dans un format JSON:
- name: Le nom exact du service
- website_url: L'URL complète et valide du site officiel
- description: Description détaillée (minimum 80 mots) expliquant ce que fait le service, ses cas d'usage, et ses avantages
- tagline: Une phrase d'accroche marketing courte (max 10 mots)
- suggested_pricing: Le modèle exact (gratuit, freemium, payant, ou abonnement)
- features: Liste de 5-7 fonctionnalités clés et spécifiques
- tags: Liste de 8-12 mots-clés pertinents pour la recherche
- suggested_categories: Les catégories qui correspondent parmi la liste disponible

IMPORTANT: 
- Ne liste QUE des services qui EXISTENT réellement avec des URLs valides
- Priorise les services populaires, actifs et bien notés
- Inclus un mix de services gratuits et payants
- Assure-toi que les descriptions sont détaillées et informatives`,
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
                      suggested_pricing: { type: "string" },
                      features: { type: "array", items: { type: "string" } },
                      tags: { type: "array", items: { type: "string" } },
                      suggested_categories: { type: "array", items: { type: "string" } }
                    }
                  }
                }
              }
            }
          });

          if (result.services && Array.isArray(result.services)) {
            allServices.push(...result.services);
            toast.info(`Vague ${i + 1}/${scanPrompts.length}: ${result.services.length} services trouvés`);
          }
        } catch (error) {
          console.error(`Erreur vague ${i + 1}:`, error);
          toast.error(`Erreur lors de la vague ${i + 1}`);
        }
      }

      // Créer les découvertes avec déduplication
      const created = [];
      const existingDiscoveries = await base44.entities.AIServiceDiscovery.list();
      const existingNames = new Set(existingDiscoveries.map(d => d.name.toLowerCase()));
      
      for (const service of allServices) {
        try {
          // Éviter les doublons
          if (!existingNames.has(service.name.toLowerCase())) {
            const discovery = await base44.entities.AIServiceDiscovery.create({
              ...service,
              status: 'new',
              source: 'auto_scan_massive'
            });
            created.push(discovery);
            existingNames.add(service.name.toLowerCase());
          }
        } catch (error) {
          console.error('Erreur création discovery:', error);
        }
      }

      return created;
    },
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['discoveries'] });
      setIsScanning(false);
      toast.success(`Scan terminé ! ${created.length} nouveau(x) service(s) découvert(s).`);
    },
    onError: (error) => {
      setIsScanning(false);
      toast.error('Erreur lors du scan: ' + error.message);
    }
  });

  const handleStatusChange = (id, status) => {
    updateDiscoveryMutation.mutate({ 
      id, 
      data: { status } 
    });
  };

  const handleEdit = (discovery) => {
    setEditingId(discovery.id);
    setEditData(discovery);
  };

  const handleSave = () => {
    updateDiscoveryMutation.mutate({
      id: editingId,
      data: editData
    });
  };

  const handleApprove = (discovery) => {
    if (!discovery.name || !discovery.website_url) {
      toast.error('Nom et URL sont requis');
      return;
    }
    approveDiscoveryMutation.mutate(discovery);
  };

  const newCount = discoveries.filter(d => d.status === 'new').length;
  const reviewedCount = discoveries.filter(d => d.status === 'reviewed').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">AI Search Scan</h2>
          <p className="text-slate-600">Découvertes automatiques de services IA</p>
        </div>
        <Button
          onClick={() => triggerScanMutation.mutate()}
          disabled={isScanning}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
        >
          {isScanning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Scan en cours...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Lancer un scan
            </>
          )}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">{newCount}</div>
            <div className="text-sm text-slate-600">Nouveaux</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{reviewedCount}</div>
            <div className="text-sm text-slate-600">En révision</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {discoveries.filter(d => d.status === 'approved').length}
            </div>
            <div className="text-sm text-slate-600">Approuvés</div>
          </CardContent>
        </Card>
      </div>

      {/* Discoveries List */}
      <div className="space-y-4">
        {discoveries.map((discovery) => (
          <Card key={discovery.id} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {discovery.logo_url && (
                      <img
                        src={discovery.logo_url}
                        alt={discovery.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    )}
                    {editingId === discovery.id ? (
                      <Input
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="max-w-md"
                      />
                    ) : (
                      <CardTitle className="text-xl">{discovery.name}</CardTitle>
                    )}
                    <Badge
                      variant={
                        discovery.status === 'new' ? 'default' :
                        discovery.status === 'approved' ? 'success' :
                        'secondary'
                      }
                    >
                      {discovery.status}
                    </Badge>
                  </div>
                  
                  {editingId === discovery.id ? (
                    <div className="space-y-2">
                      <Input
                        placeholder="Tagline"
                        value={editData.tagline || ''}
                        onChange={(e) => setEditData({ ...editData, tagline: e.target.value })}
                      />
                      <Textarea
                        placeholder="Description"
                        value={editData.description || ''}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        rows={3}
                      />
                      <Input
                        placeholder="URL du site"
                        value={editData.website_url || ''}
                        onChange={(e) => setEditData({ ...editData, website_url: e.target.value })}
                      />
                    </div>
                  ) : (
                    <>
                      {discovery.tagline && (
                        <p className="text-sm text-slate-600 mb-2">{discovery.tagline}</p>
                      )}
                      <p className="text-sm text-slate-700 mb-2">{discovery.description}</p>
                      {discovery.website_url && (
                        <a
                          href={discovery.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-purple-600 hover:underline flex items-center gap-1"
                        >
                          {discovery.website_url}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </>
                  )}
                </div>

                {discovery.cover_image_url && (
                  <img
                    src={discovery.cover_image_url}
                    alt={discovery.name}
                    className="w-32 h-32 rounded-lg object-cover ml-4"
                  />
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              {/* Tags & Features */}
              <div className="space-y-3 mb-4">
                {discovery.suggested_categories?.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-slate-600 mr-2">Catégories:</span>
                    {discovery.suggested_categories.map((cat, i) => (
                      <Badge key={i} variant="outline" className="mr-1">
                        {categories.find(c => c.id === cat)?.name || cat}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {discovery.tags?.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-slate-600 mr-2">Tags:</span>
                    {discovery.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="mr-1 text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {discovery.features?.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-slate-600">Fonctionnalités:</span>
                    <ul className="list-disc list-inside text-sm text-slate-700 mt-1">
                      {discovery.features.slice(0, 3).map((feature, i) => (
                        <li key={i}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t">
                {editingId === discovery.id ? (
                  <>
                    <Button onClick={handleSave} size="sm">
                      <Save className="w-4 h-4 mr-1" />
                      Sauvegarder
                    </Button>
                    <Button
                      onClick={() => setEditingId(null)}
                      variant="outline"
                      size="sm"
                    >
                      Annuler
                    </Button>
                  </>
                ) : (
                  <>
                    {discovery.status !== 'approved' && (
                      <>
                        <Button
                          onClick={() => handleEdit(discovery)}
                          variant="outline"
                          size="sm"
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          Modifier
                        </Button>
                        <Button
                          onClick={() => handleApprove(discovery)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Valider
                        </Button>
                        <Button
                          onClick={() => handleStatusChange(discovery.id, 'reviewed')}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Marquer vu
                        </Button>
                        <Button
                          onClick={() => handleStatusChange(discovery.id, 'dismissed')}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Rejeter
                        </Button>
                      </>
                    )}
                    {discovery.status === 'approved' && discovery.ai_service_id && (
                      <Badge className="bg-green-100 text-green-800">
                        <Check className="w-3 h-3 mr-1" />
                        Service créé: {discovery.ai_service_id}
                      </Badge>
                    )}
                  </>
                )}
              </div>

              {discovery.admin_notes && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <p className="text-xs text-yellow-800">{discovery.admin_notes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {discoveries.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Aucune découverte pour le moment
            </h3>
            <p className="text-slate-600 mb-4">
              Lancez un scan pour découvrir de nouveaux services IA
            </p>
            <Button
              onClick={() => triggerScanMutation.mutate()}
              disabled={isScanning}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Search className="w-4 h-4 mr-2" />
              Lancer le premier scan
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}