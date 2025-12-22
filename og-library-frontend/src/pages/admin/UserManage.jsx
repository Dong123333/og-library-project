import React, { useEffect, useState } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    Space,
    message,
    Popconfirm,
    Row,
    Col,
    Select,
    DatePicker,
    Tag,
    Pagination, Menu
} from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    UserOutlined,
    LockOutlined,
    GoogleOutlined, FacebookFilled, FilterOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from "../../services/axios.customize";
import email from "../../assets/images/email-authentication.png"
import facebook from "../../assets/images/facebook.png"
import google from "../../assets/images/google.png"

const UserManage = () => {
    const [listUser, setListUser] = useState([]);
    const [loading, setLoading] = useState(false);

    const [total, setTotal] = useState(0);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const [roles, setRoles] = useState([]);

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [current, pageSize]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/nguoi-dung?page=${current}&limit=${pageSize}`);
            if (res && res.result) {
                setListUser(res.result);
                setTotal(res.meta.total);
            }
        } catch (error) {
            messageApi.error("Có lỗi xảy ra!!!");
        }
        setLoading(false);
    };

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/vai-tro');
            if (res && Array.isArray(res)) {
                setRoles(res);
            }
        } catch (error) {
            messageApi.error("Có lỗi xảy ra!!!");
        }
        setLoading(false);
    };

    const handleSave = async (values) => {
        try {
            const dataToSend = {
                ...values,
                ngaySinh: values.ngaySinh ? values.ngaySinh.toISOString() : null,
            };

            if (editingUser) {
                await axios.patch(`/nguoi-dung/${editingUser._id}`, dataToSend);
                messageApi.success("Cập nhật người dùng thành công");
            } else {
                await axios.post('/nguoi-dung',dataToSend);
                messageApi.success("Thêm người dùng thành công");
            }

            handleCancel();
            fetchUsers();
        } catch (error) {
            messageApi.error(error.message);
        }
    };

    const handleEdit = (record) => {
        setEditingUser(record);
        form.setFieldsValue({
            hoVaTen: record.hoVaTen,
            email: record.email,
            soDienThoai: record.soDienThoai,
            diaChi: record.diaChi,
            maVaiTro: record.maVaiTro?._id,
            ngaySinh: record.ngaySinh ? dayjs(record.ngaySinh) : null,
            trangThai: record.trangThai,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/nguoi-dung/${id}`);
            messageApi.success("Đã xóa người dùng");
            fetchUsers();
        } catch (error) {
            messageApi.error("Xóa thất bại");
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
        setEditingUser(null);
    };

    const columns = [
        {
            title: 'STT',
            key: 'stt',
            width: 60,
            align: 'center',
            render: (text, record, index) => {
                return (
                    <b>
                        {(current - 1) * pageSize + index + 1}
                    </b>
                );
            },
        },
        {
            title: 'Họ và Tên',
            dataIndex: 'hoVaTen',
            render: (text) => <span className="font-semibold text-blue-800">{text}</span>
        },
        {
            title: 'Email',
            dataIndex: 'email',
        },
        {
            title: 'SĐT',
            dataIndex: 'soDienThoai',
        },
        {
            title: 'Ngày sinh',
            dataIndex: 'ngaySinh',
            render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : '--'
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'diaChi',
            ellipsis: true,
        },
        {
            title: 'Vai trò',
            dataIndex: 'maVaiTro',
            render: (role) => {
                const roleName = role?.tenVaiTro || 'Unknown';
                let color = roleName === 'admin' ? 'geekblue' : 'green';
                return <Tag color={color}>{roleName.toUpperCase()}</Tag>;
            }
        },
        {
            title: 'Trạng thái',
            dataIndex: 'trangThai',
            width: 180,
            render: (status) => {
                let color = 'default';
                let text = '';

                switch (status) {
                    case 0:
                        color = 'gray';
                        text = 'CHƯA KÍCH HOẠT';
                        break;
                    case 1:
                        color = 'green';
                        text = 'ĐANG HOẠT ĐỘNG';
                        break;
                    case 2:
                        color = 'volcano';
                        text = 'BỊ KHÓA';
                        break;
                    default:
                        color = 'default';
                        text = 'ĐANG HOẠT ĐỘNG';
                }

                return <Tag color={color}>{text}</Tag>;
            }
        },
        {
            title: 'Phương thức',
            dataIndex: 'nguonDangNhap',
            key: 'nguonDangNhap',
            width: 140,
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div className="p-2 shadow-xl border border-gray-100 rounded-lg bg-white min-w-[150px]">
                    <Menu
                        selectable
                        selectedKeys={selectedKeys}
                        onSelect={({ key }) => {
                            if (key === 'all') {
                                clearFilters();
                                confirm();
                            } else {
                                setSelectedKeys([key]);
                                confirm();
                            }
                        }}
                        items={[
                            { key: 'all', label: 'Tất cả phương thức' },
                            { type: 'divider' },
                            { key: 'local', icon: <LockOutlined className="text-gray-400" />, label: 'Email/mật khẩu' },
                            { key: 'google', icon: <GoogleOutlined className="text-red-500" />, label: 'Google' },
                            { key: 'facebook', icon: <FacebookFilled className="text-blue-600" />, label: 'Facebook' },
                        ]}
                    />
                </div>
            ),
            filterIcon: (filtered) => (
                <FilterOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
            ),
            onFilter: (value, record) => record.nguonDangNhap === value,
            render: (method) => {
                let icon = email;

                if (method === 'google') {
                    icon = google;
                } else if (method === 'facebook') {
                    icon = facebook;
                }

                return (
                    <div className="flex justify-center">
                        <img src={icon} style={{ width: 28, height: 28}} alt=""/>
                    </div>
                );
            },
        },
        {
            title: 'Hành động',
            key: 'action',
            fixed: 'right',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} type="primary" ghost onClick={() => handleEdit(record)} />
                    <Popconfirm title="Xóa người dùng này?" onConfirm={() => handleDelete(record._id)} okText="Xóa" cancelText="Hủy">
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div style={{
            height: 'calc(100vh - 150px)',
            display: 'flex',
            flexDirection: 'column',
            paddingBottom: 0}}
        >
            {contextHolder}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Quản Lý Người Dùng</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditingUser(null);
                        form.resetFields();
                        setIsModalOpen(true);
                    }}
                >
                    Thêm người dùng
                </Button>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
                <Table
                    dataSource={listUser}
                    columns={columns}
                    rowKey="_id"
                    loading={loading}
                    pagination={false}
                    scroll={{
                        x: 1000,
                        y: 'calc(100vh - 300px)'
                    }}
                />
            </div>
            <div style={{
                marginTop: 16,
                display: 'flex',
                justifyContent: 'flex-end',
                flexShrink: 0
            }}>
                <Pagination
                    current={current}
                    total={total}
                    pageSize={pageSize}
                    showSizeChanger
                    pageSizeOptions={['5', '10', '20', '50']}
                    showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} người dùng`}
                    onChange={(page, pageSize) => {
                        setCurrent(page);
                        setPageSize(pageSize);
                        const tableBody = document.querySelector('.ant-table-body');
                        if (tableBody) {
                            tableBody.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                    }}
                />
            </div>

            <Modal
                title={editingUser ? "Cập nhật thông tin" : "Thêm người dùng mới"}
                open={isModalOpen}
                onCancel={handleCancel}
                cancelText="Thoát"
                onOk={() => form.submit()}
                okText="Lưu"
                width={700}
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="hoVaTen"
                                label="Họ và Tên"
                                rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                            >
                                <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email!' },
                                    { type: 'email', message: 'Email không hợp lệ!' }
                                ]}
                            >
                                <Input placeholder="example@gmail.com" disabled={!!editingUser} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="soDienThoai"
                                label="Số điện thoại"
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="ngaySinh" label="Ngày sinh">
                                <DatePicker
                                    format="DD/MM/YYYY"
                                    style={{ width: '100%' }}
                                    placeholder="Chọn ngày sinh"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="diaChi" label="Địa chỉ">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="maVaiTro"
                                label="Vai trò"
                                rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
                            >
                                <Select placeholder="Chọn vai trò">
                                    {roles.map(role => (
                                        <Select.Option key={role._id} value={role._id}>
                                            {role.tenVaiTro}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="trangThai"
                                label="Trạng thái"
                                initialValue={1}
                                rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                            >
                                <Select>
                                    <Select.Option value={1}>
                                        <span className="text-green-600 font-semibold">Đang hoạt động</span>
                                    </Select.Option>

                                    <Select.Option value={2}>
                                        <span className="text-red-600 font-semibold">Bị khóa</span>
                                    </Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="matKhau"
                                label={editingUser ? "Mật khẩu mới (Để trống nếu không đổi)" : "Mật khẩu"}
                                rules={[
                                    { required: !editingUser, message: 'Vui lòng nhập mật khẩu' },
                                    { min: 6, message: 'Mật khẩu phải từ 6 ký tự' }
                                ]}
                            >
                                <Input.Password placeholder={editingUser ? "Nhập để đổi pass mới..." : "Nhập mật khẩu"} />
                            </Form.Item>
                        </Col>
                    </Row>

                </Form>
            </Modal>
        </div>
    );
};

export default UserManage;