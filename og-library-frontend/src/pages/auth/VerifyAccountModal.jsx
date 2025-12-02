import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message, notification } from 'antd';
import axios from "../../services/axios.customize.jsx";

const VerifyAccountModal = ({ isModalOpen, setIsModalOpen, email, userId }) => {
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [form] = Form.useForm();
    const [api, contextHolder] = notification.useNotification();

    useEffect(() => {
        if (timeLeft === 0) return;
        const intervalId = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(intervalId);
    }, [timeLeft]);

    useEffect(() => {
        if (isModalOpen) {
            form.resetFields();
        }
    }, [isModalOpen, form]);

    const handleVerify = async (values) => {
        setLoading(true);
        try {
            const res = await axios.post('auth/check-code', {
                _id: userId,
                maOTP: values.otp
            });
            if (res) {
                api.success({
                    message: "Kích hoạt thành công!",
                    description: "Bạn có thể đăng nhập ngay bây giờ."
                });
                form.resetFields();
                setIsModalOpen(false);
                localStorage.removeItem('remembered_email');
            }
        } catch (error) {
            api.error({
                message: "Lỗi",
                description: error.message || "Mã OTP không đúng"
            });
            form.resetFields();
        }
        setLoading(false);
    };

    const handleResend = async () => {
        try {
            await axios.post('/auth/resend-otp', { email });

            message.success("Đã gửi lại mã mới!");
            setTimeLeft(60);
        } catch (error) {
            message.error("Không gửi được mã.");
        }
    };

    return (
        <>
            {contextHolder}
            <Modal
                title={<span className="text-2xl font-bold">Kích hoạt tài khoản</span>}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                maskClosable={false}
                centered
            >
                <div className="mb-4">
                    <p>Tài khoản <b>{email}</b> chưa được kích hoạt.</p>
                    <p>Vui lòng nhập mã OTP chúng tôi vừa gửi (hoặc bấm gửi lại).</p>
                </div>

                <Form form={form} onFinish={handleVerify} layout="vertical">
                    <Form.Item
                        className="flex align-center justify-center"
                        name="otp"
                        rules={[{ required: true, len: 6, message: 'Nhập đủ 6 số!' }]}
                    >
                        <Input.OTP length={6} size="large" />
                    </Form.Item>

                    <div className="flex justify-between items-center mt-4">
                        <Button
                            type="link"
                            onClick={handleResend}
                            disabled={timeLeft > 0}
                            className="p-0"
                        >
                            {timeLeft > 0 ? `Gửi lại sau ${timeLeft}s` : "Gửi lại mã"}
                        </Button>

                        <Button type="primary" htmlType="submit" loading={loading}>
                            Xác nhận
                        </Button>
                    </div>
                </Form>
            </Modal>
        </>

    );
};

export default VerifyAccountModal;