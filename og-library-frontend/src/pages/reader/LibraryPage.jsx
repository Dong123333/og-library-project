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
    InputNumber, DatePicker, Alert, message, Menu, ConfigProvider, Avatar, Tooltip
} from 'antd';
import axios from "../../services/axios.customize";
import {
    AppstoreOutlined,
    ArrowRightOutlined,
    BookOutlined, CompassFilled,
    FilterOutlined, HeartOutlined, ReadFilled,
    SearchOutlined,
    ThunderboltFilled
} from "@ant-design/icons";
import {usePage} from "../../context/NavContext.jsx";
import {useNavigate, useSearchParams} from "react-router-dom";
import useDebounce from "../../hooks/UseDebounce.jsx";
import bookDonation from "../../assets/images/book-donation.png";
import dayjs from "dayjs";
import {useAuth} from "../../context/AuthContext.jsx";
import FadeInImage from "../../components/FadeInImage.jsx";

const { Meta } = Card;
const { Sider, Content } = Layout;

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

    const [searchParams, setSearchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(() => searchParams.get('tenSach') || '');
    const [filterCategory, setFilterCategory] = useState(null);
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        fetchBooks();
    }, [current, pageSize, debouncedSearchTerm, filterCategory]);

    useEffect(() => {
        if (debouncedSearchTerm) {
            setSearchParams({ tenSach: debouncedSearchTerm });
        } else {
            searchParams.delete('tenSach');
            setSearchParams(searchParams);
        }
    }, [debouncedSearchTerm, setSearchParams]);

    useEffect(() => {
        setActivePage("library");
    }, [setActivePage]);

    const handleClick = () => {
        setActivePage('home')
        navigate('/')
    }

    const scrollToTop = () => {
        document
            .getElementById('page-container')
            ?.scrollTo({ top: 0, behavior: 'smooth' });
    };

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
            query += `&tenSach=${encodeURIComponent(debouncedSearchTerm)}`;
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
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#4F46E5',
                    borderRadius: 12,
                    fontFamily: "'Inter', sans-serif",
                },
            }}
        >
            {contextHolder}
            <div className="min-h-screen bg-[#F3F4F6] font-sans text-slate-800 flex flex-col">
                <div className="flex flex-1 max-w-[1920px] mx-auto w-full">
                    <div className="hidden lg:block w-80 relative flex-shrink-0">
                        <div className="sticky top-24 h-[calc(100vh-120px)] p-6 bg-white/80 backdrop-blur-xl border border-white/60 shadow-lg shadow-indigo-100/50 flex flex-col z-10 rounded-2xl overflow-hidden">
                            <div onClick={handleClick} className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer border border-slate-200 text-slate-600 transition-all duration-200 hover:bg-white hover:text-indigo-600 hover:shadow-md active:scale-95 group">
                                <ArrowRightOutlined className="rotate-180 text-slate-400 transition-transform duration-200 group-hover:-translate-x-1 group-hover:text-indigo-500" />
                                <span className="font-medium">Quay lại</span>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 space-y-1 custom-scrollbar">
                                <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Khám phá</p>
                                <div
                                    onClick={() => { setFilterCategory(null); setCurrent(1); }}
                                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-300 group ${filterCategory === null ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' : 'hover:bg-white hover:shadow-sm text-slate-600'}`}
                                >
                                    <CompassFilled className={filterCategory === null ? "text-white" : "text-slate-400 group-hover:text-indigo-500"} />
                                    <span className="font-medium">Tất cả sách</span>
                                </div>

                                <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mt-6 mb-2">Danh mục</p>
                                {categories.map(c => (
                                    <div
                                        key={c._id}
                                        onClick={() => { setFilterCategory(c._id); setCurrent(1); scrollToTop(); }}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group ${filterCategory === c._id ? 'bg-white text-indigo-600 shadow-md font-bold border-l-4 border-indigo-600' : 'hover:bg-white/60 hover:text-slate-900 text-slate-500'}`}
                                    >
                                        <ReadFilled className={filterCategory === c._id ? "text-indigo-600" : "text-slate-300 group-hover:text-indigo-400"} />
                                        <span className="truncate">{c.tenDanhMuc}</span>
                                        {filterCategory === c._id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500"></div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 min-w-0 p-4 md:p-8 lg:p-10">
                        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-10">
                            <div>
                                <p className="text-slate-500 text-lg">Chào độc giả, hôm nay bạn muốn đắm mình vào thế giới nào?</p>
                            </div>

                            <div className="relative w-full xl:w-[500px]">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
                                    <SearchOutlined className="text-slate-400 text-xl group-focus-within:text-indigo-500 transition-colors" />
                                </div>

                                <Input
                                    size="large"
                                    placeholder="Tìm kiếm tác phẩm, tác giả..."
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setCurrent(1); }}
                                    styles={{
                                        input: {
                                            paddingLeft: 48,
                                            paddingRight: 110,
                                        },
                                    }}
                                    className="rounded-full border-0 bg-white shadow-sm hover:shadow-md focus:shadow-lg transition-all text-base placeholder:text-slate-400"
                                />

                                <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100 pointer-events-none">
                                    {total} SÁCH
                                </div>
                            </div>
                        </div>

                        <Spin spinning={loading} tip="Đang tải...">
                            <div className="min-h-[400px]">
                                {books.length > 0 ? (
                                    <Row gutter={[24, 24]}>
                                        {books.map((book) => (
                                            <Col xs={24} sm={12} md={8} lg={6} key={book._id}>
                                                <Card
                                                    hoverable
                                                    className="h-full flex flex-col rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                                                    bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '12px' }} // Padding nhỏ hơn chút cho gọn
                                                    onClick={() => navigate(`/library/${book._id}`)}
                                                    cover={
                                                        <div className="h-56 p-2 relative bg-white flex justify-center items-center border-b border-gray-50 overflow-hidden">
                                                            <div className="w-full h-full transition-transform duration-500 group-hover:scale-105">
                                                                <FadeInImage
                                                                    src={book.hinhAnh}
                                                                    alt={book.tenSach}
                                                                    className="w-full h-full object-contain"
                                                                />
                                                            </div>

                                                            <div className="absolute inset-0 bg-black/10 hidden group-hover:flex items-center justify-center transition-all z-10 backdrop-blur-[1px]">
                                                                <Button type="primary" shape="round" size="small">
                                                                    Xem chi tiết
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    }
                                                >
                                                    <div className="flex flex-col h-full">
                                                        <div className="mb-2">
                                                            <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">
                                                                {book.maDanhMuc?.tenDanhMuc || 'Khác'}
                                                            </span>
                                                        </div>

                                                        <div className="mb-1">
                                                            <h3
                                                                className="text-base font-bold text-gray-800 leading-snug group-hover:text-blue-600 transition-colors"
                                                                style={{
                                                                    display: '-webkit-box',
                                                                    WebkitLineClamp: 2,
                                                                    WebkitBoxOrient: 'vertical',
                                                                    overflow: 'hidden',
                                                                    lineHeight: '1.25rem',
                                                                    maxHeight: '2.5rem',
                                                                }}
                                                                title={book.tenSach}
                                                            >
                                                                {book.tenSach}
                                                            </h3>
                                                        </div>

                                                        <div className="text-gray-400 text-xs mb-3 truncate">
                                                            {book.maTacGia?.map(tg => tg.tenTacGia).join(', ') || 'Chưa cập nhật'}
                                                        </div>

                                                        <Button
                                                            type="primary"
                                                            size="large"
                                                            className="mt-auto flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 h-12 text-lg font-bold shadow-md shadow-orange-200 border-none transition-all hover:scale-[1.02]"
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
                                    <div className="h-[60vh] flex flex-col items-center justify-center text-center">
                                        <div className="w-64 h-64 bg-slate-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                            <SearchOutlined className="text-6xl text-slate-300" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-700 mb-2">Không tìm thấy sách nào</h3>
                                        <p className="text-slate-500">Thử tìm với từ khóa khác hoặc xóa bộ lọc xem sao nhé.</p>
                                        <Button type="primary" size="large" className="mt-6 bg-indigo-600" onClick={() => {setFilterCategory(null); setSearchTerm("");}}>
                                            Xem tất cả sách
                                        </Button>
                                    </div>
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
                                        scrollToTop();
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

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
                                precision={0}
                                max={Math.min(selectedBook?.soLuong, 10)}
                                style={{ width: '100%' }}
                                size="large"
                                inputMode="numeric"
                                onChange={handleQuantityChange}
                                onKeyDown={(e) => {
                                    const allowedKeys = [
                                        "Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"
                                    ];

                                    const maxValue = Math.min(selectedBook?.soLuong, 10);
                                    if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
                                        e.preventDefault();
                                        return;
                                    }

                                    const inputValue = e.target.value;
                                    const nextValue = Number(inputValue + e.key);

                                    if (/[0-9]/.test(e.key) && nextValue > maxValue) {
                                        e.preventDefault();
                                    }
                                }}

                                parser={(value) => {
                                    if (!value) return null;
                                    const num = value.replace(/\D/g, "");
                                    if (!num) return null;
                                    const maxValue = Math.min(selectedBook?.soLuong, 10);
                                    return Math.min(Number(num), maxValue);
                                }}

                                formatter={(value) => value}
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
        </ConfigProvider>
    );
};

export default LibraryPage;