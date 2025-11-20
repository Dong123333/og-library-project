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
import {
  CodeAuthDto,
  CreateAuthDto,
  ResendOTPAuthDto,
} from '../../auth/dto/create-auth.dto';
import * as crypto from 'crypto';
import dayjs from 'dayjs';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class NguoiDungService {
  constructor(
    @InjectModel(NguoiDung.name) private nguoiDungModel: Model<NguoiDung>,
    @InjectModel(VaiTro.name) private vaiTroModel: Model<VaiTro>,
    private readonly mailerService: MailerService,
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
    const { hoVaTen, email, matKhau, soDienThoai, diaChi, ngaySinh, maVaiTro } =
      createNguoiDungDto;

    const emailExist = await this.isEmailExist(email);
    if (emailExist) {
      throw new BadRequestException(
        'Email đã tồn tại. Vui lòng sử dung email khác',
      );
    }
    const hashPassword = await hashPasswordHelper(matKhau);
    const nguoiDung = await this.nguoiDungModel.create({
      hoVaTen,
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

  async handleRegister(registerDto: CreateAuthDto) {
    const { email, hoVaTen, matKhau } = registerDto;
    const readerRole = await this.vaiTroModel.findOne({ tenVaiTro: 'reader' });
    if (!readerRole) {
      throw new InternalServerErrorException(
        'Lỗi hệ thống: Chưa cấu hình vai trò Reader',
      );
    }
    const isExist = await this.isEmailExist(email);
    if (isExist) {
      throw new BadRequestException(
        'Email đã tồn tại. Vui lòng sử dụng email khác',
      );
    }
    const hashPassword = await hashPasswordHelper(matKhau);
    const maOTP = crypto.randomInt(100000, 1000000).toString();
    const user = await this.nguoiDungModel.create({
      hoVaTen,
      email,
      matKhau: hashPassword,
      trangThai: false,
      maOTP: maOTP,
      thoiHanOTP: dayjs().add(5, 'minutes'),
      maVaiTro: readerRole._id,
    });

    this.mailerService.sendMail({
      to: user.email,
      from: '"Thư viện Olive Gallery" <no-reply@olivegallery.com>',
      subject: 'Activate your account at Olive Gallery',
      template: 'register',
      context: {
        name: user?.hoVaTen ?? user?.email,
        activationCode: maOTP,
      },
    });

    return {
      _id: user._id,
      code: user.maOTP,
    };
  }

  async handleActive(codeAuthDto: CodeAuthDto) {
    const user = await this.nguoiDungModel.findOne({
      _id: codeAuthDto._id,
      maOTP: codeAuthDto.maOTP,
    });
    if (!user) {
      throw new BadRequestException('Mã OTP đã hết hạn hoặc không hợp lệ');
    }
    const isBeforeCheck = dayjs().isBefore(user.thoiHanOTP);
    if (isBeforeCheck) {
      await this.nguoiDungModel.updateOne(
        { _id: user._id },
        { trangThai: true },
      );
      return { isBeforeCheck };
    } else {
      throw new BadRequestException('Mã OTP đã hết hạn hoặc không hợp lệ');
    }
  }

  async handleResendOTP(resendOTPAuthDto: ResendOTPAuthDto) {
    const user = await this.nguoiDungModel.findOne({
      _id: resendOTPAuthDto._id,
    });
    if (!user) {
      throw new BadRequestException('Không tìm thấy người dùng với ID này');
    }

    if (user.trangThai) {
      throw new BadRequestException('Tài khoản này đã xác thực rồi!');
    }

    const email = user.email;

    const maOTP = crypto.randomInt(100000, 1000000).toString();

    // 4. Lưu OTP vào bảng Otp (Vẫn lưu theo Key là Email để khớp với logic Verify)
    await this.nguoiDungModel.findOneAndUpdate(
      { email }, // Tìm theo email
      {
        maOTP: maOTP,
        thoiHanOTP: dayjs().add(5, 'minutes'),
      },
      { upsert: true, new: true },
    );

    this.mailerService.sendMail({
      to: user.email,
      from: '"Thư viện Olive Gallery" <no-reply@olivegallery.com>',
      subject: 'Resend OTP',
      template: 'register',
      context: {
        name: user?.hoVaTen ?? user?.email,
        activationCode: maOTP,
      },
    });

    return { message: 'Đã gửi lại mã OTP thành công' };
  }
}
