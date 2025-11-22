import {  Button, Collapse, } from 'antd';
import { ReadOutlined, SafetyCertificateOutlined, ArrowRightOutlined, CalendarOutlined } from '@ant-design/icons';
import {useNavigate} from "react-router-dom";
import {useEffect} from "react";
import {usePage} from "../../context/NavContext.jsx";

const { Panel } = Collapse;

// --- 1. DỮ LIỆU GIẢ LẬP (MOCK DATA) ---

// Bài viết / Tin tức (Mới thêm)
const mockArticles = [
    { id: 1, title: "Triển lãm Sách Nghệ thuật 2025", date: "15/11/2025", image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80", summary: "Khám phá những cuốn sách nghệ thuật độc đáo nhất tại Olive Gallery tuần này." },
    { id: 2, title: "Top 10 cuốn sách IT phải đọc", date: "12/11/2025", image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80", summary: "Những đầu sách kinh điển dành cho lập trình viên muốn nâng cao tư duy." },
    { id: 3, title: "Thông báo về việc gia hạn sách", date: "10/11/2025", image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=600&q=80", summary: "Thư viện cập nhật chính sách gia hạn sách online mới, áp dụng từ tháng 12." },
];

const libraryRules = [
    { key: '1', title: 'Thời hạn mượn sách', content: 'Mỗi cuốn sách được mượn tối đa 14 ngày. Nếu muốn gia hạn, vui lòng thực hiện trước ngày hết hạn 2 ngày.' },
    { key: '2', title: 'Số lượng sách được mượn', content: 'Mỗi độc giả được mượn tối đa 5 cuốn sách cùng một lúc.' },
    { key: '3', title: 'Quy định về bảo quản', content: 'Không viết, vẽ bậy, gấp trang hoặc làm rách sách. Mọi hư hại sẽ phải bồi thường theo giá trị thực tế của sách + phí xử lý.' },
    { key: '4', title: 'Mức phạt trả trễ', content: 'Trả sách trễ hạn sẽ bị phạt 5.000 VNĐ / cuốn / ngày.' },
];

const HomePage = () => {
    const { setActivePage } = usePage();
    const navigate = useNavigate();
    useEffect(() => {
        setActivePage("home");
    }, [setActivePage]);
    const handleClick = () => {
        navigate('/library');
    }
    return (
        <>
            <div className="animate-fade-in">
                {/* Banner */}
                <div className="mb-12 relative bg-gradient-to-r from-gray-900 to-blue-900 rounded-3xl overflow-hidden shadow-2xl h-64 flex items-center">
                    <div className="absolute inset-0 opacity-30">
                        <img src="https://images.unsplash.com/photo-1507842217121-9e962805aeea?auto=format&fit=crop&w=1200&q=80" alt="Library bg" className="w-full h-full object-cover" />
                    </div>
                    <div className="relative z-10 px-8 md:px-12 w-full">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Chào mừng đến với <br/> Olive Gallery Library</h1>
                        <p className="text-gray-200 text-lg mb-6 max-w-2xl">Không gian tri thức hiện đại. Cập nhật những đầu sách mới nhất và các sự kiện văn hóa nổi bật.</p>
                        <Button type="primary" size="large" icon={<ArrowRightOutlined />} onClick={handleClick} className="bg-blue-500 border-none h-12 px-8 text-lg rounded-full">
                            Vào Thư Viện Ngay
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Cột Trái: Tin tức & Bài viết */}
                    <div className="lg:col-span-2">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <ReadOutlined className="text-blue-600"/> Tin tức & Bài viết
                            </h2>
                            <Button type="link">Xem tất cả</Button>
                        </div>

                        <div className="grid gap-6">
                            {mockArticles.map(article => (
                                <div key={article.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col md:flex-row border border-gray-100">
                                    <div className="w-full md:w-48 h-48 md:h-auto flex-shrink-0">
                                        <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="p-6 flex flex-col justify-center">
                                        <div className="text-gray-400 text-sm mb-2 flex items-center gap-1"><CalendarOutlined /> {article.date}</div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2 hover:text-blue-600 cursor-pointer transition-colors">{article.title}</h3>
                                        <p className="text-gray-600 line-clamp-2">{article.summary}</p>
                                        <Button type="link" className="p-0 mt-3 text-left w-fit">Đọc tiếp →</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Cột Phải: Nội quy (Sidebar) */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <SafetyCertificateOutlined className="text-orange-500"/> Quy định cần biết
                            </h2>
                            <Collapse ghost accordion defaultActiveKey={['1']}>
                                {libraryRules.map(rule => (
                                    <Panel header={<span className="font-semibold text-gray-700">{rule.title}</span>} key={rule.key}>
                                        <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded border-l-2 border-orange-400">{rule.content}</p>
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
        </>
    );
};

export default HomePage;