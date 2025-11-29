import React, { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import {
    DashboardOutlined,
    BookOutlined,
    DatabaseOutlined,
    AppstoreOutlined,
    TeamOutlined, BankOutlined, DollarCircleOutlined
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import LibrarianHeader from "../../components/librarian/Header.jsx";

const { Sider, Content } = Layout;

const LibrarianLayout = ({ children }) => {
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
                    defaultOpenKeys={['catalog']}

                    items={[
                        {
                            key: '/librarian',
                            icon: <DashboardOutlined />,
                            label: <Link to="/librarian">Dashboard</Link>,
                        },

                        {
                            key: 'catalog',
                            icon: <BookOutlined />,
                            label: 'Quản Lý Kho Sách',
                            children: [
                                {
                                    key: '/librarian/books',
                                    icon: <BookOutlined />,
                                    label: <Link to="/librarian/books">Sách</Link>,
                                },
                                {
                                    key: '/librarian/categories',
                                    icon: <AppstoreOutlined />,
                                    label: <Link to="/librarian/categories">Danh Mục</Link>,
                                },
                                {
                                    key: '/librarian/authors',
                                    icon: <TeamOutlined />,
                                    label: <Link to="/librarian/authors">Tác Giả</Link>,
                                },
                                {
                                    key: '/librarian/publishers',
                                    icon: <BankOutlined />,
                                    label: <Link to="/librarian/publishers">Nhà Xuất Bản</Link>,
                                },
                            ]
                        },

                        {
                            key: '/librarian/loans',
                            icon: <DatabaseOutlined />,
                            label: <Link to="/librarian/loans">Quản Lý Mượn/Trả</Link>,
                        },
                        {
                            key: '/librarian/penalties',
                            icon: <DollarCircleOutlined />,
                            label: <Link to="/librarian/penalties">Quản Lý Phiếu Phạt</Link>,
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
                <LibrarianHeader collapsed={collapsed} setCollapsed={setCollapsed} />
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

export default LibrarianLayout;