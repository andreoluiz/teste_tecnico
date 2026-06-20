import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      audience: 'authenticated',
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: 'https://ichphoubzzbmpffpejbx.supabase.co/auth/v1/.well-known/jwks.json',
      }),
      algorithms: ['ES256'],
    });
  }

  async validate(payload: any) {
    this.logger.log(`Payload decodificado via Passport com sucesso! Email do usuário: ${payload.email}`);
    return {
      userId: payload.sub,
      email: payload.email,
      role: 'GERENTE',
    };
  }
}








