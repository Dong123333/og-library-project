// App.jsx
import {Fragment, useEffect, useState} from "react";
import {authenticateRoutes, readerRoutes, adminRoutes} from "./routes/index.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ReaderLayout from "./layouts/reader/index.jsx";
import AdminLayout from "./layouts/admin/index.jsx";
import {PageProvider} from "./context/NavContext.jsx";
import HomePage from "./pages/HomePage.jsx";

const DefaultLayout = ({ children }) => <>{children}</>;

const App = () => {
    const [role, setRole] = useState("");
    useEffect(() => {
        const savedRole = localStorage.getItem("role");
        if (savedRole && savedRole !== role) {
            setRole(savedRole);
        }
    }, []);

    let routes = [];

    if (!role) {
        // guest
        routes = [
            { path: "/", component: HomePage, layout: ReaderLayout },
            ...authenticateRoutes.map(r => ({ ...r, layout: null }))
        ];
    } else if (role === "admin") {
        routes = adminRoutes.map(r => ({ ...r, layout: AdminLayout }));
    } else if (role === "reader") {
        routes = readerRoutes.map(r => ({ ...r, layout: ReaderLayout }));
    }

    return (
        <>
            <PageProvider>
            <Router>
                <div className="App">
                    <Routes>
                        {routes.map((route, index) => {
                            const Page = route.component;
                            const Layout = route.layout ? route.layout : DefaultLayout;
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
                    </Routes>
                </div>
            </Router>
            </PageProvider>
        </>

    );


};

export default App;