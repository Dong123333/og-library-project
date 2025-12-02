import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';

@Injectable()
export class MailService {
  private brevoApiInstance: SibApiV3Sdk.TransactionalEmailsApi;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];

    apiKey.apiKey = this.configService.get<string>('BREVO_API_KEY')!;

    this.brevoApiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  }

  private loadTemplate(templateName: string, data: any): string {
    const templatePath = path.join(
      process.cwd(),
      'dist',
      'src',
      'mail',
      'templates',
      `${templateName}.hbs`,
    );

    if (!fs.existsSync(templatePath)) {
      this.logger.error(`❌ Không tìm thấy file template tại: ${templatePath}`);
      this.logger.error(
        `💡 Gợi ý: Kiểm tra lại nest-cli.json xem đã cấu hình copy assets chưa?`,
      );
      return '';
    }

    const source = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(source);

    return template(data);
  }

  async sendUserConfirmation(
    email: string,
    subject: string,
    name: string,
    otp: string,
  ) {
    const fromEmail = this.configService.get<string>('MAIL_FROM')!;

    const htmlContent = this.loadTemplate('register', {
      name: name,
      activationCode: otp,
    });

    if (!htmlContent) return false;

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;

    sendSmtpEmail.sender = { name: 'Olive Gallery', email: fromEmail };

    sendSmtpEmail.to = [{ email: email }];

    try {
      await this.brevoApiInstance.sendTransacEmail(sendSmtpEmail);
      this.logger.log(`✅ [Brevo] Đã gửi OTP thành công đến ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ [Brevo] Lỗi gửi mail đến ${email}`);

      if (error.response && error.response.body) {
        this.logger.error('Chi tiết lỗi:', JSON.stringify(error.response.body));
      } else {
        this.logger.error(error);
      }
      return false;
    }
  }
}