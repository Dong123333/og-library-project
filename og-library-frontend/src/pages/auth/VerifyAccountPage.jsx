import React, { useState, useEffect } from 'react';
import {Form, Button, Typography, message, Input, notification} from 'antd';
import {useNavigate, useLocation, useParams} from 'react-router-dom';
import AuthLayout from "../../layouts/auth/index.jsx";
import axios from "../../services/axios.customize.jsx";

const { Text } = Typography;

const VerifyAccountPage = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const email = location.state?.email;
    const [timeLeft, setTimeLeft] = useState(0);
    const [api, contextHolder] = notification.useNotification();
    const [form] = Form.useForm();

    useEffect(() => {
        if (!email) {
            message.error("Không tìm thấy thông tin đăng ký. Vui lòng đăng ký lại.");
            navigate('/register');
        }
    }, [email, navigate]);

    useEffect(() => {
        if (timeLeft === 0) return;
        const intervalId = setInterval(() => {
            setTimeLeft((prevTime) => prevTime - 1);
        }, 1000);
        return () => clearInterval(intervalId);
    }, [timeLeft]);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const res = await axios.post('auth/check-code', {
                _id: id,
                maOTP: values.otp
            });

            if (res) {
                api.success({
                    message: "Xác thực thành công! 🎉",
                    description: "Tài khoản của bạn đã được kích hoạt. Vui lòng đăng nhập.",
                    duration: 1,
                    onClose: () => {
                        navigate('/login');
                    }
                });
                form.resetFields();
                localStorage.removeItem('remembered_email');
            }
        } catch (error) {
            api.error({
                message: "Xác thực thất bại",
                description: error.message || "Mã OTP không đúng hoặc đã hết hạn."
            });
            form.resetFields();

        }
        setLoading(false);
    };

    const handleResendOtp = async () => {
        try {
            await axios.post('auth/resend-otp', {email});
            api.success({
                message: "Gửi lại thành công! 🎉",
                description: "Đã gửi lại mã OTP mới vào email của bạn."
            });
            setTimeLeft(60);
        } catch (error) {
            api.error("Gửi lại thất bại. Vui lòng thử lại sau.");
        }
    };

    return (
        <AuthLayout
            title="Xác thực OTP 🔐"
            subtitle="Chúng tôi đã gửi mã xác nhận 6 số đến email của bạn."
        >
            {contextHolder}
            <div className="text-center mb-6">
                <Text type="secondary">Gửi đến: </Text>
                <Text strong>{email}</Text>
            </div>

            <Form
                form={form}
                name="otp_form"
                onFinish={onFinish}
                layout="vertical"
                className="flex flex-col items-center"
            >
                <Form.Item
                    name="otp"
                    rules={[
                        { required: true, message: 'Vui lòng nhập mã OTP!' },
                        { len: 6, message: 'Mã OTP phải có đúng 6 ký tự!' }
                    ]}
                >
                    <Input.OTP length={6} size="large" />
                </Form.Item>

                <Form.Item className="w-full">
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 border-none text-lg font-semibold rounded-lg mt-4"
                    >
                        Xác nhận
                    </Button>
                </Form.Item>
            </Form>

            <div className="text-center mt-4">
                <Text type="secondary">Chưa nhận được mã? </Text>
                <Button
                    type="link"
                    onClick={handleResendOtp}
                    disabled={timeLeft > 0}
                    className="p-0 h-auto font-medium"
                    style={{
                        color: timeLeft > 0 ? '#999' : '#1890ff',
                        cursor: timeLeft > 0 ? 'not-allowed' : 'pointer'
                    }}
                >
                    {timeLeft > 0
                        ? `Gửi lại sau ${timeLeft}s`
                        : 'Gửi lại ngay'
                    }
                </Button>
            </div>
        </AuthLayout>
    );
};

export default VerifyAccountPage;