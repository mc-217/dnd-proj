import { Module } from '@nestjs/common';
import { PersonalitiesController } from './personalities.controller';
import { PersonalitiesService } from './personalities.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [PersonalitiesController],
  providers: [PersonalitiesService],
})
export class PersonalitiesModule {}
