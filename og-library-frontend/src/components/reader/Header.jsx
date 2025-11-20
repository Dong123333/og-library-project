import logo from "../../assets/images/logo.png";
import {Avatar, Badge, Button, Dropdown} from "antd";
import {BellOutlined, BookOutlined, HomeOutlined} from "@ant-design/icons";
import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {usePage} from "../../context/NavContext.jsx";

const Header = () => {
    const {activePage, setActivePage} = usePage();
    const isLoggedIn = !!localStorage.getItem("role");
    const navigate = useNavigate();
    const userMenu = [
        { key: '1', label: 'Thông tin tài khoản' },
        { key: '2', label: 'Đổi mật khẩu' },
        { key: '3', label: 'Lịch sử mượn', onClick: () => {
                navigate('/loans');
            } },
        { key: '4', label: 'Đăng xuất', danger: true, onClick: () => {
                localStorage.removeItem('role');
                window.location.href = '/login';
            } },
    ];

    const handleClickHome = () => {
        setActivePage('home')
        navigate(`/`);
    };

    const handleClickLib = () => {
        if (!isLoggedIn) {
            navigate(`/login`);
        } else {
            setActivePage('library');
            navigate(`/lib`);
        }

    };

    return (
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm px-6 py-3 flex justify-between items-center border-b border-gray-100">
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActivePage('home')}>
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
                {isLoggedIn && ( <Badge count={2} size="small">
                    <BellOutlined className="text-xl text-gray-500 cursor-pointer hover:text-blue-600" />
                </Badge>)}

                {!isLoggedIn ? ( <div className="flex gap-3">
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
                </div>) : (<Dropdown menu={{ items: userMenu }} trigger={['click']}>
                    <div className="flex items-center cursor-pointer gap-2 hover:bg-gray-100 p-1 rounded-full pr-3 transition">
                        <Avatar size="large"
                                src="https://api.dicebear.com/7.x/micah/svg?seed=Student&baseColor=f9c9b6&hair=danny"
                                className="border border-gray-200 bg-yellow-100"/>
                        <span className="font-medium text-gray-700 hidden sm:block">Nguyễn Văn A</span>
                    </div>
                </Dropdown>)}



            </div>
        </header>
    )
}

export default Header;