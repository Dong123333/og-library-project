import {Fragment} from "react";
import {adminRoutes, publicRoutes, privateRoutes, librarianRoutes} from "./routes/index.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLayout from "./layouts/admin/index.jsx";
import {PageProvider} from "./context/NavContext.jsx";
import {AdminRoute, LibrarianRoute, ProtectedRoute} from "./routes/PrivateRoute.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

const DefaultLayout = ({ children }) => <>{children}</>;

const App = () => {
    return (
        <PageProvider>
            <Router>
                <ScrollToTop />
                <div className="App">
                    <Routes>
                        {publicRoutes.map((route, index) => {
                            const Page = route.component;
                            let Layout = DefaultLayout;
                            if (route.layout === null) Layout = Fragment;
                            else if (route.layout) Layout = route.layout;

                            return (
                                <Route
                                    key={index}
                                    path={route.path}
                                    element={
                                        <Layout>
                                            <Page />
                                        </Layout>
                                    }
                                />
                            );
                        })}

                        {privateRoutes.map((route, index) => {
                            const Page = route.component;
                            const Layout = route.layout || DefaultLayout;

                            return (
                                <Route
                                    key={index}
                                    path={route.path}
                                    element={
                                        <ProtectedRoute>
                                            <Layout>
                                                <Page />
                                            </Layout>
                                        </ProtectedRoute>
                                    }
                                />
                            );
                        })}

                        {adminRoutes.map((route, index) => {
                            const Page = route.component;
                            const Layout = route.layout || AdminLayout;

                            return (
                                <Route
                                    key={index}
                                    path={route.path}
                                    element={
                                        <AdminRoute>
                                            <Layout>
                                                <Page />
                                            </Layout>
                                        </AdminRoute>
                                    }
                                />
                            );
                        })}

                        {librarianRoutes.map((route, index) => {
                            const Page = route.component;
                            const Layout = route.layout || AdminLayout;

                            return (
                                <Route
                                    key={index}
                                    path={route.path}
                                    element={
                                        <LibrarianRoute>
                                            <Layout>
                                                <Page />
                                            </Layout>
                                        </LibrarianRoute>
                                    }
                                />
                            );
                        })}

                    </Routes>
                </div>
            </Router>
        </PageProvider>

    );
};

export default App;