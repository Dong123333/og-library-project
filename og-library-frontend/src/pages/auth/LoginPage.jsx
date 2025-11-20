import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Divider } from 'antd';
import { LockOutlined, GoogleOutlined, FacebookFilled, MailOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import AuthLayout from "../../layouts/auth/index.jsx";
const LoginPage = () => {
    const [loading, setLoading] = useState(false);

    const onFinish = (values) => {
        console.log('Login Success:', values);
        setLoading(true);
        // Gọi API login tại đây
    };

    return (
        <AuthLayout
            title="Chào mừng trở lại! 👋"
            subtitle="Vui lòng nhập thông tin để đăng nhập."
        >
            <Form
                name="login_form"
                initialValues={{ remember: true }}
                onFinish={onFinish}
                layout="vertical"
                size="large"
            >
                {/* Trường Email (Khuyên dùng Email thay vì Phone để khớp Backend) */}
                <Form.Item
                    name="email"
                    rules={[
                        { required: true, message: 'Vui lòng nhập Email!' },
                        { type: 'email', message: 'Email không hợp lệ!' }
                    ]}
                >
                    <Input prefix={<MailOutlined className="text-gray-400" />} placeholder="Email" />
                </Form.Item>

                {/* Trường Password */}
                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                >
                    <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="Mật khẩu" />
                </Form.Item>

                {/* Remember & Forgot Password */}
                <div className="flex justify-between items-center mb-4">
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                        <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                    </Form.Item>
                    <a href="#" className="text-blue-600 hover:underline text-sm font-medium">Quên mật khẩu?</a>
                </div>

                {/* Nút Submit */}
                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 border-none text-lg font-semibold rounded-lg shadow-lg shadow-blue-600/30"
                    >
                        Đăng Nhập
                    </Button>
                </Form.Item>
            </Form>

            {/* Social Login */}
            <Divider plain><span className="text-gray-400 text-xs uppercase">Hoặc tiếp tục với</span></Divider>
            <div className="grid grid-cols-2 gap-4 mb-8">
                <Button icon={<GoogleOutlined />} className="h-10 flex items-center justify-center font-medium">Google</Button>
                <Button icon={<FacebookFilled className="text-blue-600" />} className="h-10 flex items-center justify-center font-medium">Facebook</Button>
            </div>

            {/* Link chuyển trang */}
            <div className="text-center text-gray-600">
                Chưa có tài khoản?{' '}
                <Link to="/register" className="text-blue-600 font-bold hover:underline">
                    Đăng ký miễn phí
                </Link>
            </div>
        </AuthLayout>
    );
};

export default LoginPage;