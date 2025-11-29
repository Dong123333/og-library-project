import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, message, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import axios from "../../services/axios.customize.jsx";

const PublisherManage = () => {
    const [listData, setListData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const [totalPublisher, setTotalPublisher] = useState(0);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/nha-xuat-ban');
            if (Array.isArray(res)) {
                setListData(res);
                setTotalPublisher(res.length);
            }
        } catch (error) {
            messageApi.error("Lỗi tải dữ liệu");
        }
        setLoading(false);
    };

    const handleSave = async (values) => {
        try {
            if (editingItem) {
                // --- LOGIC SỬA ---
                await axios.patch(`/nha-xuat-ban/${editingItem._id}`, {
                    tenNhaXuatBan: values.tenNhaXuatBan,
                    diaChi: values.diaChi,
                });
                messageApi.success("Cập nhật thành công!");
            } else {
                await axios.post('/nha-xuat-ban',{
                    tenNhaXuatBan: values.tenNhaXuatBan,
                    diaChi: values.diaChi,
                });
                messageApi.success("Thêm mới thành công!");
            }

            setIsModalOpen(false);
            form.resetFields();
            setEditingItem(null);
            fetchData();
        } catch (error) {
            messageApi.error("Có lỗi xảy ra");
        }
    };

    const handleEdit = (record) => {
        setEditingItem(record);
        form.setFieldsValue({
            tenNhaXuatBan: record.tenNhaXuatBan,
            diaChi: record.diaChi,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/nha-xuat-ban/${id}`);
            messageApi.success("Đã xóa nhà xuất bản");
            fetchData();
        } catch (error) {
            messageApi.error("Xóa thất bại");
        }
    };

    const columns = [
        {
            title: 'STT',
            key: 'stt',
            width: 60,
            align: 'center',
            render: (text, record, index) => {
                return index + 1;
            },
        },
        {
            title: 'Tên Nhà Xuất Bản',
            dataIndex: 'tenNhaXuatBan',
            key: 'tenNhaXuatBan',
            render: (text) => <span className="font-semibold">{text}</span>
        },
        {
            title: 'Địa Chỉ',
            dataIndex: 'diaChi',
            key: 'diaChi',
        },
        {
            title: 'Hành Động',
            key: 'action',
            fixed: 'right',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        type="primary" ghost
                        onClick={() => handleEdit(record)}
                    />
                    <Popconfirm
                        title="Bạn chắc chắn muốn xóa?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Xóa" cancelText="Hủy"
                    >
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            ),
        },
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
                <h2 className="text-2xl font-bold">Quản Lý Nhà Xuất Bản</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditingItem(null);
                        form.resetFields();
                        setIsModalOpen(true);
                    }}
                >
                    Thêm nhà xuất bản
                </Button>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
                <Table
                    dataSource={listData}
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

            <div className="text-[18px]"> Tổng: {totalPublisher}</div>

            <Modal
                title={editingItem ? "Chỉnh sửa nhà xuất bản" : "Thêm nhà xuất bản mới"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item
                        name="tenNhaXuatBan"
                        label="Tên nhà xuất bản"
                        rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="diaChi"
                        label="Địa chỉ"
                    >
                        <Input.TextArea rows={3} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default PublisherManage;