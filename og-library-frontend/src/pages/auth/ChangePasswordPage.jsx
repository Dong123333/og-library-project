import React, { useState } from 'react';
import {Form, Input, Button, Divider, notification} from 'antd';
import { LockOutlined, SafetyOutlined } from '@ant-design/icons';
import AuthLayout from "../../layouts/auth/index.jsx";
import axios from "../../services/axios.customize";
import {useLocation} from "react-router-dom";

const ChangePasswordPage = () => {
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const userEmail = location.state?.userEmail;
    const [api, contextHolder] = notification.useNotification();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            await axios.post('auth/change-password',{
                maOTP: values.otp,
                email: userEmail,
                matKhau: values.password,
                xacNhanMatKhau: values.confirmPassword,
            });
            api.success({
                message: "Đổi mật khẩu thành công!",
                description: "Vui lòng đăng nhập lại."
            });
            // localStorage.removeItem("access_token");
            window.location.href = "/login";

        } catch (error) {
            api.error(error.response?.data?.message || "Mã OTP không đúng");
        }
        setLoading(false);
    };

    return (
        <AuthLayout
            title="Đổi mật khẩu 🛡️"
            subtitle="Xác thực bằng OTP để thiết lập mật khẩu mới."
        >
            {contextHolder}
            <Form form={form} layout="vertical" onFinish={onFinish} size="large">

                {/* 1. Khu vực lấy mã OTP */}
                <div className="mb-6 rounded-lg flex justify-between items-center">
                    <div>
                        <p className="font-semibold text-gray-700">Bước 1: Nhập mã xác thực</p>
                        <p className="text-sm text-gray-500">Mã sẽ gửi về email đăng ký.</p>
                    </div>
                </div>

                <Form.Item
                    name="otp"
                    rules={[{ required: true, len: 6, message: 'Nhập đủ 6 số OTP!' }]}
                >
                    <Input
                        prefix={<SafetyOutlined className="text-gray-400" />}
                        placeholder="Nhập mã OTP (6 số)"
                        maxLength={6}
                    />
                </Form.Item>

                <Divider />

                {/* 3. Mật khẩu mới */}
                <p className="font-semibold text-gray-700 mb-2">Bước 2: Thiết lập mật khẩu mới</p>

                <Form.Item
                    name="password"
                    rules={[
                        { required: true, message: 'Nhập mật khẩu mới!' },
                        { min: 6, message: 'Mật khẩu > 6 ký tự' }
                    ]}
                >
                    <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu mới" />
                </Form.Item>

                <Form.Item
                    name="confirmPassword"
                    dependencies={['password']}
                    rules={[
                        { required: true, message: 'Xác nhận mật khẩu!' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Không khớp!'));
                            },
                        }),
                    ]}
                >
                    <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu mới" />
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        className="w-full bg-blue-600 h-12"
                    >
                        Xác nhận đổi mật khẩu
                    </Button>
                </Form.Item>
            </Form>
        </AuthLayout>
    );
};

export default ChangePasswordPage;