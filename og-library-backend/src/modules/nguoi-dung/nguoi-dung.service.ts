import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateNguoiDungDto } from './dto/create-nguoi-dung.dto';
import { UpdateNguoiDungDto } from './dto/update-nguoi-dung.dto';
import { InjectModel } from '@nestjs/mongoose';
import { NguoiDung, TrangThaiNguoiDung } from './schemas/nguoi-dung.schema';
import mongoose, { Model } from 'mongoose';
import { comparePasswordHelper, hashPasswordHelper } from '../../helpers/utils';
import { VaiTro } from '../vai-tro/schemas/vai-tro.schema';
import {
  ChangePasswordAuthDto,
  ChangePasswordProfileAuthDto,
  CodeAuthDto,
  CreateAuthDto,
} from '../../auth/dto/create-auth.dto';
import * as crypto from 'crypto';
import dayjs from 'dayjs';
import aqp from 'api-query-params';
import { MailService } from '../../mail/mail.service';

@Injectable()
export class NguoiDungService implements OnModuleInit {
  constructor(
    @InjectModel(NguoiDung.name) private nguoiDungModel: Model<NguoiDung>,
    @InjectModel(VaiTro.name) private vaiTroModel: Model<VaiTro>,
    private mailService: MailService,
  ) {}

  async onModuleInit() {
    await this.seedRoles();
    await this.seedAdmin();
  }

  async seedRoles() {
    const count = await this.vaiTroModel.countDocuments();
    if (count === 0) {
      await this.vaiTroModel.insertMany([
        {
          maVaiTro: 'VT001',
          tenVaiTro: 'Độc giả',
          moTa: 'Những người đọc sách, báo, tài liệu tại thư viện',
        },
        {
          maVaiTro: 'VT002',
          tenVaiTro: 'Thủ thư',
          moTa: 'Quản lý sách, mượn trả',
        },
        {
          maVaiTro: 'VT003',
          tenVaiTro: 'Quản trị viên',
          moTa: 'Quản lý tài khoản',
        },
      ]);
    }
  }

  async seedAdmin() {
    const adminEmail = 'admin@gmail.com';
    const adminAlready = await this.nguoiDungModel.findOne({
      email: adminEmail,
    });
    if (!adminAlready) {
      const adminRole = await this.vaiTroModel.findOne({ maVaiTro: 'VT003' });
      if (adminRole) {
        const hashPassword = await hashPasswordHelper('admin123');
        await this.nguoiDungModel.create({
          hoVaTen: 'Quản trị viên',
          email: adminEmail,
          matKhau: hashPassword,
          trangThai: 1,
          maVaiTro: adminRole._id,
        });
      }
    }
  }

  isEmailExist = async (email: string) => {
    const user = await this.nguoiDungModel.exists({ email });
    return !!user;
  };

  async create(createNguoiDungDto: CreateNguoiDungDto) {
    const { email, matKhau } = createNguoiDungDto;

    const emailExist = await this.isEmailExist(email);
    if (emailExist) {
      throw new BadRequestException(
        'Email đã tồn tại. Vui lòng sử dung email khác',
      );
    }
    const hashPassword = await hashPasswordHelper(matKhau);
    const nguoiDung = await this.nguoiDungModel.create({
      ...createNguoiDungDto,
      matKhau: hashPassword,
    });
    return nguoiDung;
  }

  async findAll(currentPage: number, limit: number, query: string) {
    const { filter, sort } = aqp(query);
    delete filter.page;
    delete filter.limit;

    if (filter.hoVaTen) {
      filter.hoVaTen = { $regex: filter.hoVaTen, $options: 'i' };
    }

    let sortOption = sort;

    if (!sortOption || Object.keys(sortOption).length === 0) {
      sortOption = { createdAt: -1, _id: 1 };
    }

    const offset = (currentPage - 1) * limit;
    const defaultLimit = limit ? limit : 10;

    const totalItems = await this.nguoiDungModel.countDocuments(filter);

    const result = await this.nguoiDungModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sortOption as any)
      .select('-matKhau')
      .populate('maVaiTro', 'tenVaiTro')
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
    return await this.nguoiDungModel
      .findById(id)
      .select('-matKhau')
      .populate('maVaiTro', 'maVaiTro tenVaiTro');
  }

  async findByEmail(email: string) {
    return await this.nguoiDungModel.findOne({ email }).populate('maVaiTro');
  }

  async update(id: string, updateNguoiDungDto: UpdateNguoiDungDto) {
    if (updateNguoiDungDto.matKhau) {
      const newPassword = await hashPasswordHelper(updateNguoiDungDto.matKhau);
      updateNguoiDungDto.matKhau = newPassword;
    } else {
      delete updateNguoiDungDto.matKhau;
    }
    return await this.nguoiDungModel
      .findByIdAndUpdate(id, updateNguoiDungDto, { new: true })
      .select('-matKhau');
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
    const readerRole = await this.vaiTroModel.findOne({ maVaiTro: 'VT001' });
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
      ngaySinh: '',
      soDienThoai: '',
      diaChi: '',
      matKhau: hashPassword,
      trangThai: TrangThaiNguoiDung.CHUA_KICH_HOAT,
      maOTP: maOTP,
      thoiHanOTP: dayjs().add(5, 'minutes'),
      maVaiTro: readerRole._id,
    });

    this.mailService.sendUserConfirmation(
      user.email,
      'Activate your account at Olive Gallery',
      user?.hoVaTen ?? user?.email,
      maOTP,
    );

    return {
      _id: user._id,
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
        { trangThai: TrangThaiNguoiDung.DANG_HOAT_DONG },
      );
      return { isBeforeCheck };
    } else {
      throw new BadRequestException('Mã OTP đã hết hạn hoặc không hợp lệ');
    }
  }

  async handleResendOTP(email: string) {
    const user = await this.nguoiDungModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('Tài khoản không tồn tại');
    }

    if (user.trangThai) {
      throw new BadRequestException('Tài khoản này đã xác thực rồi!');
    }

    const maOTP = crypto.randomInt(100000, 1000000).toString();

    await this.nguoiDungModel.findOneAndUpdate(
      { email },
      {
        $set: {
          maOTP: maOTP,
          thoiHanOTP: dayjs().add(5, 'minutes'),
        },
      },
      { upsert: true, new: true },
    );

    this.mailService.sendUserConfirmation(
      user.email,
      'Resend OTP',
      user?.hoVaTen ?? user?.email,
      maOTP,
    );

    return { _id: user._id };
  }

  async handleRetryPassword(email: string) {
    const user = await this.nguoiDungModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('Tài khoản không tồn tại');
    }

    const maOTP = crypto.randomInt(100000, 1000000).toString();

    await this.nguoiDungModel.findOneAndUpdate(
      { email },
      {
        $set: {
          maOTP: maOTP,
          thoiHanOTP: dayjs().add(5, 'minutes'),
        },
      },
      { upsert: true, new: true },
    );

    this.mailService.sendUserConfirmation(
      user.email,
      'Change password your account at Olive Gallery',
      user?.hoVaTen ?? user?.email,
      maOTP,
    );

    return { _id: user._id };
  }

  async handleChangePassword(changePasswordAuthDto: ChangePasswordAuthDto) {
    if (
      changePasswordAuthDto.xacNhanMatKhau !== changePasswordAuthDto.matKhau
    ) {
      throw new BadRequestException('Mật khẩu/Xác nhận mật khẩu không khớp');
    }
    const user = await this.nguoiDungModel.findOne({
      email: changePasswordAuthDto.email,
    });
    if (!user) {
      throw new BadRequestException('Tài khoản không tồn tại');
    }

    const isBeforeCheck = dayjs().isBefore(user.thoiHanOTP);

    if (isBeforeCheck) {
      const newPassword = await hashPasswordHelper(
        changePasswordAuthDto.matKhau,
      );
      await this.nguoiDungModel.findOneAndUpdate(
        { _id: user._id },
        { matKhau: newPassword },
        { upsert: true, new: true },
      );
    }
    return { isBeforeCheck };
  }

  async handleChangePasswordProfile(
    email: string,
    changePasswordProfileAuthDto: ChangePasswordProfileAuthDto,
  ) {
    if (
      changePasswordProfileAuthDto.xacNhanMatKhauMoi !==
      changePasswordProfileAuthDto.matKhauMoi
    ) {
      throw new BadRequestException('Mật khẩu/Xác nhận mật khẩu không khớp');
    }
    const user = await this.nguoiDungModel.findOne({
      email: email,
    });
    if (!user) {
      throw new BadRequestException('Tài khoản không tồn tại');
    }

    const isPassword = await comparePasswordHelper(
      changePasswordProfileAuthDto.matKhauCu,
      user.matKhau,
    );

    if (!isPassword) {
      throw new BadRequestException('Mật khẩu cũ không chính xác');
    }

    const newPassword = await hashPasswordHelper(
      changePasswordProfileAuthDto.matKhauMoi,
    );

    if (!newPassword) {
      throw new InternalServerErrorException('Hash mật khẩu thất bại');
    }

    if (
      changePasswordProfileAuthDto.matKhauMoi ===
      changePasswordProfileAuthDto.matKhauCu
    ) {
      throw new BadRequestException(
        'Mật khẩu mới không được giống mật khẩu cũ',
      );
    }

    user.matKhau = newPassword;

    await user.save();
    return user;
  }
}
