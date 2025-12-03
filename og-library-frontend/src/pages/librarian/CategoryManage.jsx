import React, { useEffect, useState } from 'react';
import {Table, Button, Modal, Form, Input, Space, message, Popconfirm} from 'antd';
import {EditOutlined, DeleteOutlined, PlusOutlined} from '@ant-design/icons';
import axios from "../../services/axios.customize.jsx";

const CategoryManage = () => {
    const [listData, setListData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const [totalCategories, setTotalCategories] = useState(0);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/danh-muc');
            if (Array.isArray(res)) {
                setListData(res);
                setTotalCategories(res.length);
            }
        } catch (error) {
            messageApi.error("Lỗi tải dữ liệu");
        }
        setLoading(false);
    };

    const handleSave = async (values) => {
        try {
            if (editingItem) {
                await axios.patch(`/danh-muc/${editingItem._id}`, {
                    tenDanhMuc: values.tenDanhMuc,
                    moTa: values.moTa,
                });
                messageApi.success("Cập nhật thành công!");
            } else {
                await axios.post('/danh-muc',{
                    tenDanhMuc: values.tenDanhMuc,
                    moTa: values.moTa,
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
            tenDanhMuc: record.tenDanhMuc,
            moTa: record.moTa
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/danh-muc/${id}`);
            messageApi.success("Đã xóa danh mục");
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
            title: 'Tên Danh Mục',
            dataIndex: 'tenDanhMuc',
            key: 'tenDanhMuc',
            render: (text) => <span className="font-semibold">{text}</span>
        },
        {
            title: 'Mô Tả',
            dataIndex: 'moTa',
            key: 'moTa',
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
            paddingBottom: 0 }}
        >
            {contextHolder}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Quản Lý Danh Mục</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditingItem(null);
                        form.resetFields();
                        setIsModalOpen(true);
                    }}
                >
                    Thêm danh mục
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

            <div className="text-[18px]"> Tổng: {totalCategories}</div>

            <Modal
                title={editingItem ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                cancelText="Thoát"
                onOk={() => form.submit()}
                okText="Lưu"
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item
                        name="tenDanhMuc"
                        label="Tên danh mục"
                        rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="moTa"
                        label="Mô tả"
                    >
                        <Input.TextArea rows={3} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CategoryManage;