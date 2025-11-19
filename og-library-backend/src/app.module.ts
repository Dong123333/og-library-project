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
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
