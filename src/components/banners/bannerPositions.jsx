// Configuration centralisée des positions de bannières
// Modifier les prix ici pour les mettre à jour partout

export const bannerPositions = [
  {
    value: 'homepage_hero',
    label: 'Accueil - Article Hero',
    labelShort: 'Article Accueil',
    description: 'Bannière format article en haut de la page d\'accueil, juste sous la barre de recherche',
    recommendedSize: '600 x 400 px',
    creditsPerDay: 5,
  },
  {
    value: 'homepage_sidebar',
    label: 'Accueil - Sidebar (Card)',
    labelShort: 'Card Vedette',
    description: 'Bannière format card avec badges dans le module "Nouveautés" en page d\'accueil',
    recommendedSize: '400 x 300 px',
    creditsPerDay: 3,
  },
  {
    value: 'explore_top',
    label: 'Explorer - Article Haut',
    labelShort: 'Article Explorer',
    description: 'Bannière format article en haut de la page Explorer, juste sous le module de recherche',
    recommendedSize: '600 x 400 px',
    creditsPerDay: 4,
  },
  {
    value: 'explore_sidebar',
    label: 'Explorer - Sidebar (Card)',
    labelShort: 'Explorer Card',
    description: 'Bannière format card avec badges dans la grille des outils IA en page Explorer',
    recommendedSize: '400 x 300 px',
    creditsPerDay: 2,
  },
  {
    value: 'explore_bottom',
    label: 'Explorer - Bas de page',
    labelShort: 'Explorer Bas',
    description: 'Bannière horizontale en bas de la page Explorer, sous la pagination',
    recommendedSize: '1200 x 200 px',
    creditsPerDay: 2,
  },
  {
    value: 'categories_bottom',
    label: 'Catégories - Bas de page',
    labelShort: 'Catégories Bas',
    description: 'Bannière horizontale en bas de la page Catégories, sous la grille des catégories',
    recommendedSize: '1200 x 200 px',
    creditsPerDay: 2,
  },
  {
    value: 'homepage_category_bottom',
    label: 'Accueil - Sous Catégories',
    labelShort: 'Sous Catégories',
    description: 'Bannière horizontale en page d\'accueil, entre les catégories et le bouton "Explorer tous les outils"',
    recommendedSize: '1200 x 200 px',
    creditsPerDay: 2,
  }
];

export const getPositionByValue = (value) => {
  return bannerPositions.find(p => p.value === value);
};