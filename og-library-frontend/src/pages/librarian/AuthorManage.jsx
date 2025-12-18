import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, message, Popconfirm, Row, Col } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import axios from "../../services/axios.customize.jsx";

const AuthorManage = () => {
    const [listData, setListData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const [totalAuthors, setTotalAuthors] = useState(0);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/tac-gia');
            if (Array.isArray(res)) {
                setListData(res)
                setTotalAuthors(res.length)
            }
        } catch (error) {
            messageApi.error("Lỗi tải dữ liệu");
        }
        setLoading(false);
    };

    const handleSave = async (values) => {
        try {
            if (editingItem) {
                await axios.patch(`/tac-gia/${editingItem._id}`, values);
                messageApi.success("Cập nhật thành công!");
            } else {
                await axios.post('/tac-gia',values);
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
            tenTacGia: record.tenTacGia,
            butDanh: record.butDanh,
            quocTich: record.quocTich,
            tieuSu: record.tieuSu,
            namSinh: record.namSinh,
            namMat: record.namMat,
        });

        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/tac-gia/${id}`);
            messageApi.success("Đã xóa tác giả");
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
            title: 'Tên Tác Giả',
            dataIndex: 'tenTacGia',
            key: 'tenTacGia',
            width: '20%',
            render: (text) => <span className="font-semibold">{text}</span>
        },
        {
            title: 'Bút danh',
            dataIndex: 'butDanh',
            key: 'butDanh',
            width: '15%',
            render: (text) => text || <span className="text-gray-400 italic">--</span>
        },
        {
            title: 'Quốc tịch',
            dataIndex: 'quocTich',
            key: 'quocTich',
            width: '10%',
        },
        {
            title: 'Sinh - Mất',
            key: 'namSinh',
            render: (_, record) => {
                const sinh = record.namSinh || '?';
                const mat = record.namMat || 'Nay';
                return <span>{sinh} - {mat}</span>;
            }
        },
        {
            title: 'Tiểu sử',
            dataIndex: 'tieuSu',
            key: 'tieuSu',
            ellipsis: true,
        },
        {
            title: 'Hành động',
            key: 'action',
            fixed: 'right',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        type="primary" ghost size="small"
                        onClick={() => handleEdit(record)}
                    />
                    <Popconfirm
                        title="Xóa tác giả này?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Xóa" cancelText="Hủy"
                    >
                        <Button icon={<DeleteOutlined />} danger size="small" />
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
                <h2 className="text-2xl font-bold">Quản Lý Tác Giả</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditingItem(null);
                        form.resetFields();
                        setIsModalOpen(true);
                    }}
                >
                    Thêm tác giả
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


            <div className="text-[18px]"> Tổng: {totalAuthors}</div>

            <Modal
                title={editingItem ? "Cập nhật thông tin" : "Thêm tác giả mới"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                cancelText="Thoát"
                onOk={() => form.submit()}
                okText="Lưu"
                width={700}
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="tenTacGia"
                                label="Tên thật"
                                rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
                            >
                                <Input placeholder="Ví dụ: Nguyễn Nhật Ánh" />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item name="butDanh" label="Bút danh">
                                <Input placeholder="Ví dụ: Anh Bồ Câu" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="quocTich" label="Quốc tịch">
                                <Input placeholder="Ví dụ: Việt Nam" />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item name="namSinh" label="Năm sinh">
                                <Input
                                    placeholder="VD: 1920"
                                    maxLength={4}
                                    parser={(value) => value.replace(/[^\d]/g, '')}
                                    onKeyDown={(e) => {
                                        if (
                                            !/[0-9]/.test(e.key) &&
                                            !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)
                                        ) {
                                            e.preventDefault();
                                        }
                                    }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="namMat" label="Năm mất">
                                <Input
                                    placeholder="VD: 2000"
                                    maxLength={4}
                                    parser={(value) => value.replace(/[^\d]/g, '')}
                                    onKeyDown={(e) => {
                                        if (
                                            !/[0-9]/.test(e.key) &&
                                            !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)
                                        ) {
                                            e.preventDefault();
                                        }
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="tieuSu" label="Tiểu sử">
                        <Input.TextArea
                            rows={4}
                            placeholder="Mô tả ngắn về tác giả, sự nghiệp..."
                        />
                    </Form.Item>

                </Form>
            </Modal>
        </div>
    );
};

export default AuthorManage;