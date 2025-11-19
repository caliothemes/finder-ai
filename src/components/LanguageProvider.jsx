import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  fr: {
    // Navigation
    nav_home: "Accueil",
    nav_explore: "Explorer",
    nav_categories: "Catégories",
    nav_favorites: "Favoris",
    nav_profile: "Mon Profil",
    nav_pro_account: "Compte Pro",
    nav_my_banners: "Mes Bannières",
    nav_admin: "Admin",
    nav_logout: "Se déconnecter",
    nav_login: "Connexion",
    nav_submit_ai: "Proposer mon IA",
    
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
    categories_tools: "outil",
    categories_tools_plural: "outils",
    categories_explore: "Explorer",
    
    // Explore
    explore_title: "Explorer tous les outils IA",
    explore_subtitle: "Découvrez",
    explore_subtitle_suffix: "outils d'intelligence artificielle",
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
    
    // Pro Account
    pro_title: "Boostez votre visibilité",
    pro_subtitle: "Mettez en avant vos outils IA et atteignez des milliers d'utilisateurs",
    pro_your_account: "Votre Compte Pro",
    pro_current_plan: "Plan actuel",
    pro_credits_available: "Crédits disponibles",
    pro_managed_tools: "Outils IA gérés",
    pro_visibility: "Visibilité maximale",
    pro_visibility_desc: "Placez vos outils en avant et multipliez votre audience",
    pro_ad_credits: "Crédits publicitaires",
    pro_ad_credits_desc: "Utilisez vos crédits pour des bannières et placements premium",
    pro_exclusive_badges: "Badges exclusifs",
    pro_exclusive_badges_desc: "Obtenez des badges de confiance pour vos outils",
    pro_choose_plan: "Choisir ce plan",
    pro_upgrade: "Mettre à niveau",
    pro_active_plan: "Plan actif",
    pro_buy_credits: "Acheter des crédits publicitaires",
    pro_credits: "crédits",
    pro_buy_now: "Acheter maintenant",
    pro_why_pro: "Pourquoi passer Pro ?",
    
    // Banner Manager
    banner_title: "Gestion des bannières",
    banner_credits_available: "Crédits disponibles:",
    banner_create: "Créer une bannière",
    banner_create_subtitle: "Votre bannière sera soumise pour validation admin",
    banner_my_banners: "Mes bannières",
    banner_validated: "Validée",
    banner_pending: "En attente de validation",
    banner_position: "Position:",
    banner_credits_used: "Crédits utilisés:",
    banner_reserved_dates: "Dates réservées:",
    banner_reserve_dates: "Réserver des dates",
    banner_close_calendar: "Fermer le calendrier",
    banner_pending_validation: "Votre bannière est en cours de validation. Vous pourrez réserver des dates une fois validée.",
    
    // Calendar
    calendar_reserve_title: "Réserver des dates",
    calendar_available: "Disponible",
    calendar_reserved: "Réservé",
    calendar_selected: "Sélectionné",
    calendar_days_selected: "jour",
    calendar_days_selected_plural: "jours",
    calendar_total_cost: "Coût total:",
    calendar_reserve_now: "Réserver maintenant",
    calendar_pricing_info: "Tarif: 5 crédits par jour • Les dates grisées sont déjà réservées",
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
    
    // Profile
    profile_title: "Mon Profil",
    profile_member_since: "Membre depuis",
    profile_admin_badge: "Administrateur",
    profile_stats: "Statistiques",
    profile_favorites: "Favoris",
    profile_contributions: "Contributions",
    profile_reviews: "Avis",
    profile_my_submissions: "Mes Soumissions",
    profile_status_pending: "En attente",
    profile_status_approved: "Approuvé",
    profile_status_rejected: "Rejeté",
    profile_latest_reviews: "Derniers Avis",
    
    // Favorites
    favorites_title: "Mes Favoris",
    favorites_subtitle: "Tous vos outils IA favoris en un seul endroit",
    favorites_count: "favori",
    favorites_count_plural: "favoris",
    favorites_empty: "Aucun favori pour le moment",
    favorites_empty_subtitle: "Commencez à ajouter vos outils IA préférés",
    
    // Footer
    footer_discover: "Découvrir",
    footer_account: "Compte",
    footer_contribute: "Contribuer",
    footer_all_rights: "Tous droits réservés.",
    footer_powered_by: "App propulsé par",
    
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
    
    // Common
    common_loading: "Chargement...",
    common_cancel: "Annuler",
    common_save: "Enregistrer",
    common_delete: "Supprimer",
    common_edit: "Modifier",
    common_search: "Rechercher",
    common_filter: "Filtrer",
  },
  en: {
    // Navigation
    nav_home: "Home",
    nav_explore: "Explore",
    nav_categories: "Categories",
    nav_favorites: "Favorites",
    nav_profile: "My Profile",
    nav_pro_account: "Pro Account",
    nav_my_banners: "My Banners",
    nav_admin: "Admin",
    nav_logout: "Logout",
    nav_login: "Login",
    nav_submit_ai: "Submit my AI",
    
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
    categories_tools: "tool",
    categories_tools_plural: "tools",
    categories_explore: "Explore",
    
    // Explore
    explore_title: "Explore all AI tools",
    explore_subtitle: "Discover",
    explore_subtitle_suffix: "artificial intelligence tools",
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
    
    // Pro Account
    pro_title: "Boost your visibility",
    pro_subtitle: "Highlight your AI tools and reach thousands of users",
    pro_your_account: "Your Pro Account",
    pro_current_plan: "Current plan",
    pro_credits_available: "Available credits",
    pro_managed_tools: "Managed AI tools",
    pro_visibility: "Maximum visibility",
    pro_visibility_desc: "Put your tools forward and multiply your audience",
    pro_ad_credits: "Advertising credits",
    pro_ad_credits_desc: "Use your credits for banners and premium placements",
    pro_exclusive_badges: "Exclusive badges",
    pro_exclusive_badges_desc: "Get trust badges for your tools",
    pro_choose_plan: "Choose this plan",
    pro_upgrade: "Upgrade",
    pro_active_plan: "Active plan",
    pro_buy_credits: "Buy advertising credits",
    pro_credits: "credits",
    pro_buy_now: "Buy now",
    pro_why_pro: "Why go Pro?",
    
    // Banner Manager
    banner_title: "Banner Management",
    banner_credits_available: "Available credits:",
    banner_create: "Create a banner",
    banner_create_subtitle: "Your banner will be submitted for admin validation",
    banner_my_banners: "My banners",
    banner_validated: "Validated",
    banner_pending: "Pending validation",
    banner_position: "Position:",
    banner_credits_used: "Credits used:",
    banner_reserved_dates: "Reserved dates:",
    banner_reserve_dates: "Reserve dates",
    banner_close_calendar: "Close calendar",
    banner_pending_validation: "Your banner is pending validation. You can reserve dates once validated.",
    
    // Calendar
    calendar_reserve_title: "Reserve dates",
    calendar_available: "Available",
    calendar_reserved: "Reserved",
    calendar_selected: "Selected",
    calendar_days_selected: "day",
    calendar_days_selected_plural: "days",
    calendar_total_cost: "Total cost:",
    calendar_reserve_now: "Reserve now",
    calendar_pricing_info: "Pricing: 5 credits per day • Grayed dates are already reserved",
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
    
    // Profile
    profile_title: "My Profile",
    profile_member_since: "Member since",
    profile_admin_badge: "Administrator",
    profile_stats: "Statistics",
    profile_favorites: "Favorites",
    profile_contributions: "Contributions",
    profile_reviews: "Reviews",
    profile_my_submissions: "My Submissions",
    profile_status_pending: "Pending",
    profile_status_approved: "Approved",
    profile_status_rejected: "Rejected",
    profile_latest_reviews: "Latest Reviews",
    
    // Favorites
    favorites_title: "My Favorites",
    favorites_subtitle: "All your favorite AI tools in one place",
    favorites_count: "favorite",
    favorites_count_plural: "favorites",
    favorites_empty: "No favorites yet",
    favorites_empty_subtitle: "Start adding your favorite AI tools",
    
    // Footer
    footer_discover: "Discover",
    footer_account: "Account",
    footer_contribute: "Contribute",
    footer_all_rights: "All rights reserved.",
    footer_powered_by: "App powered by",
    
    // Toasts
    toast_favorite_added: "Added to favorites",
    toast_favorite_removed: "Removed from favorites",
    toast_login_required: "Please log in",
    toast_dates_reserved: "Dates reserved successfully",
    toast_insufficient_credits: "Insufficient credits",
    
    // Promo Card
    promo_your_service: "Your AI Service here",
    promo_increase_visibility: "Increase your visibility with a pro account",
    promo_become_pro: "Become Pro",
    
    // Badge
    badge_featured: "Featured",
    
    // Common
    common_loading: "Loading...",
    common_cancel: "Cancel",
    common_save: "Save",
    common_delete: "Delete",
    common_edit: "Edit",
    common_search: "Search",
    common_filter: "Filter",
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