import HomePage from "../pages/HomePage.jsx";
import AuthPage from "../pages/AuthPage.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import LoansPage from "../pages/LoansPage.jsx";
import LibPage from "../pages/LibPage.jsx";

export const authenticateRoutes = [
    {path: "/login" , component: AuthPage},
]

export const readerRoutes = [
    {path: "/" , component: HomePage},
    {path: "/loans" , component: LoansPage},
    {path: "/lib" , component: LibPage},
    {path: "/admin" , component: Dashboard},
]

export const adminRoutes = [

]

