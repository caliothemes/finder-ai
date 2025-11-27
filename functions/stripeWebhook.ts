import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

// Mapping des prix vers les crédits
const priceToCredits = {
  'price_1SY0XVHi2Io4SvfQtq9NBCMD': { credits: 10, type: 'pack' },
  'price_1SY0Y9Hi2Io4SvfQyuu2ZnfA': { credits: 50, type: 'pack' },
  'price_1SY0YkHi2Io4SvfQQbmdiOH7': { credits: 100, type: 'pack' },
  'price_1SY0aKHi2Io4SvfQIoyodFt5': { credits: 20, type: 'subscription', plan: 'starter' },
  'price_1SY0b2Hi2Io4SvfQ6jhRiZPy': { credits: 100, type: 'subscription', plan: 'pro' }
};

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return Response.json({ error: 'No signature' }, { status: 400 });
    }

    // Valider le webhook
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);

    console.log('Stripe event received:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerEmail = session.customer_email;
        const priceId = session.metadata?.price_id || null;

        // Récupérer les line items pour avoir le price_id
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        const actualPriceId = lineItems.data[0]?.price?.id;

        const priceInfo = priceToCredits[actualPriceId];

        if (priceInfo && customerEmail) {
          // Chercher ou créer le compte Pro
          const accounts = await base44.asServiceRole.entities.ProAccount.filter({ user_email: customerEmail });
          
          if (accounts.length > 0) {
            // Mettre à jour le compte existant
            const account = accounts[0];
            const updateData = {
              credits: (account.credits || 0) + priceInfo.credits
            };
            
            if (priceInfo.type === 'subscription') {
              updateData.plan_type = priceInfo.plan;
              updateData.stripe_customer_id = session.customer;
              updateData.stripe_subscription_id = session.subscription;
            }
            
            await base44.asServiceRole.entities.ProAccount.update(account.id, updateData);
            console.log(`Updated ProAccount for ${customerEmail}: +${priceInfo.credits} credits`);
          } else {
            // Créer un nouveau compte Pro
            await base44.asServiceRole.entities.ProAccount.create({
              user_email: customerEmail,
              company_name: customerEmail.split('@')[0],
              plan_type: priceInfo.type === 'subscription' ? priceInfo.plan : 'free',
              credits: priceInfo.credits,
              status: 'active',
              stripe_customer_id: session.customer,
              stripe_subscription_id: session.subscription || null
            });
            console.log(`Created ProAccount for ${customerEmail}: ${priceInfo.credits} credits`);
          }
        }
        break;
      }

      case 'invoice.paid': {
        // Renouvellement d'abonnement
        const invoice = event.data.object;
        const customerEmail = invoice.customer_email;
        const subscriptionId = invoice.subscription;

        if (customerEmail && subscriptionId && invoice.billing_reason === 'subscription_cycle') {
          // Récupérer l'abonnement pour avoir le price_id
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0]?.price?.id;
          const priceInfo = priceToCredits[priceId];

          if (priceInfo) {
            const accounts = await base44.asServiceRole.entities.ProAccount.filter({ user_email: customerEmail });
            if (accounts.length > 0) {
              const account = accounts[0];
              await base44.asServiceRole.entities.ProAccount.update(account.id, {
                credits: (account.credits || 0) + priceInfo.credits
              });
              console.log(`Subscription renewed for ${customerEmail}: +${priceInfo.credits} credits`);
            }
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        // Abonnement annulé
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Récupérer le customer pour avoir l'email
        const customer = await stripe.customers.retrieve(customerId);
        const customerEmail = customer.email;

        if (customerEmail) {
          const accounts = await base44.asServiceRole.entities.ProAccount.filter({ user_email: customerEmail });
          if (accounts.length > 0) {
            await base44.asServiceRole.entities.ProAccount.update(accounts[0].id, {
              plan_type: 'free',
              stripe_subscription_id: null
            });
            console.log(`Subscription cancelled for ${customerEmail}`);
          }
        }
        break;
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 400 });
  }
});