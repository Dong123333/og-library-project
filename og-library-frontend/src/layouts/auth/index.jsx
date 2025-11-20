import React from 'react';

const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
            {/* CONTAINER CHÍNH */}
            <div className="bg-white w-full max-w-5xl h-[600px] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row m-4">

                {/* --- CỘT TRÁI: HÌNH ẢNH & BRANDING (Giữ nguyên) --- */}
                <div className="w-full md:w-1/2 relative hidden md:block">
                    <img
                        src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1000&auto=format&fit=crop"
                        alt="Library"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 to-black/60 mix-blend-multiply"></div>
                    <div className="absolute inset-0 flex flex-col justify-between p-12 text-white z-10">
                        <div>
                            <div className="bg-white/20 backdrop-blur-sm w-fit px-3 py-1 rounded-lg border border-white/30 mb-4">
                                <span className="font-bold tracking-widest">OLIVE GALLERY</span>
                            </div>
                            <h1 className="text-4xl font-bold leading-tight">Khám phá tri thức <br /> Kiến tạo tương lai.</h1>
                            <p className="mt-4 text-gray-300 text-lg max-w-xs">
                                Hệ thống thư viện số hiện đại dành riêng cho tất cả mọi độc giả.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <div className="w-12 h-1 bg-white rounded-full"></div>
                            <div className="w-3 h-1 bg-gray-500 rounded-full"></div>
                            <div className="w-3 h-1 bg-gray-500 rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* --- CỘT PHẢI: NỘI DUNG FORM (Thay đổi động) --- */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white relative">
                    <div className="max-w-md mx-auto w-full">
                        {/* Header Form */}
                        <div className="mb-8 text-center md:text-left">
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">{title}</h2>
                            <p className="text-gray-500">{subtitle}</p>
                        </div>

                        {/* Nội dung Form (Login hoặc Register) sẽ nằm ở đây */}
                        {children}
                    </div>
                </div>
            </div>

            {/* Footer nhỏ */}
            <div className="fixed bottom-4 text-center text-xs text-gray-400 w-full">
                © 2025 Olive Gallery Library System. Privacy Policy & Terms.
            </div>
        </div>
    );
};

export default AuthLayout;