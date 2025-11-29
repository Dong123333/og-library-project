import React, {useEffect, useState} from 'react';
import {Form, Input, Button, Checkbox, Divider, notification} from 'antd';
import { LockOutlined, GoogleOutlined, FacebookFilled, MailOutlined } from '@ant-design/icons';
import {Link, useNavigate} from 'react-router-dom';
import AuthLayout from "../../layouts/auth/index.jsx";
import axios from "../../services/axios.customize";
import VerifyAccountModal from "./VerifyAccountModal.jsx";
import {useAuth} from "../../context/AuthContext.jsx";

const LoginPage = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [userId, setUserId] = useState("");
    const { loginContext } = useAuth();
    const [api, contextHolder] = notification.useNotification();
    const [form] = Form.useForm();

    useEffect(() => {
        const savedEmail = localStorage.getItem('remembered_email');
        if (savedEmail) {
            form.setFieldsValue({
                email: savedEmail,
                remember: true
            });
        }
    }, [form]);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const res = await axios.post('auth/login',
                {
                    email: values.email,
                    matKhau: values.password,
                }
            );
            if (res) {
                if (values.remember) {
                    localStorage.setItem('access_token', res.access_token);
                    localStorage.setItem('remembered_email', values.email);
                } else {
                    sessionStorage.setItem('access_token', res.access_token);
                    localStorage.removeItem('remembered_email');
                }
                loginContext(res.user);

                api.success({
                    message: "Đăng nhập thành công!",
                    description: "Đang chuyển trang...",
                    duration: 2
                });

                const role = res.user.maVaiTro;
                if (role === 'VT001') {
                    navigate('/');
                } else if (role === 'VT002') {
                    navigate('/librarian');
                } else if (role === 'VT003') {
                    navigate('/admin');
                }
            }
        } catch (error) {
            api.error({
                message: "Đăng nhập thất bại",
                description: error.message,
                placement: 'topRight',
            });
            if (error.statusCode === 412) {
                setEmail(values.email);
                setIsModalOpen(true);
                const res = await axios.post('/auth/resend-otp', { email: values.email });
                if (res) {
                    setUserId(res._id)
                }
            }
        }
        setLoading(false);

    };

    return (
        <AuthLayout
            title="Chào mừng trở lại! 👋"
            subtitle="Vui lòng nhập thông tin để đăng nhập."
        >
            {contextHolder}
            <VerifyAccountModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                email={email}
                userId={userId}
            />
            <Form
                form={form}
                name="login_form"
                initialValues={{ remember: true }}
                onFinish={onFinish}
                layout="vertical"
                size="large"
            >
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
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                >
                    <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="Mật khẩu" />
                </Form.Item>

                <div className="flex justify-between items-center mb-4">
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                        <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                    </Form.Item>
                    <a href="/forgot-password" className="text-blue-600 hover:underline text-sm font-medium">Quên mật khẩu?</a>
                </div>

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

            <Divider plain><span className="text-gray-400 text-xs uppercase">Hoặc tiếp tục với</span></Divider>
            <div className="grid grid-cols-2 gap-4 mb-8">
                <Button icon={<GoogleOutlined />} className="h-10 flex items-center justify-center font-medium">Google</Button>
                <Button icon={<FacebookFilled className="text-blue-600" />} className="h-10 flex items-center justify-center font-medium">Facebook</Button>
            </div>

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