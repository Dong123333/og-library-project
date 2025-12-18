import Header from "../../components/reader/Header.jsx";
import Footer from "../../components/reader/Footer.jsx";
import Chatbot from "../../components/Chatbot.jsx";

const ReaderLayout = ({children}) => {
    return (
        <div id="page-container" className="h-screen w-full overflow-y-auto bg-gray-50 scroll-smooth font-sans">
            <Header />
            <div className="p-4 md:p-8 max-w-9xl mx-auto min-h-screen">
                {children}
            </div>
            <Chatbot />
            <Footer />
        </div>
    )
}

export default ReaderLayout;