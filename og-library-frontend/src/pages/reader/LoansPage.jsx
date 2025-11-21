import { Table, Tag} from "antd";
import React from "react";

const myLoans = [
    { key: '1', book: 'Nhà Giả Kim', borrowDate: '2023-10-15', dueDate: '2023-10-29', returnDate: null, status: 'DangMuon' },
    { key: '2', book: 'Clean Code', borrowDate: '2023-09-01', dueDate: '2023-09-15', returnDate: '2023-09-14', status: 'DaTra' },
];
const myFines = [
    { key: '1', book: 'Harry Potter', date: '2023-08-20', reason: 'Làm rách bìa', amount: 50000, status: 'ChuaDong' },
];

const LoansPage = () => {
    return (


        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
                <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-4 border-l-4 border-blue-500 pl-3">Sách đang mượn</h3>
                    <Table dataSource={myLoans} pagination={false} columns={[{ title: 'Tên Sách', dataIndex: 'book', key: 'book', render: t => <b>{t}</b> }, { title: 'Hẹn trả', dataIndex: 'dueDate', key: 'dueDate', render: (t, r) => <span className={new Date(t) < new Date() && r.status === 'DangMuon' ? 'text-red-500 font-bold' : ''}>{t}</span> }, { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: s => <Tag color={s === 'DangMuon' ? 'processing' : 'success'}>{s === 'DangMuon' ? 'Đang mượn' : 'Đã trả'}</Tag> }]} />
                </div>
                <div className="lg:col-span-1">
                    <h3 className="text-lg font-semibold mb-4 border-l-4 border-red-500 pl-3 text-red-600">Vi phạm & Phạt</h3>
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                        {myFines.map(fine => (
                            <div key={fine.key} className="bg-white p-3 rounded shadow-sm mb-3"><div className="flex justify-between"><span className="font-bold text-gray-700">{fine.book}</span><span className="font-bold text-red-600">{fine.amount.toLocaleString()}đ</span></div><p className="text-sm text-gray-500 my-1">{fine.reason}</p><Tag color="error">Chưa đóng</Tag></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>



    )
}

export default LoansPage;