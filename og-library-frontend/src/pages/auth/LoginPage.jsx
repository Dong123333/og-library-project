import React, {useEffect, useState} from 'react';
import {Form, Input, Button, Checkbox, notification} from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import {useNavigate, useSearchParams} from 'react-router-dom';
import AuthLayout from "../../layouts/auth/index.jsx";
import axios from "../../services/axios.customize";
import VerifyAccountModal from "./VerifyAccountModal.jsx";
import {useAuth} from "../../context/AuthContext.jsx";
import google from "../../assets/images/google.png"
import facebook from "../../assets/images/facebook.png"

const LoginPage = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [userId, setUserId] = useState("");
    const { loginContext } = useAuth();
    const [api, contextHolder] = notification.useNotification();
    const [form] = Form.useForm();
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        const errorType = searchParams.get('error');
        const provider = searchParams.get('provider');

        if (errorType === 'social_conflict') {
            const msg = `Email này đã được liên kết với tài khoản ${provider}. Vui lòng đăng nhập bằng phương thức đó.`;

            api.error({
                description: msg,
                duration: 5
            });

            setSearchParams({});
        } else if (errorType === 'access_denied') {
            api.error({
                description: 'Bạn đã hủy yêu cầu đăng nhập',
                duration: 5
            });
            setSearchParams({});
        } else if (errorType === 'error') {
            api.error({
                description: 'Lỗi đăng nhập',
                duration: 5
            });
            setSearchParams({});
        }
    }, [searchParams]);

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
                    duration: 1,
                    onClose: () => {
                        const role = res.user.maVaiTro.maVaiTro;
                        if (role === 'VT001') {
                            navigate('/');
                        } else if (role === 'VT002') {
                            navigate('/librarian');
                        } else if (role === 'VT003') {
                            navigate('/admin');
                        }
                    }
                });
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

    const handleLogin = (provider) => {
        const apiUrl = import.meta.env.VITE_BACK_END_API_URL;
        window.location.href = `${apiUrl}/api/v1/auth/${provider}`;
    };

    return (
        <AuthLayout
            title="Chào mừng trở lại! 👋"
            subtitle="Vui lòng nhập thông tin để đăng nhập."
            titleFooter="Chưa có tài khoản?"
            actionFooter="Đăng ký miễn phí"
            linkFooter="/register"
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
                autoComplete="off"
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
                    <Input prefix={<MailOutlined className="text-gray-400" />} placeholder="Email"/>
                </Form.Item>

                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                >
                    <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="Mật khẩu"/>
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
            <div className="mt-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-sm text-gray-400">Hoặc đăng nhập bằng</span>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button onClick={() => handleLogin('google')} className="flex items-center justify-center gap-3 h-11 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition cursor-pointer">
                        <img style={{ width: 18, height: 18 }} src={google}  alt='Google'/>
                        Google
                    </button>

                    <button onClick={() => handleLogin('facebook')} className="flex items-center justify-center gap-3 h-11 rounded-lg border border-[#b0b3b8] bg-white text-gray-700 font-medium hover:bg-gray-50 transition cursor-pointer">
                        <img style={{ width: 18, height: 18 }} src={facebook}  alt='Facebook'/>
                        Facebook
                    </button>
                </div>
            </div>
        </AuthLayout>
    );
};

export default LoginPage;