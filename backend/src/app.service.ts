import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getInfo() {
    return {
      name: 'dnd-proj-backend',
      status: 'ok',
      docs: 'Add your API docs route here (e.g. /api/docs).',
    };
  }
}
