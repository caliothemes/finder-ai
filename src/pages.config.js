import Home from './pages/Home';
import AIDetail from './pages/AIDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "AIDetail": AIDetail,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};