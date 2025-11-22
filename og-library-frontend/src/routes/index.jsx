import HomePage from "../pages/reader/HomePage.jsx";
import Dashboard from "../pages/admin/Dashboard.jsx";
import LoansPage from "../pages/reader/LoansPage.jsx";
import LibraryPage from "../pages/reader/LibraryPage.jsx";
import LoginPage from "../pages/auth/LoginPage.jsx";
import RegisterPage from "../pages/auth/RegisterPage.jsx";
import VerifyAccountPage from "../pages/auth/VerifyAccountPage.jsx";
import ChangePasswordPage from "../pages/auth/ChangePasswordPage.jsx";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage.jsx";
import ReaderLayout from "../layouts/reader/index.jsx";
import AdminLayout from "../layouts/admin/index.jsx";
import CategoryManage from "../pages/admin/CategoryManage.jsx";
import AuthorManage from "../pages/admin/AuthorManage.jsx";
import PublisherManage from "../pages/admin/PublisherManage.jsx";
import BookManage from "../pages/admin/BookManage.jsx";

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
    { path: "/library", component: LibraryPage, layout: ReaderLayout },
];

export const adminRoutes = [
    { path: "/admin", component: Dashboard, layout: AdminLayout },
    { path: "/admin/categories", component: CategoryManage, layout: AdminLayout },
    { path: "/admin/authors", component: AuthorManage, layout: AdminLayout },
    { path: "/admin/publishers", component: PublisherManage, layout: AdminLayout },
    { path: "/admin/books", component: BookManage, layout: AdminLayout },
];

