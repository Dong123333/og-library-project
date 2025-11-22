import React, {useEffect, useRef, useState} from 'react';
import {Layout, Card, Row, Col, Pagination, Spin, Input, Tag, Empty, Select, Button, ConfigProvider} from 'antd';
import axios from "../../services/axios.customize";
import {ArrowRightOutlined, SearchOutlined} from "@ant-design/icons";
import {usePage} from "../../context/NavContext.jsx";
import {useNavigate} from "react-router-dom";
import useDebounce from "../../hooks/UseDebounce.jsx";

const { Content } = Layout;
const { Meta } = Card;


const LibraryPage = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const { setActivePage } = usePage();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);

    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(8);
    const [total, setTotal] = useState(0);

    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState(null);
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const topRef = useRef(null);

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

    return (
        <div ref={topRef} className="scroll-mt-0">
        <Layout className="min-h-screen">
            <div className="animate-fade-in">
                <div className="flex items-center gap-2 mb-6 text-gray-500 cursor-pointer hover:text-blue-600 w-fit" onClick={handleClick}>
                    <ArrowRightOutlined className="rotate-180" /> Quay lại
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 min-h-[600px]">
                    <div className="flex flex-col md:flex-row gap-4 mb-8 mt-4">
                        <Input
                            size="large"
                            placeholder="Nhập tên sách..."
                            prefix={<SearchOutlined />}
                            className="flex-grow"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
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
                                                className="h-full flex flex-col rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                                                cover={
                                                    <div className="h-60 p-4 bg-[#f0f2f5] relative group">
                                                        <img
                                                            alt={book.tenSach}
                                                            src={book.hinhAnh || "https://placehold.co/400x600?text=No+Image"}
                                                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-h-[90%] max-w-[90%] object-contain shadow-md transition-transform duration-300 group-hover:scale-110"
                                                        />
                                                        <div className="absolute inset-0 bg-black/20 hidden group-hover:flex items-center justify-center transition-all">
                                                            <Button type="primary" shape="round" onClick={() => navigate(`/book/${book._id}`)}>
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
                                                                    {/* Hiển thị mảng tác giả */}
                                                                    <span className="block truncate">
                                                                    ✍️ {book.maTacGia?.map(tg => tg.tenTacGia).join(', ') || 'Chưa cập nhật'}
                                                                </span>
                                                                </div>
                                                            }
                                                        />
                                                    </div>
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
                    <div className="flex justify-center mt-10">
                        <Pagination
                            current={current}
                            pageSize={pageSize}
                            total={total}
                            showSizeChanger
                            pageSizeOptions={['4', '8', '12', '20']}
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
        </Layout>
        </div>
    );
};

export default LibraryPage;