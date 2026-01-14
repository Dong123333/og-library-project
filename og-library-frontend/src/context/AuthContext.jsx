import React, {createContext, useState, useEffect, useContext} from 'react';
import { Spin } from 'antd';
import axios from "../services/axios.customize";

const defaultUser = {
    _id: "",
    hoVaTen: "",
    email: "",
    ngaySinh: "",
    soDienThoai: "",
    diaChi: "",
    hinhAnh: null,
    maVaiTro: null,
    nguonDangNhap: null,
};

const AuthContext = createContext({
    isAuthenticated: false,
    isLoading: true,
    user: defaultUser,
    setUser: () => {},
    logout: () => {}
});

export const useAuth = () => {
    return useContext(AuthContext);
}

export const AuthWrapper = ({ children }) => {
    const [user, setUser] = useState(defaultUser);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        fetchAccount();
    }, []);

    const loginContext = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
    };

    const fetchAccount = async () => {
        const token = localStorage.getItem("access_token");

        if (!token) {
            setIsLoading(false);
            return;
        }
        try {
            const res = await axios.get('auth/profile');
            const userData = res.user || res;
            if (userData && userData._id) {
                setUser(userData);
                setIsAuthenticated(true);
            }
        } catch (error) {
            localStorage.removeItem("access_token");
            setUser(defaultUser);
            setIsAuthenticated(false);
        }

        setIsLoading(false);
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        setUser(defaultUser);
        setIsAuthenticated(false);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            user,
            setUser,
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