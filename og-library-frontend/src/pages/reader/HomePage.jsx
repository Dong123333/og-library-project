import React, {useState, useEffect, useRef} from 'react';
import {Button, Carousel, Input, Tag, Collapse, Empty, Avatar} from 'antd';
import {
    SearchOutlined,
    ArrowRightOutlined,
    ReadOutlined,
    UserOutlined,
    EyeOutlined,
    StarFilled, LoadingOutlined, ClockCircleOutlined, SafetyCertificateOutlined,
    FireFilled, CrownFilled, TrophyFilled
} from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import { usePage } from "../../context/NavContext.jsx";
import axios from "../../services/axios.customize";
import useDebounce from "../../hooks/UseDebounce.jsx";
import {useAuth} from "../../context/AuthContext.jsx";

const { Panel } = Collapse;

const banners = [
    {
        id: 1,
        image: "https://res.cloudinary.com/dzc5ukalj/image/upload/v1764353628/468856566_592708886650966_6649774145922474098_n_bixavt.jpg",
        title: "Thư viện Tri thức Olive Gallery",
        desc: "Khám phá hàng nghìn đầu sách hấp dẫn, không gian văn hóa đẳng cấp."
    },
    {
        id: 2,
        image: "https://res.cloudinary.com/dzc5ukalj/image/upload/v1764591202/sach1_ladcop.avif",
        title: "Không gian đọc sách hiện đại",
        desc: "Trải nghiệm mượn trả sách nhanh chóng, tiện lợi chỉ với vài cú click."
    },
    {
        id: 3,
        image: "https://res.cloudinary.com/dzc5ukalj/image/upload/v1764591248/sach2_cgg0tb.avif",
        title: "Kết nối cộng đồng yêu sách",
        desc: "Nơi gặp gỡ, chia sẻ và lan tỏa văn hóa đọc đến mọi người."
    }
];

const libraryRules = [
    {
        key: '1',
        title: 'Thời hạn mượn sách',
        content: [
            'Mượn từ 1 - 5 cuốn: Hạn trả 30 ngày.',
            'Mượn từ 6 - 10 cuốn: Hạn trả 7 ngày.'
        ]
    },
    {
        key: '2',
        title: 'Số lượng sách',
        content: [
            'Mỗi độc giả được mượn tối đa 10 cuốn sách cùng một lúc.'
        ]
    },
    {
        key: '3',
        title: 'Quy định bảo quản',
        content: [
            'Không viết, vẽ bậy, gấp trang hoặc làm rách sách.',
            'Giữ gìn mã vạch và tem thư viện nguyên vẹn.'
        ]
    },
    {
        key: '4',
        title: 'Quy định Xử phạt & Bồi thường',
        content: [
            'Trả sách trễ hạn: Phạt 5.000 VNĐ / cuốn / ngày.',
            'Làm hư hỏng sách (Rách, vẽ bậy...): Đền bù 50% giá trị cuốn sách.',
            'Làm mất sách: Đền bù 100% giá trị cuốn sách + Phí xử lý (nếu có).'
        ]
    },
];

const HomePage = () => {
    const { setActivePage } = usePage();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('xuHuong');

    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const [trendingBooks, setTrendingBooks] = useState([]);
    const [newBooks, setNewBooks] = useState([]);
    const [recommendedBooks, setRecommendedBooks] = useState([]);
    const [topReaders, setTopReaders] = useState([]);

    useEffect(() => {
        setActivePage("home");
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setActivePage]);

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const [resNew, resTrending] = await Promise.all([
                    axios.get('/sach', {
                        params: {
                            page: 1,
                            limit: 9,
                            sort: '-createdAt'
                        }
                    }),

                    axios.get('/muon-tra/trending')
                ]);

                if (resNew && resNew.result) {
                    setNewBooks(resNew.result);
                }

                if (resTrending) {
                    const trendingData = Array.isArray(resTrending) ? resTrending : resTrending.data;
                    setTrendingBooks(trendingData);
                }
                if (isAuthenticated) {
                    const resRec = await axios.get('/muon-tra/recommended');
                    if(Array.isArray(resRec)) {
                        setRecommendedBooks(resRec);
                    }

                }

                const resTop = await axios.get('/muon-tra/top-readers');
                if (Array.isArray(resTop)) {
                    setTopReaders(resTop);
                }

            } catch (error) {
                console.error("Lỗi tải dữ liệu Home:", error);
            }
        };

        fetchHomeData();
    }, []);

    useEffect(() => {
        const fetchBooks = async () => {
            if (!debouncedSearchTerm.trim()) {
                setSuggestions([]);
                return;
            }
            setIsLoading(true);
            try {
                const response = await axios.get('/sach', {
                    params: {
                        page: 1,
                        limit: 5,
                        tenSach: debouncedSearchTerm
                    }
                });
                setSuggestions(response.result);
                setShowDropdown(true);
            } catch (error) {
                console.error("Lỗi tìm kiếm:", error);
                setSuggestions([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBooks();

    }, [debouncedSearchTerm]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        if (!e.target.value.trim()) {
            setShowDropdown(false);
        }
    };

    const handleEnterSearch = () => {
        if (searchTerm.trim()) {
            navigate(`/library?tenSach=${encodeURIComponent(searchTerm)}`);
            setShowDropdown(false);
        }
    };

    const displayMonth = topReaders.length > 0 ? topReaders[0].thang : new Date().getMonth() + 1;
    const displayYear = topReaders.length > 0 ? topReaders[0].nam : new Date().getFullYear();
    const formatMonth = (m) => (m < 10 ? `0${m}` : m);

    const champion = topReaders[0];
    const runnersUp = topReaders.slice(1, 5);

    const isRestricted = activeTab === 'goiY' && !isAuthenticated;

    const currentList = activeTab === 'xuHuong' ? trendingBooks
        : (activeTab === 'sachMoi' ? newBooks : recommendedBooks);

    return (
        <div className="animate-fade-in pb-12">
            <div className="relative h-[600px] mb-12 group">
                <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl z-0">
                    <Carousel autoplay autoplaySpeed={4000} effect="fade" dots={false}>
                        {banners.map((item) => (
                            <div key={item.id} className="relative h-[600px] w-full">
                                <img
                                    src={item.image}
                                    alt="Banner"
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[8000ms] group-hover:scale-110"
                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/1200x600/2d3748/FFF?text=Olive+Gallery"; }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                            </div>
                        ))}
                    </Carousel>
                </div>
                <div className="absolute inset-0 z-40 flex flex-col justify-center items-center px-4 text-center pointer-events-none">
                    <div className="max-w-4xl w-full animate-fade-in-up pointer-events-auto">
                        <Tag className="border-none bg-white/10 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-sm font-medium tracking-wide uppercase mb-6 inline-flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                            Hệ thống thư viện Olive Gallery
                        </Tag>

                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] drop-shadow-2xl mb-6">
                            Khơi nguồn tri thức<br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Kết nối đam mê</span>
                        </h1>

                        <div ref={searchRef} className="relative max-w-2xl mx-auto z-50">
                            <div className="p-2 pl-6 bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 flex items-center transition-transform hover:scale-[1.01]">
                                <Input
                                    prefix={isLoading ? <LoadingOutlined className="text-blue-500 text-lg mr-2" /> : <SearchOutlined className="text-gray-400 text-xl mr-2" />}
                                    placeholder="Tìm kiếm sách, tác giả..."
                                    bordered={false}
                                    className="text-gray-800 text-lg placeholder:text-gray-400 font-medium"
                                    value={searchTerm}
                                    onChange={(e) => handleSearchChange(e)}
                                    onPressEnter={handleEnterSearch}
                                    onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                                />
                                <Button
                                    type="primary"
                                    size="large"
                                    shape="round"
                                    icon={<ArrowRightOutlined />}
                                    className="bg-white text-blue-600 border-none h-10 w-10 flex items-center justify-center shadow-lg hover:bg-blue-50 hover:scale-110 transition-transform"
                                    onClick={handleEnterSearch}
                                />
                            </div>
                            {showDropdown && searchTerm && (
                                <div className="absolute top-full left-4 right-4 mt-2 bg-white rounded-2xl shadow-xl overflow-hidden z-[100] text-left animate-fade-in border border-slate-100">
                                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                        {suggestions.length > 0 ? (
                                            suggestions.map((book) => (
                                                <div
                                                    key={book.id || book._id}
                                                    onClick={() => navigate(`/library/${book.id || book._id}`)}
                                                    className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-none transition-colors"
                                                >
                                                    <div className="w-10 h-14 flex-shrink-0 bg-gray-200 rounded overflow-hidden">
                                                        <img src={book.hinhAnh} className="w-full h-full object-cover" alt="" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-700 text-sm line-clamp-1">{book.tenSach}</h4>
                                                        <p className="text-xs text-gray-500">{book?.maTacGia?.map(tg => tg.tenTacGia).join(', ') || "Tác giả đang cập nhật"}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            !isLoading && <div className="p-6 text-center text-gray-400"><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không tìm thấy sách" /></div>
                                        )}
                                    </div>
                                    {suggestions.length > 0 && (
                                        <div onClick={handleEnterSearch} className="p-3 bg-gray-50 text-center text-blue-600 text-sm font-bold cursor-pointer hover:bg-blue-100 transition-colors border-t border-gray-100">
                                            Xem tất cả kết quả
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-9xl mx-auto px-6 relative z-30 -mt-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { title: "Tổng đầu sách", count: "50,000+", icon: <ReadOutlined />, color: "from-amber-400 to-orange-500" },
                        { title: "Độc giả tích cực", count: "12,500+", icon: <UserOutlined />, color: "from-blue-400 to-indigo-500" },
                        { title: "Giờ mở cửa hôm nay", count: "09:00 - 17:00", icon: <ClockCircleOutlined />, color: "from-emerald-400 to-teal-500" },
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-900/10 border border-white/50 backdrop-blur-sm flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300">
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-3xl text-white shadow-lg`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-1">{stat.title}</p>
                                <h3 className="text-3xl font-extrabold text-slate-800">{stat.count}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="max-w-9xl mx-auto px-6 mt-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8">
                        <div className="flex flex-col sm:flex-row justify-between items-end mb-8 border-b border-slate-200 pb-4">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                                    <FireFilled style={{ color: 'red' }} /> Kệ Sách Nổi Bật
                                </h2>
                                <p className="text-slate-500 mt-2 font-medium">Những cuốn sách được cộng đồng quan tâm nhất tuần qua</p>
                            </div>

                            <div className="flex bg-slate-100 p-1 rounded-full mt-4 sm:mt-0">
                                {['xuHuong', 'sachMoi', 'goiY'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-5 py-2 cursor-pointer rounded-full text-sm font-bold transition-all duration-300 ${
                                            activeTab === tab
                                                ? 'bg-white text-blue-600 shadow-md transform scale-105'
                                                : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                    >
                                        {tab === 'xuHuong' ? 'Xu hướng' : (tab === 'sachMoi' ? 'Sách mới' : 'Gợi ý') }
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="min-h-[400px]">
                            {isRestricted ? (
                                <div className="flex flex-col items-center justify-center h-80 text-slate-400 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 animate-fade-in">
                                    <UserOutlined className="text-5xl mb-4 opacity-20"/>
                                    <p className="font-medium text-lg">Đăng nhập để xem gợi ý dành riêng cho bạn</p>
                                    <Button onClick={() => navigate('/login')} type="primary" className="mt-4 bg-slate-800">Đăng nhập ngay</Button>
                                </div>
                            ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10 animate-fade-in">
                                        {currentList.map((book, index) => (
                                            <div key={book._id} onClick={() => navigate(`/library/${book._id}`)} className="group w-full cursor-pointer">
                                                <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-lg transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-blue-900/20 group-hover:-translate-y-2 bg-slate-200">
                                                    <img src={book.hinhAnh} alt={book.tenSach} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />

                                                    {activeTab === 'xuHuong' && (
                                                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                                                            {index < 3 && (
                                                                <span className={`px-2 py-1 text-xs font-bold text-white rounded shadow-sm ${
                                                                    index === 0 ? 'bg-yellow-500' : (index === 1 ? 'bg-gray-400' : 'bg-orange-400')}`}>
                                                                    #{index + 1}
                                                                </span>
                                                            )}
                                                            <span className="px-2 py-1 text-xs font-bold bg-slate-900/80 text-white rounded backdrop-blur-sm shadow-sm flex items-center gap-1">
                                                                <FireFilled style={{ color: '#f97316' }} />
                                                                {book.totalBorrowed} lượt
                                                            </span>
                                                        </div>
                                                    )}

                                                    {activeTab === 'sachMoi' && (
                                                        <div className="absolute top-2 left-2">
                                                            <Tag color="blue" className="font-bold border-none shadow-sm">MỚI</Tag>
                                                        </div>
                                                    )}

                                                    {activeTab === 'goiY' && (
                                                        <div className="absolute top-2 left-2 px-2 py-1 bg-purple-600 text-white text-xs font-bold rounded shadow-sm flex items-center gap-1 backdrop-blur-md bg-opacity-90">
                                                            <StarFilled className="text-yellow-300" />
                                                            {book.maDanhMuc?.tenDanhMuc || "Gợi ý"}
                                                        </div>
                                                    )}

                                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-amber-500 flex items-center gap-1 shadow-sm z-10">
                                                        <StarFilled /> 5.0
                                                    </div>

                                                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center gap-3">
                                                        <Button onClick={() => navigate(`/library/${book._id}`)} shape="round" icon={<EyeOutlined />} className="bg-white text-slate-800 border-none hover:scale-105 transition-transform min-w-[120px]">Xem thử</Button>
                                                    </div>
                                                </div>
                                                <div className="mt-4 space-y-1">
                                                    <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">{book.maDanhMuc.tenDanhMuc}</div>
                                                    <h3 className="text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors" title={book.tenSach}>{book.tenSach}</h3>
                                                    <p className="text-sm text-slate-500 font-medium">{book?.maTacGia?.map(tg => tg.tenTacGia).join(', ') || "Tác giả đang cập nhật"}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            {!isRestricted && (
                                <div className="mt-10 text-center">
                                    <Button onClick={() => navigate('/library')} size="large" className="px-8 h-12 rounded-xl font-semibold hover:border-blue-500 hover:text-blue-600">
                                        Xem tất cả sách <ArrowRightOutlined />
                                    </Button>
                                </div>
                            )}

                        </div>
                    </div>

                    <div className="lg:col-span-4">
                        <div className="sticky top-24 flex flex-col gap-6">
                            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden relative">
                                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-b-[50%] opacity-10"></div>
                                <div className="p-6 relative z-10">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                            <TrophyFilled className="text-yellow-500" /> Bảng Vinh Danh
                                        </h3>
                                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg cursor-pointer hover:bg-blue-100">
                                            Tháng {formatMonth(displayMonth)}/{displayYear}
                                        </span>
                                    </div>

                                    {topReaders.length > 0 ? (
                                        <>
                                            {champion && (
                                                    <div className="flex flex-col items-center mb-8 relative group cursor-pointer">
                                                        <div className="absolute -top-6 animate-bounce">
                                                            <CrownFilled className="text-4xl text-yellow-400 drop-shadow-md" />
                                                        </div>

                                                        <div className="relative">
                                                            <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-yellow-400 via-yellow-200 to-yellow-500 shadow-lg shadow-yellow-200">
                                                                <Avatar size={72} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff', borderWidth: "4px", borderColor: "white", borderStyle: "solid" }}/>
                                                            </div>
                                                            <div className="absolute -bottom-2 -right-0 bg-yellow-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                                                                1
                                                            </div>
                                                        </div>

                                                        <div className="text-center mt-3">
                                                            <h4 className="font-bold text-slate-800 text-base">{champion.hoTen}</h4>
                                                            <div className="flex items-center justify-center gap-1 bg-gradient-to-r from-yellow-50 to-orange-50 px-3 py-1 rounded-full mt-1 border border-yellow-100">
                                                                <ReadOutlined className="text-orange-500 text-[12px]" />
                                                                <span className="text-[12px] font-bold text-orange-600 leading-none">{champion.totalBorrowed} cuốn</span>
                                                            </div>
                                                        </div>
                                                        <div className="absolute inset-0 bg-yellow-400/20 blur-3xl rounded-full -z-10 opacity-0 group-hover:opacity-50 transition-opacity"></div>
                                                    </div>
                                            )}

                                            <div className="flex flex-col gap-4">
                                                {runnersUp.map((reader, index) => {
                                                    const rank = index + 2;

                                                    let medalColor = "bg-slate-100 text-slate-500";
                                                    let icon = <span className="font-bold text-xs">{rank}</span>;
                                                    let ringColor = "border-transparent";

                                                    if (rank === 2) {
                                                        medalColor = "bg-slate-200 text-slate-600";
                                                        icon = <div className="w-2 h-2 rounded-full bg-slate-400"></div>;
                                                        ringColor = "border-slate-300";
                                                    }
                                                    if (rank === 3) {
                                                        medalColor = "bg-orange-100 text-orange-600";
                                                        icon = <div className="w-2 h-2 rounded-full bg-orange-400"></div>;
                                                        ringColor = "border-orange-200";
                                                    }

                                                    return (
                                                        <div key={reader._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer relative overflow-hidden">
                                                            <div className={`w-8 h-8 ${rank === 2 ? 'bg-gradient-to-br from-gray-200 to-gray-400 text-white' : (rank === 3 ? 'bg-gradient-to-br from-orange-200 to-orange-400 text-white' : 'bg-slate-100 text-slate-500')} rounded-lg flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0 z-10`}>
                                                                {rank}
                                                            </div>

                                                            <div className={`rounded-full p-[2px] ${ringColor} border z-10`}>
                                                                <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }}/>
                                                            </div>

                                                            <div className="flex-1 min-w-0 z-10">
                                                                <div className="flex justify-between items-center">
                                                                    <h4 className="font-bold text-slate-700 text-sm truncate group-hover:text-blue-600 transition-colors">
                                                                        {reader.hoTen}
                                                                    </h4>
                                                                    {rank <= 3 && <FireFilled style={{ color: "#fb923c", fontSize: "14px" }} />}
                                                                </div>

                                                                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full ${rank === 2 ? 'bg-slate-400' : (rank === 3 ? 'bg-orange-400' : 'bg-blue-400')}`}
                                                                        style={{ width: `${(reader.totalBorrowed / champion.totalBorrowed) * 100}%` }}
                                                                    ></div>
                                                                </div>
                                                                <p className="text-[10px] text-slate-400 mt-1 text-right">{reader.totalBorrowed} cuốn</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </>
                                        ) : (
                                            <div className="py-6 text-center">
                                                <Empty description="Chưa có dữ liệu" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                            </div>
                                        )}
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <SafetyCertificateOutlined className="text-orange-500"/> Quy định cần biết
                                </h2>
                                <Collapse ghost accordion defaultActiveKey={['1']}>
                                    {libraryRules.map(rule => (
                                        <Panel header={<span className="font-semibold text-gray-700">{rule.title}</span>} key={rule.key}>
                                            <ul className="pl-5 text-gray-600">
                                                {rule.content.map((line, index) => (
                                                    <li className="text-gray-600 text-sm bg-gray-50 p-3 rounded border-l-2 border-orange-400 mb-2" key={index}>{line}</li>
                                                ))}
                                            </ul>
                                        </Panel>
                                    ))}
                                </Collapse>
                                <div className="mt-6 p-4 bg-blue-50 rounded-xl text-center">
                                    <p className="text-blue-800 font-semibold mb-2">Cần hỗ trợ thêm?</p>
                                    <Button type="primary" ghost className="w-full">Liên hệ Thủ thư</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;