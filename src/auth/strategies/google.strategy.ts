import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { VerifyCallback } from 'passport-oauth2';
import { GoogleUserRequest } from 'src/model/user.model';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    try {
      console.log(accessToken);
      console.log(refreshToken);
      console.log(profile);

      const user: GoogleUserRequest = {
        displayName: profile.displayName,
        email: profile.emails[0].value,
        family_name: profile.name.familyName,
        picture: profile.photos[0].value,
        verified_email: Boolean(profile.emails[0].verified),
        provider: profile.provider,
      };

      // Lakukan kembalikan user atau false jika autentikasi gagal
      done(null, user);
    } catch (error) {
      // Tangani kesalahan dengan memanggil done dengan error
      done(error, false);
    }
  }
}
