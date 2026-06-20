import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'temporary-fallback-secret-key-supabase',
    });
  }

  async validate(payload: any) {
    this.logger.log(`Acesso autorizado via JWT para o usuário: ${payload.email}`);
    
    return {
      userId: payload.sub,
      email: payload.email,
      role: 'GERENTE',
    };
  }
}


