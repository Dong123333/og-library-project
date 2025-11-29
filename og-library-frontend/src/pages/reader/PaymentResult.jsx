import { Result, Button } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentResult = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const status = searchParams.get('status');

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-10">
                <div className="bg-white p-8 rounded-xl shadow-sm">
                    {status === '1' ? (
                        <Result
                            status="success"
                            title="Thanh toán thành công!"
                            subTitle="Cảm ơn bạn đã hoàn thành đóng phạt. Phiếu phạt đã được cập nhật."
                            extra={[
                                <Button type="primary" key="console" onClick={() => navigate('/loans#penalties')}>
                                    Về danh sách phạt
                                </Button>,
                            ]}
                        />
                    ) : (
                        <Result
                            status="error"
                            title="Thanh toán thất bại"
                            subTitle="Giao dịch bị hủy hoặc có lỗi xảy ra. Vui lòng thử lại."
                            extra={[
                                <Button key="buy" onClick={() => navigate('/loans#penalties')}>
                                    Thử lại
                                </Button>,
                            ]}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentResult;