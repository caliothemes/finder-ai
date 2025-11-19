import Home from './pages/Home';
import AIDetail from './pages/AIDetail';
import SubmitAI from './pages/SubmitAI';
import Categories from './pages/Categories';
import Category from './pages/Category';
import Favorites from './pages/Favorites';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "AIDetail": AIDetail,
    "SubmitAI": SubmitAI,
    "Categories": Categories,
    "Category": Category,
    "Favorites": Favorites,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};