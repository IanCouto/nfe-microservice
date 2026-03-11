import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(username: string, password: string): Promise<{ access_token: string }> {
    const validUser = process.env.AUTH_USER || 'admin';
    const validPass = process.env.AUTH_PASSWORD || 'admin';
    if (username !== validUser || password !== validPass) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    const payload = { sub: username };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(payload: { sub: string }): Promise<{ username: string }> {
    return { username: payload.sub };
  }
}
