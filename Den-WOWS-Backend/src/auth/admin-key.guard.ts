import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AdminKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      throw new UnauthorizedException('Missing Basic Auth header');
    }

    const base64Credentials = authHeader.split(' ')[1];
    const [username, password] = Buffer.from(base64Credentials, 'base64').toString().split(':');

    const adminUser = (process.env.ADMIN_USERNAME || 'fakharzaman').trim().toLowerCase();
    const adminKey = (process.env.ADMIN_KEY || 'admin123').trim();
    const u = (username || '').trim().toLowerCase();

    if ((u !== adminUser && u !== 'fakharzaman' && u !== 'admin') || (password || '').trim() !== adminKey) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    return true;
  }
}