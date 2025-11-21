import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('session')
  resumeSession(@Headers('authorization') authorization?: string) {
    const token = this.extractToken(authorization);
    return this.authService.resumeSession(token);
  }

  @Post('logout')
  logout(@Headers('authorization') authorization?: string) {
    const token = this.extractToken(authorization);
    return this.authService.logout(token);
  }

  private extractToken(authorization?: string): string {
    if (!authorization || !authorization.toLowerCase().startsWith('bearer ')) {
      throw new UnauthorizedException('Missing session token');
    }

    const token = authorization.slice(7).trim();

    if (!token) {
      throw new UnauthorizedException('Missing session token');
    }

    return token;
  }
}
