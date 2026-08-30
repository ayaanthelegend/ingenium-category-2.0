import { Module } from '@nestjs/common';
import { FlagsController } from './flags.controller';
import { FlagsService } from './flags.service';
import { MongooseModule } from "@nestjs/mongoose";
import { Flag, FlagSchema } from "./schemas/flag.schema";
import { FeatureFlagGuard } from "./flag.guard";
import { SeedModule } from '../seed.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Flag.name, schema: FlagSchema }]),
    SeedModule,
  ],
  controllers: [FlagsController],
  providers: [FlagsService, FeatureFlagGuard],
  exports: [FlagsService, FeatureFlagGuard],
})
export class FlagsModule {}
