import Header from "../../components/reader/Header.jsx";
import Footer from "../../components/reader/Footer.jsx";

const AdminLayout = (children) => {
    return (
        <div className="h-screen w-full overflow-y-auto bg-gray-50 scroll-smooth font-sans">
            <Header />
            <div>
                {children}
            </div>
            <Footer />
        </div>
    )
}

export default AdminLayout;