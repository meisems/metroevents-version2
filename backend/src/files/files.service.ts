import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventFile } from './event-file.entity';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(EventFile) private repo: Repository<EventFile>,
    private storage: StorageService,
  ) {}

  findByEvent(eventId: string) {
    return this.repo.find({ where: { eventId }, order: { createdAt: 'DESC' } });
  }

  async upload(
    eventId: string,
    file: Express.Multer.File,
    label: string,
    uploadedById: string,
  ): Promise<EventFile> {
    const fileUrl = await this.storage.upload(file, `events/${eventId}/files`);
    return this.repo.save(this.repo.create({
      eventId,
      originalName: file.originalname,
      fileUrl,
      mimeType: file.mimetype,
      fileSize: file.size,
      label,
      uploadedById,
    }));
  }

  async remove(id: string): Promise<void> {
    const f = await this.repo.findOneBy({ id });
    if (!f) throw new NotFoundException('File not found');
    await this.storage.delete(f.fileUrl);
    await this.repo.remove(f);
  }
}
