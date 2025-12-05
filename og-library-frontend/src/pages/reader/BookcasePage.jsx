import React, { useState, useEffect } from 'react';
import {Table, Button, Input, Image, DatePicker, InputNumber, message} from 'antd';
import { DeleteOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useBookcase } from "../../context/BookcaseContext";
import axios from "../../services/axios.customize";
import dayjs from 'dayjs';
import {usePage} from "../../context/NavContext.jsx";

const BookcasePage = () => {
    const { setActivePage } = usePage();
    const { Bookcase, removeFromBookcase, clearBookcase, updateSoLuongMuon } = useBookcase();
    const [loading, setLoading] = useState(false);
    const [note, setNote] = useState("");
    const navigate = useNavigate();
    const [api, contextHolder] = message.useMessage();
    const [returnDate, setReturnDate] = useState(null);
    const totalQuantity = Bookcase.reduce((sum, item) => sum + (item.soLuongMuon || 1), 0);

    useEffect(() => {
        setActivePage('');
    }, [setActivePage]);

    const hanToiDa = (soLuong) => {
        const today = new Date();
        if (soLuong <= 5) {
            today.setDate(today.getDate() + 30);
        } else if (soLuong > 5 && soLuong <= 10) {
            today.setDate(today.getDate() + 7);
        }
        return dayjs(today);
    };

    useEffect(() => {
        setReturnDate(hanToiDa(totalQuantity));
    }, [totalQuantity]);

    const handleCheckout = async () => {
        if (Bookcase.length === 0) return;
        if (totalQuantity > 10) {
            api.error(`Bạn chỉ được mượn tối đa 10 cuốn. Hiện tại: ${totalQuantity}`);
            return;
        }
        if (!returnDate) {
            return;
        }

        setLoading(true);
        try {
            const itemsToSend = Bookcase.map(item => ({
                maSach: item._id,
                soLuongMuon: item.soLuongMuon || 1
            }));
            await axios.post('/muon-tra', {
                items: itemsToSend,
                ngayHenTra: returnDate.toISOString(),
                ghiChu: note
            });

            api.success("Đăng ký mượn thành công! Vui lòng đến thư viện nhận sách.");
            clearBookcase();
            navigate('/loans');
        } catch (error) {
            if (error.statusCode === 400) {
                api.error(error.message);
            } else {
                api.error("Lỗi mượn sách");
            }
        }
        setLoading(false);
    };

    const columns = [
        {
            title: 'Ảnh bìa',
            dataIndex: 'hinhAnh',
            align: 'center',
            render: src => (
                <Image
                    src={src || "https://placehold.co/50x75?text=No+Image"}
                    width={50}
                    height={70}
                    style={{ objectFit: 'cover', borderRadius: 4 }}
                />
            )
        },
        {
            title: 'Tên sách',
            dataIndex: 'tenSach',
            render: text => <span className="font-bold text-blue-800 text-base">{text}</span>
        },
        {
            title: 'Tác giả',
            dataIndex: 'maTacGia',
            render: authors => (
                <span className="text-gray-600">
                    {authors?.map(a => a.tenTacGia).join(', ') || "Chưa cập nhật"}
                </span>
            )
        },
        {
            title: 'Số lượng',
            dataIndex: 'soLuongMuon',
            width: 120,
            align: 'center',
            render: (val, record) => (
                <InputNumber
                    min={1}
                    max={record.soLuong}
                    value={val || 1}
                    onChange={(value) => updateSoLuongMuon(record._id, value, record.soLuong)}
                />
            )
        },
        {
            title: 'Xóa',
            align: 'center',
            render: (_, record) => (
                <Button
                    danger
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => removeFromBookcase(record._id)}
                />
            )
        }
    ];

    return (
        <div>
            {contextHolder}
            <div className="max-w-6xl mx-auto p-6 min-h-screen bg-gray-50">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 m-0">
                        Giỏ sách của bạn <span className="text-blue-600">({Bookcase.length})</span>
                    </h2>
                    {Bookcase.length > 0 && (
                        <Button danger onClick={clearBookcase}>Xóa tất cả</Button>
                    )}
                </div>

                {Bookcase.length > 0 ? (
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="hidden sm:block">
                            <div className="w-full overflow-x-auto">
                                <Table
                                    dataSource={Bookcase}
                                    columns={columns}
                                    rowKey="_id"
                                    pagination={false}
                                    scroll={{ x: 'max-content' }}
                                    className="shadow-sm bg-white rounded-lg"
                                />
                            </div>
                        </div>
                        <div className="block sm:hidden">
                            <div className="grid grid-cols-1 gap-4">
                                {Bookcase?.map(book => (
                                    <div
                                        key={book._id}
                                        className="bg-white rounded-lg shadow p-4 border border-gray-200"
                                    >
                                        <div className="w-full h-[170px] relative rounded-md overflow-hidden mb-3 mx-auto">
                                            <img
                                                src={book.hinhAnh || "https://placehold.co/120x170?text=No+Image"}
                                                className="absolute inset-0 w-full h-full object-cover blur-lg scale-110 opacity-70"
                                            />
                                            <img
                                                src={book.hinhAnh || "https://placehold.co/120x170?text=No+Image"}
                                                className="absolute inset-0 w-full h-full object-contain z-10"
                                            />
                                        </div>

                                        <h2 className="text-base font-bold text-blue-800 mb-2">
                                            {book.tenSach}
                                        </h2>

                                        <p className="text-gray-600 text-sm mb-3">
                                            <span className="font-medium">Tác giả:</span>{" "}
                                            {book.maTacGia?.map(a => a.tenTacGia).join(", ") || "Chưa cập nhật"}
                                        </p>

                                        <div className="mb-3 flex items-center gap-3">
                                            <span className="text-gray-500 text-sm">Số lượng mượn:</span>
                                            <InputNumber
                                                min={1}
                                                max={book.soLuong}
                                                value={book.soLuongMuon || 1}
                                                onChange={(val) =>
                                                    updateSoLuongMuon(book._id, val, book.soLuong)
                                                }
                                            />
                                        </div>

                                        <div className="flex justify-end">
                                            <Button
                                                danger
                                                type="primary"
                                                icon={<DeleteOutlined />}
                                                onClick={() => removeFromBookcase(book._id)}
                                            >
                                                Xóa
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="w-full lg:w-80 flex-shrink-0">
                            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
                                <h4 className="font-bold text-lg mb-4 border-b pb-2">Thông tin mượn</h4>
                                <div className="space-y-3 text-sm text-gray-600">
                                    <div className="flex justify-between">
                                        <span>Tổng số lượng:</span>
                                        <b className="text-black">{totalQuantity} cuốn</b>
                                    </div>
                                    <div className="flex justify-between items-center gap-2">
                                        <span className="flex justify-between items-center gap-1.5">Hạn trả:</span>
                                        <DatePicker
                                            value={returnDate}
                                            format="DD/MM/YYYY"
                                            onChange={(value) => {
                                                setReturnDate(value);
                                            }}
                                            disabledDate={(current) => {
                                                const today = dayjs().startOf('day');
                                                const diff = totalQuantity <= 5 ? 30 : 7;

                                                return (
                                                    current < today ||
                                                    current > today.add(diff, 'day')
                                                );
                                            }}
                                            allowClear={false}
                                        />
                                    </div>
                                    <div className="flex justify-center items-center gap-2 my-2">
                                        <InfoCircleOutlined/>
                                        <p>Mượn <b>{totalQuantity}</b> cuốn: Hạn trả tối đa là <b>{totalQuantity <= 5 ? 30 : 7}</b> ngày</p>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <span className="block text-gray-700 mb-1 font-medium">Ghi chú:</span>
                                    <Input.TextArea
                                        rows={3}
                                        placeholder="VD: Mượn cho nhóm học..."
                                        value={note}
                                        onChange={e => setNote(e.target.value)}
                                    />
                                </div>

                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<CheckCircleOutlined />}
                                    loading={loading}
                                    onClick={handleCheckout}
                                    disabled={totalQuantity > 10}
                                    className="w-full h-12 font-bold bg-blue-600 hover:bg-blue-500 shadow-md"
                                >
                                    Xác Nhận Mượn
                                </Button>

                                {totalQuantity > 10 && (
                                    <div className="mt-3 text-red-500 text-center text-xs">
                                        Vượt quá giới hạn mượn (Tối đa 10)
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center bg-white p-12 rounded-lg shadow-sm min-h-[400px]">
                        <div className="text-center">
                            <img
                                src="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                                alt=""
                                className="mx-auto"
                            />
                            <span className="text-gray-500 text-lg">
                            Giỏ sách của bạn đang trống
                        </span>
                        </div>
                        <Button type="primary" size="large" className="mt-6" onClick={() => navigate('/library')}>
                            Quay lại chọn sách
                        </Button>
                    </div>
                )}
            </div>
        </div>

    );
};

export default BookcasePage;