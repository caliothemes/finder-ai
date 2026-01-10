import AIDetail from './pages/AIDetail';
import AINews from './pages/AINews';
import AINewsDetail from './pages/AINewsDetail';
import AIToolsCategory from './pages/AIToolsCategory';
import Admin from './pages/Admin';
import BannerManager from './pages/BannerManager';
import Categories from './pages/Categories';
import Category from './pages/Category';
import Explore from './pages/Explore';
import Favorites from './pages/Favorites';
import FinderGPT from './pages/FinderGPT';
import Home from './pages/Home';
import LegalMentions from './pages/LegalMentions';
import ProAccount from './pages/ProAccount';
import Profile from './pages/Profile';
import SubmitAI from './pages/SubmitAI';
import Tarifs from './pages/Tarifs';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIDetail": AIDetail,
    "AINews": AINews,
    "AINewsDetail": AINewsDetail,
    "AIToolsCategory": AIToolsCategory,
    "Admin": Admin,
    "BannerManager": BannerManager,
    "Categories": Categories,
    "Category": Category,
    "Explore": Explore,
    "Favorites": Favorites,
    "FinderGPT": FinderGPT,
    "Home": Home,
    "LegalMentions": LegalMentions,
    "ProAccount": ProAccount,
    "Profile": Profile,
    "SubmitAI": SubmitAI,
    "Tarifs": Tarifs,
}

export const pagesConfig = {
    mainPage: "BannerManager",
    Pages: PAGES,
    Layout: __Layout,
};