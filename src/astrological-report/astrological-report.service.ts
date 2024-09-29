import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { IReport } from './interfaces/report.interface';
import { PrismaService } from 'src/common/services/prisma.service';
import { CONSTANTS } from 'src/common/variables/rabbitmq.variables';

@Injectable()
export class AstrologicalReportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}
  @RabbitSubscribe({
    exchange: CONSTANTS.RABBITMQ_CONFIG_NAME,
    routingKey: CONSTANTS.RABBITMQ_CONFIG_ROUTING_KEY,
  })
  async handlerTask(data: string) {
    const order = JSON.parse(data);
    const report = await this.generateReport(order.userId);

    if (!report) {
      return;
    }

    this.sendReport(report);
    this.changeOrderStatus(order.id);
  }

  private async generateReport(userId: string): Promise<IReport> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      const report = {
        title: `Hi ${user.name}. This is your astrological report`,
        message:
          'You are full of energy and determination. This is a favorable period for initiatives and actions, but avoid impulsiveness.',
      };

      return report;
    } catch (err) {
      console.error('User not found ', err);
    }
  }

  private sendReport(data: IReport): void {
    try {
      const url = this.configService.get('ANALYTICS_SERVICE_URL');

      this.httpService.post(url, data);
    } catch (err) {
      console.error('Report cannot be sent ', err);
    }
  }

  private async changeOrderStatus(orderId: string): Promise<void> {
    await this.prisma.purchase.update({
      where: { id: orderId },
      data: { is_completed: true },
    });
  }
}
