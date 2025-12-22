import { Module } from '@nestjs/common';
import { NguoiDungService } from './nguoi-dung.service';
import { NguoiDungController } from './nguoi-dung.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { NguoiDung, NguoiDungSchema } from './schemas/nguoi-dung.schema';
import { VaiTro, VaiTroSchema } from '../vai-tro/schemas/vai-tro.schema';
import { MailModule } from '../../mail/mail.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CloudinaryModule } from '../../cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NguoiDung.name, schema: NguoiDungSchema },
      { name: VaiTro.name, schema: VaiTroSchema },
    ]),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService
            .get<string>('JWT_ACCESS_TOKEN_EXPIRED')
            ?.trim() as any,
        },
      }),
      inject: [ConfigService],
    }),
    MailModule,
    CloudinaryModule,
  ],
  controllers: [NguoiDungController],
  providers: [NguoiDungService],
  exports: [NguoiDungService],
})
export class NguoiDungModule {}
