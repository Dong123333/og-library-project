import {useEffect, useState} from "react";
import {ArrowRightOutlined, SearchOutlined, ShoppingCartOutlined} from "@ant-design/icons";
import {Button, Card, Empty, Input, Modal, Select, Tag} from "antd";
import Meta from "antd/es/card/Meta.js";
import {usePage} from "../context/NavContext.jsx";
import {Navigate, useNavigate} from "react-router-dom";

const mockBooks = [
    { id: 1, title: "Nhà Giả Kim", author: "Paulo Coelho", category: "Tiểu thuyết", cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80", status: "available", rating: 4.8 },
    { id: 2, title: "Số Đỏ", author: "Vũ Trọng Phụng", category: "Văn học Việt Nam", cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80", status: "borrowed", rating: 4.6 },
    { id: 3, title: "Đắc Nhân Tâm", author: "Dale Carnegie", category: "Kỹ năng sống", cover: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=400&q=80", status: "available", rating: 4.9 },
    { id: 4, title: "Dế Mèn Phiêu Lưu Ký", author: "Tô Hoài", category: "Thiếu nhi", cover: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=400&q=80", status: "available", rating: 4.5 },
    { id: 5, title: "Harry Potter và Hòn Đá Phù Thủy", author: "J.K. Rowling", category: "Fantasy", cover: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=400&q=80", status: "borrowed", rating: 5.0 },
    { id: 6, title: "Dạy Con Làm Giàu", author: "Robert Kiyosaki", category: "Tài chính", cover: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=400&q=80", status: "available", rating: 4.7 },
    { id: 7, title: "Nỗi Buồn Chiến Tranh", author: "Bảo Ninh", category: "Văn học Việt Nam", cover: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=400&q=80", status: "available", rating: 4.7 },
    { id: 8, title: "Thép Đã Tôi Thế Đấy", author: "Nikolai Ostrovsky", category: "Tiểu thuyết", cover: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=400&q=80", status: "borrowed", rating: 4.4 },
    { id: 9, title: "Tuổi Trẻ Đáng Giá Bao Nhiêu", author: "Rosie Nguyễn", category: "Phát triển bản thân", cover: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=400&q=80", status: "available", rating: 4.9 },
    { id: 10, title: "Không Gia Đình", author: "Hector Malot", category: "Văn học kinh điển", cover: "https://images.unsplash.com/photo-1473862170180-97d0734e1e48?auto=format&fit=crop&w=400&q=80", status: "available", rating: 4.8 },

    { id: 11, title: "Những Người Khốn Khổ", author: "Victor Hugo", category: "Văn học kinh điển", cover: "https://images.unsplash.com/photo-1473862170180-97d0734e1e48?auto=format&fit=crop&w=400&q=80", status: "borrowed", rating: 5.0 },
    { id: 12, title: "Hạt Giống Tâm Hồn", author: "Nhiều tác giả", category: "Truyền cảm hứng", cover: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=400&q=80", status: "available", rating: 4.3 },
    { id: 13, title: "Bố Già", author: "Mario Puzo", category: "Tội phạm", cover: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=400&q=80", status: "borrowed", rating: 4.9 },
    { id: 14, title: "Totto-Chan", author: "Tetsuko Kuroyanagi", category: "Thiếu nhi", cover: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=400&q=80", status: "available", rating: 4.8 },
    { id: 15, title: "Sapiens", author: "Yuval Noah Harari", category: "Lịch sử", cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80", status: "available", rating: 4.9 },

    { id: 16, title: "Tư Duy Nhanh Và Chậm", author: "Daniel Kahneman", category: "Tâm lý học", cover: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=400&q=80", status: "borrowed", rating: 4.8 },
    { id: 17, title: "Kẻ Trộm Sách", author: "Markus Zusak", category: "Tiểu thuyết", cover: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=400&q=80", status: "available", rating: 4.7 },
    { id: 18, title: "Sherlock Holmes", author: "Arthur Conan Doyle", category: "Trinh thám", cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80", status: "available", rating: 5.0 },
    { id: 19, title: "Hoàng Tử Bé", author: "Antoine de Saint-Exupéry", category: "Thiếu nhi", cover: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=400&q=80", status: "borrowed", rating: 4.8 },
    { id: 20, title: "Mắt Biếc", author: "Nguyễn Nhật Ánh", category: "Văn học Việt Nam", cover: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=400&q=80", status: "available", rating: 4.9 },

    { id: 21, title: "Truyện Kiều", author: "Nguyễn Du", category: "Văn học Việt Nam", cover: "https://images.unsplash.com/photo-1473862170180-97d0734e1e48?auto=format&fit=crop&w=400&q=80", status: "available", rating: 5.0 },
    { id: 22, title: "Chiến Tranh và Hòa Bình", author: "Leo Tolstoy", category: "Kinh điển", cover: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=400&q=80", status: "borrowed", rating: 4.9 },
    { id: 23, title: "Thế Giới Phẳng", author: "Thomas L. Friedman", category: "Kinh tế", cover: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=400&q=80", status: "available", rating: 4.6 },
    { id: 24, title: "Flow", author: "Mihaly Csikszentmihalyi", category: "Tâm lý học", cover: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=400&q=80", status: "available", rating: 4.8 },
    { id: 25, title: "Cây Cam Ngọt Của Tôi", author: "José Mauro de Vasconcelos", category: "Thiếu nhi", cover: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=400&q=80", status: "borrowed", rating: 4.9 },

    { id: 26, title: "Chí Phèo", author: "Nam Cao", category: "Văn học Việt Nam", cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80", status: "available", rating: 4.7 },
    { id: 27, title: "Tắt Đèn", author: "Ngô Tất Tố", category: "Văn học Việt Nam", cover: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=400&q=80", status: "borrowed", rating: 4.6 },
    { id: 28, title: "Những Tấm Lòng Cao Cả", author: "Edmondo De Amicis", category: "Thiếu nhi", cover: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=400&q=80", status: "available", rating: 4.8 },
    { id: 29, title: "Doraemon Tập 1", author: "Fujiko F. Fujio", category: "Truyện tranh", cover: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=400&q=80", status: "available", rating: 4.7 },
    { id: 30, title: "Alice ở Xứ Sở Thần Tiên", author: "Lewis Carroll", category: "Fantasy", cover: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=400&q=80", status: "borrowed", rating: 4.8 }

];
const LibPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const { setActivePage } = usePage();
    const navigate = useNavigate();

    const filteredBooks = mockBooks.filter(book => {
        const matchTerm = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || book.author.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCategory = selectedCategory === 'All' || book.category === selectedCategory;
        return matchTerm && matchCategory;
    });

    const showBookDetail = (book) => {
        setSelectedBook(book);
        setIsModalVisible(true);
    };

    useEffect(() => {
        setActivePage("library"); // khi vào trang sách, tự highlight
    }, [setActivePage]);
    const handleClick = () => {
        setActivePage('home')
        navigate('/')
    }

    return (
        <>
            <div className="animate-fade-in">
                <div className="flex items-center gap-2 mb-6 text-gray-500 cursor-pointer hover:text-blue-600 w-fit" onClick={handleClick}>
                    <ArrowRightOutlined className="rotate-180" /> Quay lại
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 min-h-[600px]">
                    <div className="flex flex-col md:flex-row gap-4 mb-8 mt-4">
                        <Input size="large" placeholder="Nhập tên sách, tác giả..." prefix={<SearchOutlined />} className="flex-grow" onChange={(e) => setSearchTerm(e.target.value)}/>
                        <Select defaultValue="All" size="large" style={{ width: 200 }} onChange={setSelectedCategory}>
                            <Option value="All">Tất cả thể loại</Option>
                            <Option value="Tiểu thuyết">Tiểu thuyết</Option>
                            <Option value="Công nghệ">Công nghệ</Option>
                            <Option value="Lịch sử">Lịch sử</Option>
                        </Select>
                    </div>

                    {filteredBooks.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                            {filteredBooks.map(book => (
                                <Card key={book.id} hoverable cover={<div className="h-56 relative group"><img alt={book.title} src={book.cover} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" /></div>} onClick={() => showBookDetail(book)} bodyStyle={{ padding: '12px' }}>
                                    <Meta title={<span className="text-base font-semibold truncate block">{book.title}</span>} description={<div className="flex justify-between items-center mt-1"><span className="text-xs text-gray-500 truncate max-w-[60%]">{book.author}</span><Tag color="blue" style={{marginRight:0, fontSize:'10px'}}>{book.category}</Tag></div>} />
                                </Card>
                            ))}
                        </div>
                    ) : <Empty description="Không tìm thấy sách" className="mt-20" />}

                </div>


            </div>
            <Modal
                title={null}
                footer={null}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                width={800}
                centered
            >
                {selectedBook && (
                    <div className="flex flex-col md:flex-row gap-6 p-4">
                        <img src={selectedBook.cover} alt={selectedBook.title} className="w-full md:w-1/3 rounded-lg object-cover shadow-md" />
                        <div className="flex-grow">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedBook.title}</h2>
                            <p className="text-lg text-gray-600 mb-4">Tác giả: {selectedBook.author}</p>
                            <div className="space-y-2 mb-6">
                                <Tag color="blue">{selectedBook.category}</Tag>
                                <p className="mt-2"><strong>Đánh giá:</strong> {selectedBook.rating}/5.0</p>
                                <p><strong>Trạng thái:</strong>
                                    {selectedBook.status === 'available'
                                        ? <span className="text-green-600 font-bold ml-2">● Có sẵn</span>
                                        : <span className="text-red-600 font-bold ml-2">● Hết hàng</span>}
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<ShoppingCartOutlined />}
                                    disabled={selectedBook.status !== 'available'}
                                >
                                    Đăng ký Mượn
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    )
}

export default LibPage;