import React from 'react';
import { Layout, Button, Avatar, Dropdown, Badge, Space, theme } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    LogoutOutlined,
    BellOutlined,
    SettingOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {useAuth} from "../../context/AuthContext.jsx";

const { Header } = Layout;

const AdminHeader = ({ collapsed, setCollapsed }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    const menuItems = [
        {
            key: '1',
            icon: <SettingOutlined />,
            label: 'Cài đặt hệ thống',
        },
        {
            type: 'divider',
        },
        {
            key: '2',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            danger: true,
            onClick: handleLogout
        },
    ];

    return (
        <Header
            style={{
                padding: 0,
                background: colorBgContainer,
            }}
            className="flex justify-between items-center shadow-sm sticky top-0 z-10 px-4"
        >
            <div className="flex items-center">
                <Button
                    type="text"
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={() => setCollapsed(!collapsed)}
                    style={{
                        fontSize: '16px',
                        width: 64,
                        height: 64,
                    }}
                />
                <span className="text-lg font-semibold text-gray-700 hidden md:block ml-2">
                    Hệ thống quản trị
                </span>
            </div>
            <div className="flex items-center gap-6 pr-4">
                <div className="cursor-pointer hover:bg-gray-100 p-2 rounded-full ">
                    <Badge count={5} size="small">
                        <BellOutlined style={{ fontSize: '20px', color: '#555' }} />
                    </Badge>
                </div>
                <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
                    <Space className="cursor-pointer hover:bg-gray-100 p-2 rounded-lg  border border-transparent">
                        <div className="flex items-center mr-3">
                            <Avatar
                                icon={<UserOutlined />}
                                style={{ backgroundColor: '#001529' }}
                            />
                        </div>

                        <div className="hidden md:flex flex-col items-end leading-tight">
                            <span className="font-bold text-gray-700 text-sm mb-1">
                                {user?.hoVaTen || user?.email || "Admin"}
                            </span>
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                                Administrator
                            </span>
                        </div>
                    </Space>
                </Dropdown>
            </div>
        </Header>
    );
};

export default AdminHeader;