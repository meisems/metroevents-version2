// apps/api/src/moodboard/moodboard.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class MoodboardService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async findByEvent(eventId: string) {
    return this.prisma.moodboardPeg.findMany({
      where: { eventId },
      include: { uploader: { select: { id: true, name: true } } },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async uploadPeg(
    eventId: string,
    file: Express.Multer.File,
    uploadedBy: string,
    caption?: string,
    category?: string,
  ) {
    const { url, storedFilename } = await this.storage.uploadFile(
      'moodboard-pegs',
      file,
      eventId,
    );
    const count = await this.prisma.moodboardPeg.count({ where: { eventId } });
    return this.prisma.moodboardPeg.create({
      data: {
        eventId,
        uploadedBy,
        imageUrl: url,
        caption,
        category,
        sortOrder: count,
      },
    });
  }

  async approve(id: string) {
    return this.prisma.moodboardPeg.update({
      where: { id },
      data: { isApproved: true },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.moodboardPeg.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.moodboardPeg.delete({ where: { id } });
  }
}
