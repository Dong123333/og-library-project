import {createContext, useContext, useState} from "react";

const PageContext = createContext();

export function PageProvider({ children }) {
    const [activePage, setActivePage] = useState("home");
    return (
        <PageContext.Provider value={{ activePage, setActivePage }}>
            {children}
        </PageContext.Provider>
    );
}

export function usePage() {
    return useContext(PageContext);
}
