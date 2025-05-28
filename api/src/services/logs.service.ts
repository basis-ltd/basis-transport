import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Log } from '../entities/log.entity';

export class LogsService {
  private readonly logRepository: Repository<Log>;

  constructor() {
    this.logRepository = AppDataSource.getRepository(Log);
  }

  // CREATE LOG
  async createLog(log: Partial<Log>): Promise<Log> {
    return this.logRepository.save(log);
  }
}
