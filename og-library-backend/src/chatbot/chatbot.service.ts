import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { InjectModel } from '@nestjs/mongoose';
import { Sach } from '../modules/sach/schemas/sach.schema';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { MuonTraService } from '../modules/muon-tra/muon-tra.service';
import { DanhMuc } from '../modules/danh-muc/schemas/danh-muc.schema';
import { TacGia } from '../modules/tac-gia/schemas/tac-gia.schema';
import { NhaXuatBan } from '../modules/nha-xuat-ban/schemas/nha-xuat-ban.schema';

@Injectable()
export class ChatbotService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    private configService: ConfigService,
    @InjectModel(Sach.name) private sachModel: Model<Sach>,
    @InjectModel(DanhMuc.name) private danhMucModel: Model<DanhMuc>,
    @InjectModel(TacGia.name) private tacGiaModel: Model<TacGia>,
    @InjectModel(NhaXuatBan.name) private nhaXuatBanModel: Model<DanhMuc>,
    private muonTraService: MuonTraService,
  ) {
    this.genAI = new GoogleGenerativeAI(
      this.configService.get<string>('GEMINI_API_KEY') ?? '',
    );
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async chatWithAi(message: string) {
    const LIBRARY_SYSTEM_PROMPT = `
    VAI TRÒ:
    Bạn là "Olivery" - Trợ lý ảo AI chuyên nghiệp của Thư viện Olive Gallery.
    Nhiệm vụ: Hỗ trợ độc giả tra cứu sách, giải đáp quy định mượn trả và hướng dẫn sử dụng dịch vụ.
    
    CƠ SỞ TRI THỨC & QUY ĐỊNH (BẮT BUỘC TUÂN THỦ):
    1. GIỚI THIỆU VỀ OLIVE GALLERY:
        - Lịch sử: Thành lập khoảng 2022 tại khu FPT, quận Ngũ Hành Sơn, tiếp nối tâm nguyện của Hoàng Minh Nhân - một nhà văn, nhà báo, người rất đam mê sách, văn chương và mảnh đất Quảng Nam – Đà Nẵng.
        - Sứ mệnh: Thúc đẩy văn hóa đọc, kết nối cộng đồng, tạo không gian học tập, đọc sách và thưởng thức nghệ thuật.
        - Quy mô: Hơn 10.000 đầu sách đa thể loại của nghệ sĩ Việt Nam và quốc tế, mở cửa miễn phí cho cộng đồng, thu hút giới trẻ và gia đình.
    2. 🕒 THỜI GIAN & ĐỊA ĐIỂM:
       - Giờ mở cửa: 09:00 - 17:00 (Thứ 2 đến Thứ 7). Chủ nhật và Ngày lễ nghỉ.
       - Địa chỉ: X7F8+6C7, Khu đô thị FPT City, Ngũ Hành Sơn, Đà Nẵng, Việt Nam.
       - Số điện thoại hỗ trợ: 0903501386.
    
    3. 📚 CHÍNH SÁCH MƯỢN SÁCH:
       - Độc giả phải có tài khoản và đăng nhập để mượn.
       - Số lượng tối đa: 10 cuốn/lần.
       - Thời hạn mượn (Tính tự động):
         + Mượn từ 1 - 5 cuốn: Hạn trả 30 ngày.
         + Mượn từ 6 - 10 cuốn: Hạn trả rút ngắn còn 7 ngày.
       - Quy trình: Đăng ký Online -> Chờ Admin duyệt -> Đến thư viện nhận sách.
    
    4. 💰 QUY ĐỊNH PHẠT & BỒI THƯỜNG:
       - Trả chậm: Phạt 5.000 VNĐ / cuốn / ngày quá hạn.
       - Hư hỏng nhẹ (rách, vẽ bậy): Bồi thường 50% giá bìa.
       - Làm mất hoặc hỏng nặng: Bồi thường 100% giá bìa + 20.000 VNĐ phí xử lý.
       - Thanh toán: Tiền mặt tại quầy hoặc chuyển khoản VNPay qua website.
    
    HƯỚNG DẪN TRẢ LỜI (QUAN TRỌNG):
      1. ĐỊNH DẠNG VĂN BẢN:
         - TUYỆT ĐỐI KHÔNG sử dụng định dạng Markdown (không dùng dấu sao *, dấu gạch dưới _ , dấu thăng #).
         - Chỉ trả lời bằng văn bản thuần túy (Plain Text).
         - Sử dụng Emoji (😊 📚 ⚠️ 📍) để làm điểm nhấn thay vì in đậm.
         
      1. TRƯỜNG HỢP CÓ SÁCH TRONG DATABASE:
         - Ưu tiên số 1: Sử dụng thông tin trong phần "DỮ LIỆU TỪ DATABASE" để trả lời.
         - Báo rõ số lượng tồn kho và mời khách mượn.

      2. TRƯỜNG HỢP KHÔNG CÓ TRONG DATABASE (KIẾN THỨC BỔ SUNG):
         - Nếu khách hỏi về một cuốn sách, tác giả hoặc thể loại mà hệ thống không tìm thấy (hoặc trả về rỗng):
         - HÃY SỬ DỤNG KIẾN THỨC CỦA BẠN để giới thiệu sơ qua về cuốn sách đó (Tác giả là ai, nội dung chính là gì, có hay không).
         - TUY NHIÊN, bắt buộc phải kết thúc bằng câu: "Tuy nhiên, hiện tại thư viện Olive Gallery chưa nhập cuốn sách này về. Bạn có thể tham khảo các sách khác hoặc đề xuất nhập sách nhé! 😿"

      2. CÁCH TRẢ LỜI VỀ SÁCH:
         - Nếu khách hỏi về Lịch sử/Giới thiệu: Dùng thông tin mục "GIỚI THIỆU VỀ OLIVE GALLERY".
         - Nếu khách nhờ Gợi ý/Đề xuất sách hay: Hãy dùng dữ liệu trong phần "TOP SÁCH ĐƯỢC MƯỢN NHIỀU NHẤT" để tư vấn.
         - Dựa tuyệt đối vào phần "DỮ LIỆU SÁCH" ở trên.
         - Nếu có sách và Tồn kho > 0:
           -> Mẫu: "Chào bạn, thư viện hiện có sách [Tên Sách], Tác giả: [Tên], Thể loại: [Tên], Nhà XB: [Tên], Năm XB: [Năm]. Hiện tại còn [Số lượng] cuốn ạ. Bạn có thể đăng ký mượn ngay! 😊"
         - Nếu có sách nhưng Tồn kho = 0:
           -> Mẫu: "Cuốn [Tên Sách] hiện đang được mượn hết rồi ạ 😿. Bạn vui lòng quay lại sau nhé."
         - Nếu dữ liệu trống hoặc không tìm thấy:
           -> Mẫu: "Rất tiếc, mình không tìm thấy cuốn sách này trong hệ thống. Bạn thử tìm tên khác xem sao nhé!"

      3. CÁCH TRẢ LỜI CÂU HỎI KHÁC:
         - Trả lời ngắn gọn, đi thẳng vào vấn đề.
         - Xưng hô: Mình (hoặc Olive) và Bạn.
         - Nếu khách hỏi chuyện ngoài lề (thời tiết, bóng đá...): Từ chối lịch sự và quay về chủ đề thư viện.
    `;
    try {
      const extractionPrompt = `
            Phân tích câu hỏi: "${message}"
            
            Nhiệm vụ:
            1. Xác định xem người dùng có đang muốn tìm sách cụ thể không?
            2. Nếu có, trích xuất tên sách.
            3. Xác định từ khóa tìm kiếm (Tên sách, Tên tác giả, hoặc Thể loại).
            4. Nếu là thể loại tiếng Anh (vd: Self help, Detective), hãy cố gắng dịch sang tiếng Việt tương ứng nếu có thể (Kỹ năng sống, Trinh thám) để tìm kiếm chính xác hơn.
            
            Trả về định dạng JSON duy nhất (không markdown):
            { "isSearchingBook": boolean, "keyword": string | null }
            
            Ví dụ:
            - "Có sách Đắc Nhân Tâm không?" -> { "isSearchingBook": true, "keyword": "Đắc Nhân Tâm" }
            - "Mấy giờ thư viện đóng cửa?" -> { "isSearchingBook": false, "keyword": null }
            - "Sách 1984 còn không?" -> { "isSearchingBook": true, "keyword": "1984" }
            - "Sách self help" -> { "isSearchingBook": true, "keyword": "Self help" } (Hoặc Kỹ năng sống)
            - "Truyện trinh thám" -> { "isSearchingBook": true, "keyword": "Trinh thám" }
        `;

      const extractionResult = await this.model.generateContent(extractionPrompt);
      const extractionText = extractionResult.response.text().replace(/```json|```/g, '').trim();

      let intent: { isSearchingBook: boolean; keyword: string | null } = {
        isSearchingBook: false,
        keyword: null,
      };
      try {
        intent = JSON.parse(extractionText);
      } catch (e) {
        console.error("Lỗi parse JSON từ AI:", e);
        intent.isSearchingBook = true;
        intent.keyword = message;
      }

      let bookContext = "Người dùng không hỏi về cuốn sách cụ thể nào.";

      if (intent.isSearchingBook && intent.keyword && intent.keyword !== 'NULL') {
        const regex = { $regex: intent.keyword, $options: 'i' };

        // A. Tìm ID của các Danh mục khớp từ khóa (VD: "Kinh tế", "Văn học")
        const foundCategories = await this.danhMucModel.find({ tenDanhMuc: regex }).select('_id');
        const catIds = foundCategories.map(c => c._id);

        // B. Tìm ID của các Tác giả khớp từ khóa (VD: "Nam Cao")
        const foundAuthors = await this.tacGiaModel.find({ tenTacGia: regex }).select('_id');
        const authIds = foundAuthors.map(a => a._id);

        // C. Tìm Sách khớp 1 trong 3 điều kiện
        const books = await this.sachModel
          .find({
            $or: [
              { tenSach: regex },
              { maDanhMuc: { $in: catIds } },
              { maTacGia: { $in: authIds } },
            ],
          })
          .select('tenSach soLuong giaTien namXuatBan maTacGia maDanhMuc maNhaXuatBan')
          .populate('maTacGia', 'tenTacGia')
          .populate('maDanhMuc', 'tenDanhMuc')
          .populate('maNhaXuatBan', 'tenNhaXuatBan')
          .limit(5) // Lấy 5 cuốn để AI có nhiều dữ liệu trả lời hơn
          .exec();

        if (books.length > 0) {
          bookContext = "DỮ LIỆU SÁCH TÌM ĐƯỢC TỪ DATABASE:\n";
          books.forEach(b => {
            const danhMuc = (b.maDanhMuc as any)?.tenDanhMuc || 'N/A';
            let tacGia = 'N/A';
            if (Array.isArray(b.maTacGia)) {
              tacGia = (b.maTacGia as any[]).map(a => a.tenTacGia).join(', ');
            } else if (b.maTacGia) {
              tacGia = (b.maTacGia as any).tenTacGia;
            }
            const nhaXuatBan = (b.maNhaXuatBan as any)?.tenNhaXuatBan || 'N/A';
            const price = b.giaTien ? b.giaTien.toLocaleString('vi-VN') : '0';
            bookContext += `- Tên: "${b.tenSach}", Tác giả: ${tacGia}, Thể loại: ${danhMuc}, Nhà xuất bản: ${nhaXuatBan}, Năm xuất bản: ${b.namXuatBan}, Tồn kho: ${b.soLuong}, Giá bìa: ${price}đ\n`;
          });
        } else {
          bookContext = `Hệ thống đã tìm kiếm từ khóa "${intent.keyword}" nhưng không thấy sách nào khớp.`;
        }
      }

      const trendingBooks = await this.muonTraService.getTrendingBooks(5);

      let trendingContext = 'Chưa có dữ liệu sách nổi bật.';
      if (trendingBooks.length > 0) {
        trendingContext = trendingBooks
          .map((b, index) => {
            if (!b) return '';
            let tacGia = 'N/A';
            if (Array.isArray(b.maTacGia)) {
              tacGia = (b.maTacGia as any[]).map((a) => a.tenTacGia).join(', ');
            }
            return `Top ${index + 1}: "${b.tenSach}", Tác giả: ${tacGia}, Thể loại: ${(b.maDanhMuc as any)?.tenDanhMuc}, Tồn kho: ${b.soLuong}`;
          })
          .join('\n');
      }

      const finalPrompt = `
            ${LIBRARY_SYSTEM_PROMPT}

            --- KẾT QUẢ TÌM KIẾM THEO CÂU HỎI (SEARCH) ---
            "${bookContext}"

            --- TOP SÁCH ĐƯỢC MƯỢN NHIỀU NHẤT (TRENDING) ---
            "${trendingContext}"

            --- CÂU HỎI CỦA ĐỘC GIẢ ---
            "${message}"
        `;

      const result = await this.model.generateContent(finalPrompt);
      return { reply: result.response.text() };
    } catch (error) {
      console.error("❌ Lỗi Chatbot:", error);
      return { reply: "Xin lỗi, hệ thống đang bận. Bạn vui lòng thử lại sau nhé! 🤖" };
    }
  }
}
