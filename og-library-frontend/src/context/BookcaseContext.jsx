import React, { createContext, useState, useContext, useEffect } from 'react';
import { message } from 'antd';

const BookcaseContext = createContext();

export const BookcaseWrapper = ({ children }) => {
    const [Bookcase, setBookcase] = useState([]);

    useEffect(() => {
        const stored = localStorage.getItem("bookcase");
        if (stored) setBookcase(JSON.parse(stored));
    }, []);

    useEffect(() => {
        localStorage.setItem("bookcase", JSON.stringify(Bookcase));
    }, [Bookcase]);

    const addToBookcase = (book) => {
        const existingItem = Bookcase.find(item => item._id === book._id);

        if (existingItem) {
            const nextQuantity = (existingItem.soLuongMuon || 1) + 1;

            if (nextQuantity > book.soLuong) {
                message.warning(`Chỉ còn ${book.soLuong} cuốn trong kho!`);
                return;
            }

            const newCart = Bookcase.map(item =>
                item._id === book._id
                    ? { ...item, soLuongMuon: nextQuantity }
                    : item
            );
            setBookcase(newCart);
            message.success("Đã tăng số lượng sách");
        } else {
            if (book.soLuong < 1) {
                message.error("Sách này đã hết hàng!");
                return;
            }
            setBookcase([...Bookcase, { ...book, soLuongMuon: 1 }]);
            message.success("Đã thêm vào giỏ");
        }
    };

    const updateSoLuongMuon = (bookId, newSoLuongMuon, maxStock) => {
        if (newSoLuongMuon < 1) return;

        if (newSoLuongMuon > maxStock) {
            message.warning(`Vượt quá số lượng tồn kho (Max: ${maxStock})`);
            return;
        }

        const newCart = Bookcase.map(item =>
            item._id === bookId ? { ...item, soLuongMuon: newSoLuongMuon } : item
        );
        setBookcase(newCart);
    };

    const removeFromBookcase = (bookId) => {
        setBookcase(Bookcase.filter(item => item._id !== bookId));
    };

    const clearBookcase = () => {
        setBookcase([]);
    };

    return (
        <BookcaseContext.Provider value={{
            Bookcase,
            addToBookcase,
            removeFromBookcase,
            clearBookcase,
            updateSoLuongMuon
        }}>
            {children}
        </BookcaseContext.Provider>
    );
};

export const useBookcase = () => useContext(BookcaseContext);