import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  fr: {
    // Navigation
    nav_home: "Accueil",
    nav_explore: "Explorer IA",
    nav_categories: "Catégories IA",
      nav_finder_gpt: "FinderAI-GPT",
    nav_favorites: "Favoris",
    nav_profile: "Mon Profil",
    nav_pro_account: "Compte Pro",
    nav_my_banners: "Mes Bannières",
    nav_admin: "Admin",
    nav_logout: "Se déconnecter",
    nav_login: "Connexion",
    nav_submit_ai: "Proposer mon IA",
      nav_ai_news: "Actualités IA",
    
    // Hero Section
    hero_title: "Découvrez les Meilleurs Outils",
    hero_subtitle: "Le répertoire ultime des outils d'IA",
    hero_description: "Des milliers d'outils d'intelligence artificielle pour booster votre productivité et créativité",
    hero_search_placeholder: "Rechercher un outil IA...",
    hero_search_button: "Rechercher",
    
    // Stats
    stats_ai_tools: "Outils IA",
    stats_categories: "Catégories",
    stats_users: "Utilisateurs",
    
    // Featured
    featured_title: "Outils IA en vedette",
    featured_subtitle: "Les meilleurs outils d'IA sélectionnés pour vous",
    featured_discover: "Découvrir",
    featured_views: "vues",
    
    // Categories
    categories_title: "Explorer par Catégorie",
    categories_subtitle: "Découvrez les meilleurs outils IA classés par usage",
    categories_all: "Toutes les catégories",
    categories_tools: "outil",
    categories_tools_plural: "outils",
    categories_explore: "Explorer",
    category_available: "disponible",
    category_available_plural: "disponibles",
    category_not_found: "Catégorie introuvable",
    category_not_found_subtitle: "Cette catégorie n'existe pas.",
    category_no_tools: "Aucun outil disponible",
    category_no_tools_subtitle: "Aucun outil n'a encore été ajouté dans cette catégorie.",
    
    // Favorites
    favorites_title: "Vos outils IA préférés",
    favorites_subtitle: "Retrouvez tous les outils que vous avez ajoutés à vos favoris",
    favorites_my: "Mes Favoris",
    favorites_count: "favori",
    favorites_count_plural: "favoris",
    favorites_none_title: "Aucun favori pour le moment",
    favorites_none_subtitle: "Commencez à ajouter des outils à vos favoris pour les retrouver facilement ici",
    
    // Profile
    profile_user: "Utilisateur",
    profile_member_since: "Membre depuis",
    profile_admin: "Administrateur",
    profile_favorites: "Favoris",
    profile_favorite_tools: "Outils favoris",
    profile_contributions: "Contributions",
    profile_tools_submitted: "Outils proposés",
    profile_reviews: "Avis",
    profile_reviews_published: "Avis publiés",
    profile_my_tools: "Mes outils IA proposés",
    profile_my_reviews: "Mes derniers avis",
    profile_status_approved: "Approuvé",
    profile_status_pending: "En attente",
    profile_status_rejected: "Rejeté",
    
    // Pro Account
    pro_title: "Boostez votre visibilité",
    pro_subtitle: "Mettez en avant vos outils IA et atteignez des milliers d'utilisateurs",
    pro_professional: "Compte Professionnel",
    pro_your_account: "Votre Compte Pro",
    pro_current_plan: "Plan actuel",
    pro_credits_available: "Crédits disponibles",
    pro_tools_managed: "Outils IA gérés",
    pro_popular: "Populaire",
    pro_active: "Actif",
    pro_always: "toujours",
    pro_per_month: "/mois",
    pro_credits_per_month: "crédits/mois",
    pro_plan_active: "Plan actif",
    pro_upgrade: "Mettre à niveau",
    pro_choose_plan: "Choisir ce plan",
    pro_buy_credits: "Acheter des crédits publicitaires",
    pro_credits: "crédits",
    pro_buy_now: "Acheter maintenant",
    pro_why_pro: "Pourquoi passer Pro ?",
    pro_visibility_title: "Visibilité maximale",
    pro_visibility_desc: "Placez vos outils en avant et multipliez votre audience",
    pro_credits_title: "Crédits publicitaires",
    pro_credits_desc: "Utilisez vos crédits pour des bannières et placements premium",
    pro_badges_title: "Badges exclusifs",
    pro_badges_desc: "Obtenez des badges de confiance pour vos outils",
    pro_how_it_works: "Comment ça marche ?",
    pro_how_it_works_intro: "Utilisez vos crédits pour afficher des bannières publicitaires sur les pages stratégiques de Finder AI. Chaque crédit = 1 jour d'affichage sur l'emplacement choisi.",
    pro_how_step1_title: "1. Achetez des crédits",
    pro_how_step1_desc: "Choisissez un pack de crédits ou un abonnement mensuel selon vos besoins.",
    pro_how_step2_title: "2. Créez votre bannière",
    pro_how_step2_desc: "Uploadez votre visuel, choisissez l'emplacement et rédigez votre message.",
    pro_how_step3_title: "3. Réservez vos dates",
    pro_how_step3_desc: "Sélectionnez les jours où vous souhaitez apparaître sur le site.",
    pro_positions_title: "Emplacements disponibles",
    pro_position_hero: "Hero Accueil",
    pro_position_hero_desc: "Grande bannière en haut de page (3 crédits/jour)",
    pro_position_sidebar: "Card Vedette",
    pro_position_sidebar_desc: "Format card parmi les IA en vedette (2 crédits/jour)",
    pro_position_category: "Sous Catégories",
    pro_position_category_desc: "Bannière avant le bouton Explorer (1 crédit/jour)",
    pro_position_explore: "Page Explorer",
    pro_position_explore_desc: "Bannière et card dans la page Explorer (1-2 crédits/jour)",
    pro_cost_per_credit: "par crédit",
    
    // Banner Manager
    banner_manager_title: "Gestion des bannières",
    banner_credits: "Crédits disponibles",
    banner_create: "Créer une bannière",
    banner_create_desc: "Votre bannière sera soumise pour validation admin",
    banner_ai_service: "Service IA",
    banner_title_label: "Titre de la bannière",
    banner_image_label: "Image de la bannière",
    banner_url_label: "URL de destination",
    banner_position: "Position",
    banner_position_hero: "Page d'accueil - Hero",
    banner_position_sidebar: "Page d'accueil - Sidebar",
    banner_position_category: "Catégories - En haut",
    banner_position_detail: "Détail service",
    banner_create_btn: "Créer",
    banner_cancel: "Annuler",
    banner_my_banners: "Mes bannières",
    banner_validated: "Validée",
    banner_pending: "En attente de validation",
    banner_credits_used: "Crédits utilisés",
    banner_dates_reserved: "Dates réservées",
    banner_reserve_dates: "Réserver des dates",
    banner_close_calendar: "Fermer le calendrier",
    banner_validation_pending: "Votre bannière est en cours de validation. Vous pourrez réserver des dates une fois validée.",
    banner_pro_required: "Compte Pro requis",
    banner_pro_required_desc: "Vous devez avoir un compte Pro pour gérer vos bannières",
    banner_discover_pro: "Découvrir les plans Pro",
    
    // Explore
    explore_title: "Explorer tous les outils IA",
    explore_subtitle: "Découvrez",
    explore_subtitle_suffix: "outils d'intelligence artificielle",
    explore_continue: "Continuer l'exploration des IA",
    explore_filters_title: "Filtres et Recherche",
    explore_search_placeholder: "Rechercher un outil, tag...",
    explore_all_categories: "Toutes les catégories",
    explore_all_pricing: "Tous les prix",
    explore_pricing_free: "Gratuit",
    explore_pricing_freemium: "Freemium",
    explore_pricing_paid: "Payant",
    explore_pricing_subscription: "Abonnement",
    explore_sort_by: "Trier par:",
    explore_sort_recent: "Plus récents",
    explore_sort_views: "Plus vus",
    explore_sort_rating: "Mieux notés",
    explore_results: "résultat",
    explore_results_plural: "résultats",
    explore_no_results: "Aucun résultat",
    explore_no_results_subtitle: "Essayez de modifier vos critères de recherche",
    
    // Service Card
    service_views: "vues",
    service_discover: "Découvrir",
    
    // Pricing
    pricing_free: "Gratuit",
    pricing_freemium: "Freemium",
    pricing_paid: "Payant",
    pricing_subscription: "Abonnement",
    
    // Calendar
    calendar_reserve_title: "Réserver des dates",
    calendar_available: "Disponible",
    calendar_reserved: "Réservé",
    calendar_selected: "Sélectionné",
    calendar_days_selected: "jour",
    calendar_days_selected_plural: "jours",
    calendar_total_cost: "Coût total:",
    calendar_reserve_now: "Réserver maintenant",
    calendar_pricing_info: "Tarif: 1 crédit par jour • Les dates grisées sont déjà réservées",
    calendar_months: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
    calendar_days: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
    
    // Submit AI
    submit_title: "Proposer votre outil IA",
    submit_subtitle: "Soumettez votre outil à notre répertoire",
    submit_basic_info: "Informations de base",
    submit_name: "Nom du service",
    submit_tagline: "Phrase d'accroche",
    submit_description: "Description complète",
    submit_website: "Site web",
    submit_categories: "Catégories",
    submit_pricing: "Modèle de prix",
    submit_images: "Images",
    submit_logo: "Logo",
    submit_cover: "Image de couverture",
    submit_features: "Fonctionnalités",
    submit_add_feature: "Ajouter une fonctionnalité",
    submit_tags: "Tags",
    submit_add_tag: "Ajouter un tag",
    submit_submit: "Soumettre",
    submit_submitting: "Envoi en cours...",
    
    // Toasts
    toast_favorite_added: "Ajouté aux favoris",
    toast_favorite_removed: "Retiré des favoris",
    toast_login_required: "Veuillez vous connecter",
    toast_dates_reserved: "Dates réservées avec succès",
    toast_insufficient_credits: "Crédits insuffisants",
    
    // Promo Card
    promo_your_service: "Votre Service IA ici",
    promo_increase_visibility: "Augmentez votre visibilité avec un compte pro",
    promo_become_pro: "Devenir Pro",
    
    // Badge
    badge_featured: "À l'affiche",
    
    // Reviews
    reviews_title: "Avis des utilisateurs",
    reviews_write: "Laisser un avis",
    reviews_placeholder: "Partagez votre expérience...",
    reviews_submit: "Publier l'avis",
    reviews_empty: "Aucun avis pour le moment. Soyez le premier à donner votre avis !",

    // Agent FinderAI
    agent_welcome: "Bienvenue sur Agent FinderAI !",
    agent_subtitle: "Ton expert IA pour trouver l'outil parfait",
    agent_description: "Je suis ton expert IA ! Pose-moi n'importe quelle question : trouver l'outil IA parfait, connaître les dernières actualités IA, ou poser une question sur l'intelligence artificielle.",
    agent_create_account: "Crée ton compte gratuit",
    agent_signup_desc: "Inscris-toi en 20 secondes pour accéder à Agent FinderAI et découvrir des milliers d'outils IA !",
    agent_feature_recommendations: "Recommandations IA instantanées",
    agent_feature_recommendations_desc: "Trouve l'outil parfait en secondes",
    agent_feature_favorites: "Sauvegarde tes favoris",
    agent_feature_favorites_desc: "Garde une trace des outils que tu aimes",
    agent_feature_history: "Historique de chat sauvegardé",
    agent_feature_history_desc: "Reprends tes conversations à tout moment",
    agent_signup_btn: "S'inscrire gratuitement",
    agent_signup_info: "✨ 100% gratuit • Pas de carte bancaire • Accès en 20 secondes",
    agent_placeholder: "Pose-moi une question...",
    agent_thinking: "Réflexion...",
    agent_new_chat: "Nouveau",
    agent_saved: "✨ Conversations sauvegardées",
    agent_login_prompt: "Connecte-toi pour sauvegarder",

    // Common
          common_loading: "Chargement...",
          common_cancel: "Annuler",
          common_save: "Enregistrer",
          common_delete: "Supprimer",
          common_edit: "Modifier",
          common_search: "Rechercher",
          common_filter: "Filtrer",

          // Footer
          footer_tagline: "Le répertoire ultime des outils d'intelligence artificielle",
          footer_discover: "Découvrir",
          footer_home: "Accueil",
          footer_explore: "Explorer IA",
          footer_categories: "Catégories",
          footer_ai_news: "Actualités IA",
          footer_account: "Compte",
          footer_profile: "Mon Profil",
          footer_favorites: "Favoris",
          footer_pro_account: "Compte Pro",
          footer_contribute: "Contribuer",
          footer_submit_ai: "Proposer une IA",
          footer_copyright: "© 2025 Finder AI. Tous droits réservés.",
          footer_powered_by: "App propulsé par",
          footer_legal: "Mentions légales",
    
    // Home page
    home_hero_badge: "Découvrez l'univers de l'Intelligence Artificielle",
    home_hero_title: "Finder AI",
    home_hero_subtitle: "Le répertoire ultime des outils d'IA",
    home_hero_description: "Explorez, comparez et découvrez les meilleurs services d'intelligence artificielle pour tous vos besoins",
    home_hero_search_placeholder: "Rechercher un outil IA... (ex: génération d'images, chatbot, vidéo)",
    home_hero_search_btn: "Rechercher",
    home_hero_tools: "Outils IA",
    home_hero_categories: "Catégories",
    home_hero_users: "Utilisateurs",
    home_featured_title: "Outils IA en Vedette",
    home_featured_subtitle: "Les outils IA les plus populaires et innovants du moment",
    home_featured_badge: "En vedette",
    home_featured_discover: "Découvrir",
    home_category_title: "Explorez par Catégorie",
    home_category_subtitle: "Trouvez l'outil IA parfait pour votre besoin",
    home_category_tools: "outil",
    home_category_tools_plural: "outils",
    home_category_explore: "Explorer",
    home_newsletter_badge: "Restez à jour",
    home_newsletter_title: "Ne ratez aucune nouveauté IA",
    home_newsletter_subtitle: "Recevez chaque semaine les derniers outils IA, tendances et guides exclusifs directement dans votre boîte mail",
    home_newsletter_name: "Votre prénom",
    home_newsletter_email: "Votre email",
    home_newsletter_btn: "S'inscrire à la Newsletter",
    home_newsletter_loading: "Inscription...",
    home_newsletter_free: "Gratuit",
    home_newsletter_frequency: "1 email/semaine",
    home_newsletter_unsubscribe: "Désabonnement facile",
    home_newsletter_success_title: "Inscription réussie ! 🎉",
    home_newsletter_success_subtitle: "Vous allez recevoir notre prochaine newsletter avec les meilleurs outils IA",
    home_newsletter_error_email: "Veuillez entrer votre email",
    home_newsletter_error: "Une erreur s'est produite. Veuillez réessayer.",
    home_newsletter_success_toast: "Merci ! Vous êtes inscrit à notre newsletter 🎉",
  },
  en: {
    // Navigation
    nav_home: "Home",
    nav_explore: "AI Explorer",
    nav_categories: "AI Categories",
      nav_finder_gpt: "FinderAI-GPT",
    nav_favorites: "Favorites",
    nav_profile: "My Profile",
    nav_pro_account: "Pro Account",
    nav_my_banners: "My Banners",
    nav_admin: "Admin",
    nav_logout: "Logout",
    nav_login: "Login",
    nav_submit_ai: "Submit my AI",
      nav_ai_news: "AI News",
    
    // Hero Section
    hero_title: "Discover the Best AI Tools",
    hero_subtitle: "The ultimate AI tools directory",
    hero_description: "Thousands of artificial intelligence tools to boost your productivity and creativity",
    hero_search_placeholder: "Search for an AI tool...",
    hero_search_button: "Search",
    
    // Stats
    stats_ai_tools: "AI Tools",
    stats_categories: "Categories",
    stats_users: "Users",
    
    // Featured
    featured_title: "Featured AI Tools",
    featured_subtitle: "The best AI tools selected for you",
    featured_discover: "Discover",
    featured_views: "views",
    
    // Categories
    categories_title: "Explore by Category",
    categories_subtitle: "Discover the best AI tools classified by use case",
    categories_all: "All categories",
    categories_tools: "tool",
    categories_tools_plural: "tools",
    categories_explore: "Explore",
    category_available: "available",
    category_available_plural: "available",
    category_not_found: "Category not found",
    category_not_found_subtitle: "This category does not exist.",
    category_no_tools: "No tools available",
    category_no_tools_subtitle: "No tools have been added to this category yet.",
    
    // Favorites
    favorites_title: "Your Favorite AI Tools",
    favorites_subtitle: "Find all the tools you've added to your favorites",
    favorites_my: "My Favorites",
    favorites_count: "favorite",
    favorites_count_plural: "favorites",
    favorites_none_title: "No favorites yet",
    favorites_none_subtitle: "Start adding tools to your favorites to find them easily here",
    
    // Profile
    profile_user: "User",
    profile_member_since: "Member since",
    profile_admin: "Administrator",
    profile_favorites: "Favorites",
    profile_favorite_tools: "Favorite tools",
    profile_contributions: "Contributions",
    profile_tools_submitted: "Tools submitted",
    profile_reviews: "Reviews",
    profile_reviews_published: "Reviews published",
    profile_my_tools: "My submitted AI tools",
    profile_my_reviews: "My recent reviews",
    profile_status_approved: "Approved",
    profile_status_pending: "Pending",
    profile_status_rejected: "Rejected",
    
    // Pro Account
    pro_title: "Boost Your Visibility",
    pro_subtitle: "Showcase your AI tools and reach thousands of users",
    pro_professional: "Professional Account",
    pro_your_account: "Your Pro Account",
    pro_current_plan: "Current plan",
    pro_credits_available: "Credits available",
    pro_tools_managed: "AI tools managed",
    pro_popular: "Popular",
    pro_active: "Active",
    pro_always: "forever",
    pro_per_month: "/month",
    pro_credits_per_month: "credits/month",
    pro_plan_active: "Active plan",
    pro_upgrade: "Upgrade",
    pro_choose_plan: "Choose this plan",
    pro_buy_credits: "Buy advertising credits",
    pro_credits: "credits",
    pro_buy_now: "Buy now",
    pro_why_pro: "Why go Pro?",
    pro_visibility_title: "Maximum visibility",
    pro_visibility_desc: "Feature your tools and multiply your audience",
    pro_credits_title: "Advertising credits",
    pro_credits_desc: "Use your credits for banners and premium placements",
    pro_badges_title: "Exclusive badges",
    pro_badges_desc: "Get trust badges for your tools",
    pro_how_it_works: "How does it work?",
    pro_how_it_works_intro: "Use your credits to display advertising banners on strategic pages of Finder AI. Each credit = 1 day of display on the chosen placement.",
    pro_how_step1_title: "1. Buy credits",
    pro_how_step1_desc: "Choose a credit pack or monthly subscription according to your needs.",
    pro_how_step2_title: "2. Create your banner",
    pro_how_step2_desc: "Upload your visual, choose the placement and write your message.",
    pro_how_step3_title: "3. Reserve your dates",
    pro_how_step3_desc: "Select the days when you want to appear on the site.",
    pro_positions_title: "Available placements",
    pro_position_hero: "Homepage Hero",
    pro_position_hero_desc: "Large banner at the top of the page (3 credits/day)",
    pro_position_sidebar: "Featured Card",
    pro_position_sidebar_desc: "Card format among featured AIs (2 credits/day)",
    pro_position_category: "Below Categories",
    pro_position_category_desc: "Banner before the Explore button (1 credit/day)",
    pro_position_explore: "Explore Page",
    pro_position_explore_desc: "Banner and card on the Explore page (1-2 credits/day)",
    pro_cost_per_credit: "per credit",
    
    // Banner Manager
    banner_manager_title: "Banner Management",
    banner_credits: "Available credits",
    banner_create: "Create a banner",
    banner_create_desc: "Your banner will be submitted for admin validation",
    banner_ai_service: "AI Service",
    banner_title_label: "Banner title",
    banner_image_label: "Banner image",
    banner_url_label: "Target URL",
    banner_position: "Position",
    banner_position_hero: "Homepage - Hero",
    banner_position_sidebar: "Homepage - Sidebar",
    banner_position_category: "Categories - Top",
    banner_position_detail: "Service detail",
    banner_create_btn: "Create",
    banner_cancel: "Cancel",
    banner_my_banners: "My banners",
    banner_validated: "Validated",
    banner_pending: "Pending validation",
    banner_credits_used: "Credits used",
    banner_dates_reserved: "Dates reserved",
    banner_reserve_dates: "Reserve dates",
    banner_close_calendar: "Close calendar",
    banner_validation_pending: "Your banner is pending validation. You can reserve dates once validated.",
    banner_pro_required: "Pro Account required",
    banner_pro_required_desc: "You need a Pro account to manage your banners",
    banner_discover_pro: "Discover Pro plans",
    
    // Explore
    explore_title: "Explore all AI tools",
    explore_subtitle: "Discover",
    explore_subtitle_suffix: "artificial intelligence tools",
    explore_continue: "Continue exploring AI tools",
    explore_filters_title: "Filters and Search",
    explore_search_placeholder: "Search for a tool, tag...",
    explore_all_categories: "All categories",
    explore_all_pricing: "All pricing",
    explore_pricing_free: "Free",
    explore_pricing_freemium: "Freemium",
    explore_pricing_paid: "Paid",
    explore_pricing_subscription: "Subscription",
    explore_sort_by: "Sort by:",
    explore_sort_recent: "Most recent",
    explore_sort_views: "Most viewed",
    explore_sort_rating: "Best rated",
    explore_results: "result",
    explore_results_plural: "results",
    explore_no_results: "No results",
    explore_no_results_subtitle: "Try modifying your search criteria",
    
    // Service Card
    service_views: "views",
    service_discover: "Discover",
    
    // Pricing
    pricing_free: "Free",
    pricing_freemium: "Freemium",
    pricing_paid: "Paid",
    pricing_subscription: "Subscription",
    
    // Calendar
    calendar_reserve_title: "Reserve dates",
    calendar_available: "Available",
    calendar_reserved: "Reserved",
    calendar_selected: "Selected",
    calendar_days_selected: "day",
    calendar_days_selected_plural: "days",
    calendar_total_cost: "Total cost:",
    calendar_reserve_now: "Reserve now",
    calendar_pricing_info: "Pricing: 1 credit per day • Grayed dates are already reserved",
    calendar_months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    calendar_days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    
    // Submit AI
    submit_title: "Submit your AI tool",
    submit_subtitle: "Submit your tool to our directory",
    submit_basic_info: "Basic information",
    submit_name: "Service name",
    submit_tagline: "Tagline",
    submit_description: "Full description",
    submit_website: "Website",
    submit_categories: "Categories",
    submit_pricing: "Pricing model",
    submit_images: "Images",
    submit_logo: "Logo",
    submit_cover: "Cover image",
    submit_features: "Features",
    submit_add_feature: "Add a feature",
    submit_tags: "Tags",
    submit_add_tag: "Add a tag",
    submit_submit: "Submit",
    submit_submitting: "Submitting...",
    
    // Toasts
    toast_login_required: "Please log in",
    toast_dates_reserved: "Dates reserved successfully",
    toast_insufficient_credits: "Insufficient credits",
    
    // Promo Card
    promo_your_service: "Your AI Service here",
    promo_increase_visibility: "Increase your visibility with a pro account",
    promo_become_pro: "Become Pro",
    
    // Badge
    badge_featured: "Featured",
    
    // Reviews
    reviews_title: "User reviews",
    reviews_write: "Write a review",
    reviews_placeholder: "Share your experience...",
    reviews_submit: "Submit review",
    reviews_empty: "No reviews yet. Be the first to share your thoughts!",

    // Agent FinderAI
    agent_welcome: "Welcome to Agent FinderAI!",
    agent_subtitle: "Your AI expert to find the perfect tool",
    agent_description: "I'm your AI expert! Ask me anything: find the perfect AI tool, get the latest AI news, or ask any question about artificial intelligence.",
    agent_create_account: "Create your free account",
    agent_signup_desc: "Sign up in 20 seconds to access Agent FinderAI and discover thousands of AI tools!",
    agent_feature_recommendations: "Instant AI Recommendations",
    agent_feature_recommendations_desc: "Find the perfect tool in seconds",
    agent_feature_favorites: "Save your favorites",
    agent_feature_favorites_desc: "Keep track of tools you love",
    agent_feature_history: "Chat history saved",
    agent_feature_history_desc: "Resume conversations anytime",
    agent_signup_btn: "Sign up for free",
    agent_signup_info: "✨ 100% free • No credit card required • Access in 20 seconds",
    agent_placeholder: "Ask me about AI tools...",
    agent_thinking: "Thinking...",
    agent_new_chat: "New",
    agent_saved: "✨ Conversations saved automatically",
    agent_login_prompt: "Log in to save your history",

    // Common
          common_loading: "Loading...",
          common_cancel: "Cancel",
          common_save: "Save",
          common_delete: "Delete",
          common_edit: "Edit",
          common_search: "Search",
          common_filter: "Filter",

          // Footer
          footer_tagline: "The ultimate directory of artificial intelligence tools",
          footer_discover: "Discover",
          footer_home: "Home",
          footer_explore: "Explore AI",
          footer_categories: "Categories",
          footer_ai_news: "AI News",
          footer_account: "Account",
          footer_profile: "My Profile",
          footer_favorites: "Favorites",
          footer_pro_account: "Pro Account",
          footer_contribute: "Contribute",
          footer_submit_ai: "Submit an AI",
          footer_copyright: "© 2025 Finder AI. All rights reserved.",
          footer_powered_by: "App powered by",
          footer_legal: "Legal Notice",
    
    // Home page
    home_hero_badge: "Discover the world of Artificial Intelligence",
    home_hero_title: "Finder AI",
    home_hero_subtitle: "The ultimate AI tools directory",
    home_hero_description: "Explore, compare and discover the best artificial intelligence services for all your needs",
    home_hero_search_placeholder: "Search for an AI tool... (e.g: image generation, chatbot, video)",
    home_hero_search_btn: "Search",
    home_hero_tools: "AI Tools",
    home_hero_categories: "Categories",
    home_hero_users: "Users",
    home_featured_title: "Featured AI Tools",
    home_featured_subtitle: "The most popular and innovative AI tools of the moment",
    home_featured_badge: "Featured",
    home_featured_discover: "Discover",
    home_category_title: "Explore by Category",
    home_category_subtitle: "Find the perfect AI tool for your needs",
    home_category_tools: "tool",
    home_category_tools_plural: "tools",
    home_category_explore: "Explore",
    home_newsletter_badge: "Stay updated",
    home_newsletter_title: "Don't miss any AI news",
    home_newsletter_subtitle: "Receive the latest AI tools, trends and exclusive guides directly in your mailbox every week",
    home_newsletter_name: "Your first name",
    home_newsletter_email: "Your email",
    home_newsletter_btn: "Subscribe to Newsletter",
    home_newsletter_loading: "Subscribing...",
    home_newsletter_free: "Free",
    home_newsletter_frequency: "1 email/week",
    home_newsletter_unsubscribe: "Easy unsubscribe",
    home_newsletter_success_title: "Successfully subscribed! 🎉",
    home_newsletter_success_subtitle: "You will receive our next newsletter with the best AI tools",
    home_newsletter_error_email: "Please enter your email",
    home_newsletter_error: "An error occurred. Please try again.",
    home_newsletter_success_toast: "Thank you! You are subscribed to our newsletter 🎉",
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('fr');

  useEffect(() => {
    // Vérifier si une langue est stockée
    const savedLang = localStorage.getItem('language');
    if (savedLang && (savedLang === 'fr' || savedLang === 'en')) {
      setLanguage(savedLang);
    } else {
      // Détecter la langue du navigateur
      const browserLang = navigator.language || navigator.userLanguage;
      const detectedLang = browserLang.startsWith('fr') ? 'fr' : 'en';
      setLanguage(detectedLang);
      localStorage.setItem('language', detectedLang);
    }
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};