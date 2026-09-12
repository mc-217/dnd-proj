import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { CharactersModule } from './characters/characters.module';

@Module({
  imports: [HealthModule, CharactersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
