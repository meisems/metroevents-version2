// apps/api/src/files/files.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

const ALLOWED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

@Injectable()
export class FilesService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async findByEvent(eventId: string, clientVisible?: boolean) {
    return this.prisma.eventFile.findMany({
      where: {
        eventId,
        ...(clientVisible !== undefined && { isClientVisible: clientVisible }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async upload(
    eventId: string,
    file: Express.Multer.File,
    category: string,
    description: string | undefined,
    uploadedBy: string,
  ) {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('File type not allowed');
    }

    const { url, storedFilename } = await this.storage.uploadFile(
      'event-files',
      file,
      eventId,
    );

    return this.prisma.eventFile.create({
      data: {
        eventId,
        category,
        originalFilename: file.originalname,
        storedFilename,
        fileUrl: url,
        fileSizeKb: Math.round(file.size / 1024),
        mimeType: file.mimetype,
        description,
        uploadedBy,
      },
    });
  }

  async toggleClientVisible(id: string) {
    const file = await this.prisma.eventFile.findUniqueOrThrow({ where: { id } });
    return this.prisma.eventFile.update({
      where: { id },
      data: { isClientVisible: !file.isClientVisible },
    });
  }

  async remove(id: string) {
    const file = await this.prisma.eventFile.findUniqueOrThrow({ where: { id } });
    await this.storage.deleteFile('event-files', file.storedFilename);
    return this.prisma.eventFile.delete({ where: { id } });
  }

  async getSignedUrl(id: string) {
    const file = await this.prisma.eventFile.findUniqueOrThrow({ where: { id } });
    const url = await this.storage.getSignedUrl('event-files', file.storedFilename);
    return { url, expiresIn: 3600 };
  }
}
