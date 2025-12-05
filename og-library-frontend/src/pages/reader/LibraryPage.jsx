import React, {useEffect, useRef, useState} from 'react';
import {
    Layout,
    Card,
    Row,
    Col,
    Pagination,
    Spin,
    Input,
    Tag,
    Empty,
    Select,
    Button,
    Modal,
    Form,
    InputNumber, DatePicker, Alert, message
} from 'antd';
import axios from "../../services/axios.customize";
import {ArrowRightOutlined, SearchOutlined} from "@ant-design/icons";
import {usePage} from "../../context/NavContext.jsx";
import {useNavigate} from "react-router-dom";
import useDebounce from "../../hooks/UseDebounce.jsx";
import bookDonation from "../../assets/images/book-donation.png";
import dayjs from "dayjs";
import {useAuth} from "../../context/AuthContext.jsx";
import FadeInImage from "../../components/FadeInImage.jsx";

const { Meta } = Card;


const LibraryPage = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const { setActivePage } = usePage();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null);
    const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
    const [loadingBookId, setLoadingBookId] = useState(null);
    const [form] = Form.useForm();
    const { isAuthenticated } = useAuth();

    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(16);
    const [total, setTotal] = useState(0);

    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState(null);
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const topRef = useRef(null);
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        fetchBooks();
    }, [current, pageSize, debouncedSearchTerm, filterCategory]);

    useEffect(() => {
        setActivePage("library");
    }, [setActivePage]);
    const handleClick = () => {
        setActivePage('home')
        navigate('/')
    }

    useEffect(() => {
        const fetchCategories = async () => {
            const res = await axios.get('/danh-muc');
            if (res && res.result) setCategories(res.result);
            else if (Array.isArray(res)) setCategories(res);
        };
        fetchCategories();
    }, []);

    const fetchBooks = async () => {
        setLoading(true);

        let query = `page=${current}&limit=${pageSize}`;

        if (debouncedSearchTerm) {
            query += `&tenSach=${debouncedSearchTerm}`;
        }
        if (filterCategory && filterCategory !== 'All') {
            query += `&maDanhMuc=${filterCategory}`;
        }

        try {
            const res = await axios.get(`/sach?${query}`);
            if (res && res.result) {
                setBooks(res.result);
                setTotal(res.meta.total);
            }
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    };

    const handleQuantityChange = (value) => {
        const daysToAdd = value <= 5 ? 30 : 7;
        const newDate = dayjs().add(daysToAdd, 'day');
        form.setFieldValue('ngayHenTra', newDate);
    };

    const handleConfirmBorrow = async (values) => {
        setLoadingBookId(selectedBook._id);
        try {
            const payload = {
                items: [
                    {
                        maSach: selectedBook._id,
                        soLuongMuon: values.soLuongMuon
                    }
                ],
                ngayHenTra: values.ngayHenTra.toISOString(),
                ghiChu: values.ghiChu || "Mượn nhanh trực tiếp"
            };

            await axios.post('/muon-tra', payload);

            messageApi.success("Đăng ký thành công! Vui lòng chờ duyệt.");
            navigate('/loans');

        } catch (error) {
            if (error.statusCode === 400) {
                messageApi.error(error.message);
            } else {
                messageApi.error("Lỗi mượn sách");
            }
        }
        setLoadingBookId(null)
        setIsBorrowModalOpen(false);
    };

    const handleOpenBorrowModal = (book) => {
        if (!isAuthenticated) {
            messageApi.warning("Vui lòng đăng nhập để mượn sách!");
            navigate('/login');
            return;
        }
        if (book.soLuong <= 0) {
            messageApi.error("Sách này đang tạm hết hàng!");
            return;
        }

        setSelectedBook(book);

        const defaultDate = dayjs().add(30, 'day');

        form.setFieldsValue({
            soLuongMuon: 1,
            ngayHenTra: defaultDate,
            ghiChu: ""
        });

        setIsBorrowModalOpen(true);
    };

    return (
        <div ref={topRef} className="scroll-mt-0">
            {contextHolder}
            <Layout className="min-h-screen" style={{ backgroundColor: "transparent"}}>
                <div className="animate-fade-in">
                    <div className="flex items-center gap-2 mb-6 text-gray-500 cursor-pointer hover:text-blue-600 w-fit" onClick={handleClick}>
                        <ArrowRightOutlined className="rotate-180" /> Quay lại
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 min-h-[600px]">
                        <div className="flex flex-col md:flex-row gap-4 mb-8 mt-4">
                            <Input
                                size="large"
                                placeholder="Nhập tên sách..."
                                prefix={<SearchOutlined />}
                                className="flex-grow"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrent(1);
                                }}
                            />
                            <Select
                                defaultValue="All"
                                style={{ width: 200 }}
                                size="large"
                                onChange={(val) => {
                                    setFilterCategory(val);
                                    setCurrent(1);
                                }}
                            >
                                <Select.Option value="All">-- Tất cả --</Select.Option>
                                {categories.map(c => (
                                    <Select.Option key={c._id} value={c._id}>{c.tenDanhMuc}</Select.Option>
                                ))}
                            </Select>
                        </div>
                        <Spin spinning={loading} tip="Đang tải dữ liệu...">
                            <div className="min-h-[400px]">
                                {books.length > 0 ? (
                                    <Row gutter={[24, 24]}>
                                        {books.map((book) => (
                                            <Col xs={24} sm={12} md={8} lg={6} key={book._id}>
                                                <Card
                                                    hoverable
                                                    className="h-full flex flex-col rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                                                    onClick={() => navigate(`/library/${book._id}`)}
                                                    cover={
                                                        <div className="h-64 p-4 relative group bg-white flex justify-center items-center border-b border-gray-100">
                                                            <FadeInImage
                                                                src={book.hinhAnh}
                                                                alt={book.tenSach}
                                                                className="w-full h-full"
                                                            />
                                                            <div className="absolute inset-0 bg-black/20 hidden group-hover:flex items-center justify-center transition-all">
                                                                <Button type="primary" shape="round" onClick={() => navigate(`/library/${book._id}`)}>
                                                                    Xem chi tiết
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    }
                                                >
                                                    <div className="flex flex-col h-full justify-between">
                                                        <div>
                                                            <div className="flex justify-between items-start mb-3">
                                                                <Tag color="blue">{book.maDanhMuc?.tenDanhMuc || 'Khác'}</Tag>
                                                                {book.soLuong > 0
                                                                    ? <div></div>
                                                                    : <Tag color="error">Tạm hết</Tag>
                                                                }
                                                            </div>
                                                            <Meta
                                                                title={
                                                                    <div className="text-lg font-bold text-gray-800 truncate" title={book.tenSach}>
                                                                        {book.tenSach}
                                                                    </div>
                                                                }
                                                                description={
                                                                    <div className="text-gray-500">
                                                                        <span className="block truncate">
                                                                        ✍️ {book.maTacGia?.map(tg => tg.tenTacGia).join(', ') || 'Chưa cập nhật'}
                                                                    </span>
                                                                    </div>
                                                                }
                                                            />
                                                        </div>
                                                        <Button
                                                            type="primary"
                                                            size="large"
                                                            className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 h-14 text-lg font-bold shadow-lg shadow-orange-200 mt-4"
                                                            loading={loadingBookId === book._id}
                                                            disabled={book.soLuong === 0}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleOpenBorrowModal(book);
                                                            }}
                                                        >
                                                            {loadingBookId !== book._id && (
                                                                    <img
                                                                        style={{
                                                                            filter: 'invert(100%)',
                                                                            width: '24px',
                                                                            height: '24px',
                                                                            objectFit: 'contain'
                                                                        }}
                                                                        src={bookDonation}
                                                                        alt=""
                                                                    />
                                                            )}
                                                            <span>Mượn Ngay</span>
                                                        </Button>
                                                    </div>

                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>
                                ) : (
                                    <Empty description="Không tìm thấy sách phù hợp" />
                                )}
                            </div>
                        </Spin>
                        <div className="flex justify-center mt-10 w-full">
                            <div style={{ display: "flex", flexWrap: "nowrap", transform: "scale(0.8)", transformOrigin: "center" }}>
                                <Pagination
                                    style={{ display: "flex", flexWrap: "nowrap" }}
                                    current={current}
                                    pageSize={pageSize}
                                    total={total}
                                    showSizeChanger
                                    pageSizeOptions={['8', '16', '32', '64']}
                                    onChange={(p, s) => {
                                        setCurrent(p);
                                        setPageSize(s);
                                        if (topRef.current) {
                                            topRef.current.scrollIntoView({
                                                behavior: 'smooth',
                                                block: 'start'
                                            });
                                        }
                                    }}
                                />
                            </div>

                        </div>
                    </div>
                </div>
            </Layout>
            <Modal
                title={
                    <div className="flex items-center gap-2 w-full">
                        <img style={{width: '24px', height: '24px' }} src={bookDonation} alt=""/>
                        <span className="flex-shrink-0 whitespace-nowrap font-medium">Mượn nhanh: </span>
                        <span className="text-blue-700 truncate">{selectedBook?.tenSach}</span>
                    </div>
                }
                open={isBorrowModalOpen}
                onCancel={() => setIsBorrowModalOpen(false)}
                cancelText="Thoát"
                onOk={() => form.submit()}
                okText="Xác nhận mượn"
                centered
                width={500}
            >
                <Form form={form} layout="vertical" onFinish={handleConfirmBorrow}>
                    <Form.Item
                        name="soLuongMuon"
                        label={`Số lượng (Tồn kho: ${selectedBook?.soLuong})`}
                        rules={[{ required: true, message: 'Nhập số lượng' }]}
                    >
                        <InputNumber
                            min={1}
                            max={Math.min(selectedBook?.soLuong, 10)}
                            style={{ width: '100%' }}
                            size="large"
                            onChange={handleQuantityChange}
                        />
                    </Form.Item>
                    <Form.Item
                        noStyle
                        dependencies={['soLuongMuon']}
                    >
                        {({ getFieldValue }) => {
                            const currentQty = getFieldValue('soLuongMuon') || 1;
                            const maxDays = currentQty <= 5 ? 30 : 7;
                            return (
                                <div>
                                    <Form.Item
                                        name="ngayHenTra"
                                        label="Ngày hẹn trả"
                                        rules={[{ required: true, message: 'Vui lòng chọn ngày trả' }]}
                                        extra={
                                            <div style={{ marginTop: 8, color: "#999" }}>
                                                Ngày trả được gợi ý tự động, bạn có thể điều chỉnh.
                                            </div>
                                        }
                                    >
                                        <DatePicker
                                            format="DD/MM/YYYY"
                                            style={{ width: '100%' }}
                                            size="large"
                                            allowClear={false}
                                            disabledDate={(current) => {
                                                const isPast = current && current < dayjs().startOf('day');
                                                const isTooFar = current && current > dayjs().add(maxDays, 'day').endOf('day');
                                                return isPast || isTooFar;
                                            }}
                                        />
                                    </Form.Item>
                                    <Alert
                                        message="Quy định mượn sách"
                                        description={
                                            <ul className="list-disc pl-4 text-xs text-gray-600 mt-1">
                                                <li>Mượn <b>{currentQty}</b> cuốn, hạn trả tối đa là <b>{maxDays} ngày</b></li>
                                            </ul>
                                        }
                                        type="info"
                                        showIcon
                                        className="mb-4"
                                    />
                                </div>
                            );
                        }}
                    </Form.Item>

                    <Form.Item name="ghiChu" style={{ paddingTop: '12px'}} label="Ghi chú cho thủ thư">
                        <Input.TextArea rows={2} placeholder="VD: Em sẽ đến lấy vào chiều mai..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default LibraryPage;