import logo from "../../assets/images/logo.png";
import {CalendarOutlined, EnvironmentOutlined, MailOutlined, PhoneOutlined} from "@ant-design/icons";
import {Button} from "antd";
import React from "react";

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300 py-8 mt-12">
            <div className="max-w-9xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                    <div className="flex items-center gap-2 mb-6">
                        <img className="w-42 h-42 object-cover mr-2" src={logo}/>
                        <span className="text-2xl font-bold text-white">Thư Viện Olive Gallery</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <h4 className="text-white font-bold mb-4 border-b border-gray-700 pb-2 inline-block">Liên hệ</h4>
                            <p className="flex items-start gap-3">
                                <EnvironmentOutlined className="mt-1 text-blue-500" />
                                <span>Lô 02-B3.75, Khu đô thị Công nghệ FPT, Da Nang, Vietnam</span>
                            </p>
                            <p className="flex items-center gap-3">
                                <PhoneOutlined className="text-blue-500" /> 090 350 13 86
                            </p>
                            <p className="flex items-center gap-3">
                                <MailOutlined className="text-blue-500" /> Welcomehoangthujsc@gmail.com
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4 border-b border-gray-700 pb-2 inline-block">Giờ mở cửa</h4>

                            <div className="space-y-4 text-sm">
                                <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                                    <div className="flex items-center gap-2 text-blue-400 font-bold mb-2">
                                        <CalendarOutlined /> Thứ 2 - Thứ 7
                                    </div>
                                    <div className="space-y-1 pl-1">
                                        <div className="flex justify-between text-gray-400">
                                            <span>☀️ Sáng:</span>
                                            <span className="text-white font-mono">09:00 - 11:30</span>
                                        </div>
                                        <div className="flex justify-between text-gray-400">
                                            <span>🌙 Chiều & Tối:</span>
                                            <span className="text-white font-mono">14:00 - 17:00</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center px-3 py-2 rounded bg-gray-800/30 border border-gray-800 text-gray-500">
                                    <span className="flex items-center gap-2"><CalendarOutlined /> Chủ Nhật</span>
                                    <span className="text-red-400 font-semibold text-xs border border-red-900/50 bg-red-900/20 px-2 py-1 rounded">Đóng cửa</span>
                                </div>

                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-4">
                        <Button onClick={() => window.open("https://www.facebook.com/OLIVEGALLERY.DN", "_blank")} ghost shape="circle" icon={<i className="fa fa-facebook">F</i>} />
                        <Button ghost shape="circle">I</Button>
                        <Button ghost shape="circle">Y</Button>
                    </div>
                </div>
                <div className="h-64 md:h-80 bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 relative group">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3471.1777745635263!2d108.26346307459809!3d15.97305414200642!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31421148575a8ba5%3A0x7639946785a38382!2sOlive%20Gallery!5e1!3m2!1svi!2sus!4v1763363267123!5m2!1svi!2sus"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Olive Gallery Map"
                        className="filter transition-all duration-500"
                    ></iframe>

                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-2 text-center text-xs text-gray-400 pointer-events-none">
                        Olive Gallery - FPT City Đà Nẵng
                    </div>
                </div>

            </div>
            <div className="text-center pt-8 mt-8 border-t border-gray-800 text-sm text-gray-500">
                © 2025 Library Management System. Designed for Olive Gallery.
            </div>
        </footer>
    )
}

export default Footer