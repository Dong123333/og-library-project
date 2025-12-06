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

  async chatWithAi(
    message: string,
    history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  ) {
    const LIBRARY_SYSTEM_PROMPT = `
    ROLE & IDENTITY (EXTREMELY IMPORTANT):
      - You are "Olivery", the AI Assistant of **THIS** library called **Olive Gallery Library**.
      - When the user mentions "Olive Gallery", "the library", or "here", they are referring to **US** (the system you are serving).
      - **NEVER** treat "Olive Gallery" as a third-party entity, an external art gallery, or someone else.
      - Always identify yourself as part of Olive Gallery (e.g., "Welcome to our library", "At Olive Gallery, we have...").
        
        KNOWLEDGE BASE & REGULATIONS (MANDATORY COMPLIANCE):
        
        1. INTRODUCTION TO OLIVE GALLERY:
            - Context: We are a modern library located in Da Nang, Vietnam.
            - History: Established around 2022 in FPT area, Ngu Hanh Son district, continuing the legacy of Hoang Minh Nhan - a writer and journalist passionate about books, literature, and the Quang Nam – Da Nang land.
            - Mission: To promote reading culture, connect the community, and create a space for learning, reading, and enjoying art.
            - Scale: Over 10,000 book titles of diverse genres by Vietnamese and international artists, open for free to the community, attracting youth and families.
  
        2. 🕒 TIME & LOCATION:
           - Opening hours: 09:00 - 17:00 (Monday to Saturday). Closed on Sundays and Holidays.
           - Address: X7F8+6C7, FPT City Urban Area, Ngu Hanh Son, Da Nang, Vietnam.
           - Support Hotline: 0903501386.
        
        3. 📚 BORROWING POLICY:
           - Readers must have an account and log in to borrow.
           - Max quantity: 10 books at a time.
           - Borrowing Duration (Auto-calculated):
             + Borrowing 1 - 5 books: Due date is 30 days.
             + Borrowing 6 - 10 books: Due date is shortened to 7 days.
           - Process: Register Online -> Wait for Admin Approval -> Come to the library to receive books.
        
        4. 💰 PENALTY & COMPENSATION POLICY:
           - Late return: Fine 5,000 VND / book / overdue day.
           - Minor damage (torn, scribbled): Compensate 50% of the cover price.
           - Lost or severe damage: Compensate 100% of the cover price + 20,000 VND processing fee.
           - Payment: Cash at the counter or VNPay transfer via the website.
        
        RESPONSE GUIDELINES (CRITICAL):
  
          1. 🌍 LANGUAGE ADAPTATION (MANDATORY):
             - Automatically DETECT the language the user is using.
             - REPLY IN THAT EXACT LANGUAGE.
             - Examples:
               + User: "Xin chào" -> Reply in Vietnamese.
               + User: "Hello" -> Reply in English.
               + User: "Hello, what time do you open?" -> Reply in English (Translate the opening hours info).
               + User: "こんにちは" -> Reply in Japanese.
  
          2. TEXT FORMATTING:
             - ABSOLUTELY NO Markdown formatting (do not use asterisks *, underscores _, hashes #).
             - Reply in Plain Text only.
             - Use Emojis (😊 📚 ⚠️ 📍) for emphasis instead of bolding.
             
          3. CASE: BOOK EXISTS IN DATABASE:
             - Priority #1: Use information from the "DATABASE DATA" section below to answer.
             - Clearly state the stock quantity and invite the guest to borrow.
  
          4. CASE: NOT IN DATABASE (SUPPLEMENTAL KNOWLEDGE):
             - If the guest asks about a book, author, or genre not found in the system (or returns empty):
             - USE YOUR OWN KNOWLEDGE to briefly introduce that book (Who is the author, what is the main content, does it exist).
             - HOWEVER, you must end with the sentence (translated to user's language): "However, currently Olive Gallery Library has not imported this book yet. You can refer to other books or suggest importing books! 😿"
  
          5. HOW TO ANSWER ABOUT BOOKS:
             - If asking about History/Intro: Use "INTRODUCTION TO OLIVE GALLERY".
             - If asking for Suggestions/Recommendations: Use data from "TOP MOST BORROWED BOOKS".
             - Rely absolutely on "DATABASE DATA" above.
             - If Stock > 0:
               -> Template: "Hello, the library currently has the book [Book Name], Author: [Name], Genre: [Name], Publisher: [Name], Year: [Year], price: [Price]. There are currently [Quantity] copies left. You can register to borrow immediately! 😊"
             - If Stock = 0:
               -> Template: "The book [Book Name] is currently out of stock 😿. Please come back later."
             - If data is empty or not found:
               -> Template: "Sorry, I couldn't find this book in the system. Please try searching for another name!"
               
          6. WHEN CUSTOMERS ASK SPECIFICALLY ABOUT THE PRICE:
            - If a customer asks "How much is this book?": Answer the cover price.
            - Important note: Remind the customer that "Borrowing books from the library is FREE. The cover price is for reference only or a compensation fee will be charged if lost."
  
          7. HOW TO ANSWER OTHER QUESTIONS:
             - Answer concisely, straight to the point.
             - Address yourself as: "I" (or Olivery/Mình/Em depending on language context) and "You" (Bạn).
             - If asked about unrelated topics (weather, football...): Politely refuse and steer back to the library topic.
    `;
    try {
      const extractionPrompt = `
      Analyze the user's question: "${message}"
      
      YOUR TASK (SEARCH EXPERT):
      1. IDENTIFY INTENT: Is the user looking for a specific book, author, genre, or publisher?
      2. EXTRACT & EXPAND KEYWORDS (CRITICAL):
         - Extract main entities (Book Title, Author, Publisher, Genre).
         - If the keyword is a Genre/Topic (e.g., "Self help", "Trinh thám"):
           -> You MUST include synonyms or translations in both English and Vietnamese (e.g., "Self help" -> add "Kỹ năng sống"; "Detective" -> add "Trinh thám").
         - If it is a broad topic (e.g., "sleep", "rich"):
           -> You may add 1-2 famous book titles related to that topic to the list.
         - Remove stopwords (e.g., "có", "không", "sách", "muốn tìm").
  
      OUTPUT FORMAT:
      Return a single valid JSON object (no Markdown code blocks):
      { 
        "isSearchingBook": boolean, 
        "keywords": string[] 
      }
      
      FEW-SHOT EXAMPLES:
      - Input: "Có sách Đắc Nhân Tâm không?" 
        -> Output: { "isSearchingBook": true, "keywords": ["Đắc Nhân Tâm"] }
        
      - Input: "Mấy giờ thư viện đóng cửa?" 
        -> Output: { "isSearchingBook": false, "keywords": [] }
        
      - Input: "Tìm truyện trinh thám" 
        -> Output: { "isSearchingBook": true, "keywords": ["Trinh thám", "Detective", "Sherlock Holmes", "Conan"] }
        
      - Input: "Sách về giấc ngủ" 
        -> Output: { "isSearchingBook": true, "keywords": ["giấc ngủ", "sleep", "Why We Sleep"] }
        
      - Input: "Sách của bác Ánh NXB Trẻ" 
        -> Output: { "isSearchingBook": true, "keywords": ["Nguyễn Nhật Ánh", "NXB Trẻ", "Anh Bồ Câu"] }
  `;

      const extractionResult = await this.model.generateContent(extractionPrompt);
      const extractionText = extractionResult.response.text().replace(/```json|```/g, '').trim();

      let intent: { isSearchingBook: boolean; keywords: string[] } = {
        isSearchingBook: false,
        keywords: [],
      };
      try {
        intent = JSON.parse(extractionText);
      } catch (e) {
        console.error('Lỗi parse JSON từ AI:', e);
        intent.isSearchingBook = true;
        intent.keywords = [message];
      }

      let bookContext = 'Người dùng không hỏi về cuốn sách cụ thể nào.';

      if (
        intent.isSearchingBook &&
        intent.keywords &&
        intent.keywords.length > 0
      ) {
        const regexList = intent.keywords.map(k => ({ $regex: k, $options: 'i' }));

// 2. Query tìm ID của các bảng vệ tinh (Dùng $or)
        const [cats, auths, pubs] = await Promise.all([
          // A. Tìm Danh mục (Dùng $or để tìm tên nào khớp với regex cũng được)
          this.danhMucModel.find({
            $or: regexList.map(r => ({ tenDanhMuc: r }))
          }).select('_id'),

          // B. Tìm Tác giả (Tìm cả tên và bút danh)
          this.tacGiaModel.find({
            $or: [
              ...regexList.map(r => ({ tenTacGia: r })),
              ...regexList.map(r => ({ butDanh: r }))
            ]
          }).select('_id'),

          // C. Tìm NXB
          this.nhaXuatBanModel.find({
            $or: regexList.map(r => ({ tenNhaXuatBan: r }))
          }).select('_id')
        ]);

// 3. Query Bảng Sách (Trùm cuối)
        const books = await this.sachModel.find({
          $or: [
            // A. Tên sách khớp với bất kỳ từ khóa nào
            ...regexList.map(r => ({ tenSach: r })),

            // B. Hoặc thuộc Danh mục tìm thấy
            { maDanhMuc: { $in: cats.map(c => c._id) } },

            // C. Hoặc của Tác giả tìm thấy
            { maTacGia: { $in: auths.map(a => a._id) } },

            // D. Hoặc của NXB tìm thấy
            { maNhaXuatBan: { $in: pubs.map(p => p._id) } }
          ]
        })
          .select(
            'tenSach soLuong giaTien namXuatBan maTacGia maDanhMuc maNhaXuatBan',
          )
          .populate('maTacGia', 'tenTacGia')
          .populate('maDanhMuc', 'tenDanhMuc')
          .populate('maNhaXuatBan', 'tenNhaXuatBan')
          .limit(5)
          .exec();

        if (books.length > 0) {
          bookContext = 'DỮ LIỆU SÁCH TÌM ĐƯỢC TỪ DATABASE:\n';
          books.forEach((b: any) => {
            // Xử lý dữ liệu hiển thị (như code cũ của bạn)
            const danhMuc = b.maDanhMuc?.tenDanhMuc || 'N/A';
            const nxb = b.maNhaXuatBan?.tenNhaXuatBan || 'N/A';
            const price = b.giaTien ? b.giaTien.toLocaleString('vi-VN') : '0';

            let tacGia = 'N/A';
            if (Array.isArray(b.maTacGia)) {
              tacGia = b.maTacGia.map((a: any) => a.tenTacGia).join(', ');
            }

            bookContext += `- Tên: "${b.tenSach}", Tác giả: ${tacGia}, Thể loại: ${danhMuc}, NXB: ${nxb}, Kho: ${b.soLuong}, Giá: ${price}đ\n`;
          });
        } else {
          bookContext = `Hệ thống đã tìm kiếm các từ khóa: [${intent.keywords.join(', ')}] nhưng KHÔNG thấy sách nào khớp.`;
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

      const geminiHistory = (history || []).map((msg) => ({
        role: (msg.role as string) === 'ai' ? 'model' : 'user',
        parts: msg.parts || [{ text: (msg as any).text }],
      }));

      const chatSession = this.model.startChat({
        history: geminiHistory,
        systemInstruction: {
          role: 'system',
          parts: [{ text: LIBRARY_SYSTEM_PROMPT }],
        },
      });

      const messageWithContext = `
        [DỮ LIỆU HỆ THỐNG VỪA TRA CỨU]:
        "${bookContext}"

        [SÁCH HOT]:
        "${trendingContext}"

        [CÂU HỎI CỦA NGƯỜI DÙNG]:
        "${message}"
        
        Hãy trả lời câu hỏi trên dựa vào dữ liệu hệ thống và quy định.
      `;

      const result = await chatSession.sendMessage(messageWithContext);
      return { reply: result.response.text() };
    } catch (error) {
      console.error('❌ Lỗi Chatbot:', error);
      return {
        reply: 'Xin lỗi, hệ thống đang bận. Bạn vui lòng thử lại sau nhé! 🤖',
      };
    }
  }
}
