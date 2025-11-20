import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiKeysService } from '../api-keys.service';

/**
 * ApiKeyAuthGuard - Validates API key from Authorization header
 * 
 * Expects header: Authorization: Bearer cf_abc123...
 * Attaches validated API key data to request.apiKey
 */
@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(private apiKeysService: ApiKeysService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Extract API key from Authorization header
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const [type, key] = authHeader.split(' ');
    if (type !== 'Bearer' || !key) {
      throw new UnauthorizedException('Invalid Authorization header format');
    }

    // Validate API key
    const apiKeyData = await this.apiKeysService.validateApiKey(key);
    if (!apiKeyData) {
      throw new UnauthorizedException('Invalid or expired API key');
    }

    // Attach API key data to request for downstream use
    request.apiKey = apiKeyData;
    request.user = apiKeyData.user;
    request.org = apiKeyData.org;

    return true;
  }
}
