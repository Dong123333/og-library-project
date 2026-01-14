import React, {useEffect, useRef, useState} from 'react';
import {
    Layout, Row, Col, Card, Form, Input, Button,
    DatePicker, message, Tabs, Tag, Avatar, Spin, Slider, Modal, Tooltip
} from 'antd';
import {
    UserOutlined, LockOutlined, SaveOutlined,
    MailOutlined, PhoneOutlined, EnvironmentOutlined, CalendarOutlined, ArrowRightOutlined, CameraOutlined,
    ZoomOutOutlined, ZoomInOutlined, RotateRightOutlined, GooglePlusCircleFilled, FacebookFilled
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {useAuth} from "../../context/AuthContext.jsx";
import axios from '../../services/axios.customize';
import {useNavigate} from "react-router-dom";
import {usePage} from "../../context/NavContext.jsx";
import facebook from "../../assets/images/facebook.png";
import google from "../../assets/images/google.png";

const { Content } = Layout;

const ProfilePage = () => {
    const { setActivePage } = usePage();
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [imageLoading, setImageLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();

    const [formInfo] = Form.useForm();
    const [formPass] = Form.useForm();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [imgFilters, setImgFilters] = useState({
        brightness: 100,
        contrast: 100,
    });

    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        setActivePage('');
    }, [setActivePage]);

    useEffect(() => {
        const fetchFullProfile = async () => {
            setDataLoading(true);
            try {
                const res = await axios.get('/auth/profile');
                const dataToCheck = res.user || res;
                if (dataToCheck) {
                    const userData = dataToCheck;
                    setUser(userData);
                    formInfo.setFieldsValue({
                        hoVaTen: userData.hoVaTen,
                        email: userData.email,
                        soDienThoai: userData.soDienThoai,
                        diaChi: userData.diaChi,
                        ngaySinh: userData.ngaySinh ? dayjs(userData.ngaySinh) : null,
                    });
                }
            } catch (error) {
                messageApi.error("Không thể tải thông tin người dùng");
            }
            setDataLoading(false);
        };
        fetchFullProfile()
    }, []);

    const handleUpdateInfo = async (values) => {
        setLoading(true);
        try {
            const { email, ...dataToSend } = values;

            const payload = {
                ...dataToSend,
                ngaySinh: values.ngaySinh ? values.ngaySinh.toISOString() : null
            };

            const res = await axios.patch('/nguoi-dung/profile', payload);

            if (res) {
                messageApi.success("Cập nhật hồ sơ thành công!");
                const newUserParams = {
                    ...user,
                    ...payload,
                    hoVaTen: values.hoVaTen
                };
                setUser(newUserParams);
            }
        } catch (error) {
            messageApi.error(error.response?.data?.message || "Lỗi cập nhật");
        }
        setLoading(false);
    };

    const handleChangePass = async (values) => {
        try {
            const res = await axios.post('/auth/change-password-profile', values);
            if (res) {
                messageApi.success("Đổi mật khẩu thành công!");
                formPass.resetFields();
            }
        }catch (e) {
            messageApi.error(e.message);
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                messageApi.error("Dung lượng ảnh không được vượt quá 2MB");
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                setSelectedImage(reader.result);
                setIsEditModalOpen(true);
                setZoom(1);
                setRotation(0);
                setImgFilters({ brightness: 100, contrast: 100 });
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        if (isEditModalOpen && selectedImage && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                const size = 400;
                canvas.width = size;
                canvas.height = size;

                ctx.filter = `brightness(${imgFilters.brightness}%) contrast(${imgFilters.contrast}%)`;
                ctx.clearRect(0, 0, size, size);

                ctx.save();
                ctx.translate(size / 2, size / 2);
                ctx.rotate((rotation * Math.PI) / 180);
                ctx.scale(zoom, zoom);

                const aspect = img.width / img.height;
                let drawW, drawH;
                if (aspect > 1) {
                    drawH = size;
                    drawW = size * aspect;
                } else {
                    drawW = size;
                    drawH = size / aspect;
                }

                ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
                ctx.restore();
            };
            img.src = selectedImage;
        }
    }, [isEditModalOpen, selectedImage, zoom, rotation, imgFilters]);

    const dataURLtoFile = (dataurl, filename) => {
        let arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, {type:mime});
    }


    const saveAvatar = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const finalDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        const file = dataURLtoFile(finalDataUrl, 'avatar.jpg');

        const formData = new FormData();
        formData.append('hinhAnh', file);
        setImageLoading(true);
        setIsEditModalOpen(false);

        try {
            const res = await axios.patch('/nguoi-dung/profile', formData);

            if (res) {
                let newImageUrl = res.hinhAnh;
                if (newImageUrl) {
                    newImageUrl = `${newImageUrl.split('?')[0]}?t=${new Date().getTime()}`;
                }

                setUser(prev => ({
                    ...prev,
                    hinhAnh: newImageUrl
                }));
                messageApi.success("Đã cập nhật ảnh đại diện mới!");
            }
        } catch (error) {
            messageApi.error("Lỗi khi tải ảnh lên server");
        } finally {
            setImageLoading(false);
            setSelectedImage(null);
        }
    };

    const renderProviderIcon = () => {
        if (user.nguonDangNhap === 'google') return <Tooltip title="Đã liên kết Google"><img style={{ width: 18, height: 18 }} src={google} alt=""/></Tooltip>;
        if (user.nguonDangNhap === 'facebook') return <Tooltip title="Đã liên kết Facebook"><img style={{ width: 18, height: 18 }} src={facebook} alt=""/></Tooltip>;
        return null;
    };

    return (
        <Layout className="min-h-screen" style={{ backgroundColor: 'transparent'}}>
            {contextHolder}
            <Content className="max-w-9xl mx-auto w-full">
                <div className="flex items-center gap-2 mb-6 text-gray-500 cursor-pointer hover:text-blue-600 w-fit" onClick={() => navigate("/")}>
                    <ArrowRightOutlined className="rotate-180" /> Quay lại
                </div>
                <Spin spinning={dataLoading} tip="Đang tải...">
                    <Row gutter={[24, 24]} align="stretch">
                        <Col xs={24} md={8}>
                            <Card className="h-full shadow-sm text-center border-t-4 border-t-blue-600 rounded-lg">
                                <div className="h-32 absolute top-0 left-0 w-full flex items-start justify-end p-4">
                                    {renderProviderIcon()}
                                </div>
                                <div className="relative inline-block mb-4 group">
                                    <Spin spinning={imageLoading}>
                                        <div className="relative">
                                            <Avatar
                                                size={120}
                                                src={user.hinhAnh}
                                                icon={!user.hinhAnh ? <UserOutlined style={{ color: '#8a8d91' }} /> : undefined}
                                                className="border-4 border-white shadow-md"
                                                style={{ backgroundColor: '#ffffff', border: '1px solid #b0b3b8' }}
                                            />
                                            <div
                                                onClick={() => fileInputRef.current.click()}
                                                className="absolute bottom-1 right-1 bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-blue-700 transition-all border-2 border-white"
                                            >
                                                <CameraOutlined style={{ fontSize: '18px' }} />
                                            </div>
                                        </div>
                                    </Spin>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>

                                <h2 className="text-xl font-bold text-gray-800 mb-1">
                                    {user.hoVaTen || "Thành viên mới"}
                                </h2>
                                <p className="text-gray-500 mb-3">{user.email}</p>

                                <Tag color="blue" className="px-3 py-1 rounded-full text-sm">
                                    {user.maVaiTro?.tenVaiTro?.toUpperCase()}
                                </Tag>

                                <div className="mt-8 text-left space-y-4 border-t pt-6">
                                    <div className="flex items-center text-gray-600">
                                        <MailOutlined className="mr-3 text-blue-500 text-lg" />
                                        <span className="truncate">{user.email}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <CalendarOutlined className="mr-3 text-green-500 text-lg" />
                                        <span>{user.ngaySinh ? dayjs(user.ngaySinh).format('DD/MM/YYYY') : "Chưa cập nhật ngày sinh"}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <PhoneOutlined className="mr-3 text-green-500 text-lg" />
                                        <span>{user.soDienThoai || "Chưa cập nhật SĐT"}</span>
                                    </div>
                                    <div className="flex items-start text-gray-600">
                                        <EnvironmentOutlined className="mr-3 text-red-500 text-lg mt-1" />
                                        <span>{user.diaChi || "Chưa cập nhật địa chỉ"}</span>
                                    </div>
                                </div>
                            </Card>
                        </Col>

                        <Col xs={24} md={16}>
                            <Card className="h-full shadow-sm rounded-lg" bodyStyle={{padding: '0 24px 24px 24px' }}>
                                <Tabs defaultActiveKey="1" items={[
                                    {
                                        key: '1',
                                        label: <span className="font-medium"><UserOutlined /> Thông tin cá nhân</span>,
                                        children: (
                                            <Form
                                                form={formInfo}
                                                layout="vertical"
                                                onFinish={handleUpdateInfo}
                                                className="mt-4"
                                            >
                                                <Row gutter={16}>
                                                    <Col span={24}>
                                                        <Form.Item name="hoVaTen" label="Họ và Tên" rules={[{ required: true, message: 'Nhập họ tên' }]}>
                                                            <Input prefix={<UserOutlined className="text-gray-400" />} size="large" />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={12}>
                                                        <Form.Item name="email" label="Email">
                                                            <Input prefix={<MailOutlined className="text-gray-400" />} disabled className="bg-gray-50" size="large" />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={12}>
                                                        <Form.Item name="soDienThoai" label="Số điện thoại">
                                                            <Input prefix={<PhoneOutlined className="text-gray-400" />} size="large" />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={12}>
                                                        <Form.Item name="ngaySinh" label="Ngày sinh">
                                                            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} size="large" placeholder="Chọn ngày" />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={12}>
                                                        <Form.Item name="diaChi" label="Địa chỉ">
                                                            <Input prefix={<EnvironmentOutlined className="text-gray-400" />} size="large" />
                                                        </Form.Item>
                                                    </Col>
                                                </Row>

                                                <div className="text-right mt-7">
                                                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading} size="large" className="px-8">
                                                        Lưu thay đổi
                                                    </Button>
                                                </div>
                                            </Form>
                                        )
                                    },
                                    {
                                        key: '2',
                                        label: <span className="font-medium"><LockOutlined /> Đổi mật khẩu</span>,
                                        children: (
                                            <div style= {{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                {user.nguonDangNhap !== 'local' ? (
                                                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm text-slate-700">
                                                        <span className="text-slate-500">ℹ️</span>
                                                        <span className="truncate">
                                                            Tài khoản được liên kết qua{" "}
                                                            <b className="uppercase text-slate-800">{user.nguonDangNhap}</b>.
                                                            Vui lòng đổi mật khẩu tại trang quản lý của{" "}
                                                            <b className="uppercase text-slate-800">{user.nguonDangNhap}</b>.
                                                        </span>
                                                    </div>


                                                ) : (
                                                    <Form form={formPass} layout="vertical" onFinish={handleChangePass} style={{ marginTop: '1rem', maxWidth: '32rem', marginLeft: 'auto', marginRight: 'auto', width: '100%' }}>
                                                        <Form.Item
                                                            name="matKhauCu"
                                                            label="Mật khẩu hiện tại"
                                                            rules={[{ required: true, message: 'Nhập mật khẩu cũ' }]}
                                                        >
                                                            <Input.Password prefix={<LockOutlined />} size="large" />
                                                        </Form.Item>

                                                        <Form.Item
                                                            name="matKhauMoi"
                                                            label="Mật khẩu mới"
                                                            rules={[{ required: true, message: 'Nhập mật khẩu mới' }, { min: 6, message: 'Tối thiểu 6 ký tự' }]}
                                                        >
                                                            <Input.Password prefix={<LockOutlined />} size="large" />
                                                        </Form.Item>

                                                        <Form.Item
                                                            name="xacNhanMatKhauMoi"
                                                            label="Xác nhận mật khẩu mới"
                                                            dependencies={['matKhauMoi']}
                                                            rules={[
                                                                { required: true, message: 'Xác nhận lại mật khẩu' },
                                                                ({ getFieldValue }) => ({
                                                                    validator(_, value) {
                                                                        if (!value || getFieldValue('matKhauMoi') === value) {
                                                                            return Promise.resolve();
                                                                        }
                                                                        return Promise.reject(new Error('Mật khẩu không khớp!'));
                                                                    },
                                                                }),
                                                            ]}
                                                        >
                                                            <Input.Password prefix={<LockOutlined />} size="large" />
                                                        </Form.Item>

                                                        <Button type="primary" htmlType="submit" danger block size="large" loading={loading} className="mt-4">
                                                            Cập nhật mật khẩu
                                                        </Button>
                                                    </Form>
                                                    )}
                                            </div>
                                        )
                                    }
                                ]} />
                            </Card>
                        </Col>
                    </Row>
                </Spin>
            </Content>
            <Modal
                title="Chỉnh sửa ảnh đại diện"
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                onOk={saveAvatar}
                okText="Áp dụng"
                cancelText="Hủy"
                width={700}
                centered
                bodyStyle={{ padding: '24px' }}
            >
                <Row gutter={24} align="middle">
                    <Col xs={24} md={12} className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-4">
                        <canvas
                            ref={canvasRef}
                            className="max-w-full h-auto shadow-lg border-2 border-white"
                            style={{ borderRadius: '50%', backgroundColor: '#000' }}
                        />
                        <div className="mt-4 text-gray-400 text-xs text-center italic">
                            Ảnh trong vòng tròn sẽ là hiển thị chính thức
                        </div>
                    </Col>

                    <Col xs={24} md={12} className="space-y-6 mt-6 md:mt-0">
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium">Thu phóng</span>
                                <span className="text-blue-600 font-bold">{zoom.toFixed(1)}x</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <ZoomOutOutlined />
                                <Slider
                                    min={0.5} max={3} step={0.1} value={zoom}
                                    onChange={setZoom} className="flex-1"
                                />
                                <ZoomInOutlined />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium">Xoay ảnh</span>
                                <span className="text-blue-600 font-bold">{rotation}°</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button icon={<RotateRightOutlined />} onClick={() => setRotation(r => r - 90)} />
                                <Slider
                                    min={0} max={360} value={rotation}
                                    onChange={setRotation} className="flex-1"
                                />
                                <Button icon={<RotateRightOutlined />} onClick={() => setRotation(r => r + 90)} />
                            </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <h4 className="text-xs font-bold text-blue-600 uppercase mb-3">Bộ lọc nhanh</h4>
                            <div className="space-y-4">
                                <div>
                                    <span className="text-[10px] text-gray-500 uppercase">Độ sáng</span>
                                    <Slider min={50} max={150} value={imgFilters.brightness} onChange={v => setImgFilters(f => ({...f, brightness: v}))} />
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-500 uppercase">Độ tương phản</span>
                                    <Slider min={50} max={150} value={imgFilters.contrast} onChange={v => setImgFilters(f => ({...f, contrast: v}))} />
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Modal>
        </Layout>
    );
};

export default ProfilePage;