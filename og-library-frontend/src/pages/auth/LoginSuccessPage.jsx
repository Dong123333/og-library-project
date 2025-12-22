import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Spin, Result, message } from 'antd';

const LoginSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');

        if (token) {
            localStorage.setItem('access_token', token);
            message.success('Đăng nhập bằng Facebook thành công!');
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        } else {
            message.error('Đăng nhập thất bại. Vui lòng thử lại.');
            navigate('/login');
        }
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Result
                icon={<Spin size="large" />}
                title="Đang xác thực tài khoản..."
                subTitle="Vui lòng đợi trong giây lát, chúng tôi đang thiết lập không gian đọc sách cho bạn."
            />
        </div>
    );
};

export default LoginSuccessPage;