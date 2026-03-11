/**
 * Controller de autenticação: endpoint POST /auth/login para obter token JWT.
 */
import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiProperty } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';

export class LoginDto {
  @ApiProperty({ example: 'admin' })
  username!: string;
  @ApiProperty({ example: 'admin' })
  password!: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** Autentica usuário/senha e retorna access_token JWT (rota pública). */
  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Login e obter JWT' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.username, dto.password);
  }
}
