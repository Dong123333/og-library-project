import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('FACEBOOK_CLIENT_ID')!,
      clientSecret: configService.get<string>('FACEBOOK_CLIENT_SECRET')!,
      callbackURL: configService.get<string>('FACEBOOK_CALLBACK_URL')!,
      scope: 'email',
      profileFields: ['emails', 'name', 'photos'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    const { name, emails, id, photos } = profile;

    const familyName = name?.familyName || '';
    const givenName = name?.givenName || '';
    const hoVaTen =
      `${familyName} ${givenName}`.trim() || 'Người dùng Facebook';

    const facebookUser = {
      maFacebook: id,
      email: emails ? emails[0].value : `${id}@facebook.com`,
      hoVaTen: hoVaTen,
      hinhAnh: photos && photos.length > 0 ? photos[0].value : null,
    };

    done(null, facebookUser);
  }
}
