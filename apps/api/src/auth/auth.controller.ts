import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(
    @Body() body: { email: string; name: string; password: string },
  ) {
    return this.authService.register(body.email, body.name, body.password);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get current user' })
  async me(@Request() req) {
    return req.user;
  }
}
