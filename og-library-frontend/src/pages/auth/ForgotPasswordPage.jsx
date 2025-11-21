import React, { useState } from 'react';
import {Form, Input, Button, message, notification} from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from "../../layouts/auth/index.jsx";
import axios from "../../services/axios.customize";

const ForgotPasswordPage = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [api, contextHolder] = notification.useNotification();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            await axios.post('auth/retry-password',{email: values.email});
            api.success({
                message: "Đã gửi mã OTP! Vui lòng kiểm tra email.",
                description: "Đang chuyển trang..."
            });
            navigate('/change-password', { state: { userEmail: values.email } });
        } catch (error) {
            api.error(error.response?.data?.message || "Lỗi gửi email");
        }
        setLoading(false);
    };

    return (
        <AuthLayout
            title="Quên mật khẩu? 🔒"
            subtitle="Nhập email của bạn để nhận mã đặt lại mật khẩu."
        >
            {contextHolder}
            <Form onFinish={onFinish} layout="vertical" size="large">
                <Form.Item
                    name="email"
                    rules={[
                        { required: true, message: 'Vui lòng nhập email!' },
                        { type: 'email', message: 'Email không hợp lệ!' }
                    ]}
                >
                    <Input prefix={<MailOutlined />} placeholder="Email đã đăng ký" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block className="h-12 bg-blue-600">
                        Gửi mã xác nhận
                    </Button>
                </Form.Item>
            </Form>

            <div className="text-center mt-4">
                <Link to="/login" className="text-gray-500 hover:text-blue-600">
                    <ArrowLeftOutlined /> Quay lại đăng nhập
                </Link>
            </div>
        </AuthLayout>
    );
};

export default ForgotPasswordPage;