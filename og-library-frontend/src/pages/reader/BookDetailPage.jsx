import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {
    Layout,
    Row,
    Col,
    Image,
    Typography,
    Button,
    Rate,
    Divider,
    Spin,
    message,
    Card,
    Modal,
    Alert,
    Input,
    Form, InputNumber, DatePicker
} from 'antd';
import {ShoppingCartOutlined, HomeOutlined, RightOutlined, LeftOutlined, HeartFilled} from '@ant-design/icons';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from "../../services/axios.customize";
import {useAuth} from "../../context/AuthContext.jsx";
import {useBookcase} from "../../context/BookcaseContext.jsx";
import bookDonation from "../../assets/images/book-donation.png";
import dayjs from "dayjs";

const { Meta } = Card;

const { Content } = Layout;
const { Title, Text } = Typography;

const BookDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [relatedBooks, setRelatedBooks] = useState([]);
    const [startIndex, setStartIndex] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(4);
    const topRef = useRef(null);
    const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
    const [borrowLoading, setBorrowLoading] = useState(false);
    const [form] = Form.useForm();
    const { addToBookcase } = useBookcase();
    const { isAuthenticated } = useAuth();
    const [messageApi, contextHolder] = message.useMessage();

    useLayoutEffect(() => {
        const forceScrollTop = () => {
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
            const allElements = document.querySelectorAll('*');
            allElements.forEach((el) => {
                if (el.scrollTop > 0) {
                    el.scrollTop = 0;
                }
            });
        };

        forceScrollTop();
        const timer = setTimeout(forceScrollTop, 50);
        fetchBookDetail();

        return () => clearTimeout(timer);
    }, [id]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setItemsPerPage(2);
            } else {
                setItemsPerPage(4);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchBookDetail = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/sach/${id}`);
            if (res) {
                setBook(res);
                if (res.maDanhMuc?._id) {
                    fetchRelatedBooks(res.maDanhMuc._id, res._id);
                }
            }
        } catch (error) {
            messageApi.error("Không tìm thấy thông tin sách");
            navigate('/library');
        }
        setLoading(false);
    };

    const fetchRelatedBooks = async (categoryId, currentBookId) => {
        const query = `page=1&limit=100&maDanhMuc=${categoryId}`;
        const res = await axios.get(`/sach?${query}`);

        if (res && res.result) {
            const filtered = res.result.filter(b => b._id !== currentBookId);
            setRelatedBooks(filtered);
        }
    }

    const handleQuantityChange = (value) => {
        const daysToAdd = value <= 5 ? 30 : 7;
        const newDate = dayjs().add(daysToAdd, 'day');
        form.setFieldValue('ngayHenTra', newDate);
    };

    const handleConfirmBorrow = async (values) => {
        setBorrowLoading(true);
        try {
            const payload = {
                items: [
                    {
                        maSach: book._id,
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
        setBorrowLoading(false);
        setIsBorrowModalOpen(false);
    };

    const handleOpenBorrowModal = () => {
        if (!isAuthenticated) {
            messageApi.warning("Vui lòng đăng nhập để mượn sách!");
            navigate('/login');
            return;
        }
        if (book.soLuong <= 0) {
            messageApi.error("Sách này đang tạm hết hàng!");
            return;
        }

        const defaultDate = dayjs().add(30, 'day');

        form.setFieldsValue({
            soLuongMuon: 1,
            ngayHenTra: defaultDate,
            ghiChu: ""
        });

        setIsBorrowModalOpen(true);
    };

    const handleAddToCart = () => {
        if (!isAuthenticated) {
            messageApi.warning("Vui lòng đăng nhập để sử dụng giỏ sách!");
            navigate('/login');
            return;
        }
        addToBookcase(book);
    };

    const handleNext = () => {
        if (startIndex + itemsPerPage < relatedBooks.length) {
            setStartIndex(prev => prev + itemsPerPage);
        }
    };

    const handlePrev = () => {
        if (startIndex > 0) {
            setStartIndex(prev => prev - itemsPerPage);
        }
    };

    return (
        <div>
            {contextHolder}
            <Layout className="min-h-screen bg-gray-50 relative">
                <div
                    ref={topRef}
                    style={{ position: 'absolute', top: 0, left: 0, width: 1, height: 1 }}
                />
                <Content className="w-full">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-nowrap">
                        <Link to="/" className="flex items-center gap-1  transition-colors cursor-pointer whitespace-nowrap">
                            <HomeOutlined style={{ color: '#1f2937' }} />
                            <span className="text-gray-800 hover:text-blue-600 ">Trang chủ</span>
                        </Link>
                        <span className="text-gray-400">/</span>
                        <Link to="/library" className="flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap">
                            <span className="text-gray-800 hover:text-blue-600">Thư viện sách</span>
                        </Link>
                        <span className="text-gray-400">/</span>
                        <span className="font-medium text-gray-800 truncate flex-1 min-w-0">
                            {book?.tenSach || "Đang tải..."}
                        </span>
                    </div>

                    <Spin className="mt-6" spinning={loading} tip="Đang tải thông tin...">
                        {book ? (
                            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm w-full">
                                <Row gutter={[48, 32]}>
                                    <Col xs={24} md={9} lg={8}>
                                        <div className="border rounded-lg overflow-hidden shadow-md bg-white p-4 flex justify-center items-center w-full h-[500px]">
                                            <Image
                                                src={book.hinhAnh || "https://placehold.co/400x600?text=No+Image"}
                                                alt={book.tenSach}
                                                className="w-full h-full object-contain"
                                                preview={{ mask: 'Phóng to' }}
                                            />
                                        </div>
                                    </Col>

                                    <Col xs={24} md={15} lg={16}>
                                        <div className="flex flex-col h-full">
                                        <Title level={2} className="mb-2" style={{ color: '#1f2937' }}>
                                            {book.tenSach}
                                        </Title>

                                        <div className="flex items-center gap-4 mb-2 text-gray-500">
                                            <span className="text-lg">
                                                Tác giả: <span className="font-semibold text-blue-600">
                                                    {book.maTacGia?.map(t => t.tenTacGia).join(', ') || "Chưa cập nhật"}
                                                </span>
                                            </span>
                                        </div>
                                            <Divider style={{ marginTop: 6, marginBottom: 6}} />

                                            <div className="mb-8">
                                                <Text style={{ fontSize: '16px' }} type="secondary" className="block mb-2">Tình trạng sẵn có:</Text>
                                                {book.soLuong > 0 ? (
                                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-600 rounded-lg text-green-700">
                                                        <span className="w-3 h-3 bg-green-600 rounded-full animate-pulse font-bold"></span>
                                                        Sẵn sàng cho mượn ({book.soLuong} bản)
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-red-600 font-bold text-lg">
                                                        <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                                                        Tạm hết hàng
                                                    </div>
                                                )}
                                            </div>
                                        <div className="grid grid-cols-2 gap-4 mb-8 text-base">
                                            <div>
                                                <Text type="secondary">Danh mục:</Text>
                                                <p className="font-medium">{book.maDanhMuc?.tenDanhMuc || "Khác"}</p>
                                            </div>
                                            <div>
                                                <Text type="secondary">Nhà xuất bản:</Text>
                                                <p className="font-medium">{book.maNhaXuatBan?.tenNhaXuatBan || "---"}</p>
                                            </div>
                                            <div>
                                                <Text type="secondary">Năm xuất bản:</Text>
                                                <p className="font-medium">{book.namXuatBan || "---"}</p>
                                            </div>
                                            <div>
                                                <Text type="secondary">Đánh giá:</Text>
                                                <div className="flex items-center gap-2">
                                                    <Rate disabled defaultValue={5} style={{ fontSize: 14 }} />
                                                    <span className="text-sm">(5.0)</span>
                                                </div>
                                            </div>
                                        </div>
                                            <div className="flex items-center gap-2 mb-8">
                                                <span className="text-gray-500 text-[20px]">Giá tiền:</span>
                                                <span className="text-red-600 font-semibold text-[20px]">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book.giaTien || 0)}</span>
                                            </div>
                                        <div className="flex gap-4 mt-auto mb-8">
                                            <Button
                                                type="primary"
                                                size="large"
                                                icon={<ShoppingCartOutlined />}
                                                onClick={handleAddToCart}
                                            >
                                                Thêm vào giỏ
                                            </Button>

                                            <Button
                                                type="primary"
                                                size="large"
                                                className="bg-orange-500 hover:bg-orange-600 h-14 px-8 text-lg font-bold shadow-lg shadow-orange-200"
                                                loading={borrowLoading}
                                                disabled={book.soLuong === 0}
                                                onClick={handleOpenBorrowModal}
                                            >
                                                <img style={{ filter: 'invert(100%)', width: '24px', height: '24px' }} src={bookDonation} alt=""/>
                                                <span>Mượn Ngay</span>
                                            </Button>
                                        </div>
                                            </div>
                                    </Col>

                                </Row>
                            </div>
                        ) : (
                            <div className="h-64 flex justify-center items-center">Không có dữ liệu</div>
                        )}
                    </Spin>
                </Content>
            </Layout>
            <Divider style={{ margin: '50px 0' }} />
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm w-full">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                        <HeartFilled style={{ fontSize: '20px' }} />
                    </div>
                    <Title level={3} style={{ margin: 0, color: '#374151' }}>
                        Có thể bạn sẽ thích
                    </Title>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                    <Button
                        shape="circle"
                        icon={<LeftOutlined />}
                        size="large"
                        onClick={handlePrev}
                        disabled={startIndex === 0}
                        className="z-10 -translate-y-1/2 shadow-md border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-600 bg-white"
                        style={{ display: relatedBooks.length <= 4 ? 'none' : 'flex' }}
                    />
                    <div className="flex-1 w-0">
                        <Row gutter={[16, 16]}>
                            {relatedBooks.slice(startIndex, startIndex + itemsPerPage).map((item) => (
                                <Col xs={12} sm={12} md={8} lg={6} key={item._id}>
                                    <Card
                                        hoverable
                                        className="shadow-sm hover:shadow-lg transition-all duration-300 border-gray-200"
                                        style={{ borderRadius: 12, overflow: 'hidden', height: '100%', }}
                                        onClick={() => navigate(`/library/${item._id}`)}
                                        cover={
                                            <div className="h-40 md:h-56 md:p-3 bg-[#f8f9fa] flex justify-center items-center relative overflow-hidden">
                                                <img
                                                    alt={item.tenSach}
                                                    src={item.hinhAnh || "https://placehold.co/200x300?text=No+Image"}
                                                    className="h-full w-full object-contain transition-transform duration-300 hover:scale-110 mix-blend-multiply"
                                                />
                                            </div>
                                        }
                                    >
                                        <Meta
                                            title={
                                                <div
                                                    className="text-sm md:text-base font-bold text-gray-800 truncate"
                                                    title={item.tenSach}
                                                >
                                                    {item.tenSach}
                                                </div>
                                            }
                                            description={
                                                <div className="flex justify-between items-center mt-2">
                                                <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">
                                                Xem ngay
                                            </span>
                                                </div>
                                            }
                                        />
                                    </Card>
                                </Col>
                            ))}

                            {relatedBooks.length === 0 && (
                                <div className="w-full text-center text-gray-400 py-10 italic">
                                    Chưa có sách tương tự để hiển thị.
                                </div>
                            )}
                        </Row>
                    </div>
                    <Button
                        shape="circle"
                        icon={<RightOutlined />}
                        size="large"
                        onClick={handleNext}
                        disabled={startIndex + itemsPerPage >= relatedBooks.length}
                        className="shrink-0 shadow-md border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-600 bg-white flex items-center justify-center"
                        style={{ display: relatedBooks.length <= 4 ? 'none' : 'flex' }}
                    />
                </div>
            </div>
            <Modal
                title={
                    <div className="flex items-center gap-2 w-full">
                        <img style={{width: '24px', height: '24px' }} src={bookDonation} alt=""/>
                        <span className="flex-shrink-0 whitespace-nowrap font-medium">Mượn nhanh: </span>
                        <span className="text-blue-700 truncate">{book?.tenSach}</span>
                    </div>
                }
                open={isBorrowModalOpen}
                onCancel={() => setIsBorrowModalOpen(false)}
                cancelText="Thoát"
                onOk={() => form.submit()}
                okText="Xác nhận mượn"
                confirmLoading={borrowLoading}
                centered
                width={500}
            >
                <Form form={form} layout="vertical" onFinish={handleConfirmBorrow}>
                    <Form.Item
                        name="soLuongMuon"
                        label={`Số lượng (Tồn kho: ${book?.soLuong})`}
                        rules={[{ required: true, message: 'Nhập số lượng' }]}
                    >
                        <InputNumber
                            min={1}
                            max={Math.min(book?.soLuong, 10)}
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

export default BookDetailPage;