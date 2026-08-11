// src/flags/feature-flag.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FlagsService } from './flags.service';

export const FEATURE_FLAG_KEY = 'featureFlag';
export const RequireFlag = (key: string) => SetMetadata(FEATURE_FLAG_KEY, key);

@Injectable()
export class FeatureFlagGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private flagsService: FlagsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const key = this.reflector.get<string>(FEATURE_FLAG_KEY, context.getHandler());
    if (!key) return true; // route does not require a flag

    const enabled = await this.flagsService.getFlag(key);
    if (!enabled) {
      throw new UnauthorizedException(`Feature '${key}' is disabled`);
    }
    return true;
  }
}
