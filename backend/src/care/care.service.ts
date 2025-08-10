import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CareQueryDto } from "./dto/care-query.dto";
import { CreateCareScheduleDto } from "./dto/create-care-schedule.dto";
import { CompleteCareDto } from "./dto/complete-care.dto";

@Injectable()
export class CareService {
  constructor(private readonly prisma: PrismaService) {}

  async findSchedules(query: CareQueryDto) {
    const { page = 1, limit = 20, catId, careType, dateFrom, dateTo } = query;
    const where: any = {};
    if (catId) where.catId = catId;
    if (careType) where.scheduleType = "CARE"; // CARE種別のみに絞る
    if (dateFrom || dateTo) {
      where.scheduleDate = {};
      if (dateFrom) where.scheduleDate.gte = new Date(dateFrom);
      if (dateTo) where.scheduleDate.lte = new Date(dateTo);
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.schedule.count({ where }),
      this.prisma.schedule.findMany({
        where,
        include: {
          cat: { select: { id: true, name: true } },
        },
        orderBy: { scheduleDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      success: true,
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async addSchedule(dto: CreateCareScheduleDto, userId?: string) {
    const result = await this.prisma.schedule.create({
      data: {
        catId: dto.catId,
        scheduleType: "CARE",
        scheduleDate: new Date(dto.scheduledDate),
        title: dto.description ?? "Care",
        description: dto.description,
        assignedTo: userId ?? (await this.prisma.user.findFirstOrThrow()).id,
      },
      include: { cat: { select: { id: true, name: true } } },
    });
    return { success: true, data: result };
  }

  async complete(id: string, dto: CompleteCareDto, userId?: string) {
    const updated = await this.prisma.schedule.update({
      where: { id },
      data: { status: "COMPLETED" },
    });

    if (dto.nextScheduledDate) {
      await this.prisma.schedule.create({
        data: {
          title: updated.title,
          description: dto.notes ?? updated.description ?? undefined,
          scheduleType: updated.scheduleType,
          scheduleDate: new Date(dto.nextScheduledDate),
          catId: updated.catId ?? undefined,
          assignedTo: userId ?? updated.assignedTo,
        },
      });
    }

    // 実績として CareRecord を残す
    await this.prisma.careRecord.create({
      data: {
        catId: updated.catId!,
        careType: "HEALTH_CHECK", // 簡易実装: 詳細種別は後で拡張
        description: updated.title,
        careDate: dto.completedDate ? new Date(dto.completedDate) : new Date(),
        notes: dto.notes,
        recordedBy: userId ?? (await this.prisma.user.findFirstOrThrow()).id,
      },
    });

    return { success: true };
  }
}
