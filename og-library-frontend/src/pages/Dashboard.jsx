import React, { useState } from 'react'; // <-- 1. Thêm useState
import { useNavigate } from 'react-router-dom'; // <-- 2. Thêm Navigate
import {
    Layout,
    Menu,
    Avatar,
    Dropdown,
    Badge,
    Button,
    Tooltip,
    message,
    Popconfirm,
    Space,
    Input,
    Tag,
    Table
} from 'antd';
import {
    DashboardOutlined, BookOutlined, UserOutlined,
    BellOutlined, SettingOutlined, LogoutOutlined,
    FullscreenOutlined, FullscreenExitOutlined,
    EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined // <-- 3. Thêm các icon cho BookManager
} from '@ant-design/icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

// --- DỮ LIỆU GIẢ LẬP ---
const statsData = [
    { title: 'Tổng Sách', value: 12400, percent: 5.2, color: '#3b82f6' },
    { title: 'Đang Mượn', value: 854, percent: -1.4, color: '#10b981' },
    { title: 'Độc Giả', value: 3200, percent: 3.8, color: '#8b5cf6' },
    { title: 'Phạt chưa thu', value: '1.2M', percent: 10.5, color: '#ef4444' },
];
const chartData = [
    { name: 'T2', mượn: 40, trả: 24 }, { name: 'T3', mượn: 30, trả: 13 }, { name: 'T4', mượn: 90, trả: 98 },
    { name: 'T5', mượn: 27, trả: 39 }, { name: 'T6', mượn: 88, trả: 48 }, { name: 'T7', mượn: 60, trả: 38 },
    { name: 'CN', mượn: 20, trả: 10 },
];
const booksData = [
    { key: '1', maSach: 'S001', tenSach: 'Nhà Giả Kim', tacGia: 'Paulo Coelho', theLoai: 'Tiểu thuyết', soLuong: 15, trangThai: 'Còn hàng' },
    { key: '2', maSach: 'S002', tenSach: 'Clean Code', tacGia: 'Robert C. Martin', theLoai: 'Kỹ thuật', soLuong: 0, trangThai: 'Hết hàng' },
    { key: '3', maSach: 'S003', tenSach: 'Dế Mèn Phiêu Lưu Ký', tacGia: 'Tô Hoài', theLoai: 'Truyện thiếu nhi', soLuong: 5, trangThai: 'Còn hàng' },
];

const { Header, Sider, Content } = Layout;

// --- COMPONENT CON 1: Trang Dashboard ---
const DashboardHome = () => (
    <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {statsData.map((item, index) => (
                <div key={index} className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all border-l-4" style={{ borderColor: item.color }}>
                    <p className="text-gray-500 text-sm font-medium">{item.title}</p>
                    <div className="flex justify-between items-end mt-2">
                        <h3 className="text-3xl font-bold text-gray-800 m-0">{item.value}</h3>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${item.percent > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {item.percent > 0 ? '+' : ''}{item.percent}%
                        </span>
                    </div>
                </div>
            ))}
        </div>

        {/* Chart Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Biểu đồ hoạt động mượn trả</h3>
            {/* FIX 4: Thêm div set chiều cao cố định cho Chart */}
            <div style={{ height: 400, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorMuon" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        <Area type="monotone" dataKey="mượn" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorMuon)" />
                        <Area type="monotone" dataKey="trả" stroke="#10b981" strokeWidth={3} fillOpacity={0} fill="#10b981" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
);

// --- COMPONENT CON 2: Trang Quản lý Sách ---
// (Tôi gom code BookManager vào đây cho bạn dễ quản lý, không cần import nữa)
const BookManager = () => {
    const [data, setData] = useState(booksData);
    const [searchText, setSearchText] = useState('');

    const handleDelete = (key) => {
        setData(data.filter((item) => item.key !== key));
        message.success('Đã xóa sách thành công');
    };

    const columns = [
        { title: 'Mã Sách', dataIndex: 'maSach', key: 'maSach', render: text => <b className="text-blue-600">{text}</b> },
        { title: 'Tên Sách', dataIndex: 'tenSach', key: 'tenSach', sorter: (a, b) => a.tenSach.localeCompare(b.tenSach) },
        { title: 'Tác Giả', dataIndex: 'tacGia', key: 'tacGia' },
        { title: 'Thể Loại', dataIndex: 'theLoai', key: 'theLoai',
            filters: [{ text: 'Tiểu thuyết', value: 'Tiểu thuyết' }, { text: 'Kỹ thuật', value: 'Kỹ thuật' }],
            onFilter: (value, record) => record.theLoai.indexOf(value) === 0,
        },
        { title: 'Số Lượng', dataIndex: 'soLuong', key: 'soLuong', sorter: (a, b) => a.soLuong - b.soLuong },
        { title: 'Trạng Thái', dataIndex: 'trangThai', key: 'trangThai',
            render: (status) => (<Tag color={status === 'Còn hàng' ? 'success' : 'error'}>{status.toUpperCase()}</Tag>)
        },
        { title: 'Hành động', key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Chỉnh sửa"><Button type="primary" ghost icon={<EditOutlined />} size="small" /></Tooltip>
                    <Popconfirm title="Bạn chắc chắn muốn xóa?" onConfirm={() => handleDelete(record.key)}>
                        <Button danger icon={<DeleteOutlined />} size="small" />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">📚 Kho Sách</h2>
                <Space>
                    <Input
                        placeholder="Tìm kiếm sách..."
                        prefix={<SearchOutlined />}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 250 }}
                    />
                    <Button type="primary" icon={<PlusOutlined />} size="large">Thêm Sách Mới</Button>
                </Space>
            </div>
            <Table
                columns={columns}
                dataSource={data.filter(item => item.tenSach.toLowerCase().includes(searchText.toLowerCase()))}
                pagination={{ pageSize: 5 }}
            />
        </div>
    );
};


// --- COMPONENT CHA: Trang Admin Chính ---
// (Bọc toàn bộ logic và JSX vào đây)
const AdminDashboard = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [currentView, setCurrentView] = useState('dashboard');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const navigate = useNavigate();

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    // FIX 5: Sửa 'overlay' thành 'menu' cho Dropdown
    const userMenuItems = [
        { key: '1', icon: <UserOutlined />, label: 'Hồ sơ cá nhân' },
        { key: '2', icon: <SettingOutlined />, label: 'Cài đặt' },
        { type: 'divider' },
        {
            key: '3',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            danger: true,
            onClick: () => navigate('/login') // Thêm hành động đăng xuất
        },
    ];

    const renderContent = () => {
        switch (currentView) {
            case 'dashboard': return <DashboardHome />;
            case 'books': return <BookManager />;
            default: return <div className="text-center p-20">Chức năng đang phát triển...</div>;
        }
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={setCollapsed}
                width={260}
                style={{
                    background: '#001529', overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100
                }}
            >
                <div className="h-16 flex items-center justify-center border-b border-gray-700">
                    <h1 className={`text-white font-bold transition-all duration-300 ${collapsed ? 'text-sm' : 'text-xl tracking-widest'}`}>
                        {collapsed ? 'OG Lib' : 'Olive Gallery Library'}
                    </h1>
                </div>
                <Menu
                    theme="dark"
                    defaultSelectedKeys={['dashboard']}
                    mode="inline"
                    onClick={(e) => setCurrentView(e.key)}
                    items={[
                        { key: 'dashboard', icon: <DashboardOutlined />, label: 'Tổng quan' },
                        { key: 'books', icon: <BookOutlined />, label: 'Quản lý Sách' },
                        { key: 'users', icon: <UserOutlined />, label: 'Độc giả' },
                        { key: 'settings', icon: <SettingOutlined />, label: 'Cấu hình hệ thống' },
                    ]}
                    style={{ marginTop: '10px' }}
                />
            </Sider>

            <Layout className="site-layout bg-gray-50" style={{ marginLeft: collapsed ? 80 : 260, transition: 'all 0.2s' }}>
                <Header className="bg-white px-6 flex justify-between items-center shadow-sm sticky top-0 z-10">
                    <h2 className="text-xl font-semibold text-gray-800 m-0 capitalize">
                        {currentView === 'dashboard' ? 'Bảng điều khiển' :
                            currentView === 'books' ? 'Quản lý đầu sách' : 'Hệ thống'}
                    </h2>
                    <div className="flex items-center gap-6">
                        <Tooltip title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}>
                            <Button
                                type="text"
                                icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                                onClick={toggleFullscreen}
                                style={{ fontSize: '20px' }}
                            />
                        </Tooltip>
                        <Badge count={5} offset={[0, 5]} size="small">
                            <BellOutlined style={{ fontSize: '20px', color: '#64748b', cursor: 'pointer' }} />
                        </Badge>
                        <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
                            <div className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition">
                                {/* FIX 6: Sửa link ảnh Avatar */}
                                <Avatar src="https://api.dicebear.com/7.x/micah/svg?seed=Admin&baseColor=f9c9b6" size="large" style={{ border: '2px solid #e2e8f0' }} />
                                <div className="ml-3 hidden md:block">
                                    <p className="text-sm font-bold text-gray-700 m-0">Admin Master</p>
                                    <p className="text-xs text-gray-500 m-0">Quản trị viên</p>
                                </div>
                            </div>
                        </Dropdown>
                    </div>
                </Header>

                <Content style={{ margin: '24px', overflow: 'initial' }}>
                    {renderContent()}
                </Content>
            </Layout>
        </Layout>
    );
};

// --- 7. Sửa lại cách Export ---
export default AdminDashboard;