// Configuration centralisée des positions de bannières
// Modifier les prix ici pour les mettre à jour partout

export const bannerPositions = [
  {
    value: 'homepage_hero',
    label: 'Accueil - Article Hero',
    labelShort: 'Article Accueil',
    description: 'Format article avec image + texte en haut de la page d\'accueil',
    recommendedSize: '600 x 400 px',
    creditsPerDay: 5,
  },
  {
    value: 'homepage_sidebar',
    label: 'Accueil - Sidebar (Card)',
    labelShort: 'Card Vedette',
    description: 'Bannière format card avec badges parmi les outils IA en vedette',
    recommendedSize: '400 x 300 px',
    creditsPerDay: 3,
  },
  {
    value: 'explore_top',
    label: 'Explorer - Article Haut',
    labelShort: 'Article Explorer',
    description: 'Format article avec image + texte sous le bloc de recherche',
    recommendedSize: '600 x 400 px',
    creditsPerDay: 4,
  },
  {
    value: 'explore_sidebar',
    label: 'Explorer - Sidebar (Card)',
    labelShort: 'Explorer Card',
    description: 'Bannière format card avec badges parmi les outils IA',
    recommendedSize: '400 x 300 px',
    creditsPerDay: 2,
  },
  {
    value: 'explore_bottom',
    label: 'Explorer - Bas de page',
    labelShort: 'Explorer Bas',
    description: 'Bannière sous la pagination dans Explorer',
    recommendedSize: '1200 x 200 px',
    creditsPerDay: 2,
  },
  {
    value: 'categories_bottom',
    label: 'Catégories - Bas de page',
    labelShort: 'Catégories Bas',
    description: 'Bannière sous les blocs catégories',
    recommendedSize: '1200 x 200 px',
    creditsPerDay: 2,
  },
  {
    value: 'homepage_category_bottom',
    label: 'Accueil - Sous Catégories',
    labelShort: 'Sous Catégories',
    description: 'Bannière entre les catégories et le bouton Explorer',
    recommendedSize: '1200 x 200 px',
    creditsPerDay: 2,
  }
];

export const getPositionByValue = (value) => {
  return bannerPositions.find(p => p.value === value);
};