import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
    Strategy,
    'jwt-refresh-token',
) {
    constructor(
        private readonly configService: ConfigService,
        private readonly usersService: UsersService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => {
                    return request?.body?.refresh_token;
                },
            ]),
            secretOrKey: configService.get<string>('REFRESH_TOKEN_SECRET') || 'fallback_refresh_secret',
            passReqToCallback: true,
        });
    }

    async validate(request: Request, payload: any) {
        const refreshToken = request.body?.refresh_token;
        if (!refreshToken) {
            return null;
        }
        return this.usersService.getUserIfRefreshTokenMatches(
            refreshToken,
            payload.sub,
        );
    }
}
