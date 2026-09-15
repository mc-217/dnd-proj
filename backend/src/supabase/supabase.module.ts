import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

// Exported so any feature module can import it instead of providing its own
// copy of the PostgREST plumbing.
@Module({
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class SupabaseModule {}
