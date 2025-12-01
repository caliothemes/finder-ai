import Home from './pages/Home';
import AIDetail from './pages/AIDetail';
import SubmitAI from './pages/SubmitAI';
import Categories from './pages/Categories';
import Category from './pages/Category';
import Favorites from './pages/Favorites';
import Explore from './pages/Explore';
import ProAccount from './pages/ProAccount';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import BannerManager from './pages/BannerManager';
import LegalMentions from './pages/LegalMentions';
import AINews from './pages/AINews';
import AINewsDetail from './pages/AINewsDetail';
import FinderGPT from './pages/FinderGPT';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "AIDetail": AIDetail,
    "SubmitAI": SubmitAI,
    "Categories": Categories,
    "Category": Category,
    "Favorites": Favorites,
    "Explore": Explore,
    "ProAccount": ProAccount,
    "Profile": Profile,
    "Admin": Admin,
    "BannerManager": BannerManager,
    "LegalMentions": LegalMentions,
    "AINews": AINews,
    "AINewsDetail": AINewsDetail,
    "FinderGPT": FinderGPT,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};