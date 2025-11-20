import HomePage from "../pages/HomePage.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import LoansPage from "../pages/LoansPage.jsx";
import LibPage from "../pages/LibPage.jsx";
import LoginPage from "../pages/auth/LoginPage.jsx";
import RegisterPage from "../pages/auth/RegisterPage.jsx";
import VerifyAccountPage from "../pages/auth/VerifyAccountPage.jsx";

export const authenticateRoutes = [
    {path: "/login" , component: LoginPage},
    {path: "/register" , component: RegisterPage},
    {path: `/verify/:id` , component: VerifyAccountPage},
]

export const readerRoutes = [
    {path: "/" , component: HomePage},
    {path: "/loans" , component: LoansPage},
    {path: "/lib" , component: LibPage},
    {path: "/admin" , component: Dashboard},
]

export const adminRoutes = [

]

