import {Avatar, Badge, Button, Dropdown, Menu, Space} from "antd";
import {
    BookOutlined,
    HistoryOutlined,
    HomeOutlined,
    LogoutOutlined, ShoppingCartOutlined,
    UserOutlined
} from "@ant-design/icons";
import {Link, useNavigate} from "react-router-dom";
import {usePage} from "../../context/NavContext.jsx";
import {useAuth} from "../../context/AuthContext.jsx";
import {useBookcase} from "../../context/BookcaseContext.jsx";
import NotificationBell from "../NotificationBell.jsx";
import logo from "../../assets/images/logo.png";

const Header = () => {
    const {activePage, setActivePage} = usePage();
    const { Bookcase } = useBookcase();
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuth();

    const userMenu = (
        <Menu>
            <Menu.Item key="profile" icon={<UserOutlined />}>
                <Link to="/profile">Hồ sơ cá nhân</Link>
            </Menu.Item>
            <Menu.Item key="loans" icon={<HistoryOutlined />}>
                <Link to="/loans">Lịch sử mượn trả</Link>
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="logout" icon={<LogoutOutlined />} danger onClick={logout}>
                Đăng xuất
            </Menu.Item>
        </Menu>
    );

    const handleClickHome = () => {
        setActivePage('home')
        navigate(`/`);
    };

    const handleClickLib = () => {
        setActivePage('library');
        navigate(`/library`);
    };

    console.log(user.hinhAnh)

    return (
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm px-6 py-3 flex justify-between items-center border-b border-gray-100">
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                    <img className="w-12 h-12 object-cover mr-2" src={logo}/>
                    <span className="text-xl font-bold text-gray-800 hidden md:block">Olive Gallery</span>
                </div>

                <nav className="hidden md:flex gap-1">
                    <Button
                        type={activePage === 'home' ? 'primary' : 'text'}
                        icon={<HomeOutlined />}
                        onClick={handleClickHome}
                        className={` ${ activePage === 'home' ? 'bg-blue-100 text-blue-700 font-semibold border-none' : 'text-gray-600' } focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 `}
                    >
                        Trang chủ
                    </Button>
                    <Button
                        type={activePage === 'library' ? 'primary' : 'text'}
                        icon={<BookOutlined />}
                        onClick={handleClickLib}
                        className={` ${ activePage === 'library' ? 'bg-blue-100 text-blue-700 font-semibold border-none' : 'text-gray-600' } focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 `}
                    >
                        Thư viện sách
                    </Button>
                </nav>
            </div>

            <div className="flex items-center gap-6">
                {isAuthenticated && (
                    <div id="cart-icon" className="relative">
                        <Badge count={Bookcase.length} showZero>
                            <Button
                                icon={<ShoppingCartOutlined style={{ fontSize: '24px', outline: "none" }} />}
                                type="text"
                                onClick={() => navigate('/bookcase')}
                            />
                        </Badge>
                    </div>

                )}

                {!isAuthenticated ? ( <div className="flex gap-3">
                    <button
                        onClick={() => navigate("/login")}
                        className="px-4 py-1 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                    >
                        Đăng nhập
                    </button>

                    <button
                        onClick={() => navigate("/register")}
                        className="px-4 py-1 rounded-lg bg-gray-300 hover:bg-gray-400"
                    >
                        Đăng ký
                    </button>
                </div>) : (
                    <div className="flex items-center gap-4 h-full">
                        <NotificationBell />
                        <Dropdown overlay={userMenu} trigger={['click']} placement="bottomRight">
                            <Space className="cursor-pointer hover:bg-gray-100 p-2 rounded transition">
                                <Avatar src={user.hinhAnh}  icon={!user.hinhAnh ? <UserOutlined style={{ color: '#8a8d91' }} /> : undefined} style={{ backgroundColor: '#ffffff', border: '1px solid #b0b3b8', }} />
                                <span className="hidden md:block font-medium text-gray-700">
                                    {user.hoVaTen}
                                </span>
                            </Space>
                        </Dropdown>
                    </div>
                )}
            </div>
        </header>
    )
}

export default Header;