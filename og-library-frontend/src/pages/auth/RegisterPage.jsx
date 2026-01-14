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
                    description: "Đang chuyển trang...",
                    duration: 0.6,
                    onClose: () => {
                        navigate(`/verify/${res._id}`, { state: { email: values.email } });
                    }
                });
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
            titleFooter="Đã có tài khoản?"
            actionFooter="Đăng nhập ngay"
            linkFooter="/login"
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
        </AuthLayout>
    );
};

export default RegisterPage;