import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAdminByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        email,
        isAdmin: true,
      },
    });
  }

  async findAdminById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        id,
        isAdmin: true,
      },
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async updateRefreshToken(
    id: number,
    refreshToken: string | null = null,
  ): Promise<User> {
    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        refreshToken,
      },
    });
  }
}
