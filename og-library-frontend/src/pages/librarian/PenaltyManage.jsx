import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, message, Popconfirm, Tabs, Card, Statistic } from 'antd';
import { DollarCircleOutlined, HistoryOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from "../../services/axios.customize.jsx";

const PenaltyManage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/phieu-phat');
            if (Array.isArray(res)) setData(res);
        } catch (error) {
            messageApi.error("Lỗi tải dữ liệu");
        }
        setLoading(false);
    };

    const handlePay = async (id) => {
        try {
            await axios.patch(`/phieu-phat/${id}/pay`);
            messageApi.success("Đã xác nhận thu tiền thành công!");
            fetchData();
        } catch (error) {
            messageApi.error("Lỗi cập nhật");
        }
    };

    const filteredData = data

    const pendingList = filteredData.filter(item => !item.trangThai);
    const paidList = filteredData.filter(item => item.trangThai);

    const totalDebt = pendingList.reduce((sum, item) => sum + item.soTien, 0);

    const columns = [
        {
            title: 'STT',
            key: 'stt',
            align: 'center',
            width: 60,
            render: (text, record, index) => {
                return <b>{index + 1}</b>;
            },
        },
        {
            title: 'Mã phiếu',
            dataIndex: 'maMuonTra',
            width: 120,
            render: (r) => (
                <Tag color="purple" style={{ cursor: 'pointer' }}>
                    {r?._id ? `#${r._id.slice(-6).toUpperCase()}` : 'Chưa có'}
                </Tag>
            )
        },
        {
            title: 'Độc giả',
            dataIndex: 'maNguoiDung',
            render: u => (
                <div>
                    <div className="font-bold">{u?.hoVaTen}</div>
                    <div className="text-xs text-gray-500">{u?.email}</div>
                </div>
            )
        },
        {
            title: 'Sách & Lý do',
            render: (_, r) => (
                <div>
                    <div className="text-blue-700 font-medium">{r.maSach?.tenSach}</div>
                    <div className="text-gray-500 italic">{r.lyDo}</div>
                </div>
            )
        },
        {
            title: 'Số tiền',
            dataIndex: 'soTien',
            render: v => <b className="text-red-600">{new Intl.NumberFormat('vi-VN').format(v)} đ</b>
        },
        {
            title: 'Ngày lập',
            dataIndex: 'ngayLap',
            align: 'center',
            width: 150,
            render: (d) => (
                <div className="font-medium">
                    {dayjs(d).format('DD/MM/YYYY')}
                    <div className="text-xs opacity-75">{dayjs(d).format('HH:mm')}</div>
                </div>
            )
        },
    ];

    const pendingColumns = [
        ...columns,
        {
            title: 'Hành động',
            key: 'action',
            align: 'center',
            width: 150,
            render: (_, record) => (
                <Popconfirm
                    title="Thu tiền mặt?"
                    description={`Xác nhận thu ${record.soTien.toLocaleString()}đ?`}
                    onConfirm={() => handlePay(record._id)}
                    okText="Đã thu" cancelText="Hủy"
                >
                    <Button type="primary" size="small" icon={<DollarCircleOutlined />}>
                        Thu tiền
                    </Button>
                </Popconfirm>
            )
        }
    ];

    const paidColumns = [
        ...columns,
        {
            title: 'Ngày thanh toán',
            dataIndex: 'updatedAt',
            key: 'paymentDate',
            align: 'center',
            width: 150,
            render: (d) => (
                <div className="text-green-700 font-medium">
                    {dayjs(d).format('DD/MM/YYYY')}
                    <div className="text-xs opacity-75">{dayjs(d).format('HH:mm')}</div>
                </div>
            )
        }
    ];

    const tableScrollHeight = 'calc(100vh - 380px)';

    return (
        <div style={{
            height: 'calc(100vh - 150px)',
            display: 'flex',
            flexDirection: 'column',
            paddingBottom: 0
        }}>
            {contextHolder}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-2xl font-bold m-0">Quản Lý Vi Phạm</h2>
                    <div className="text-gray-500 mt-1">Theo dõi và thu hồi tiền phạt</div>
                </div>

                <Card size="small" className="shadow-sm border-red-200 bg-red-50 min-w-[200px]">
                    <Statistic
                        title="Tổng tiền chưa thu"
                        value={totalDebt}
                        precision={0}
                        suffix="đ"
                        valueStyle={{ color: '#cf1322', fontWeight: 'bold' }}
                    />
                </Card>
            </div>

            <div style={{ flex: 1, overflow: 'hidden' }}>
                <Tabs defaultActiveKey="1" items={[
                    {
                        key: '1',
                        label: (
                            <span>
                                <DollarCircleOutlined />
                                Chưa thanh toán <Tag color="red" className="ml-1">{pendingList.length}</Tag>
                            </span>
                        ),
                        children: (
                                <Table
                                    columns={pendingColumns}
                                    dataSource={pendingList}
                                    rowKey="_id"
                                    loading={loading}
                                    pagination={false}
                                    scroll={{ x: 1000, y: tableScrollHeight }}
                                />
                        )

                    },
                    {
                        key: '2',
                        label: (
                            <span>
                                <HistoryOutlined />
                                Lịch sử đã thu <Tag color="default" className="ml-1">{paidList.length}</Tag>
                            </span>
                        ),
                        children: (
                                <Table
                                    columns={paidColumns}
                                    dataSource={paidList}
                                    rowKey="_id"
                                    loading={loading}
                                    pagination={false}
                                    scroll={{ x: 1000, y: tableScrollHeight }}
                                />
                        )
                    }
                ]} />
            </div>
        </div>
    );
};

export default PenaltyManage;