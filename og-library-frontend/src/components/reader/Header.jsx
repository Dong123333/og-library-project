import logo from "../../assets/images/logo.png";
import {Avatar, Badge, Button, Dropdown, Menu, Space} from "antd";
import {
    BellOutlined,
    BookOutlined,
    HistoryOutlined,
    HomeOutlined,
    LogoutOutlined,
    UserOutlined
} from "@ant-design/icons";
import {Link, useNavigate} from "react-router-dom";
import {usePage} from "../../context/NavContext.jsx";
import {useAuth} from "../../context/AuthContext.jsx";

const Header = () => {
    const {activePage, setActivePage} = usePage();
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuth();

    const userMenu = (
        <Menu>
            <Menu.Item key="profile" icon={<UserOutlined />}>
                <Link to="/profile">Hồ sơ cá nhân</Link>
            </Menu.Item>
            <Menu.Item key="loans" icon={<HistoryOutlined />}>
                <Link to="/loans">Lịch sử mượn sách</Link>
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
        if (!isAuthenticated) {
            navigate(`/login`);
        } else {
            setActivePage('library');
            navigate(`/lib`);
        }

    };

    return (
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm px-6 py-3 flex justify-between items-center border-b border-gray-100">
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                    <img className="w-12 h-12 object-cover mr-2" src={logo}/>
                    <span className="text-xl font-bold text-gray-800 hidden md:block">Olive Gallery</span>
                </div>

                {/* Menu điều hướng */}
                <nav className="hidden md:flex gap-1">
                    <Button
                        type={activePage === 'home' ? 'primary' : 'text'}
                        icon={<HomeOutlined />}
                        onClick={handleClickHome}
                        className={activePage === 'home' ? 'bg-blue-100 text-blue-700 font-semibold border-none' : 'text-gray-600'}
                    >
                        Trang chủ
                    </Button>
                    <Button
                        type={activePage === 'library' ? 'primary' : 'text'}
                        icon={<BookOutlined />}
                        onClick={handleClickLib}
                        className={activePage === 'library' ? 'bg-blue-100 text-blue-700 font-semibold border-none' : 'text-gray-600'}
                    >
                        Thư viện số
                    </Button>
                </nav>
            </div>

            <div className="flex items-center gap-6">
                {isAuthenticated && ( <Badge count={2} size="small">
                    <BellOutlined className="text-xl text-gray-500 cursor-pointer hover:text-blue-600" />
                </Badge>)}

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
                </div>) : (<Dropdown overlay={userMenu} trigger={['click']} placement="bottomRight">
                    <Space className="cursor-pointer hover:bg-gray-100 py-1 px-2 rounded transition">
                        <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                        <span className="hidden md:block font-medium text-gray-700">
                                {user.fullName}
                            </span>
                    </Space>
                </Dropdown>)}



            </div>
        </header>
    )
}

export default Header;