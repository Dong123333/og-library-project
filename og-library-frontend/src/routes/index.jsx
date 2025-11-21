import HomePage from "../pages/reader/HomePage.jsx";
import Dashboard from "../pages/admin/Dashboard.jsx";
import LoansPage from "../pages/reader/LoansPage.jsx";
import LibPage from "../pages/reader/LibPage.jsx";
import LoginPage from "../pages/auth/LoginPage.jsx";
import RegisterPage from "../pages/auth/RegisterPage.jsx";
import VerifyAccountPage from "../pages/auth/VerifyAccountPage.jsx";
import ChangePasswordPage from "../pages/auth/ChangePasswordPage.jsx";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage.jsx";
import ReaderLayout from "../layouts/reader/index.jsx";
import AdminLayout from "../layouts/admin/index.jsx";

export const publicRoutes = [
    { path: "/", component: HomePage, layout: ReaderLayout },
    { path: "/login", component: LoginPage, layout: null },
    { path: "/register", component: RegisterPage, layout: null },
    { path: "/forgot-password", component: ForgotPasswordPage, layout: null },
    { path: "/verify/:id", component: VerifyAccountPage, layout: null },
    {path: "/change-password" , component: ChangePasswordPage, layout: null },
];

export const privateRoutes = [
    { path: "/loans", component: LoansPage, layout: ReaderLayout },
    { path: "/lib", component: LibPage, layout: ReaderLayout },
];

export const adminRoutes = [
    { path: "/admin", component: Dashboard, layout: AdminLayout },
    // { path: "/admin/users", component: UserManagement },
    // { path: "/admin/books", component: BookManagement },
];

