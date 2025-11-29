import React, { useState } from 'react';
import {Form, Input, Button, Divider, notification} from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, GoogleOutlined, FacebookFilled } from '@ant-design/icons';
import {Link, useNavigate} from 'react-router-dom';
import AuthLayout from "../../layouts/auth/index.jsx";
import axios from "../../services/axios.customize";


const RegisterPage = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [api, contextHolder] = notification.useNotification();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const res = await axios.post('auth/register',
                {
                    hoVaTen: values.fullname,
                    email: values.email,
                    matKhau: values.password,
                }
            );
            if (res) {
                api.success({
                    message: "Đăng ký thành công!",
                    description: "Đang chuyển trang..."
                });
                navigate(`/verify/${res._id}`, { state: { email: values.email } });
            }
        } catch (error) {
            api.error({
                message: "Đăng ký thất bại",
                description: error.message,
                placement: 'topRight',
            });
        }
        setLoading(false);

    };

    return (
        <AuthLayout
            title="Tạo tài khoản mới 🚀"
            subtitle="Điền thông tin bên dưới để tham gia cùng chúng tôi."
        >
            {contextHolder}
            <Form
                name="register_form"
                onFinish={onFinish}
                layout="vertical"
                size="large"
                scrollToFirstError
            >
                <Form.Item
                    name="fullname"
                    rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                >
                    <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="Họ và tên" />
                </Form.Item>

                <Form.Item
                    name="email"
                    rules={[
                        { required: true, message: 'Vui lòng nhập Email!' },
                        { type: 'email', message: 'Email không hợp lệ!' }
                    ]}
                >
                    <Input prefix={<MailOutlined className="text-gray-400" />} placeholder="Email" />
                </Form.Item>

                <Form.Item
                    name="password"
                    rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu!' },
                        { min: 6, message: 'Mật khẩu phải từ 6 ký tự trở lên!' }
                    ]}
                    hasFeedback
                >
                    <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="Mật khẩu" />
                </Form.Item>

                <Form.Item
                    name="confirm"
                    dependencies={['password']}
                    hasFeedback
                    rules={[
                        { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Mật khẩu không khớp!'));
                            },
                        }),
                    ]}
                >
                    <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="Nhập lại mật khẩu" />
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 border-none text-lg font-semibold rounded-lg shadow-lg shadow-blue-600/30"
                    >
                        Đăng Ký Ngay
                    </Button>
                </Form.Item>
            </Form>

            <Divider plain><span className="text-gray-400 text-xs uppercase">Hoặc đăng ký với</span></Divider>
            <div className="grid grid-cols-2 gap-4 mb-8">
                <Button icon={<GoogleOutlined />} className="h-10 flex items-center justify-center font-medium">Google</Button>
                <Button icon={<FacebookFilled className="text-blue-600" />} className="h-10 flex items-center justify-center font-medium">Facebook</Button>
            </div>

            <div className="text-center text-gray-600">
                Đã có tài khoản?{' '}
                <Link to="/login" className="text-blue-600 font-bold hover:underline">
                    Đăng nhập ngay
                </Link>
            </div>
        </AuthLayout>
    );
};

export default RegisterPage;