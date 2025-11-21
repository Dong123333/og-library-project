import React from 'react';
import { Card, Row, Col, Statistic, List, Typography } from 'antd';
import { UserOutlined, ReadOutlined, ShoppingCartOutlined, WarningOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Dashboard = () => {
    return (
        <div>
            <Title level={3} className="mb-6">Tổng quan hệ thống</Title>

            {/* 1. CÁC THẺ THỐNG KÊ */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="Tổng người dùng"
                            value={128}
                            prefix={<UserOutlined className="text-blue-500" />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="Tổng đầu sách"
                            value={3450}
                            prefix={<ReadOutlined className="text-green-500" />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="Đang mượn"
                            value={42}
                            prefix={<ShoppingCartOutlined className="text-orange-500" />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="Quá hạn"
                            value={5}
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<WarningOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* 2. DANH SÁCH HOẠT ĐỘNG GẦN ĐÂY */}
            <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
                <Title level={4}>Hoạt động gần đây</Title>
                <List
                    itemLayout="horizontal"
                    dataSource={[
                        { title: 'Nguyễn Văn A vừa mượn sách "Nhà Giả Kim"', time: '5 phút trước' },
                        { title: 'Trần Thị B vừa đăng ký tài khoản mới', time: '15 phút trước' },
                        { title: 'Admin vừa thêm sách mới "Clean Code"', time: '1 giờ trước' },
                    ]}
                    renderItem={(item) => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={<div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>}
                                title={<span className="font-medium">{item.title}</span>}
                                description={item.time}
                            />
                        </List.Item>
                    )}
                />
            </div>
        </div>
    );
};

export default Dashboard;