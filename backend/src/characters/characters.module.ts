import { Module } from '@nestjs/common';
import { CharactersController } from './characters.controller';
import { CharactersService } from './characters.service';
import { SupabaseService } from './supabase.service';

@Module({
  controllers: [CharactersController],
  providers: [CharactersService, SupabaseService],
})
export class CharactersModule {}
