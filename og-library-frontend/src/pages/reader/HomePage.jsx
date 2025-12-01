import {Button, Carousel, Collapse,} from 'antd';
import { ReadOutlined, SafetyCertificateOutlined, ArrowRightOutlined, CalendarOutlined } from '@ant-design/icons';
import {useNavigate} from "react-router-dom";
import {useEffect} from "react";
import {usePage} from "../../context/NavContext.jsx";

const { Panel } = Collapse;

const mockArticles = [
    { id: 1, title: "Triển lãm Sách Nghệ thuật 2025", date: "15/11/2025", image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80", summary: "Khám phá những cuốn sách nghệ thuật độc đáo nhất tại Olive Gallery tuần này." },
    { id: 2, title: "Top 10 cuốn sách IT phải đọc", date: "12/11/2025", image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80", summary: "Những đầu sách kinh điển dành cho lập trình viên muốn nâng cao tư duy." },
    { id: 3, title: "Thông báo về việc gia hạn sách", date: "10/11/2025", image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=600&q=80", summary: "Thư viện cập nhật chính sách gia hạn sách online mới, áp dụng từ tháng 12." },
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

const HomePage = () => {
    const { setActivePage } = usePage();
    const navigate = useNavigate();
    useEffect(() => {
        setActivePage("home");
    }, [setActivePage]);
    return (
        <>
            <div className="animate-fade-in">
                <div className="mb-12 rounded-3xl overflow-hidden shadow-2xl group">
                    <Carousel
                        autoplay
                        autoplaySpeed={4000}
                        effect="fade"
                        dots={true}
                    >
                        {banners.map((item) => (
                            <div key={item.id}>
                                <div className="relative h-80 md:h-96 w-full">
                                    <img
                                        src={item.image}
                                        alt="Banner"
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://placehold.co/1200x600/2d3748/FFF?text=Olive+Gallery+Library";
                                        }}
                                    />

                                    <div className="absolute inset-0 bg-black/40"></div>

                                    <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 max-w-4xl">
                                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight drop-shadow-lg animate-fade-in-up">
                                            {item.title}
                                        </h1>
                                        <p className="text-gray-100 text-lg mb-8 max-w-2xl drop-shadow-md animate-fade-in-up delay-100">
                                            {item.desc}
                                        </p>
                                        <div className="animate-fade-in-up delay-200">
                                            <Button
                                                type="primary"
                                                size="large"
                                                icon={<ArrowRightOutlined />}
                                                onClick={() => navigate('/library')}
                                                className="bg-blue-600 border-none h-12 px-8 text-lg rounded-full hover:bg-blue-500 shadow-lg"
                                            >
                                                Vào Thư Viện Ngay
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Carousel>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
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

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 sticky top-24">
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
        </>
    );
};

export default HomePage;