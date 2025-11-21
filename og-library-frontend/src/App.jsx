// App.jsx
import {Fragment} from "react";
import {adminRoutes, publicRoutes, privateRoutes} from "./routes/index.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLayout from "./layouts/admin/index.jsx";
import {PageProvider} from "./context/NavContext.jsx";
import {AdminRoute, ProtectedRoute} from "./routes/PrivateRoute.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

const DefaultLayout = ({ children }) => <>{children}</>;

const App = () => {
    // const { user } = useContext(AuthContext);

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
                                        <ProtectedRoute> {/* Bọc bảo vệ */}
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

                    </Routes>
                </div>
            </Router>
        </PageProvider>

    );


};

export default App;