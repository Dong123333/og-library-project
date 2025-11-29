import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, List, Avatar, Typography, Tag, Skeleton, Empty } from 'antd';
import {
    ReadOutlined, UserOutlined, ShoppingCartOutlined,
    DollarCircleOutlined, WarningOutlined, RiseOutlined,
    ClockCircleOutlined, BookOutlined, CheckCircleOutlined, CloseCircleOutlined, SafetyCertificateOutlined
} from '@ant-design/icons';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('vi');
import axios from '../../services/axios.customize';

const { Title, Text } = Typography;

const Dashboard = () => {
    const [kpi, setKpi] = useState({
        totalBooks: 0, totalUsers: 0, activeLoans: 0, overdueBooks: 0, totalRevenue: 0
    });
    const [chartData, setChartData] = useState([]);
    const [activities, setActivities] = useState([]);

    const [loadingKpi, setLoadingKpi] = useState(true);
    const [loadingChart, setLoadingChart] = useState(true);
    const [loadingActivity, setLoadingActivity] = useState(true);

    useEffect(() => {
        fetchKpi();
        fetchChart();
        fetchRecent();
    }, []);

    const fetchKpi = async () => {
        try {
            const res = await axios.get('/dashboard/kpi');
            if (res) setKpi(res);
        } catch (e) { console.error("Lỗi KPI", e) }
        setLoadingKpi(false);
    }

    const fetchChart = async () => {
        try {
            const res = await axios.get('/dashboard/chart');
            if (res) {
                const processed = processChartData(res.borrowStats || [], res.returnStats || []);
                setChartData(processed);
            }
        } catch (e) { console.error("Lỗi Chart", e) }
        setLoadingChart(false);
    }

    const fetchRecent = async () => {
        try {
            const res = await axios.get('/dashboard/recent');
            if (res) {
                const loans = (res.recentLoans || []).map(i => {
                    let time = i.ngayDangKy;
                    let type = 'loan';
                    if (i.trangThai === 4) {
                        time = i.updatedAt;
                        type = 'loan-cancel';
                    }
                    else if (i.ngayMuon) {
                        time = i.ngayMuon;
                        type = 'loan-active';
                    }
                    else {
                        time = i.ngayDangKy;
                        type = 'loan-register';
                    }
                    return {
                        ...i,
                        type,
                        time
                    }
                });

                const penaltyEvents = [];

                (res.recentPenalties || []).map(i => {
                    penaltyEvents.push({
                        ...i,
                        type: 'fine-issued',
                        time: i.ngayLap
                    });

                    if (i.trangThai) {
                    penaltyEvents.push({
                        ...i,
                        type: 'fine-paid',
                        time: i.updatedAt
                    });
                }
                });

                const combined = [...loans, ...penaltyEvents].sort((a, b) =>
                    new Date(b.time).getTime() - new Date(a.time).getTime()
                );

                setActivities(combined);
                console.log(activities);
            }
        } catch (e) { console.error("Lỗi Recent", e) }
        setLoadingActivity(false);
    }

    const processChartData = (borrowStats, returnStats) => {
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const date = dayjs().subtract(i, 'day');
            const dateKey = date.format('YYYY-MM-DD');
            const displayDate = date.format('DD/MM');

            const borrow = borrowStats.find(b => b._id === dateKey)?.count || 0;
            const ret = returnStats.find(r => r._id === dateKey)?.count || 0;

            data.push({
                name: displayDate,
                muon: borrow,
                tra: ret
            });
        }
        return data;
    };

    const StatCard = ({ title, value, icon, color, suffix, loading, isMoney }) => (
        <Card bordered={false} className="shadow-sm hover:shadow-md transition-all h-full">
            <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
                <Statistic
                    title={<span className="text-gray-500 font-semibold">{title}</span>}
                    value={value}
                    prefix={icon}
                    valueStyle={{ color: color, fontWeight: 'bold' }}
                    suffix={<span className="text-gray-400 text-xs ml-1">{suffix}</span>}
                    formatter={isMoney ? (val) => new Intl.NumberFormat('vi-VN').format(val) : undefined}
                />
            </Skeleton>
        </Card>
    );

    return (
        <div className="flex flex-col h-[calc(100vh-110px)] overflow-hidden">
            <div className="flex-shrink-0 mb-4">
                <div className="mb-4">
                    <Title level={3} style={{ margin: 0 }}>Tổng quan hệ thống</Title>
                    <Text type="secondary">Cập nhật lúc {dayjs().format('HH:mm DD/MM/YYYY')}</Text>
                </div>

                {!loadingKpi && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <StatCard title="Sách" value={kpi.totalBooks} icon={<BookOutlined />} color="#1890ff" suffix="cuốn" />
                        <StatCard title="Độc giả" value={kpi.totalUsers} icon={<UserOutlined />} color="#722ed1" suffix="người" />
                        <StatCard title="Đang mượn" value={kpi.activeLoans} icon={<ShoppingCartOutlined />} color="#faad14" suffix="phiếu" />
                        <StatCard title="Quá hạn" value={kpi.overdueBooks} icon={<WarningOutlined />} color="#cf1322" suffix="cuốn" />
                        <StatCard title="Doanh thu" value={kpi.totalRevenue} icon={<DollarCircleOutlined />} color="#52c41a" suffix="đ" isMoney />
                    </div>
                )}
            </div>

            <div className="flex-1 min-h-0">
                <Row gutter={[16, 16]} className="h-full">
                    <Col xs={24} lg={16} className="h-full">
                        <Card
                            title="Xu hướng Mượn/Trả (7 ngày qua)"
                            bordered={false}
                            className="shadow-sm h-full flex flex-col"
                            bodyStyle={{ flex: 1, minHeight: 0 }}
                        >
                            {loadingChart ? <Skeleton active /> : (
                                <div style={{ width: '100%', height: '100%' }}>
                                    <ResponsiveContainer>
                                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                            <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                                            <Tooltip cursor={{ fill: '#f5f5f5' }} />
                                            <Legend iconType="circle" />
                                            <Bar dataKey="muon" name="Lượt mượn" fill="#1890ff" radius={[4, 4, 0, 0]} barSize={20} />
                                            <Bar dataKey="tra" name="Lượt trả" fill="#52c41a" radius={[4, 4, 0, 0]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </Card>
                    </Col>

                    <Col xs={24} lg={8} className="h-full">
                        <Card
                            title={<div className="flex items-center gap-2"><RiseOutlined /> Hoạt động mới nhất</div>}
                            bordered={false}
                            className="shadow-sm h-full flex flex-col"
                            bodyStyle={{
                                flex: 1,
                                overflowY: 'auto',
                                padding: '0 12px 12px 12px'
                            }}
                        >
                            <Skeleton loading={loadingActivity} active paragraph={{ rows: 4 }}>
                                <List
                                    itemLayout="horizontal"
                                    dataSource={activities}
                                    locale={{ emptyText: <Empty description="Chưa có hoạt động nào" /> }}
                                    renderItem={(item) => {
                                        const user = item.maNguoiDung;

                                        let actionText = "";
                                        let actionColor = "";
                                        let actionIcon = null;

                                        switch (item.type) {
                                            case 'loan-register':
                                                actionText = "đăng ký mượn";
                                                actionColor = "#1890ff";
                                                actionIcon = <ReadOutlined style={{ color: actionColor }} />;
                                                break;

                                            case 'loan-active':
                                                actionText = "đã nhận sách";
                                                actionColor = "#13c2c2";
                                                actionIcon = <CheckCircleOutlined style={{ color: actionColor }} />;
                                                break;

                                            case 'loan-cancel':
                                                actionText = "đã hủy yêu cầu";
                                                actionColor = "#8c8c8c";
                                                actionIcon = <CloseCircleOutlined style={{ color: actionColor }} />;
                                                break;


                                            case 'fine-issued':
                                                actionText = "bị phạt vi phạm";
                                                actionColor = "#ff4d4f";
                                                actionIcon = <DollarCircleOutlined style={{ color: actionColor }} />;
                                                break;

                                            case 'fine-paid':
                                                actionText = "đã đóng tiền phạt";
                                                actionColor = "#52c41a";
                                                actionIcon = <SafetyCertificateOutlined style={{ color: actionColor }} />;
                                                break;

                                            default:
                                                actionText = "cập nhật phiếu";
                                                actionColor = "#595959";
                                                actionIcon = <ClockCircleOutlined style={{ color: actionColor }} />;
                                        }
                                        return (
                                            <List.Item className="px-2 py-3 hover:bg-gray-50 rounded transition-colors">
                                                <List.Item.Meta
                                                    avatar={
                                                        <Avatar
                                                            style={{ backgroundColor: `${actionColor}15` }}
                                                            icon={actionIcon}
                                                        />
                                                    }
                                                    title={
                                                        <div className="flex justify-between items-start gap-2">
                                                            <span className="text-sm font-medium">
                                                                {user?.hoVaTen}
                                                                <span className="font-normal text-gray-500 ml-1">{actionText}</span>
                                                            </span>
                                                            <span className="text-xs text-gray-400 flex items-center gap-1 whitespace-nowrap flex-shrink-0 mt-1">
                                                                <ClockCircleOutlined /> {dayjs(item.time).fromNow()}
                                                            </span>
                                                        </div>
                                                    }
                                                    description={
                                                        <div className="text-xs">
                                                            {item.type.includes('loan') ? (
                                                                <Tag className="m-0 text-[10px] border-0 bg-gray-100 text-gray-600">
                                                                    #{item._id.slice(-6).toUpperCase()}
                                                                </Tag>
                                                            ) : (
                                                                <span className={`text-xs font-bold ${item.type === 'fine-paid' ? 'text-green-600' : 'text-red-500'}`}>
                                                                    {item.type === 'fine-paid' ? '+' : '-'}{item.soTien?.toLocaleString()}đ
                                                                </span>
                                                            )}

                                                        </div>
                                                    }
                                                />
                                            </List.Item>
                                        )
                                    }}
                                />
                            </Skeleton>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default Dashboard;