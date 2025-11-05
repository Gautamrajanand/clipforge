import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth.service';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(Strategy, 'api-key') {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(token: string) {
    // Hash the provided token and look it up
    const keyHash = await bcrypt.hash(token, 10);
    try {
      return this.authService.validateApiKey(keyHash);
    } catch (error) {
      throw new UnauthorizedException('Invalid API key');
    }
  }
}
