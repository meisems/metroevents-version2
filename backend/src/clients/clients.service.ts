import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { Client, CRMStage } from './client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

const STAGE_ORDER: CRMStage[] = [
  CRMStage.NEW_INQUIRY,
  CRMStage.OCULAR_SCHEDULED,
  CRMStage.PROPOSAL_SENT,
  CRMStage.RESERVED,
  CRMStage.FULLY_BOOKED,
  CRMStage.DONE,
];

@Injectable()
export class ClientsService {
  constructor(@InjectRepository(Client) private repo: Repository<Client>) {}

  async findAll(search?: string, stage?: CRMStage) {
    const where: FindManyOptions<Client>['where'] = {};
    if (stage) where['stage'] = stage;
    if (search) where['fullName'] = Like(`%${search}%`);

    const clients = await this.repo.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['events'],
    });

    // Pipeline counts
    const pipeline = await this.getPipelineCounts();
    return { clients, pipeline };
  }

  async getPipelineCounts() {
    const counts: Record<string, number> = {};
    for (const stage of Object.values(CRMStage)) {
      counts[stage] = await this.repo.countBy({ stage });
    }
    return counts;
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.repo.findOne({
      where: { id },
      relations: ['events'],
    });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  async create(dto: CreateClientDto): Promise<Client> {
    const client = this.repo.create(dto);
    return this.repo.save(client);
  }

  async update(id: string, dto: UpdateClientDto): Promise<Client> {
    const client = await this.findOne(id);
    Object.assign(client, dto);
    return this.repo.save(client);
  }

  async advanceStage(id: string): Promise<Client> {
    const client = await this.findOne(id);
    const idx = STAGE_ORDER.indexOf(client.stage);
    if (idx === -1 || idx === STAGE_ORDER.length - 1) {
      throw new BadRequestException('Client is already at the final stage or in a terminal state');
    }
    client.stage = STAGE_ORDER[idx + 1];
    client.lastContactedAt = new Date();
    return this.repo.save(client);
  }

  async remove(id: string): Promise<void> {
    const client = await this.findOne(id);
    await this.repo.remove(client);
  }
}
