import React, { useEffect, useState } from 'react';
import { Badge, Dropdown, List, Avatar, Button, Empty } from 'antd';
import {
    BellOutlined,
    InfoCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined, WarningOutlined, DollarCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from "../services/axios.customize.jsx";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
dayjs.extend(relativeTime);
dayjs.locale('vi');

const NotificationBell = () => {
    const [notifs, setNotifs] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 15000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get('/thong-bao');
            if (Array.isArray(res)) {
                setNotifs(res);
                setUnreadCount(res.filter(n => !n.daXem).length);
            }
        } catch (e) { console.error(e); }
    };

    const handleClickItem = async (item) => {
        if (!item.daXem) {
            await axios.patch(`/thong-bao/${item._id}/read`);
            fetchData();
        }
        if (item.lienKet) {
            if (item.lienKet.includes('#')) {
                const [path, hash] = item.lienKet.split('#');
                navigate(path);
                setTimeout(() => {
                    window.location.hash = hash;
                }, 100);
            } else {
                navigate(item.lienKet);
            }
        }
    };

    const handleReadAll = async () => {
        await axios.patch('/thong-bao/read-all');
        fetchData();
    };

    const menu = (
        <div className="w-80 bg-white shadow-xl rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-3 border-b flex justify-between items-center bg-gray-50">
                <span className="font-bold text-gray-700">Thông báo</span>
                {unreadCount > 0 && (
                    <a className="text-xs text-blue-600 cursor-pointer" onClick={handleReadAll}>
                        Đánh dấu đã đọc hết
                    </a>
                )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
                <List
                    dataSource={notifs}
                    locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có thông báo" /> }}
                    renderItem={item => {
                        let icon, bg;
                        if (item.tieuDe.includes("bị hủy") || item.tieuDe.includes("đã hủy") || item.tieuDe.includes("từ chối")) {
                            icon = <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
                            bg = '#fff1f0';
                        }
                        else if (item.tieuDe.includes("vi phạm") || item.tieuDe.includes("phạt")) {
                            icon = <WarningOutlined style={{ color: '#faad14' }} />;
                            bg = '#fffbe6';
                        }
                        // 👇 TRƯỜNG HỢP TIỀN VỀ (ADMIN) HOẶC ĐÓNG TIỀN (USER)
                        else if (item.tieuDe.includes("Tiền phạt") || item.tieuDe.includes("Thanh toán")) {
                            icon = <DollarCircleOutlined style={{ color: '#52c41a' }} />;
                            bg = '#f6ffed';
                        }
                        else if (item.tieuDe.includes("duyệt") || item.tieuDe.includes("sẵn sàng")) {
                            icon = <CheckCircleOutlined style={{ color: '#52c41a' }} />;
                            bg = '#f6ffed';
                        }
                        else {
                            icon = <InfoCircleOutlined style={{ color: '#1890ff' }} />;
                            bg = '#e6f7ff';
                        }
                        return (
                            <div
                                onClick={() => handleClickItem(item)}
                                className={`p-3 cursor-pointer border-b transition-colors flex gap-3 items-start
                                ${item.daXem ? 'bg-white hover:bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'}
                            `}
                            >
                                <div className="mt-1">
                                    <Avatar size="small" style={{ backgroundColor: bg }} icon={icon} />
                                </div>
                                <div className="flex-1">
                                    <div className={`text-sm mb-1 ${!item.daXem ? 'font-bold text-gray-800' : 'text-gray-600'}`}>
                                        {item.tieuDe}
                                    </div>
                                    <div className="text-xs text-gray-500 line-clamp-2 mb-1">
                                        {item.noiDung}
                                    </div>
                                    <div className="text-[10px] text-gray-400 text-right">
                                        {dayjs(item.createdAt).fromNow()}
                                    </div>
                                </div>
                            </div>
                        )
                    }}
                />
            </div>
        </div>
    );

    return (
        <Dropdown overlay={menu} trigger={['click']} placement="bottomRight" arrow>
                <Badge count={unreadCount} overflowCount={99}>
                    <Button
                        icon={ <BellOutlined style={{ fontSize: '22px' }} />}
                        type="text"
                    />
                </Badge>
        </Dropdown>
    );
};

export default NotificationBell;