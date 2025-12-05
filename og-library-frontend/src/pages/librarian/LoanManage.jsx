import React, { useEffect, useState } from 'react';
import {
    Table,
    Tag,
    Button,
    message,
    Modal,
    Form,
    InputNumber,
    Input,
    Tooltip,
    Popconfirm,
    Space,
    Select,
    Pagination
} from 'antd';
import {
    CheckCircleOutlined,
    CarOutlined,
    ExclamationCircleOutlined,
    ClockCircleOutlined, CloseCircleOutlined, SearchOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from '../../services/axios.customize';
import useDebounce from "../../hooks/UseDebounce.jsx";

const LoanManage = () => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedData, setExpandedData] = useState({});
    const [currentBookPrice, setCurrentBookPrice] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [form] = Form.useForm();
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [selectedLoanId, setSelectedLoanId] = useState(null);
    const [formApprove] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [total, setTotal] = useState(0);

    useEffect(() => { fetchLoans(); }, [current, pageSize, debouncedSearchTerm]);

    const fetchLoans = async () => {
        setLoading(true);

        let query = `page=${current}&limit=${pageSize}`;
        if (debouncedSearchTerm) {
            query += `&keyword=${debouncedSearchTerm}`;
        }
        try {
            const res = await axios.get(`/muon-tra?${query}`);
            if (res && res.result) {
                setLoans(res.result);
                setTotal(res.meta.total);
            }
        } catch (error) {
            messageApi.error("Lỗi tải danh sách");
        }
        setLoading(false);
    };

    const refreshExpandedRow = async (loanId) => {
        if (expandedData[loanId]) {
            try {
                const details = await axios.get(`/muon-tra/${loanId}/details`);
                setExpandedData(prev => ({
                    ...prev,
                    [loanId]: details
                }));
            } catch (error) {
                console.error("Lỗi refresh bảng con", error);
            }
        }
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

    const handleOpenApproveModal = (id) => {
        setSelectedLoanId(id);
        formApprove.resetFields();
        setIsApproveModalOpen(true);
    };

    const handleSubmitApprove = async (values) => {
        try {
            await axios.patch(`/muon-tra/${selectedLoanId}/approve`, {
                ghiChu: values.ghiChu
            });

            messageApi.success("Đã duyệt đơn và gửi lời nhắn!");
            setIsApproveModalOpen(false);
            fetchLoans();
            await refreshExpandedRow(selectedLoanId);
        } catch (error) {
            messageApi.error("Lỗi khi duyệt đơn");
        }
    };

    const handlePickup = async (id) => {
        await axios.patch(`/muon-tra/${id}/pickup`);
        messageApi.success("Đã giao sách");
        fetchLoans();
        await refreshExpandedRow(id);
    };

    const handleCancel = async (id) => {
        try {
            await axios.patch(`/muon-tra/${id}/cancel`);
            messageApi.success("Đã hủy phiếu mượn");
            fetchLoans();
            await refreshExpandedRow(id);
        } catch (error) {
            messageApi.error(error.response?.data?.message || "Lỗi hủy phiếu");
        }
    };

    const handleOpenModal = (detailRecord) => {
        const daTra = detailRecord.soLuongDaTra || 0;
        const tong = detailRecord.soLuongMuon || 1;
        const conNo = tong - daTra;

        const returnDate = dayjs();
        const dueDate = dayjs(detailRecord.ngayHenTra);
        const isOverdue = returnDate.isAfter(dueDate, 'day');

        let phatGoiY = 0;
        let lyDoGoiY = "";

        if (isOverdue) {
            const days = returnDate.diff(dueDate, 'day');
            phatGoiY = days * 5000 * conNo;
            lyDoGoiY = `Quá hạn ${days} ngày (${conNo} cuốn)`;
        }

        const price = detailRecord.maSach?.giaTien || 0;
        setCurrentBookPrice(price);

        setSelectedDetail({
            ...detailRecord,
            maxQty: conNo,
            isOverdue
        });

        form.setFieldsValue({
            soLuongTra: conNo,
            tienPhat: phatGoiY,
            lyDoPhat: lyDoGoiY,
            ghiChu: ""
        });

        setIsModalOpen(true);
    };

    const handleSubmitReturn = async (values) => {
        try {
            await axios.patch(`/muon-tra/detail/${selectedDetail._id}/return`, values);

            messageApi.success("Trả sách thành công!");
            setIsModalOpen(false);

            fetchLoans();
            const parentId = selectedDetail.maMuonTra?._id || selectedDetail.maMuonTra;
            if (parentId) {
                const newDetails = await axios.get(`/muon-tra/${parentId}/details`);
                setExpandedData(prev => ({ ...prev, [parentId]: newDetails }));
            }

        } catch (error) {
            messageApi.error(error.response?.data?.message || "Lỗi trả sách");
        }
    };

    const onQuickReasonChange = (value) => {
        if (value === 'qua_han') {
            form.setFieldsValue({
                tienPhat: 0,
                lyDoPhat: 'Quá hạn'
            });
        } else if (value === 'mat_sach') {
            form.setFieldsValue({
                tienPhat: currentBookPrice,
                lyDoPhat: 'Làm mất sách'
            });
        }
        else if (value === 'rach_sach') {
            form.setFieldsValue({
                tienPhat: currentBookPrice * 0.5,
                lyDoPhat: 'Làm rách/hư hỏng sách'
            });
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
            width: 120,
            render: (r) => (
                <Tag color="purple" style={{ cursor: 'pointer' }}>
                    {r ? `#${r.slice(-6).toUpperCase()}` : 'Chưa có'}
                </Tag>
            )
        },
        {
            title: 'Người mượn',
            dataIndex: 'maNguoiDung',
            render: (user) => (
                <div>
                    <div className="font-bold text-gray-700">{user?.hoVaTen}</div>
                    <div className="text-xs text-gray-500">{user?.email}</div>
                </div>
            )
        },
        {
            title: 'Ngày đăng ký',
            dataIndex: 'ngayDangKy',
            render: d => dayjs(d).format('DD/MM/YYYY HH:mm')
        },
        {
            title: 'Ngày mượn (Thực tế)',
            dataIndex: 'ngayMuon',
            width: 180,
            render: (date) => {

                if (!date) {
                    return (
                        <div className="flex justify-center">
                            <span className="text-gray-400 italic text-xs">-- Chưa lấy sách --</span>
                        </div>
                    )
                }

                return (
                    <div className="flex justify-center">
                        <span>
                            {dayjs(date).format('DD/MM/YYYY')}
                        </span>
                    </div>
                );
            }
        },
        {
            title: 'Trạng thái',
            dataIndex: 'trangThai',
            render: (st) => {
                const map = {
                    0: { color: 'orange', text: 'Chờ duyệt' },
                    1: { color: 'blue', text: 'Chờ lấy sách' },
                    2: { color: 'geekblue', text: 'Đang mượn' },
                    3: { color: 'green', text: 'Hoàn thành' },
                    4: { color: 'red', text: 'Đã hủy' }
                };
                return <Tag color={map[st]?.color || 'default'}>{map[st]?.text || 'Unknown'}</Tag>
            }
        },
        {
            title: 'Hành động',
            render: (_, record) => (
                <>
                    {record.trangThai === 0 && (
                        <Space>
                            <Button type="primary" size="small" onClick={() => handleOpenApproveModal(record._id)}>
                                Duyệt đơn
                            </Button>
                            <Popconfirm title="Từ chối/Hủy đơn này?" onConfirm={() => handleCancel(record._id)}>
                                <Button danger size="small">Từ chối</Button>
                            </Popconfirm>
                        </Space>

                    )}
                    {record.trangThai === 1 && (
                        <Space>
                            <Button className="border-green-600 text-green-600" size="small" icon={<CarOutlined />} onClick={() => handlePickup(record._id)}>
                                Khách đã lấy
                            </Button>
                            <Popconfirm
                                title="Khách không đến lấy? Hủy đơn này?"
                                onConfirm={() => handleCancel(record._id)}
                            >
                                <Button danger type="text" icon={<CloseCircleOutlined />} />
                            </Popconfirm>
                        </Space>

                    )}
                    {record.trangThai === 2 && <span className="text-gray-400 text-xs">Xem chi tiết để trả</span>}
                </>
            )
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
                        <img src={book?.hinhAnh} alt="" className="w-8 h-10 object-cover rounded border" />
                        <span className="font-medium text-blue-800">{book?.tenSach}</span>
                    </div>
                )
            },
            {
                title: 'Tiến độ',
                align: 'center',
                render: (_, detail) => (
                    <span>
                        {detail.soLuongDaTra || 0} / <b>{detail.soLuongMuon}</b>
                    </span>
                )
            },
            {
                title: 'Hạn trả',
                dataIndex: 'ngayHenTra',
                render: (date, detailRecord) => {
                    if (!date) return <span className="text-gray-400">--</span>;
                    const parentStatus = detailRecord.maMuonTra?.trangThai;
                    const isBorrowing = parentStatus === 2;
                    const notReturned = detailRecord.tinhTrang === 0;
                    const timePassed = dayjs().isAfter(dayjs(date));

                    const isOverdue = isBorrowing && notReturned && timePassed;
                    return (
                        <span className={isOverdue ? "text-red-600 font-bold flex items-center gap-1" : ""}>
                            {dayjs(date).format('DD/MM/YYYY')}
                            {isOverdue && <Tooltip title="Quá hạn"><ClockCircleOutlined /></Tooltip>}
                        </span>
                    );
                }
            },
            {
                title: 'Ngày trả (Thực tế)',
                dataIndex: 'ngayTra',
                render: (date, record) => {
                    if (!date) return (
                        <div className="flex justify-center">
                            <span className="text-gray-400 italic">--Chưa trả--</span>
                        </div>
                    )
                    const returnDate = dayjs(date);
                    const dueDate = dayjs(record.ngayHenTra);
                    const isLate = returnDate.isAfter(dueDate, 'day');
                    return (
                        <div className="flex justify-center">
                            <span className={`font-medium ${isLate ? 'text-red-600' : 'text-green-600'}`}>
                                {returnDate.format('DD/MM/YYYY')}
                            </span>
                        </div>
                    );
                }
            },
            {
                title: 'Trạng thái',
                dataIndex: 'tinhTrang',
                render: (detailStatus, detailRecord) => {
                    const parentStatus = detailRecord.maMuonTra?.trangThai;

                    if (parentStatus === 4) return <Tag color="red">Đã hủy</Tag>;
                    if (parentStatus === 0) return <Tag color="orange" style={{borderStyle:'dashed'}}>Chờ duyệt</Tag>;
                    if (parentStatus === 1) return <Tag color="blue" style={{borderStyle:'dashed'}}>Chờ lấy</Tag>;

                    if (detailStatus === 1) return <Tag color="green">Đã trả đủ</Tag>;
                    return <Tag color="geekblue">Đang giữ</Tag>;
                }
            },
            {
                title: 'Trả sách',
                render: (_, detail) => {
                    const daTra = detail.soLuongDaTra || 0;
                    const tong = detail.soLuongMuon || 1;
                    const conNo = tong - daTra;
                    const isCancelOrPending = record.trangThai === 4 || record.trangThai === 0 || record.trangThai === 1;
                    if (conNo > 0 && !isCancelOrPending) {
                        let buttonText = "Trả sách";
                         if (daTra > 0) {
                            buttonText = `Trả tiếp (${conNo})`;
                        }
                        return (
                            <Button
                                size="small"
                                type={'primary'}
                                icon={<CheckCircleOutlined />}
                                onClick={() => handleOpenModal(detail)}
                            >
                                {buttonText}
                            </Button>
                        );
                    }

                    if (conNo === 0) {
                        return <Tag color="green">Đã trả đủ</Tag>;
                    }

                    if (record.trangThai === 1) return <span className="text-gray-400 text-xs">Chưa lấy sách</span>;
                    if (record.trangThai === 4) return <span className="text-red-300 text-xs">Đã hủy</span>;

                    return null;
                }
            }
        ];

        return <Table columns={detailColumns} dataSource={data} pagination={false} rowKey="_id" />;
    };

    return (
        <div style={{
            height: 'calc(100vh - 150px)',
            display: 'flex',
            flexDirection: 'column',
            paddingBottom: 0
        }}>
            {contextHolder}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold mb-4">Quản lý Mượn Trả</h2>
                <div className="flex gap-2 w-[300px]">
                    <Input
                        size="large"
                        placeholder="Nhập mã phiếu hoặc người mượn..."
                        prefix={<SearchOutlined />}
                        className="flex-grow"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                        }}
                    />
                </div>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
                <Table
                    className="components-table-demo-nested"
                    columns={columns}
                    expandable={{ expandedRowRender, onExpand }}
                    dataSource={loans}
                    rowKey="_id"
                    loading={loading}
                    pagination={false}
                    scroll={{
                        x: 1000,
                        y: 'calc(100vh - 300px)'
                    }}
                />
            </div>
            <div style={{
                marginTop: 16,
                display: 'flex',
                justifyContent: 'flex-end',
                flexShrink: 0
            }}>
                <Pagination
                    current={current}
                    total={total}
                    pageSize={pageSize}
                    showSizeChanger
                    pageSizeOptions={['5', '10', '20', '50']}
                    showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} phiếu`}
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

            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <span>Xác nhận trả sách</span>
                        {selectedDetail?.isOverdue && <Tag color="red">ĐANG QUÁ HẠN</Tag>}
                    </div>
                }
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                cancelText="Thoát"
                onOk={() => form.submit()}
                okText="Xác nhận"
                okButtonProps={{ danger: selectedDetail?.isOverdue }}
            >
                {selectedDetail && (
                    <div className="bg-blue-50 p-3 rounded border border-blue-100 mb-4 text-sm">
                        <p><b>Sách:</b> {selectedDetail.maSach?.tenSach}</p>
                        <p>
                            <b>Tiến độ:</b> {selectedDetail.soLuongDaTra}/{selectedDetail.soLuongMuon}
                            <span className="ml-2 text-red-600 font-bold">(Còn nợ: {selectedDetail.maxQty})</span>
                        </p>
                    </div>
                )}

                <Form form={form} layout="vertical" onFinish={handleSubmitReturn}>
                    <Form.Item
                        name="soLuongTra"
                        label="Số lượng trả lần này"
                        rules={[
                            { required: true, message: 'Nhập số lượng' },
                            { type: 'number', min: 1, max: selectedDetail?.maxQty, message: 'Số lượng không hợp lệ' }
                        ]}
                    >
                        <InputNumber style={{ width: '100%' }} min={1} max={selectedDetail?.maxQty} />
                    </Form.Item>

                    <div className={`p-3 rounded border mb-3 ${selectedDetail?.isOverdue ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-2 font-bold text-gray-700 mb-2">
                            <ExclamationCircleOutlined className={selectedDetail?.isOverdue ? "text-red-500" : ""} />
                            Xử lý vi phạm (Nếu có)
                        </div>
                        <Form.Item label="Chọn nhanh lý do phạt">
                            <Select onChange={onQuickReasonChange} placeholder="-- Chọn lý do --">
                                <Select.Option value="qua_han">Quá hạn (Tính theo ngày)</Select.Option>
                                <Select.Option value="mat_sach">Làm mất (Đền 100% giá)</Select.Option>
                                <Select.Option value="rach_sach">Hư hỏng (Đền 50% giá)</Select.Option>
                            </Select>
                        </Form.Item>
                        <div className="flex gap-2">
                            <Form.Item name="tienPhat" label="Số tiền phạt" style={{ width: 150 }}>
                                <InputNumber
                                    min={0}
                                    style={{ width: '100%' }}
                                    formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    addonAfter="đ"
                                />
                            </Form.Item>
                            <Form.Item name="lyDoPhat" label="Lý do cụ thể" style={{ flex: 1 }}>
                                <Input/>
                            </Form.Item>
                        </div>
                    </div>
                </Form>
            </Modal>
            <Modal
                title="Duyệt yêu cầu mượn sách"
                open={isApproveModalOpen}
                onCancel={() => setIsApproveModalOpen(false)}
                cancelText="Thoát"
                onOk={() => formApprove.submit()}
                okText="Duyệt ngay"
            >
                <p className="text-gray-500 mb-4">
                    Bạn có thể để lại lời nhắn cho độc giả (Ví dụ: Thời gian đến lấy, dặn dò...).
                </p>

                <Form form={formApprove} layout="vertical" onFinish={handleSubmitApprove}>
                    <Form.Item
                        name="ghiChu"
                        label="Ghi chú phản hồi"
                        initialValue="Sách đã sẵn sàng, vui lòng đến thư viện nhận sách trong vòng 2 ngày."
                    >
                        <Input.TextArea
                            rows={4}
                            placeholder="Nhập lời nhắn..."
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default LoanManage;