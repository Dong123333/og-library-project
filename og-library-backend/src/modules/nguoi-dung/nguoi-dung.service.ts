import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
  UploadedFile,
} from '@nestjs/common';
import { CreateNguoiDungDto } from './dto/create-nguoi-dung.dto';
import {
  UpdateProfileDto,
  UpdateUserByAdminDto,
} from './dto/update-nguoi-dung.dto';
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
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

@Injectable()
export class NguoiDungService implements OnModuleInit {
  constructor(
    @InjectModel(NguoiDung.name) private nguoiDungModel: Model<NguoiDung>,
    @InjectModel(VaiTro.name) private vaiTroModel: Model<VaiTro>,
    private mailService: MailService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly cloudinaryService: CloudinaryService,
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
    const usersToSeed = [
      {
        email: 'admin@olive.gallery.vn',
        hoVaTen: 'Quản trị viên',
        password: '123456',
        maVaiTro: 'VT003',
      },
      {
        email: 'librarian@olive.gallery.vn',
        hoVaTen: 'Thủ thư',
        password: '123456',
        maVaiTro: 'VT002',
      },
    ];
    for (const user of usersToSeed) {
      const existing = await this.nguoiDungModel.findOne({ email: user.email });
      if (!existing) {
        const role = await this.vaiTroModel.findOne({
          maVaiTro: user.maVaiTro,
        });
        if (role) {
          const hashedPassword = await hashPasswordHelper(user.password);
          await this.nguoiDungModel.create({
            hoVaTen: user.hoVaTen,
            hinhAnh: '',
            ngaySinh: null,
            diaChi: '',
            soDienThoai: '',
            email: user.email,
            matKhau: hashedPassword,
            trangThai: 1,
            maVaiTro: role._id,
            nguonDangNhap: 'local',
          });
        }
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

  async updateProfile(
    id: string,
    updateProfileDto: UpdateProfileDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      const result = await this.cloudinaryService.uploadImage(file);
      updateProfileDto.hinhAnh = result.secure_url;
    }
    return await this.nguoiDungModel
      .findByIdAndUpdate(id, updateProfileDto, { new: true })
      .select('-matKhau');
  }

  async updateUserByAdmin(
    id: string,
    updateUserByAdminDto: UpdateUserByAdminDto,
  ) {
    if (updateUserByAdminDto.matKhau) {
      updateUserByAdminDto.matKhau = await hashPasswordHelper(
        updateUserByAdminDto.matKhau,
      );
    } else {
      delete updateUserByAdminDto.matKhau;
    }

    return await this.nguoiDungModel
      .findByIdAndUpdate(id, updateUserByAdminDto, { new: true })
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
    const isExist = await this.nguoiDungModel.findOne({ email });
    if (isExist) {
      if (
        isExist.nguonDangNhap === 'facebook' ||
        isExist.nguonDangNhap === 'google'
      ) {
        throw new ConflictException(
          `Email này đã được sử dụng để đăng nhập bằng ${isExist.nguonDangNhap}.`,
        );
      }
      throw new ConflictException(
        'Email đã được đăng ký. Vui lòng sử dụng email khác',
      );
    }
    const hashPassword = await hashPasswordHelper(matKhau);
    const maOTP = crypto.randomInt(100000, 1000000).toString();
    const user = await this.nguoiDungModel.create({
      hoVaTen,
      email,
      hinhAnh: '',
      ngaySinh: null,
      soDienThoai: '',
      diaChi: '',
      matKhau: hashPassword,
      trangThai: TrangThaiNguoiDung.CHUA_KICH_HOAT,
      maOTP: maOTP,
      thoiHanOTP: dayjs().add(5, 'minutes'),
      maVaiTro: readerRole._id,
      nguonDangNhap: 'local',
    });

    this.mailService.sendUserConfirmation(
      user.email,
      'Kích hoạt tài khoản của bạn tại Olive Gallery',
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
      await this.nguoiDungModel.findOneAndUpdate(
        { _id: user._id },
        {
          trangThai: TrangThaiNguoiDung.DANG_HOAT_DONG,
          maOTP: null,
          thoiHanOTP: null,
        },
      );
    } else {
      throw new BadRequestException('Mã OTP đã hết hạn hoặc không hợp lệ');
    }
    return { message: 'Xác thực tài khoản thành công' };
  }

  async handleResendOTP(email: string) {
    const user = await this.nguoiDungModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('Tài khoản không tồn tại');
    }

    if (user.nguonDangNhap !== 'local') {
      throw new BadRequestException(
        `Tài khoản của bạn liên kết với ${user.nguonDangNhap}. Vui lòng quản lý mật khẩu tại trang cá nhân của nhà cung cấp đó.`,
      );
    }

    if (user.trangThai) {
      throw new BadRequestException('Tài khoản này đã xác thực rồi!');
    }

    const maOTP = crypto.randomInt(100000, 1000000).toString();

    await this.nguoiDungModel.findOneAndUpdate(
      { email },
      {
        maOTP: maOTP,
        thoiHanOTP: dayjs().add(5, 'minutes'),
      },
    );

    this.mailService.sendUserConfirmation(
      user.email,
      'Gửi lại OTP',
      user?.hoVaTen ?? user?.email,
      maOTP,
    );

    return { message: 'Gửi OTP thành công' };
  }

  async handleRetryPassword(email: string) {
    const user = await this.nguoiDungModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('Tài khoản không tồn tại');
    }

    if (user.nguonDangNhap !== 'local') {
      throw new BadRequestException(
        `Tài khoản của bạn liên kết với ${user.nguonDangNhap}. Vui lòng quản lý mật khẩu tại trang cá nhân của nhà cung cấp đó.`,
      );
    }

    const maOTP = crypto.randomInt(100000, 1000000).toString();

    await this.nguoiDungModel.findOneAndUpdate(
      { email },
      {
        maOTP: maOTP,
        thoiHanOTP: dayjs().add(5, 'minutes'),
      },
    );

    this.mailService.sendUserConfirmation(
      user.email,
      'Thay đổi mật khẩu tài khoản của bạn tại Olive Gallery',
      user?.hoVaTen ?? user?.email,
      maOTP,
    );

    return { message: 'Gửi yêu cầu đổi mật khẩu thành công' };
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

    if (changePasswordAuthDto.maOTP !== user.maOTP) {
      throw new BadRequestException('Mã OTP không chính xác');
    }

    const isBeforeCheck = dayjs().isBefore(user.thoiHanOTP);

    if (isBeforeCheck) {
      const newPassword = await hashPasswordHelper(
        changePasswordAuthDto.matKhau,
      );
      await this.nguoiDungModel.findOneAndUpdate(
        { _id: user._id },
        {
          matKhau: newPassword,
          maOTP: null,
          thoiHanOTP: null,
        },
      );
    } else {
      throw new BadRequestException('Mã OTP đã hết hạn. Vui lòng lấy mã mới.');
    }
    return { message: 'Đổi mật khẩu thành công' };
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

    if (user.nguonDangNhap !== 'local') {
      throw new BadRequestException(
        `Tài khoản của bạn liên kết với ${user.nguonDangNhap}. Vui lòng quản lý mật khẩu tại trang cá nhân của nhà cung cấp đó.`,
      );
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

  async validateSocialUser(profile: {
    email: string;
    hoVaTen: string;
    hinhAnh?: string;
    ma: string;
    loai: 'google' | 'facebook';
  }) {
    const { email, hoVaTen, hinhAnh, ma, loai } = profile;
    const maSocialKey = loai === 'google' ? 'maGoogle' : 'maFacebook';
    const otherSocialKey = loai === 'google' ? 'maFacebook' : 'maGoogle';

    let user: any = await this.nguoiDungModel.findOne({
      $or: [{ email: email }, { [maSocialKey]: ma }],
    });

    if (user) {
      if (user.nguonDangNhap !== loai) {
        return {
          status: 'CONFLICT',
          provider: user.nguonDangNhap,
        };
      }
      user = await this.nguoiDungModel
        .findByIdAndUpdate(
          user._id,
          {
            $set: {
              [maSocialKey]: ma,
              email: email,
            },
            $unset: { [otherSocialKey]: 1 },
          },
          { new: true },
        )
        .populate('maVaiTro')
        .lean();
    } else {
      const role = await this.vaiTroModel.findOne({
        maVaiTro: 'VT001',
      });

      user = await this.nguoiDungModel.create({
        hoVaTen: hoVaTen,
        hinhAnh: hinhAnh,
        email: email,
        ngaySinh: null,
        diaChi: '',
        soDienThoai: '',
        matKhau: '',
        maVaiTro: role?._id,
        trangThai: 1,
        [maSocialKey]: ma,
        nguonDangNhap: loai,
      });
    }

    if (!user) {
      throw new InternalServerErrorException(
        'Không thể xác thực hoặc tạo tài khoản người dùng',
      );
    }

    const payload = {
      email: user.email,
      sub: user._id,
      maVaiTro: user.maVaiTro,
      hoVaTen: user.hoVaTen,
    };

    return { status: 'SUCCESS', access_token: this.jwtService.sign(payload) };
  }

  async validateFacebookUser(fbProfile: any) {
    const { email, hoVaTen, maFacebook, hinhAnh } = fbProfile;

    return this.validateSocialUser({
      email: email,
      hoVaTen: hoVaTen,
      hinhAnh: hinhAnh,
      ma: maFacebook,
      loai: 'facebook',
    });
  }

  async validateGoogleUser(googleProfile: any) {
    const { email, hoVaTen, maGoogle, hinhAnh } = googleProfile;

    return this.validateSocialUser({
      email: email,
      hoVaTen: hoVaTen,
      hinhAnh: hinhAnh,
      ma: maGoogle,
      loai: 'google',
    });
  }

  getRedirectUrl(status: string | undefined, data: any): string {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const currentStatus = status || 'ERROR';

    if (currentStatus === 'CANCELLED') {
      return `${frontendUrl}/login?error=access_denied`;
    }

    if (currentStatus === 'ERROR') {
      return `${frontendUrl}/login?error=error`;
    }

    if (currentStatus === 'CONFLICT') {
      const providerName =
        data.provider === 'google'
          ? 'Google'
          : data.provider === 'facebook'
            ? 'Facebook'
            : 'Email/Mật khẩu';
      return `${frontendUrl}/login?error=social_conflict&provider=${encodeURIComponent(providerName)}`;
    }

    if (currentStatus === 'SUCCESS' && data.access_token) {
      return `${frontendUrl}/login-success?token=${data.access_token}`;
    }

    return `${frontendUrl}/login?error=unknown`;
  }
}
