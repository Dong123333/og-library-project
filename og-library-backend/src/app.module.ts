import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DanhMucModule } from './modules/danh-muc/danh-muc.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { NhaXuatBanModule } from './modules/nha-xuat-ban/nha-xuat-ban.module';
import { TacGiaModule } from './modules/tac-gia/tac-gia.module';
import { TacGiaSachModule } from './modules/tac-gia_sach/tac-gia_sach.module';
import { SachModule } from './modules/sach/sach.module';
import { VaiTroModule } from './modules/vai-tro/vai-tro.module';
import { NguoiDungModule } from './modules/nguoi-dung/nguoi-dung.module';
import { MuonTraModule } from './modules/muon-tra/muon-tra.module';
import { ChiTietMuonTraModule } from './modules/chi-tiet-muon-tra/chi-tiet-muon-tra.module';
import { PhieuPhatModule } from './modules/phieu-phat/phieu-phat.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/passport/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailerModule } from '@nestjs-modules/mailer';
import { DashboardModule } from './dashboard/dashboard.module';
import { PaymentModule } from './payment/payment.module';
import { ThongBaoModule } from './modules/thong-bao/thong-bao.module';
import { ChatbotModule } from './chatbot/chatbot.module';

@Module({
  imports: [
    DanhMucModule,
    NhaXuatBanModule,
    TacGiaModule,
    TacGiaSachModule,
    SachModule,
    VaiTroModule,
    NguoiDungModule,
    MuonTraModule,
    ChiTietMuonTraModule,
    PhieuPhatModule,
    AuthModule,
    DashboardModule,
    PaymentModule,
    ThongBaoModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: 'smtp.sendgrid.net',
          port: 587,
          auth: {
            user: 'apikey',
            pass: configService.get<string>('SENDGRID_API_KEY'),
          },
        },
        defaults: {
          from: '"Olive Gallery" <hobadong7777777@gmail.com>',
        },
        template: {
          dir: process.cwd() + '/src/mail/templates/',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    ChatbotModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
