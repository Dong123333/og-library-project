import React, { useEffect, useState } from 'react';
import {
    Layout, Row, Col, Card, Form, Input, Button,
    DatePicker, message, Tabs, Tag, Avatar, Spin
} from 'antd';
import {
    UserOutlined, LockOutlined, SaveOutlined,
    MailOutlined, PhoneOutlined, EnvironmentOutlined, CalendarOutlined, ArrowRightOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {useAuth} from "../../context/AuthContext.jsx";
import axios from '../../services/axios.customize';
import {useNavigate} from "react-router-dom";

const { Content } = Layout;

const ProfilePage = () => {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();

    const [formInfo] = Form.useForm();
    const [formPass] = Form.useForm();

    useEffect(() => {
        const fetchFullProfile = async () => {
            setDataLoading(true);
            try {
                const res = await axios.get('/auth/profile');
                const dataToCheck = res.user || res;
                if (dataToCheck) {
                    const userData = dataToCheck;
                    setUser(userData);
                    formInfo.setFieldsValue({
                        hoVaTen: userData.hoVaTen,
                        email: userData.email,
                        soDienThoai: userData.soDienThoai,
                        diaChi: userData.diaChi,
                        ngaySinh: userData.ngaySinh ? dayjs(userData.ngaySinh) : null,
                    });
                }
            } catch (error) {
                messageApi.error("Không thể tải thông tin người dùng");
            }
            setDataLoading(false);
        };
        fetchFullProfile()
    }, []);

    const handleUpdateInfo = async (values) => {
        setLoading(true);
        try {
            const payload = {
                ...values,
                ngaySinh: values.ngaySinh ? values.ngaySinh.toISOString() : null
            };

            const res = await axios.patch(`/nguoi-dung/${user._id}`, payload);

            if (res) {
                messageApi.success("Cập nhật hồ sơ thành công!");
                const newUserParams = {
                    ...user,
                    ...payload,
                    hoVaTen: values.hoVaTen
                };

                setUser(newUserParams);
            }
        } catch (error) {
            messageApi.error(error.response?.data?.message || "Lỗi cập nhật");
        }
        setLoading(false);
    };

    const handleChangePass = async (values) => {
        try {
            const res = await axios.post('/auth/change-password-profile', values);
            if (res) {
                messageApi.success("Đổi mật khẩu thành công!");
                formPass.resetFields();
            }
        }catch (e) {
            messageApi.error(e.message);
        }
    }

    return (
        <Layout className="min-h-screen" style={{ backgroundColor: 'transparent'}}>
            {contextHolder}
            <Content className="max-w-5xl mx-auto w-full">
                <div className="flex items-center gap-2 mb-6 text-gray-500 cursor-pointer hover:text-blue-600 w-fit" onClick={() => navigate("/")}>
                    <ArrowRightOutlined className="rotate-180" /> Quay lại
                </div>
                <Spin spinning={dataLoading} tip="Đang tải hồ sơ...">
                    <Row gutter={[24, 24]} align="stretch">
                        <Col xs={24} md={8}>
                            <Card className="h-full shadow-sm text-center border-t-4 border-t-blue-600 rounded-lg">
                                <div className="relative inline-block mb-4 group">
                                    <Avatar
                                        size={120}
                                        icon={<UserOutlined />}
                                        className="border-4 border-white shadow-md"
                                        style={{ backgroundColor: '#1890ff' }}
                                    />
                                </div>

                                <h2 className="text-xl font-bold text-gray-800 mb-1">
                                    {user.hoVaTen || "Thành viên mới"}
                                </h2>
                                <p className="text-gray-500 mb-3">{user.email}</p>

                                <Tag color="blue" className="px-3 py-1 rounded-full text-sm">
                                    {user.maVaiTro?.tenVaiTro?.toUpperCase()}
                                </Tag>

                                <div className="mt-8 text-left space-y-4 border-t pt-6">
                                    <div className="flex items-center text-gray-600">
                                        <MailOutlined className="mr-3 text-blue-500 text-lg" />
                                        <span className="truncate">{user.email}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <CalendarOutlined className="mr-3 text-green-500 text-lg" />
                                        <span>{user.ngaySinh ? dayjs(user.ngaySinh).format('DD/MM/YYYY') : "Chưa cập nhật ngày sinh"}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <PhoneOutlined className="mr-3 text-green-500 text-lg" />
                                        <span>{user.soDienThoai || "Chưa cập nhật SĐT"}</span>
                                    </div>
                                    <div className="flex items-start text-gray-600">
                                        <EnvironmentOutlined className="mr-3 text-red-500 text-lg mt-1" />
                                        <span>{user.diaChi || "Chưa cập nhật địa chỉ"}</span>
                                    </div>
                                </div>
                            </Card>
                        </Col>

                        <Col xs={24} md={16}>
                            <Card className="h-full shadow-sm rounded-lg" bodyStyle={{padding: '0 24px 24px 24px' }}>
                                <Tabs defaultActiveKey="1" items={[
                                    {
                                        key: '1',
                                        label: <span className="font-medium"><UserOutlined /> Thông tin cá nhân</span>,
                                        children: (
                                            <Form
                                                form={formInfo}
                                                layout="vertical"
                                                onFinish={handleUpdateInfo}
                                                className="mt-4"
                                            >
                                                <Row gutter={16}>
                                                    <Col span={24}>
                                                        <Form.Item name="hoVaTen" label="Họ và Tên" rules={[{ required: true, message: 'Nhập họ tên' }]}>
                                                            <Input prefix={<UserOutlined className="text-gray-400" />} size="large" />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={12}>
                                                        <Form.Item name="email" label="Email">
                                                            <Input prefix={<MailOutlined className="text-gray-400" />} disabled className="bg-gray-50" size="large" />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={12}>
                                                        <Form.Item name="soDienThoai" label="Số điện thoại">
                                                            <Input prefix={<PhoneOutlined className="text-gray-400" />} size="large" />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={12}>
                                                        <Form.Item name="ngaySinh" label="Ngày sinh">
                                                            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} size="large" placeholder="Chọn ngày" />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={12}>
                                                        <Form.Item name="diaChi" label="Địa chỉ">
                                                            <Input prefix={<EnvironmentOutlined className="text-gray-400" />} size="large" />
                                                        </Form.Item>
                                                    </Col>
                                                </Row>

                                                <div className="text-right mt-7">
                                                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading} size="large" className="px-8">
                                                        Lưu thay đổi
                                                    </Button>
                                                </div>
                                            </Form>
                                        )
                                    },
                                    {
                                        key: '2',
                                        label: <span className="font-medium"><LockOutlined /> Đổi mật khẩu</span>,
                                        children: (
                                            <div style= {{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                <Form form={formPass} layout="vertical" onFinish={handleChangePass} style={{ marginTop: '1rem', maxWidth: '32rem', marginLeft: 'auto', marginRight: 'auto', width: '100%' }}>
                                                    <Form.Item
                                                        name="matKhauCu"
                                                        label="Mật khẩu hiện tại"
                                                        rules={[{ required: true, message: 'Nhập mật khẩu cũ' }]}
                                                    >
                                                        <Input.Password prefix={<LockOutlined />} size="large" />
                                                    </Form.Item>

                                                    <Form.Item
                                                        name="matKhauMoi"
                                                        label="Mật khẩu mới"
                                                        rules={[{ required: true, message: 'Nhập mật khẩu mới' }, { min: 6, message: 'Tối thiểu 6 ký tự' }]}
                                                    >
                                                        <Input.Password prefix={<LockOutlined />} size="large" />
                                                    </Form.Item>

                                                    <Form.Item
                                                        name="xacNhanMatKhauMoi"
                                                        label="Xác nhận mật khẩu mới"
                                                        dependencies={['matKhauMoi']}
                                                        rules={[
                                                            { required: true, message: 'Xác nhận lại mật khẩu' },
                                                            ({ getFieldValue }) => ({
                                                                validator(_, value) {
                                                                    if (!value || getFieldValue('matKhauMoi') === value) {
                                                                        return Promise.resolve();
                                                                    }
                                                                    return Promise.reject(new Error('Mật khẩu không khớp!'));
                                                                },
                                                            }),
                                                        ]}
                                                    >
                                                        <Input.Password prefix={<LockOutlined />} size="large" />
                                                    </Form.Item>

                                                    <Button type="primary" htmlType="submit" danger block size="large" loading={loading} className="mt-4">
                                                        Cập nhật mật khẩu
                                                    </Button>
                                                </Form>
                                            </div>
                                        )
                                    }
                                ]} />
                            </Card>
                        </Col>
                    </Row>
                </Spin>

            </Content>
        </Layout>
    );
};

export default ProfilePage;