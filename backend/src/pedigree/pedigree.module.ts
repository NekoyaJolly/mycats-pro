import { Module } from '@nestjs/common';
import { PedigreeService } from './pedigree.service';
import { PedigreeController } from './pedigree.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PedigreeController],
  providers: [PedigreeService],
  exports: [PedigreeService],
})
export class PedigreeModule {}
