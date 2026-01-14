import React, {useEffect, useRef, useState} from 'react';
import {
    Layout,
    Table,
    Tag,
    Typography,
    message,
    Tooltip,
    Tabs,
    Alert,
    Empty,
    Popconfirm,
    Button,
    Pagination, Modal, Row, Col, DatePicker
} from 'antd';
import {
    HomeOutlined,
    ClockCircleOutlined,
    InfoCircleOutlined,
    DollarCircleOutlined,
    CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, FieldTimeOutlined, ThunderboltOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(duration);
dayjs.extend(relativeTime);
import {Link, useLocation} from 'react-router-dom';
import axios from '../../services/axios.customize';
import {usePage} from "../../context/NavContext.jsx";

const { Content } = Layout;
const { TabPane } = Tabs;
const { Title } = Typography;

const LoansPage = () => {
    const { setActivePage } = usePage();
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedData, setExpandedData] = useState({});
    const [list, setList] = useState([]);
    const [totalDebt, setTotalDebt] = useState(0);
    const topRef = useRef(null);
    const [activeTab, setActiveTab] = useState('1');
    const location = useLocation();
    const [messageApi, contextHolder] = message.useMessage();
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [total, setTotal] = useState(0);
    const [mobileDetails, setMobileDetails] = useState({});
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [newDueDate, setNewDueDate] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const today = dayjs();

    useEffect(() => {
        setActivePage('');
    }, [setActivePage]);

    useEffect(() => {
        const hash = window.location.hash;
        if (hash === '#penalties') {
            setActiveTab('2');
        } else {
            setActiveTab('1');
        }
    }, [location]);

    useEffect(() => {
        fetchMyLoans();
    }, [current, pageSize]);

    useEffect(() => {
        fetchMyPenalty();
    }, []);

    useEffect(() => {
        if (!loans.length) return;

        const fetchAll = async () => {
            try {
                const results = await Promise.all(
                    loans.map(async (item) => {
                        const res = await axios.get(`/muon-tra/${item._id}/details`);
                        return { id: item._id, data: res};
                    })
                );

                const map = {};
                results.forEach(r => { map[r.id] = r.data });

                setMobileDetails(map);
            } catch (error) {
                console.error("Error fetching loan details:", error);
            }
        };

        fetchAll();
    }, [loans]);



    const fetchMyLoans = async () => {
        setLoading(true);

        try {
            const res = await axios.get(`/muon-tra?page=${current}&limit=${pageSize}`);
            if (res && res.result) {
                setLoans(res.result);
                setTotal(res.meta.total);
            }
        } catch (error) {
            messageApi.error("Lỗi tải lịch sử");
        }
        setLoading(false);
    };

    const onExpand = async (expanded, record) => {
        if (expanded && !expandedData[record._id]) {
            try {
                const details = await axios.get(`/muon-tra/${record._id}/details`);
                setExpandedData(prev => ({ ...prev, [record._id]: details }));
            } catch (error) {
                console.error(error);
            }
        }
    };

    const getLimitDays = (maMuonTra) => {
        const details = expandedData[maMuonTra] || [];
        const totalBooks = details.reduce((sum, d) => sum + d.soLuongMuon, 0);

        if (totalBooks < 5) return 30;
        if (totalBooks >= 5 && totalBooks < 10) return 7;
    };

    const showModal = (detail) => {
        setSelectedDetail(detail);
        setNewDueDate(null);
        setIsModalVisible(true);
    };

    const handleConfirm = async () => {
        if (!newDueDate) return messageApi.warning("Vui lòng chọn ngày trả mới!");

        setSubmitting(true);
        try {
            const parentId = typeof selectedDetail.maMuonTra === 'object'
                ? selectedDetail.maMuonTra._id
                : selectedDetail.maMuonTra;

            const payload = {
                maMuonTra: parentId,
                maSach: selectedDetail.maSach._id,
                ngayHenTraMoi: newDueDate.toISOString()
            };

            await axios.patch('muon-tra/gia-han', payload);

            const formattedNewDate = newDueDate.format('YYYY-MM-DD');
            setExpandedData(prev => {
                const nextData = { ...prev };
                if (nextData[parentId]) {
                    nextData[parentId] = nextData[parentId].map(item => {
                        if (item._id === selectedDetail._id) {
                            return {
                                ...item,
                                ngayHenTra: formattedNewDate,
                                giaHan: true
                            };
                        }
                        return item;
                    });
                }
                return nextData;
            });

            setLoans(prevLoans => prevLoans.map(loan =>
                loan._id === parentId
                    ? { ...loan, lastUpdated: new Date().getTime() }
                    : loan
            ));

            if (mobileDetails[parentId]) {
                setMobileDetails(prev => ({
                    ...prev,
                    [parentId]: prev[parentId].map(d =>
                        d._id === selectedDetail._id ? { ...d, ngayHenTra: formattedNewDate, giaHan: true } : d
                    )
                }));
            }
            messageApi.success("Gia hạn sách thành công!");
            setIsModalVisible(false);
        } catch (error) {
            messageApi.error("Gia hạn thất bại, vui lòng thử lại.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        messageApi.info("Đã hủy thao tác gia hạn.");
    };

    const fetchMyPenalty  = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/phieu-phat');
            if (Array.isArray(res)) {
                setList(res);
                const debt = res
                    .filter(item => !item.trangThai)
                    .reduce((sum, item) => sum + item.soTien, 0);
                setTotalDebt(debt);
            }
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    const handleCancelLoan = async (loanId) => {
        try {
            await axios.patch(`/muon-tra/${loanId}/cancel`);
            messageApi.success("Đã hủy yêu cầu mượn sách.");
            fetchMyLoans();
        } catch (error) {
            messageApi.error(error.response?.data?.message || "Lỗi khi hủy");
        }
    };

    const handlePayment = async (record) => {
        try {
            const res = await axios.post('/payment/create_url', {
                amount: record.soTien,
                orderId: record._id });
            if (res && res.url) {
                window.location.href = res.url;
            }
        } catch (error) {
            message.error("Lỗi tạo thanh toán");
        }
    };

    const columns = [
        {
            title: 'STT',
            key: 'stt',
            width: 60,
            align: 'center',
            render: (text, record, index) => {
                return (
                    <b>
                        {(current - 1) * pageSize + index + 1}
                    </b>
                );
            },
        },
        {
            title: 'Mã phiếu',
            dataIndex: '_id',
            key: '_id',
            width: 120,
            render: (id) => (
                <Tag color="purple" style={{ cursor: 'pointer' }}>
                    #{id.slice(-6).toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Ngày đăng ký',
            dataIndex: 'ngayDangKy',
            render: (d) => dayjs(d).format('DD/MM/YYYY HH:mm')
        },
        {
            title: 'Ngày mượn (Thực tế)',
            dataIndex: 'ngayMuon',
            render: (d) => d ? dayjs(d).format('DD/MM/YYYY') : '-'
        },
        {
            title: 'Ghi chú',
            dataIndex: 'ghiChu',
            render: (t) => t || <span className="text-gray-400 italic">Không có</span>
        },
        {
            title: 'Trạng thái xử lý',
            dataIndex: 'trangThai',
            render: (status) => {
                const mapStatus = {
                    0: { color: 'orange', text: '⏳ Chờ duyệt', desc: 'Đang đợi thủ thư kiểm tra' },
                    1: { color: 'blue', text: '📦 Chờ lấy sách', desc: 'Vui lòng đến thư viện nhận sách' },
                    2: { color: 'geekblue', text: '📖 Đang mượn', desc: 'Bạn đang giữ sách' },
                    3: { color: 'green', text: '✅ Hoàn tất', desc: 'Đã trả hết sách' },
                    4: { color: 'red', text: '❌ Đã hủy', desc: 'Yêu cầu bị từ chối hoặc hủy' },
                };

                const st = mapStatus[status] || { color: 'default', text: 'Unknown' };

                return (
                    <Tooltip title={st.desc}>
                        <Tag color={st.color} style={{ cursor: 'help' }}>{st.text}</Tag>
                    </Tooltip>
                );
            }
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => {
                if (record.trangThai === 0) {
                    return (
                        <Popconfirm
                            title="Hủy yêu cầu mượn sách?"
                            description="Bạn có chắc chắn muốn hủy đơn này không?"
                            onConfirm={() => handleCancelLoan(record._id)}
                            okText="Đồng ý"
                            cancelText="Không"
                        >
                            <Button danger size="small" icon={<CloseCircleOutlined />}>
                                Hủy đơn
                            </Button>
                        </Popconfirm>
                    );
                }
                return (
                    <Tooltip title="Chỉ có thể hủy khi đơn đang chờ duyệt">
                        <Button
                            disabled
                            size="small"
                            icon={<CloseCircleOutlined />}
                        >
                            Hủy đơn
                        </Button>
                    </Tooltip>
                );
            }
        }
    ];

    const expandedRowRender = (record) => {
        const data = expandedData[record._id] || [];

        const detailColumns = [
            {
                title: 'Sách',
                dataIndex: 'maSach',
                render: (book) => (
                    <div className="flex items-center gap-3">
                        <img
                            src={book?.hinhAnh || "https://placehold.co/40x60"}
                            alt="bia"
                            className="w-10 h-14 object-cover rounded border"
                        />
                        <span className="font-medium text-blue-800">{book?.tenSach}</span>
                    </div>
                )
            },
            {
                title: 'Số lượng',
                align: 'center',
                width: 90,
                render: (_, detail) =>  <span>{detail.soLuongMuon}</span>
            },
            {
                title: 'Hạn trả',
                dataIndex: 'ngayHenTra',
                render: (date, detailRecord) => {
                    if (!date) return <span className="text-gray-400">--</span>;
                    const parentStatus = detailRecord.maMuonTra?.trangThai;
                    const isBorrowing = parentStatus === 2;
                    const notReturned = detailRecord.tinhTrang === 1;
                    const timePassed = dayjs().isAfter(dayjs(date));

                    const isOverdue = isBorrowing && notReturned && timePassed;

                    return (
                        <span className={isOverdue ? "text-red-600 font-bold flex items-center gap-1" : ""}>
                            {dayjs(date).format('DD/MM/YYYY')}
                            {isOverdue && <Tooltip title="Bạn đã quá hạn trả!"><ClockCircleOutlined /></Tooltip>}
                        </span>
                    );
                }
            },
            {
                title: 'Ngày trả',
                dataIndex: 'ngayTra',
                render: (d) => d ? dayjs(d).format('DD/MM/YYYY') : '-'
            },
            {
                title: 'Trạng thái sách',
                dataIndex: 'tinhTrang',
                key: 'status_detail',
                render: (detailStatus, record) => {
                    const parentStatus = record.maMuonTra?.trangThai;
                    if (parentStatus === 4) {
                        return <Tag color="red">Đã hủy</Tag>;
                    }
                    if (parentStatus === 0) {
                        return <Tag color="orange" style={{ borderStyle: 'dashed' }}>⏳ Chờ duyệt</Tag>;
                    }
                    if (parentStatus === 1) {
                        return <Tag color="blue" style={{ borderStyle: 'dashed' }}>📦 Chờ lấy sách</Tag>;
                    }
                    if (detailStatus === 2) {
                        return <Tag color="green">✅ Đã trả</Tag>;
                    } else if (detailStatus === 1) {
                        return <Tag color="volcano">📖 Đang giữ</Tag>;
                    }
                }
            },
            {
                title: 'Gia hạn',
                key: 'action',
                render: (_, record) => {
                    const due = dayjs(record.ngayHenTra);
                    const diffDays = due.diff(today, 'day');

                    if (record.giaHan === true) {
                        return <Tag color="success" icon={<CheckCircleOutlined />} className="border-0">Đã gia hạn</Tag>;
                    }

                    const isBeforeDeadline = diffDays >= 1;
                    const isBorrowing = record.tinhTrang === 1;

                    return (
                        <Button
                            size="small"
                            type="primary"
                            disabled={!isBorrowing || !isBeforeDeadline}
                            icon={<FieldTimeOutlined />}
                            onClick={() => showModal(record)}
                            className="bg-blue-600 border-0 rounded-md shadow-sm"
                        >
                            Gia hạn
                        </Button>
                    );
                }
            }
        ];

        return <Table columns={detailColumns} dataSource={data} pagination={false} rowKey="_id" />;
    };

    const columnsPenalty  = [
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
            title: 'Sách liên quan',
            dataIndex: 'maSach',
            render: (book) => (
                <div className="flex items-center gap-3">
                    <img src={book?.hinhAnh} alt="" className="w-8 h-10 object-cover rounded border" />
                    <span className="font-medium text-blue-800">{book?.tenSach}</span>
                </div>
            )
        },
        {
            title: 'Lý do phạt',
            dataIndex: 'lyDo',
            render: (text) => <span className="text-gray-600">{text}</span>
        },
        {
            title: 'Ngày lập',
            dataIndex: 'ngayLap',
            align: 'center',
            width: 50,
            render: (d) => (
                <div className="font-medium">
                    {dayjs(d).format('DD/MM/YYYY')}
                    <div className="text-xs opacity-75">{dayjs(d).format('HH:mm')}</div>
                </div>
            )
        },
        {
            title: 'Số tiền',
            dataIndex: 'soTien',
            align: 'right',
            render: (val) => (
                <b className="text-red-600">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)}
                </b>
            )
        },
        {
            title: 'Trạng thái / Hạn nộp',
            dataIndex: 'trangThai',
            align: 'center',
            render: (_, record) => {
                if (record.trangThai) {
                    return (
                        <Tag
                            icon={<CheckCircleOutlined/>}
                            color="success"
                        >
                            ĐÃ THANH TOÁN
                        </Tag>
                    )

                } else {
                    const deadline = dayjs(record.ngayLap).add(7, 'day');
                    const now = dayjs();
                    const isOverdue = now.isAfter(deadline);

                    const diffMs = Math.abs(now.diff(deadline));
                    const duration = dayjs.duration(diffMs);
                    const days = Math.ceil(duration.asDays());

                    if (isOverdue) {
                        return (
                            <Tooltip title={`Hạn chót: ${deadline.format('DD/MM/YYYY')} (Trễ ${days} ngày)`}>
                                <div
                                    className="text-red-600 font-bold flex items-center justify-center gap-1 cursor-help bg-red-50 border border-red-200 px-2 py-1 rounded">
                                    <ExclamationCircleOutlined className="animate-pulse"/>
                                    Quá hạn {days} ngày
                                </div>
                            </Tooltip>
                        );
                    }
                    return (
                        <Tooltip title={`Còn ${days} ngày nữa là đến hạn`}>
                            <div className="flex flex-col items-center">
                                <Tag
                                    icon={<ExclamationCircleOutlined/>}
                                    color="volcano"
                                >
                                    CHƯA THANH TOÁN
                                </Tag>
                                <div className="flex items-center gap-1 mt-2">
                                    <span className="text-[12px]">Hạn còn {days} ngày</span>
                                    <span className="text-[11px] ">({deadline.format('DD/MM/YYYY')})</span>
                                </div>

                            </div>
                        </Tooltip>
                    );
                }
            }
        },
        {
            title: 'Ngày thanh toán',
            key: 'ngayThanhToan',
            align: 'center',
            width: 150,
            render: (_, record) => {
                if (record.trangThai) {
                    return (
                        <div className="text-green-700 font-medium">
                            {dayjs(record.updatedAt).format('DD/MM/YYYY')}
                            <div className="text-xs opacity-75">{dayjs(record.updatedAt).format('HH:mm')}</div>
                        </div>
                    );
                }
                return <span className="text-gray-400 italic">--</span>;
            }
        },
        {
            title: 'Hành động',
            render: (_, record) => (
                !record.trangThai ? (
                    <Button
                        type="primary"
                        className="bg-blue-600"
                        size="small"
                        onClick={() => handlePayment(record)}
                    >
                        Thanh toán VNPay
                    </Button>
                ) : (
                    <Button
                        type="primary"
                        className="bg-blue-600"
                        size="small"
                        disabled
                    >
                        Thanh toán VNPay
                    </Button>
                )
            )
        }
    ];

    const parentLoan = selectedDetail ? loans.find(l => l.maMuonTra === selectedDetail.maMuonTra) : null;
    const ngayMuonGoc = parentLoan ? dayjs(parentLoan.ngayMuon) : dayjs(today);
    const limitDays = selectedDetail ? getLimitDays(selectedDetail.maMuonTra) : 0;
    const absoluteDeadline = dayjs(ngayMuonGoc).add(limitDays, 'day');

    return (
        <div ref={topRef}>
            {contextHolder}
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                <Link to="/" className="hover:text-blue-600 flex items-center gap-1">
                    <HomeOutlined /> Trang chủ
                </Link>
                <span>/</span>
                <span className="text-gray-800 font-medium">Lịch sử mượn trả</span>
            </div>
            <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)}>
                <TabPane tab={
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">Theo dõi mượn trả</span>
                        <Tooltip title="Bấm vào dấu (+) để xem chi tiết từng cuốn sách">
                            <InfoCircleOutlined className="text-gray-400 text-sm" />
                        </Tooltip>
                    </div>
                } key="1">
                    <div className="bg-gray-50" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
                        <Content className="max-w-9xl mx-auto px-4 py-8 w-full">
                            <div
                                className="hidden sm:flex bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex-col overflow-hidden"
                                style={{ flex: 1 }}
                            >
                                <Table
                                    className="components-table-demo-nested"
                                    columns={columns}
                                    dataSource={loans}
                                    expandable={{ expandedRowRender, onExpand }}
                                    rowKey="_id"
                                    loading={loading}
                                    pagination={false}
                                    scroll={{ x: 1000, y: 'calc(100vh - 280px)' }}
                                />
                            </div>

                            <div className="block sm:hidden space-y-4 overflow-y-auto max-h-[calc(100vh-240px)]">
                                {loans.map((item, index) => {
                                    const STT = (current - 1) * pageSize + index + 1;

                                    const mapStatus = {
                                        0: { color: 'orange', text: '⏳ Chờ duyệt' },
                                        1: { color: 'blue', text: '📦 Chờ lấy sách' },
                                        2: { color: 'geekblue', text: '📖 Đang mượn' },
                                        3: { color: 'green', text: '✅ Hoàn tất' },
                                        4: { color: 'red', text: '❌ Đã hủy' },
                                    };
                                    const st = mapStatus[item.trangThai] || { text: 'Unknown', color: 'default' };

                                    const nested = mobileDetails[item._id] || [];

                                    return (
                                        <div
                                            key={item._id}
                                            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-4 overflow-hidden"
                                        >

                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-lg font-bold">{STT}</span>
                                                <Tag color="purple">#{item._id.slice(-6).toUpperCase()}</Tag>
                                            </div>

                                            <div className="mb-2 flex">
                                                <span className="font-medium whitespace-nowrap mr-2">Ngày đăng ký: </span>
                                                <p> {dayjs(item.ngayDangKy).format('DD/MM/YYYY HH:mm')}</p>

                                            </div>

                                            <div className="mb-2 flex">
                                                <span className="font-medium whitespace-nowrap mr-2">Ngày mượn: </span>
                                                <p>{item.ngayMuon ? dayjs(item.ngayMuon).format('DD/MM/YYYY') : '-'}</p>
                                            </div>

                                            <div className="mb-2 flex">
                                                <span className="font-medium whitespace-nowrap mr-2">
                                                    Ghi chú:
                                                </span>
                                                <p className="text-gray-800 break-words whitespace-normal flex-1 min-w-0">
                                                    {item.ghiChu || "Không có"}
                                                </p>
                                            </div>

                                            <div className="mt-2">
                                                <Tag color={st.color}>{st.text}</Tag>
                                            </div>

                                            <div className="mt-3">
                                                {item.trangThai === 0 ? (
                                                    <Popconfirm
                                                        title="Hủy yêu cầu mượn sách?"
                                                        description="Bạn có chắc chắn muốn hủy đơn này không?"
                                                        onConfirm={() => handleCancelLoan(item._id)}
                                                        okText="Đồng ý"
                                                        cancelText="Không"
                                                        placement="topRight"
                                                    >
                                                        <Button danger size="small" icon={<CloseCircleOutlined />}>
                                                            Hủy đơn
                                                        </Button>
                                                    </Popconfirm>
                                                ) : (
                                                    <Button disabled size="small" icon={<CloseCircleOutlined />}>
                                                        Hủy đơn
                                                    </Button>
                                                )}
                                            </div>
                                            {nested.length > 0 && (
                                                <div className="mt-4 border-t pt-3">
                                                    <p className="font-semibold text-gray-800 mb-2">Danh sách sách</p>

                                                    {nested.map((detail) => {
                                                        const book = detail.maSach;
                                                        const isOverdue =
                                                            detail.tinhTrang === 0 &&
                                                            detail.ngayHenTra &&
                                                            dayjs().isAfter(dayjs(detail.ngayHenTra));

                                                        return (
                                                            <div
                                                                key={detail._id}
                                                                className="p-3 bg-gray-50 rounded-lg border mb-2"
                                                            >
                                                                <div className="flex gap-3 items-center">
                                                                    <img
                                                                        src={book?.hinhAnh || "https://placehold.co/40x60"}
                                                                        className="w-12 h-16 object-cover rounded border"
                                                                    />
                                                                    <div className="flex-1 flex flex-col justify-center gap-1.5">
                                                                        <p className="font-medium text-blue-800">
                                                                            {book?.tenSach}
                                                                        </p>

                                                                        <p className="text-xs">
                                                                            <span className="font-medium mr-1">Số lượng:</span>
                                                                            {detail?.soLuongMuon}
                                                                        </p>

                                                                        <p className="text-xs">
                                                                            <span className="font-medium">Hạn trả:</span>{' '}
                                                                            {detail.ngayHenTra ? (
                                                                                <span className={isOverdue ? 'text-red-600 font-bold' : ''}>
                                                                                    {dayjs(detail.ngayHenTra).format('DD/MM/YYYY')}
                                                                                    {isOverdue && (
                                                                                        <Tooltip title="Bạn đã quá hạn trả!">
                                                                                            <ClockCircleOutlined className="ml-1" />
                                                                                        </Tooltip>
                                                                                    )}
                                                                                </span>
                                                                            ) : (
                                                                                '--'
                                                                            )}
                                                                        </p>
                                                                        <p className="text-xs">
                                                                            <span className="font-medium">Ngày trả:</span>{' '}
                                                                            {detail.ngayTra ? dayjs(detail.ngayTra).format('DD/MM/YYYY') : '-'}
                                                                        </p>

                                                                        <p className="text-xs mt-1">
                                                                            {detail.tinhTrang === 2 ? (
                                                                                <Tag color="green">Đã trả</Tag>
                                                                            ) : detail.tinhTrang === 3 ? (
                                                                                <Tag color="volcano">Mất/Hỏng</Tag>
                                                                            ) : (
                                                                                <Tag color="geekblue">Đang giữ</Tag>
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <div style={{
                                marginTop: 16,
                                display: 'flex',
                                justifyContent: 'flex-end',
                                flexShrink: 0,
                            }}>
                                <Pagination
                                    style={{ display: "flex", flexWrap: "nowrap" }}
                                    current={current}
                                    total={total}
                                    pageSize={pageSize}
                                    showSizeChanger
                                    pageSizeOptions={['5', '10', '20', '50']}
                                    showTotal={(total, range) => (
                                        <span className="hidden sm:inline">
                                            {`${range[0]}-${range[1]} của ${total} phiếu`}
                                        </span>
                                    )}
                                    onChange={(page, pageSize) => {
                                        setCurrent(page);
                                        setPageSize(pageSize);
                                        const tableBody = document.querySelector('.ant-table-body');
                                        if (tableBody) {
                                            tableBody.scrollTo({ top: 0, behavior: 'smooth' });
                                        }
                                    }}
                                />
                            </div>
                        </Content>
                    </div>
                </TabPane>
                <TabPane tab={
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">Phiếu phạt</span>
                    </div>
                } key="2">
                    <Layout className="min-h-screen" style={{ backgroundColor: "transparent" }}>
                        <Content className="max-w-9xl mx-auto px-4 py-8 w-full">
                            <div className="mb-6">
                                {totalDebt > 0 ? (
                                    <Alert
                                        message={
                                            <div className="flex items-center gap-4">
                                                <span className="text-lg">Bạn đang có khoản nợ cần thanh toán:</span>
                                                <span className="text-2xl font-bold text-red-600">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalDebt)}
                                    </span>
                                            </div>
                                        }
                                        description="Vui lòng đến quầy thủ thư để nộp phạt trước hạn, hoặc thanh toán trực tuyến qua VNPay."
                                        type="error"
                                        showIcon
                                        icon={<DollarCircleOutlined style={{ fontSize: 24 }} />}
                                        className="py-4 px-6 shadow-sm border-red-200 bg-red-50"
                                    />
                                ) : (
                                    <Alert
                                        message="Tuyệt vời! Bạn không có khoản phạt nào."
                                        type="success"
                                        showIcon
                                        className="py-4 px-6 shadow-sm"
                                    />
                                )}
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <Title level={4} className="mb-4">Chi tiết các phiếu phạt</Title>
                                <div className="hidden md:block">
                                    <Table
                                        columns={columnsPenalty}
                                        dataSource={list}
                                        rowKey="_id"
                                        loading={loading}
                                        pagination={false}
                                        locale={{ emptyText: <Empty description="Không có dữ liệu vi phạm" /> }}
                                    />
                                </div>
                                <div className="block md:hidden space-y-4">
                                    {list.map((item, index) => {
                                        const deadline = dayjs(item.ngayLap).add(7, 'day');
                                        const now = dayjs();
                                        const isOverdue = now.isAfter(deadline);
                                        const diffMs = Math.abs(now.diff(deadline));
                                        const duration = dayjs.duration(diffMs);
                                        const days = Math.ceil(duration.asDays());

                                        return (
                                            <div key={item._id} className="bg-white shadow rounded-lg p-4 border">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-bold">STT: {index + 1}</span>
                                                    <Tag color="purple" className="cursor-pointer">
                                                        {item.maMuonTra?._id ? `#${item.maMuonTra._id.slice(-6).toUpperCase()}` : 'Chưa có'}
                                                    </Tag>
                                                </div>

                                                <div className="flex items-center gap-2 mb-2">
                                                    <img src={item.maSach?.hinhAnh} alt="" className="w-12 h-16 object-cover rounded border" />
                                                    <span className="font-medium text-blue-800">{item.maSach?.tenSach}</span>
                                                </div>

                                                <div className="text-gray-600 mb-2">
                                                    <span>Lý do phạt: {item.lyDo}</span>
                                                </div>

                                                <div className="mb-2 flex items-center gap-2">
                                                    <span className="font-medium">Ngày lập: {dayjs(item.ngayLap).format('DD/MM/YYYY')}</span>
                                                    <div className="text-xs opacity-75">{dayjs(item.ngayLap).format('HH:mm')}</div>
                                                </div>

                                                <div className="mb-2 flex items-center gap-2">
                                                    <span className="font-medium">Số tiền:</span>
                                                    <b className="text-red-600">
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.soTien)}
                                                    </b>
                                                </div>

                                                <div className="mb-2">
                                                    {item.trangThai ? (
                                                        <Tag icon={<CheckCircleOutlined />} color="success">
                                                            ĐÃ THANH TOÁN
                                                        </Tag>
                                                    ) : (
                                                        <Tooltip
                                                            title={
                                                                isOverdue
                                                                    ? `Hạn chót: ${deadline.format('DD/MM/YYYY')} (Trễ ${days} ngày)`
                                                                    : `Còn ${days} ngày nữa là đến hạn`
                                                            }
                                                        >
                                                            <div className={`flex flex-col gap-1 ${isOverdue ? 'text-red-600' : ''}`}>
                                                                <Tag icon={<ExclamationCircleOutlined />} color={isOverdue ? 'red' : 'volcano'}>
                                                                    {isOverdue ? `Quá hạn ${days} ngày` : 'CHƯA THANH TOÁN'}
                                                                </Tag>
                                                                {!isOverdue && (
                                                                    <div className="text-[12px]">
                                                                        Hạn còn {days} ngày ({deadline.format('DD/MM/YYYY')})
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </Tooltip>
                                                    )}
                                                </div>

                                                <div className="mb-2">
                                                    <span className="font-medium">
                                                        Ngày thanh toán:{' '}
                                                        {item.trangThai ? dayjs(item.updatedAt).format('DD/MM/YYYY HH:mm') : '--'}
                                                    </span>
                                                </div>

                                                <Button
                                                    type="primary"
                                                    className="bg-blue-600 w-full"
                                                    size="small"
                                                    disabled={item.trangThai}
                                                    onClick={() => handlePayment(item)}
                                                >
                                                    Thanh toán VNPay
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>

                            </div>
                        </Content>
                    </Layout>
                </TabPane>
            </Tabs>
            <Modal
                title={<div className="flex items-center gap-2 font-bold"><ThunderboltOutlined className="text-yellow-500" /> Xác nhận gia hạn</div>}
                open={isModalVisible}
                onOk={handleConfirm}
                onCancel={handleCancel}
                confirmLoading={submitting}
                okText="Xác nhận"
                cancelText="Hủy bỏ"
                okButtonProps={{ className: 'bg-blue-600 h-10 rounded-lg px-8 shadow-md' }}
                cancelButtonProps={{ className: 'h-10 rounded-lg' }}
                centered
                width={500}
            >
                {selectedDetail && (
                    <div className="py-4">
                        <label className="block font-bold text-gray-700 flex items-center gap-2 mb-2">Tên sách:</label>
                        <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="text-base font-bold text-gray-800 leading-tight">{selectedDetail.maSach?.tenSach}</div>
                        </div>

                        <Row gutter={16} className="mb-6">
                            <Col span={12}>
                                <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
                                    <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Hạn cũ</div>
                                    <div className="font-bold text-gray-600">{dayjs(selectedDetail.ngayHenTra).format('DD/MM/YYYY')}</div>
                                </div>
                            </Col>
                            <Col span={12}>
                                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm text-center">
                                    <div className="text-[10px] text-blue-400 font-bold uppercase mb-1">Lượt mượn</div>
                                    <div className="font-bold text-blue-600">{selectedDetail.soLuongMuon} cuốn</div>
                                </div>
                            </Col>
                        </Row>

                        <div className="space-y-4">
                            <label className="block font-bold text-gray-700 flex items-center gap-2">
                                <CalendarOutlined className="text-blue-500" /> Chọn ngày trả mới dự kiến:
                            </label>
                            <DatePicker
                                className="w-full h-12 rounded-xl"
                                format="DD/MM/YYYY"
                                disabledDate={(currentDate) => {
                                    const currentHenTra = dayjs(selectedDetail.ngayHenTra);
                                    return (
                                        currentDate && (
                                            currentDate.isBefore(currentHenTra.add(1, 'day'), 'day') ||
                                            currentDate.isAfter(absoluteDeadline, 'day')
                                        )
                                    );
                                }}
                                onChange={(date) => setNewDueDate(date)}
                                placeholder="Chọn một ngày trong khoảng gia hạn"
                            />
                            <div className="text-[11px] text-blue-500/70 bg-blue-50 p-4 rounded-2xl border border-dashed border-blue-200 leading-relaxed">
                                <InfoCircleOutlined className="mr-1" />
                                Hạn mượn tối đa cho phiếu này (<b>{limitDays} ngày</b> tính từ ngày nhận sách) là ngày
                                <b> {absoluteDeadline.format('DD/MM/YYYY')}</b>.
                                Mọi yêu cầu gia hạn không được vượt quá mốc này.
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>

    );
};

export default LoansPage;