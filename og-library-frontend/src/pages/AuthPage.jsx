import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Divider, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
    UserOutlined, LockOutlined, MailOutlined,
    GoogleOutlined, FacebookFilled, ArrowRightOutlined, PhoneOutlined
} from '@ant-design/icons';

const AuthPage = () => {
    // State để chuyển đổi giữa Login (true) và Register (false)
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);

    // Xử lý khi bấm nút Submit
    const navigate = useNavigate(); // <--- 2. KHAI BÁO HOOK

    const onFinish = (values) => {
        setLoading(true);

        // Giả lập gọi API kiểm tra đăng nhập
        setTimeout(() => {
            setLoading(false);

            // --- 3. LOGIC CHUYỂN TRANG ---
            if (isLogin) {
                message.success('Đăng nhập thành công!');

                // Ví dụ: Nếu số điện thoại là admin thì qua trang Admin, còn lại qua trang Độc giả
                if (values.phone === '0123456789' && values.password === '123') {
                    localStorage.setItem('role','admin');
                } else if (values.phone === '0987654321' && values.password === '123') {
                    localStorage.setItem('role','reader');// Chuyển đến path /reader
                    window.location.href = '/';
                }

            } else {
                message.success('Đăng ký thành công! Vui lòng đăng nhập.');
                setIsLogin(true); // Chuyển về form đăng nhập
            }

        }, 1000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">

            {/* CONTAINER CHÍNH: Dạng Card lớn đổ bóng */}
            <div className="bg-white w-full max-w-5xl h-[600px] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row m-4">

                {/* --- 1. CỘT TRÁI: HÌNH ẢNH & BRANDING --- */}
                <div className="w-full md:w-1/2 relative hidden md:block">
                    {/* Ảnh nền */}
                    <img
                        src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1000&auto=format&fit=crop"
                        alt="Library"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* Lớp phủ màu (Overlay) */}
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 to-black/60 mix-blend-multiply"></div>

                    {/* Nội dung trên ảnh */}
                    <div className="absolute inset-0 flex flex-col justify-between p-12 text-white z-10">
                        <div>
                            <div className="bg-white/20 backdrop-blur-sm w-fit px-3 py-1 rounded-lg border border-white/30 mb-4">
                                <span className="font-bold tracking-widest">OLIVE GALLERY</span>
                            </div>
                            <h1 className="text-4xl font-bold leading-tight">Khám phá tri thức <br/> Kiến tạo tương lai.</h1>
                            <p className="mt-4 text-gray-300 text-lg max-w-xs">
                                Hệ thống thư viện số hiện đại dành riêng cho tất cả mọi độc giả.
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <div className="w-12 h-1 bg-white rounded-full"></div>
                            <div className="w-3 h-1 bg-gray-500 rounded-full"></div>
                            <div className="w-3 h-1 bg-gray-500 rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* --- 2. CỘT PHẢI: FORM ĐĂNG NHẬP/ĐĂNG KÝ --- */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white relative">

                    <div className="max-w-md mx-auto w-full">
                        {/* Header Form */}
                        <div className="mb-8 text-center md:text-left">
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">
                                {isLogin ? 'Chào mừng trở lại! 👋' : 'Tạo tài khoản mới 🚀'}
                            </h2>
                            <p className="text-gray-500">
                                {isLogin
                                    ? 'Vui lòng nhập thông tin để đăng nhập.'
                                    : 'Điền thông tin bên dưới để tham gia cùng chúng tôi.'}
                            </p>
                        </div>

                        {/* Form Ant Design */}
                        <Form
                            name="auth_form"
                            initialValues={{ remember: true }}
                            onFinish={onFinish}
                            layout="vertical"
                            size="large"
                        >
                            {/* Trường Tên (Chỉ hiện khi Đăng ký) */}
                            {!isLogin && (
                                <Form.Item
                                    name="fullname"
                                    rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                                >
                                    <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="Họ và tên đầy đủ" />
                                </Form.Item>
                            )}

                            {/* Trường Phone */}
                            <Form.Item
                                name="phone"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập số điện thoại!' },
                                    {
                                        pattern: /^0\d{9}$/,
                                        message: 'Số điện thoại không hợp lệ (phải có 10 số và bắt đầu bằng số 0)!'
                                    }
                                ]}
                            >
                                <Input
                                    prefix={<PhoneOutlined rotate={90} className="text-gray-400" />}
                                    placeholder="Số điện thoại"
                                    maxLength={10} // Giới hạn nhập 10 ký tự
                                    type="tel"     // Giúp hiện bàn phím số trên điện thoại
                                />
                            </Form.Item>

                            {/* Trường Mật khẩu */}
                            <Form.Item
                                name="password"
                                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                            >
                                <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="Mật khẩu" />
                            </Form.Item>

                            {/* Trường Xác nhận Mật khẩu (Chỉ hiện khi Đăng ký) */}
                            {!isLogin && (
                                <Form.Item
                                    name="confirm"
                                    dependencies={['password']}
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
                            )}

                            {/* Hàng phụ: Remember me & Forgot Password */}
                            {isLogin && (
                                <div className="flex justify-between items-center mb-4">
                                    <Form.Item name="remember" valuePropName="checked" noStyle>
                                        <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                                    </Form.Item>
                                    <a href="#" className="text-blue-600 hover:underline text-sm font-medium">Quên mật khẩu?</a>
                                </div>
                            )}

                            {/* Nút Submit */}
                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 border-none text-lg font-semibold rounded-lg shadow-lg shadow-blue-600/30"
                                >
                                    {isLogin ? 'Đăng Nhập' : 'Đăng Ký Ngay'}
                                </Button>
                            </Form.Item>
                        </Form>

                        {/* Divider & Social Login */}
                        <Divider plain><span className="text-gray-400 text-xs uppercase">Hoặc tiếp tục với</span></Divider>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <Button icon={<GoogleOutlined />} className="h-10 flex items-center justify-center font-medium">Google</Button>
                            <Button icon={<FacebookFilled className="text-blue-600" />} className="h-10 flex items-center justify-center font-medium">Facebook</Button>
                        </div>

                        {/* Chuyển đổi Login/Register */}
                        <div className="text-center text-gray-600">
                            {isLogin ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
                            <span
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-blue-600 font-bold cursor-pointer hover:underline select-none"
                            >
                {isLogin ? 'Đăng ký miễn phí' : 'Đăng nhập ngay'}
              </span>
                        </div>

                    </div>
                </div>
            </div>

            {/* Footer nhỏ ngoài cùng */}
            <div className="fixed bottom-4 text-center text-xs text-gray-400 w-full">
                © 2025 Olive Gallery Library System. Privacy Policy & Terms.
            </div>
        </div>
    );
};

export default AuthPage;