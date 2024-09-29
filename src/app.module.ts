import { Module } from '@nestjs/common';
import { AstrologicalReportModule } from './astrological-report/astrological-report.module';

@Module({
  imports: [AstrologicalReportModule],
})
export class AppModule {}