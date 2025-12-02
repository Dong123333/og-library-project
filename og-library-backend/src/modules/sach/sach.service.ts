import { Injectable, OnModuleInit, UploadedFile } from '@nestjs/common';
import { CreateSachDto } from './dto/create-sach.dto';
import { UpdateSachDto } from './dto/update-sach.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sach } from './schemas/sach.schema';
import aqp from 'api-query-params';
import { convertToRegex } from '../../helpers/regex.util';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { DanhMuc } from '../danh-muc/schemas/danh-muc.schema';
import { TacGia } from '../tac-gia/schemas/tac-gia.schema';
import { NhaXuatBan } from '../nha-xuat-ban/schemas/nha-xuat-ban.schema';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SachService implements OnModuleInit {
  constructor(
    @InjectModel(Sach.name) private sachModel: Model<Sach>,
    @InjectModel(DanhMuc.name) private danhMucModel: Model<DanhMuc>,
    @InjectModel(TacGia.name) private tacGiaModel: Model<TacGia>,
    @InjectModel(NhaXuatBan.name) private nhaXuatBanModel: Model<NhaXuatBan>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async onModuleInit() {
    await this.seedCategories();
    await this.seedAuthors();
    await this.seedPublishers();
    await this.seedBooks();
  }

  async seedCategories() {
    const count = await this.danhMucModel.countDocuments();
    const filePath = path.join(
      process.cwd(),
      'dist',
      'src',
      'modules',
      'sach',
      'seed',
      'danhmuc.json',
    );
    const rawData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(rawData);
    if (count === 0) {
      await this.danhMucModel.insertMany(data);
    }
  }

  async seedAuthors() {
    const count = await this.tacGiaModel.countDocuments();
    const filePath = path.join(
      process.cwd(),
      'dist',
      'src',
      'modules',
      'sach',
      'seed',
      'tacgia.json',
    );
    const rawData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(rawData);
    if (count === 0) {
      await this.tacGiaModel.insertMany(data);
    }
  }

  async seedPublishers() {
    const count = await this.nhaXuatBanModel.countDocuments();
    const filePath = path.join(
      process.cwd(),
      'dist',
      'src',
      'modules',
      'sach',
      'seed',
      'nhaxuatban.json',
    );
    const rawData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(rawData);
    if (count === 0) {
      await this.nhaXuatBanModel.insertMany(data);
    }
  }

  async seedBooks() {
    const count = await this.sachModel.countDocuments();
    if (count === 0) {
      const basePath = path.join(
        process.cwd(),
        'dist',
        'src',
        'modules',
        'sach',
        'seed',
      );

      const rawCat = fs.readFileSync(
        path.join(basePath, 'danhmuc.json'),
        'utf8',
      );
      const rawAuth = fs.readFileSync(
        path.join(basePath, 'tacgia.json'),
        'utf8',
      );
      const rawPub = fs.readFileSync(
        path.join(basePath, 'nhaxuatban.json'),
        'utf8',
      );
      const rawBooks = fs.readFileSync(
        path.join(basePath, 'sach.json'),
        'utf8',
      );

      const categoriesJson = JSON.parse(rawCat);
      const authorsJson = JSON.parse(rawAuth);
      const publishersJson = JSON.parse(rawPub);
      const booksJson = JSON.parse(rawBooks);

      const categoriesDB = await this.danhMucModel.find();
      const authorsDB = await this.tacGiaModel.find();
      const publishersDB = await this.nhaXuatBanModel.find();

      const catIdToName = {};
      categoriesJson.forEach(c => catIdToName[c.id] = c.tenDanhMuc);

      const authIdToName = {};
      authorsJson.forEach(a => authIdToName[a.id] = a.tenTacGia);

      const pubIdToName = {};
      publishersJson.forEach(p => pubIdToName[p.id] = p.tenNhaXuatBan);

      const nameToRealId_Cat = {};
      categoriesDB.forEach((c) => (nameToRealId_Cat[c.tenDanhMuc] = c._id));

      const nameToRealId_Auth = {};
      authorsDB.forEach((a) => (nameToRealId_Auth[a.tenTacGia] = a._id));

      const nameToRealId_Pub = {};
      publishersDB.forEach((p) => (nameToRealId_Pub[p.tenNhaXuatBan] = p._id));

      const finalBooks = booksJson.map(book => {
        const catName = catIdToName[book.maDanhMuc];
        const realCatId = nameToRealId_Cat[catName];

        const pubName = pubIdToName[book.maNhaXuatBan];
        const realPubId = nameToRealId_Pub[pubName];

        const realAuthorIds = book.maTacGia.map(fakeId => {
            const authName = authIdToName[fakeId];
            return nameToRealId_Auth[authName];
        }).filter(id => id);

        return {
          ...book,
          maDanhMuc: realCatId,
          maNhaXuatBan: realPubId,
          maTacGia: realAuthorIds,
        };
      });

      await this.sachModel.insertMany(finalBooks);
      console.log(`✅ Đã seed thành công ${finalBooks.length} cuốn sách!`);
    }
  }

  async create(
    createSachDto: CreateSachDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      const result = await this.cloudinaryService.uploadImage(file);
      createSachDto.hinhAnh = result.secure_url;
    }
    return await this.sachModel.create(createSachDto);
  }

  async findAll(currentPage: number, limit: number, query: string) {
    const { filter, sort } = aqp(query);

    delete filter.page;
    delete filter.limit;
    delete filter.current;
    delete filter.pageSize;

    let keyword = filter.tenSach;

    if (keyword) {
      if (Array.isArray(keyword)) {
        keyword = keyword.join(',');
      } else if (typeof keyword === 'object' && keyword.$in) {
        keyword = keyword.$in.join(',');
      }
      const regexString = convertToRegex(keyword);

      filter.tenSach = { $regex: regexString, $options: 'i' };
    }

    if (!filter.maDanhMuc || filter.maDanhMuc === 'All') {
      delete filter.maDanhMuc;
    }

    let sortOption = sort;

    if (!sortOption || Object.keys(sortOption).length === 0) {
      sortOption = { createdAt: -1, _id: 1 };
    }

    const defaultLimit = limit ? limit : 10;
    const offset = (currentPage - 1) * defaultLimit;

    const totalItems = await this.sachModel.countDocuments(filter);

    const result = await this.sachModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sortOption as any)
      .populate([
        { path: 'maDanhMuc', select: 'tenDanhMuc' },
        { path: 'maTacGia', select: 'tenTacGia' },
        { path: 'maNhaXuatBan', select: 'tenNhaXuatBan' },
      ])
      .exec();

    return {
      meta: {
        current: currentPage,
        pageSize: defaultLimit,
        pages: Math.ceil(totalItems / defaultLimit),
        total: totalItems,
      },
      result,
    };
  }

  async findOne(id: string) {
    return await this.sachModel
      .findById(id)
      .populate('maTacGia', 'tenTacGia')
      .populate('maDanhMuc', 'tenDanhMuc')
      .populate('maNhaXuatBan', 'tenNhaXuatBan')
      .exec();
  }

  async update(
    id: string,
    updateSachDto: UpdateSachDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      const result = await this.cloudinaryService.uploadImage(file);
      updateSachDto.hinhAnh = result.secure_url;
    }
    return await this.sachModel.findByIdAndUpdate(id, updateSachDto, { new: true });
  }

  async remove(id: string) {
    return await this.sachModel.findByIdAndDelete(id);
  }
}
