import * as dotenv from 'dotenv';
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { PrismaService } from 'src/common/services/prisma.service';
import { CONSTANTS } from 'src/common/variables/rabbitmq.variables';
import { AstrologicalReportService } from './astrological-report.service';

dotenv.config();

@Module({
  imports: [
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: CONSTANTS.RABBITMQ_CONFIG_NAME,
          type: CONSTANTS.RABBITMQ_CONFIG_TYPE,
          options: {
            arguments: { 'x-delayed-type': 'direct' },
          },
        },
        HttpModule,
      ],
      uri: process.env.RABBITMQ_URL,
    }),
    ConfigModule.forRoot(),
    HttpModule,
  ],
  providers: [AstrologicalReportService, PrismaService],
})
export class AstrologicalReportModule {}
