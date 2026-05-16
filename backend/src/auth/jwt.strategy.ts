
// ════════════════════════════════════════════════════════════
//  JWT Strategy  —  validates Bearer tokens on protected routes
// ════════════════════════════════════════════════════════════
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  sub:   string;
  email: string;
  role:  string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest:   ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:      config.get('JWT_SECRET'),
    });
  }

  /** Return value is attached to request.user */
  async validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
      email:  payload.email,
      role:   payload.role,
    };
  }
}
</parameter>