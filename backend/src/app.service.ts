import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async getHello() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'UP',
        timestamp: new Date().toISOString(),
        services: {
          database: {
            status: 'UP',
            provider: 'Supabase (US Pooler)',
          },
          api: {
            status: 'UP',
            uptime: process.uptime(),
          }
        }
      };
    } catch (error) {
      return {
        status: 'DOWN',
        timestamp: new Date().toISOString(),
        services: {
          database: {
            status: 'DOWN',
            error: error instanceof Error ? error.message : 'Erro desconhecido',
          },
          api: {
            status: 'UP',
          }
        }
      };
    }
  }
}