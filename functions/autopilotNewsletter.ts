import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// This function should be called by a cron job every Sunday morning
// Or can be triggered manually from admin

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Check autopilot config
    const configs = await base44.asServiceRole.entities.AutopilotConfig.filter({ feature: 'newsletter' });
    const config = configs[0];

    if (!config || !config.enabled) {
      return Response.json({ success: false, message: 'Autopilot disabled' });
    }

    if (!config.template_id) {
      return Response.json({ success: false, message: 'No template configured' });
    }

    // Check if already ran today
    if (config.last_run) {
      const lastRun = new Date(config.last_run);
      const today = new Date();
      if (lastRun.toDateString() === today.toDateString()) {
        return Response.json({ success: false, message: 'Already ran today' });
      }
    }

    // Get template
    const templates = await base44.asServiceRole.entities.NewsletterTemplate.filter({ id: config.template_id });
    const template = templates[0];
    if (!template) {
      return Response.json({ success: false, message: 'Template not found' });
    }

    // Get latest content
    const latestNews = await base44.asServiceRole.entities.AINews.filter({ status: 'published' }, '-created_date', 8);
    const latestServices = await base44.asServiceRole.entities.AIService.filter({ status: 'approved' }, '-created_date', 8);
    const allCategories = await base44.asServiceRole.entities.Category.list();
    const randomCategories = allCategories.sort(() => Math.random() - 0.5).slice(0, 10);

    // Build content
    const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const newsHtml = latestNews.map(news => `
      <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 10px;">
        ${news.cover_image_url ? `<img src="${news.cover_image_url}" alt="${news.title}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;" />` : ''}
        <h3 style="margin: 0 0 8px 0; color: #1a1a2e; font-size: 16px;">${news.title}</h3>
        <p style="margin: 0 0 10px 0; color: #666; font-size: 14px; line-height: 1.5;">${(news.summary || '').substring(0, 120)}...</p>
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
                <p style="margin: 0 0 12px 0; color: #666; font-size: 14px; line-height: 1.6;">${(service.description || service.tagline || '').substring(0, 250)}...</p>
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
            <p style="margin: 0 0 8px 0; color: #666; font-size: 12px;">${(service.tagline || '').substring(0, 60)}...</p>
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

    // Replace placeholders
    let content = template.content
      .replace(/{{date}}/g, today)
      .replace(/{{contenu_genere}}/g, generatedContent);

    // If template doesn't have {{contenu_genere}}, append at the end
    if (!template.content.includes('{{contenu_genere}}')) {
      content = template.content.replace(/{{date}}/g, today) + generatedContent;
    }

    const subject = template.subject.replace(/{{date}}/g, today);

    // Create newsletter
    const newsletter = await base44.asServiceRole.entities.Newsletter.create({
      subject,
      content,
      template_id: template.id,
      status: 'draft'
    });

    // Get all subscribers (newsletter + users)
    const newsletterSubs = await base44.asServiceRole.entities.NewsletterSubscriber.filter({ active: true });
    const users = await base44.asServiceRole.entities.User.list();

    const emailSet = new Set();
    const allSubscribers = [];

    newsletterSubs.forEach(s => {
      if (!emailSet.has(s.email)) {
        emailSet.add(s.email);
        allSubscribers.push(s.email);
      }
    });

    users.forEach(u => {
      if (!emailSet.has(u.email)) {
        emailSet.add(u.email);
        allSubscribers.push(u.email);
      }
    });

    // Send emails
    let sent = 0;
    for (const email of allSubscribers) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          subject: newsletter.subject,
          body: newsletter.content
        });
        sent++;
      } catch (e) {
        console.error('Failed to send to', email, e);
      }
    }

    // Update newsletter status
    await base44.asServiceRole.entities.Newsletter.update(newsletter.id, {
      status: 'sent',
      sent_to: sent,
      sent_date: new Date().toISOString()
    });

    // Update config last_run
    await base44.asServiceRole.entities.AutopilotConfig.update(config.id, {
      last_run: new Date().toISOString()
    });

    return Response.json({ 
      success: true, 
      message: `Newsletter sent to ${sent} subscribers`,
      newsletter_id: newsletter.id
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});