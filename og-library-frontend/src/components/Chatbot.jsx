import React, { useState, useRef, useEffect } from 'react';
import {Button, Input, Avatar, Tooltip} from 'antd';
import {
    MessageOutlined,
    SendOutlined,
    CloseOutlined,
    RobotOutlined,
    UserOutlined,
    LoadingOutlined, ReloadOutlined
} from '@ant-design/icons';
import axios from '../services/axios.customize';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem('chat_history');
        return saved ? JSON.parse(saved) : [
            { role: 'ai', text: 'Xin chào! Tôi là trợ lý ảo Olivery. Tôi có thể giúp gì cho bạn?' }
        ];
    });
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    useEffect(scrollToBottom, [messages, isOpen]);

    useEffect(() => {
        localStorage.setItem('chat_history', JSON.stringify(messages));
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMsg = inputValue;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInputValue('');
        setLoading(true);

        try {
            const historyPayload = messages.slice(1).map(msg => ({
                role: msg.role === 'ai' ? 'model' : 'user',
                parts: [{ text: msg.text }]
            }));

            const limitedHistory = historyPayload.slice(-20);

            const res = await axios.post('/chatbot', {
                message: userMsg,
                history: limitedHistory
            });

            if (res && res.reply) {
                setMessages(prev => [...prev, { role: 'ai', text: res.reply }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', text: 'Xin lỗi, Olivery đang bận rồi.' }]);
        }
        setLoading(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {isOpen ? (
                <div className="w-screen h-screen fixed bottom-0 right-0 md:w-80 md:h-96 md:relative flex flex-col rounded-none md:rounded-t-xl md:rounded-b-xl overflow-hidden shadow-[0_12px_30px_rgba(0,0,0,0.25)] bg-white/95 backdrop-blur-sm">
                    <div className="flex items-center justify-between bg-blue-600 px-4 py-3 shadow-inner">
                        <div className="flex items-center gap-2">
                            <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#22c55e', color: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}  />
                            <div className="text-white font-semibold flex flex-col">
                                <span>Olivery</span>
                                <span className="text-xs font-normal">Trợ lý ảo của Olive Gallery</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                type="text"
                                icon={<ReloadOutlined />}
                                onClick={() => {
                                    localStorage.removeItem('chat_history');
                                    setMessages([{ role: 'ai', text: 'Xin chào! Tôi là trợ lý ảo Olivery.' }]);
                                }}
                                style={{
                                    color: "#fff",
                                    width: 28,
                                    height: 28,
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "0.2s",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            />
                            <Button
                                type="text"
                                icon={<CloseOutlined style={{ color: '#fff' }}  />}
                                onClick={() => setIsOpen(false)}
                                style={{
                                    color: "#fff",
                                    width: 28,
                                    height: 28,
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "0.2s",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            />
                        </div>
                    </div>

                    <div className="flex-1 p-3 overflow-y-auto bg-white space-y-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex items-start gap-2 ${
                                    msg.role === "user" ? "justify-end" : "justify-start"
                                }`}
                            >
                                {msg.role === "ai" && (
                                    <Avatar
                                        icon={<RobotOutlined />}
                                        style={{ backgroundColor: '#22c55e', color: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}
                                        size="small"
                                    />
                                )}
                                <div
                                    className={`max-w-[75%] p-2 text-sm break-words rounded-lg shadow-md transition hover:shadow-lg ${
                                        msg.role === "user"
                                            ? "bg-blue-500 text-white rounded-tr-none"
                                            : "bg-gray-100 text-gray-800 rounded-tl-none"
                                    }`}
                                >
                                    {msg.text}
                                </div>
                                {msg.role === "user" && (
                                    <Avatar
                                        icon={<UserOutlined />}
                                        style={{backgroundColor: '#9ca3af', color: '#ffffff', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}
                                        size="small"
                                    />
                                )}
                            </div>
                        ))}

                        {loading && (
                            <div className="flex items-start gap-2">
                                <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#22c55e', color: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}  size="small" />
                                <div className="bg-gray-100 px-3 py-2 rounded-lg rounded-tl-none shadow-md flex items-center">
                                  <span className="flex space-x-1">
                                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce-dot"></span>
                                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce-dot delay-150"></span>
                                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce-dot delay-300"></span>
                                  </span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-3 bg-gray-50 border-t border-gray-200 flex gap-2">
                        <Input
                            placeholder="Nhập câu hỏi..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onPressEnter={handleSend}
                            disabled={loading}
                            style={{flex: 1, borderRadius: '9999px', border: '1px solid #d1d5db', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',}}
                        />
                        <Button
                            type="primary"
                            onClick={handleSend}
                            loading={false}
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                backgroundColor: '#0084ff',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {loading ? (
                                <LoadingOutlined
                                    style={{ color: 'white', fontSize: 18 }}
                                    spin
                                />
                            ) : (
                                <SendOutlined style={{ color: 'white'}} />
                            )}
                        </Button>

                    </div>
                </div>
            ) : (
                <Tooltip
                    title={
                        <div style={{
                            display: "inline-block",
                            maxWidth: "200px",
                            whiteSpace: "normal",
                            color: "#fff",
                            fontSize: "0.875rem",
                        }}>
                            Nhấn để trò chuyện với <strong>Olivery</strong>
                        </div>
                    }
                    placement="left"
                    color="#2563eb"
                >
                    <Button
                        type="primary"
                        shape="circle"
                        icon={<MessageOutlined className="text-xl" />}
                        size="large"
                        style={{
                            width: 60,
                            height: 60,
                            boxShadow: '0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)',
                            backgroundColor: '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            animation: 'bounce 2s infinite',
                            transition: 'background-color 0.2s',
                        }}
                        onClick={() => setIsOpen(true)}
                    />
                </Tooltip>
            )}
        </div>

    );
};

export default Chatbot;