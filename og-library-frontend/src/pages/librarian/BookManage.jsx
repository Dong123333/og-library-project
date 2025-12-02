import React, {useEffect, useRef, useState} from 'react';
import {
    Table, Button, Modal, Form, Input, Select, InputNumber, Space, message, Popconfirm, Image, Row, Col,
    Pagination
} from 'antd';
import {EditOutlined, DeleteOutlined, PlusOutlined, UploadOutlined, SearchOutlined} from '@ant-design/icons';
import axios from "../../services/axios.customize.jsx";
import useDebounce from "../../hooks/UseDebounce.jsx";

const BookManage = () => {
    const [listBook, setListBook] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    const [authors, setAuthors] = useState([]);
    const [categories, setCategories] = useState([]);
    const [publishers, setPublishers] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const [selectedImage, setSelectedImage] = useState("");
    const [rawFile, setRawFile] = useState(null);
    const [inputKey, setInputKey] = useState(Date.now());
    const fileInputRef = useRef(null);
    const [isSubmitLoading, setIsSubmitLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    useEffect(() => {
        fetchMasterData();
    }, []);

    useEffect(() => {
        fetchBooks();
    }, [current, pageSize, debouncedSearchTerm]);

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setRawFile(file);
            setSelectedImage(URL.createObjectURL(file));
        }
    };

    const fetchMasterData = async () => {
        const [resAuth, resCat, resPub] = await Promise.all([
            axios.get('/tac-gia'),  axios.get('/danh-muc'),  axios.get('/nha-xuat-ban')
        ]);

        if (Array.isArray(resAuth)) {
            setAuthors(resAuth);
        }
        if (Array.isArray(resCat)) {
            setCategories(resCat);
        }
        if (Array.isArray(resPub)) {
            setPublishers(resPub);
        }

    };

    const fetchBooks = async () => {
        setLoading(true);

        let query = `page=${current}&limit=${pageSize}`;

        if (debouncedSearchTerm) {
            query += `&tenSach=${debouncedSearchTerm}`;
        }
        try {
            const res = await axios.get(`/sach?${query}`);
            if (res && res.result) {
                setListBook(res.result);
                setTotal(res.meta.total);
            }
        } catch (error) {
            messageApi.error("Lỗi tải sách");
        }
        setLoading(false);
    };

    const handleSave = async (values) => {
        setIsSubmitLoading(true);
        try {
            const formData = new FormData();
            formData.append("tenSach", values.tenSach);
            formData.append("maDanhMuc", values.maDanhMuc);
            if (values.maTacGia && Array.isArray(values.maTacGia)) {
                values.maTacGia.forEach((authorId) => {
                    formData.append("maTacGia", authorId);
                });
            }
            formData.append("maNhaXuatBan", values.maNhaXuatBan);
            formData.append("soLuong", values.soLuong);
            formData.append("namXuatBan", values.namXuatBan);
            formData.append("giaTien", values.giaTien);
            if (rawFile) {
                formData.append("hinhAnh", rawFile);
            }
            if (editingBook) {
                await axios.patch(`/sach/${editingBook._id}`, formData);
                messageApi.success("Cập nhật thành công");
            } else {
                await axios.post('/sach',formData);
                messageApi.success("Thêm sách thành công");
            }
            setIsModalOpen(false);
            form.resetFields();
            setSelectedImage("");
            setRawFile(null);
            setEditingBook(null);
            fetchBooks();
            setInputKey(Date.now());
        } catch (error) {
            messageApi.error("Có lỗi xảy ra");
        }finally {
            setIsSubmitLoading(false);
        }
    };

    const handleEdit = (record) => {
        setEditingBook(record);
        setSelectedImage(record.hinhAnh || "");
        setRawFile(null);
        form.setFieldsValue({
            tenSach: record.tenSach,
            soLuong: record.soLuong,
            maTacGia: record.maTacGia?.map(item => item._id),
            maDanhMuc: record.maDanhMuc?._id,
            maNhaXuatBan: record.maNhaXuatBan?._id,
            namXuatBan: record.namXuatBan,
            giaTien: record.giaTien,
        });
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
        setRawFile(null);
        setSelectedImage("");
        setEditingBook(null);
        setInputKey(Date.now());
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
            title: 'Hình ảnh',
            dataIndex: 'hinhAnh',
            render: (src) => <Image src={src} width={50} />
        },
        {
            title: 'Tên sách',
            dataIndex: 'tenSach',
            render: (text) => <span className="font-bold text-blue-800">{text}</span>
        },
        {
            title: 'Danh mục',
            dataIndex: 'maDanhMuc',
            render: (item) => item?.tenDanhMuc || <span className="text-gray-400">--</span>
        },
        {
            title: 'Tác giả',
            dataIndex: 'maTacGia',
            render: (authors) => {
                if (authors && authors.length > 0) {
                    return (
                        <div className="text-blue-700">
                            {authors.map(a => a.tenTacGia).join(', ')}
                        </div>
                    );
                }
                return <span className="text-gray-400">--</span>;
            }
        },
        {
            title: 'Nhà xuất bản',
            dataIndex: 'maNhaXuatBan',
            render: (item) => item?.tenNhaXuatBan || <span className="text-gray-400">--</span>
        },
        {
            title: 'Năm xuất bản',
            dataIndex: 'namXuatBan',
            render: (text) => <span>{text}</span>
        },
        {
            title: 'SL',
            dataIndex: 'soLuong',
        },
        {
            title: 'Giá tiền',
            dataIndex: 'giaTien',
        },
        {
            title: 'Hành động',
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} type="primary" ghost onClick={() => handleEdit(record)} />
                    <Popconfirm title="Xóa sách?" onConfirm={async () => {
                        await axios.delete(`/sach/${record._id}`);
                        messageApi.success("Đã xóa");
                        fetchBooks();
                    }}>
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
            paddingBottom: 0
        }}>
            {contextHolder}
            <div className="mb-4">
                <h2 className="text-2xl font-bold">Quản Lý Sách</h2>
            </div>
            <div className="flex justify-between items-center mb-4">
                <div className="min-w-[500px]">
                    <Input
                        size="large"
                        placeholder="Nhập tên sách..."
                        prefix={<SearchOutlined />}
                        className="flex-grow"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                        }}
                    />
                </div>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                    setEditingBook(null);
                    form.resetFields();
                    setRawFile(null);
                    setSelectedImage("");
                    setIsModalOpen(true);
                }}>Thêm sách mới
                </Button>
            </div>

            <div style={{ flex: 1, overflow: 'hidden' }}>
                <Table
                    dataSource={listBook}
                    columns={columns}
                    rowKey="_id"
                    loading={loading}
                    pagination={false}
                    scroll={{
                        x: 1000,
                        y: 'calc(100vh - 380px)'
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
                    showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} sách`}
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
                title={editingBook ? "Cập nhật sách" : "Thêm sách mới"}
                open={isModalOpen}
                onCancel={handleCancel}
                onOk={() => form.submit()}
                width={800}
                confirmLoading={isSubmitLoading}
                okText={isSubmitLoading ? "Đang xử lý..." : "Lưu lại"}
                cancelButtonProps={{ disabled: isSubmitLoading }}
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Row gutter={24}>
                        <Col span={8}>
                            <Form.Item label="Ảnh bìa">
                                <div className="flex flex-col items-center gap-3">
                                    <div style={{
                                        width: '100%',
                                        aspectRatio: '2/3',
                                        border: '1px dashed #d9d9d9',
                                        borderRadius: 8,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        overflow: 'hidden',
                                        backgroundColor: '#fafafa',
                                        position: 'relative'
                                    }}>
                                        {selectedImage ? (
                                            <Image
                                                src={selectedImage}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                preview={false}
                                            />
                                        ) : (
                                            <div className="text-gray-400 text-center p-4">
                                                <span style={{ fontSize: 40 }}>📷</span>
                                                <div className="text-xs mt-2">Chưa có ảnh</div>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={fileInputRef}
                                        key={inputKey}
                                        onChange={handleImageChange}
                                        style={{ display: 'none' }}
                                    />

                                    <Button
                                        icon={<UploadOutlined />}
                                        onClick={() => fileInputRef.current.click()}
                                        block
                                    >
                                        {rawFile ? "Đổi ảnh khác" : "Chọn hình ảnh"}
                                    </Button>
                                    {rawFile && (
                                        <span className="text-green-600 text-xs truncate w-full text-center">
                            {rawFile.name}
                        </span>
                                    )}
                                </div>
                            </Form.Item>
                        </Col>
                        <Col span={16}>
                            <Form.Item
                                name="tenSach"
                                label="Tên sách"
                                rules={[{ required: true, message: 'Tên sách không được để trống' }]}
                            >
                                <Input size="large" placeholder="Nhập tên sách..." />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="maDanhMuc"
                                        label="Danh mục"
                                        rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                                    >
                                        <Select placeholder="Chọn danh mục" showSearch optionFilterProp="children">
                                            {categories.map(c => (
                                                <Select.Option key={c._id} value={c._id}>{c.tenDanhMuc}</Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="maTacGia"
                                        label="Tác giả"
                                        rules={[{ required: true, message: 'Chọn ít nhất 1 tác giả' }]}
                                    >
                                        <Select
                                            mode="multiple"
                                            placeholder="Chọn các tác giả"
                                            maxTagCount="responsive"
                                            allowClear
                                        >
                                            {authors.map(a => (
                                                <Select.Option key={a._id} value={a._id}>{a.tenTacGia}</Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="maNhaXuatBan"
                                        label="Nhà xuất bản"
                                        rules={[{ required: true, message: 'Vui lòng chọn NXB' }]}
                                    >
                                        <Select placeholder="Chọn NXB">
                                            {publishers.map(p => (
                                                <Select.Option key={p._id} value={p._id}>{p.tenNhaXuatBan}</Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="namXuatBan" label="Năm xuất bản" rules={[
                                        {
                                            validator: (_, value) => {
                                                if (typeof value !== 'number') {
                                                    return Promise.reject(new Error('Năm xuất bản phải là số'));
                                                }
                                                if (!value || (value >= 1000 && value <= 9999)) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(new Error('Năm xuất bản phải từ 1000 đến 9999'));
                                            },
                                        },
                                    ]}>
                                        <InputNumber
                                            placeholder="VD: 2024"
                                            style={{ width: '100%' }}
                                            controls={false}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="soLuong"
                                        label="Số lượng"
                                        rules={[{ required: true, message: 'Nhập số lượng' }]}
                                    >
                                        <InputNumber className="w-full" min={0} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="giaTien"
                                        label="Giá tiền (VNĐ)"
                                        rules={[{ required: true, message: 'Nhập giá tiền' }]}
                                    >
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            min={0}
                                            step={1000}
                                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                            addonAfter="₫"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </div>
    );
};

export default BookManage;