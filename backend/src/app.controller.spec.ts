import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return app metadata', () => {
      expect(appController.getInfo()).toEqual({
        name: 'dnd-proj-backend',
        status: 'ok',
        docs: 'Add your API docs route here (e.g. /api/docs).',
      });
    });
  });
});
