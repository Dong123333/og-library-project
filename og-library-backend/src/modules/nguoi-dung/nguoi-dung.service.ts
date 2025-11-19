import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateNguoiDungDto } from './dto/create-nguoi-dung.dto';
import { UpdateNguoiDungDto } from './dto/update-nguoi-dung.dto';
import { InjectModel } from '@nestjs/mongoose';
import { NguoiDung } from './schemas/nguoi-dung.schema';
import mongoose, { Model } from 'mongoose';
import { hashPasswordHelper } from '../../helpers/utils';
import { VaiTro } from '../vai-tro/schemas/vai-tro.schema';

@Injectable()
export class NguoiDungService {
  constructor(
    @InjectModel(NguoiDung.name) private nguoiDungModel: Model<NguoiDung>,
    @InjectModel(VaiTro.name) private vaiTroModel: Model<VaiTro>,
  ) {}

  isEmailExist = async (email: string) => {
    const user = await this.nguoiDungModel.exists({ email });
    return !!user;
  };

  async create(createNguoiDungDto: CreateNguoiDungDto) {
    const readerRole = await this.vaiTroModel.findOne({ tenVaiTro: 'reader' });
    if (!readerRole) {
      throw new InternalServerErrorException(
        'Lỗi hệ thống: Chưa cấu hình vai trò Reader',
      );
    }
    const {
      tenNguoiDung,
      email,
      matKhau,
      soDienThoai,
      diaChi,
      ngaySinh,
      maVaiTro,
    } = createNguoiDungDto;

    const emailExist = await this.isEmailExist(email);
    if (emailExist) {
      throw new BadRequestException(
        'Email đã tồn tại. Vui lòng sử dung email khác',
      );
    }
    const hashPassword = await hashPasswordHelper(matKhau);
    const nguoiDung = await this.nguoiDungModel.create({
      tenNguoiDung,
      email,
      soDienThoai,
      diaChi,
      ngaySinh,
      matKhau: hashPassword,
      maVaiTro: readerRole._id,
    });
    return nguoiDung;
  }

  findAll() {
    return `This action returns all nguoiDung`;
  }

  findOne(id: number) {
    return `This action returns a #${id} nguoiDung`;
  }

  async findByEmail(email: string) {
    return await this.nguoiDungModel.findOne({ email });
  }

  async update(updateNguoiDungDto: UpdateNguoiDungDto) {
    const { _id, ...updateData } = updateNguoiDungDto;
    return await this.nguoiDungModel.updateOne(
      {
        _id: _id,
      },
      { ...updateData },
    );
  }

  remove(_id: string) {
    if (mongoose.isValidObjectId(_id)) {
      return this.nguoiDungModel.deleteOne({ _id });
    } else {
      throw new BadRequestException('_id không đúng định dạng');
    }
  }
}
