import React, {createContext, useState, useEffect, useContext} from 'react';
import { Spin } from 'antd';
import axios from "../services/axios.customize";

const AuthContext = createContext({
    isAuthenticated: false,
    isLoading: true,
    user: {
        username: "",
        fullName: "",
        role: "",
        _id: ""
    },
    setUser: () => {},
    logout: () => {}
});

export const useAuth = () => {
    return useContext(AuthContext);
}

export const AuthWrapper = ({ children }) => {
    const [user, setUser] = useState({
        username: "",
        fullName: "",
        role: "",
        _id: ""
    });
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        fetchAccount();
    }, []);

    const loginContext = (userData) => {
        setUser(userData);
        setIsAuthenticated(true); // <--- QUAN TRỌNG: Bật cờ này lên thì Header mới đổi
    };

    const fetchAccount = async () => {
        const token = localStorage.getItem("access_token");

        if (!token) {
            setIsLoading(false);
            return;
        }
        try {
            const res = await axios.get('auth/profile');
            if (res) {
                setUser(res);
                setIsAuthenticated(true);
            }
        } catch (error) {
            localStorage.removeItem("access_token");
            setUser({ username: "", fullName: "", role: "", _id: "" });
            setIsAuthenticated(false);
        }

        setIsLoading(false);
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        setUser({ username: "", fullName: "", role: "", _id: "" });
        setIsAuthenticated(false);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            user,
            loginContext,
            isLoading,
            logout
        }}>
            {isLoading ? (
                <div className="flex justify-center items-center h-screen w-full bg-white">
                    <Spin size="large" tip="Đang tải dữ liệu người dùng..." />
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};