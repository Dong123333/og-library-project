import { Navigate, Link } from "react-router-dom";
import { Result, Button, Spin } from "antd";
import {useAuth} from "../context/AuthContext.jsx";

export const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen w-full">
                <Spin size="large" tip="Đang tải dữ liệu..." />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export const AdminRoute = ({ children }) => {
    const { isAuthenticated, user, isLoading } = useAuth();
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen w-full">
                <Spin size="large" tip="Đang kiểm tra quyền..." />
            </div>
        );
    }
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    if (user.maVaiTro.maVaiTro !== 'VT003') {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <Result
                    status="403"
                    title="403 Forbidden"
                    subTitle="Xin lỗi, bạn không có quyền truy cập trang quản trị."
                    extra={
                        <Button type="primary" size="large">
                            <Link to="/">Về trang chủ</Link>
                        </Button>
                    }
                />
            </div>
        );
    }
    return children;
};

export const LibrarianRoute = ({ children }) => {
    const { isAuthenticated, user, isLoading } = useAuth();
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen w-full">
                <Spin size="large" tip="Đang kiểm tra quyền..." />
            </div>
        );
    }
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    if (user.maVaiTro.maVaiTro !== 'VT002') {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <Result
                    status="403"
                    title="403 Forbidden"
                    subTitle="Xin lỗi, bạn không có quyền truy cập trang thủ thư."
                    extra={
                        <Button type="primary" size="large">
                            <Link to="/">Về trang chủ</Link>
                        </Button>
                    }
                />
            </div>
        );
    }
    return children;
};