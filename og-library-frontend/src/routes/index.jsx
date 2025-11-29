import HomePage from "../pages/reader/HomePage.jsx";
import Dashboard from "../pages/librarian/Dashboard.jsx";
import LoansPage from "../pages/reader/LoansPage.jsx";
import LibraryPage from "../pages/reader/LibraryPage.jsx";
import LoginPage from "../pages/auth/LoginPage.jsx";
import RegisterPage from "../pages/auth/RegisterPage.jsx";
import VerifyAccountPage from "../pages/auth/VerifyAccountPage.jsx";
import ChangePasswordPage from "../pages/auth/ChangePasswordPage.jsx";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage.jsx";
import ReaderLayout from "../layouts/reader/index.jsx";
import AdminLayout from "../layouts/admin/index.jsx";
import CategoryManage from "../pages/librarian/CategoryManage.jsx";
import AuthorManage from "../pages/librarian/AuthorManage.jsx";
import PublisherManage from "../pages/librarian/PublisherManage.jsx";
import BookManage from "../pages/librarian/BookManage.jsx";
import UserManage from "../pages/admin/UserManage.jsx";
import BookDetailPage from "../pages/reader/BookDetailPage.jsx";
import LoanManage from "../pages/librarian/LoanManage.jsx";
import BookcasePage from "../pages/reader/BookcasePage.jsx";
import LibrarianLayout from "../layouts/librarian/index.jsx";
import PenaltyManage from "../pages/librarian/PenaltyManage.jsx";
import PaymentResult from "../pages/reader/PaymentResult.jsx";
import ProfilePage from "../pages/reader/ProfilePage.jsx";

export const publicRoutes = [
    { path: "/", component: HomePage, layout: ReaderLayout },
    { path: "/library", component: LibraryPage, layout: ReaderLayout },
    { path: "/library/:id", component: BookDetailPage, layout: ReaderLayout },
    { path: "/login", component: LoginPage, layout: null },
    { path: "/register", component: RegisterPage, layout: null },
    { path: "/forgot-password", component: ForgotPasswordPage, layout: null },
    { path: "/verify/:id", component: VerifyAccountPage, layout: null },
    {path: "/change-password" , component: ChangePasswordPage, layout: null },
];

export const privateRoutes = [
    { path: "/loans", component: LoansPage, layout: ReaderLayout },
    { path: "/bookcase", component: BookcasePage, layout: ReaderLayout },
    { path: "/payment-result", component: PaymentResult, layout: ReaderLayout },
    { path: "/profile", component: ProfilePage, layout: ReaderLayout },
];

export const adminRoutes = [
    { path: "/admin", component: Dashboard, layout: AdminLayout },
    { path: "/admin/users", component: UserManage, layout: AdminLayout },
];

export const librarianRoutes = [
    { path: "/librarian", component: Dashboard, layout: LibrarianLayout },
    { path: "/librarian/categories", component: CategoryManage, layout: LibrarianLayout },
    { path: "/librarian/authors", component: AuthorManage, layout: LibrarianLayout },
    { path: "/librarian/publishers", component: PublisherManage, layout: LibrarianLayout },
    { path: "/librarian/books", component: BookManage, layout: LibrarianLayout },
    { path: "/librarian/loans", component: LoanManage, layout: LibrarianLayout },
    { path: "/librarian/penalties", component: PenaltyManage, layout: LibrarianLayout },
];

