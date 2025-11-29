import React, { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import {
    DashboardOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import AdminHeader from "../../components/admin/Header.jsx";

const { Sider, Content } = Layout;

const AdminLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    const {
        token: { colorBgContainer },
    } = theme.useToken();

    return (
        <Layout style={{ height: '100vh', overflow: 'hidden' }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={250}
                style={{
                    overflow: 'auto',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    zIndex: 20
                }}
            >
                <div className="h-16 flex items-center justify-center text-white font-bold text-xl border-b border-gray-700 bg-[#002140]">
                    {collapsed ? 'OG' : 'OLIVE GALLERY'}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={[location.pathname]}

                    items={[
                        {
                            key: '/admin',
                            icon: <DashboardOutlined />,
                            label: <Link to="/admin">Dashboard</Link>,
                        },

                        {
                            key: '/admin/users',
                            icon: <UserOutlined />,
                            label: <Link to="/admin/users">Quản lý Người dùng</Link>,
                        },
                    ]}
                />
            </Sider>
            <Layout style={{
                marginLeft: collapsed ? 80 : 250,
                transition: 'all 0.2s',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <AdminHeader collapsed={collapsed} setCollapsed={setCollapsed} />
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: 8,
                    }}
                >
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;