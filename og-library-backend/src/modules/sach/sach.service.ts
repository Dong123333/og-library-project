import { Injectable, UploadedFile } from '@nestjs/common';
import { CreateSachDto } from './dto/create-sach.dto';
import { UpdateSachDto } from './dto/update-sach.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sach } from './schemas/sach.schema';
import aqp from 'api-query-params';
import { convertToRegex } from '../../helpers/regex.util';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

@Injectable()
export class SachService {
  constructor(
    @InjectModel(Sach.name) private sachModel: Model<Sach>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}
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

    if (filter.tenSach) {
      const regexString = convertToRegex(filter.tenSach);

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
