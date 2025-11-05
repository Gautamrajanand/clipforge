import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(email: string, name: string, password: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user with organization
    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        memberships: {
          create: {
            role: 'OWNER',
            org: {
              create: {
                name: `${name}'s Organization`,
              },
            },
          },
        },
      },
      include: { memberships: { include: { org: true } } },
    });

    return this.generateToken(user);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { memberships: { include: { org: true } } },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user);
  }

  async validateApiKey(keyHash: string) {
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { keyHash },
      include: { org: true, user: true },
    });

    if (!apiKey || (apiKey.expiresAt && apiKey.expiresAt < new Date())) {
      throw new UnauthorizedException('Invalid API key');
    }

    // Update last used
    await this.prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    });

    return { user: apiKey.user, org: apiKey.org, apiKey };
  }

  async validateJwt(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { memberships: { include: { org: true } } },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  private generateToken(user: any) {
    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);
    return { access_token, user };
  }
}
