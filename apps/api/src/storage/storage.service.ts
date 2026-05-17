// apps/api/src/storage/storage.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private supabase: SupabaseClient;

  constructor(private config: ConfigService) {
    this.supabase = createClient(
      config.get('SUPABASE_URL')!,
      config.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
  }

  async uploadFile(
    bucket: string,
    file: Express.Multer.File,
    folder?: string,
  ): Promise<{ url: string; storedFilename: string }> {
    const ext = file.originalname.split('.').pop();
    const filename = `${folder ? folder + '/' : ''}${uuidv4()}.${ext}`;

    const { error } = await this.supabase.storage
      .from(bucket)
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) throw new Error(`Upload failed: ${error.message}`);

    const { data } = this.supabase.storage.from(bucket).getPublicUrl(filename);

    return { url: data.publicUrl, storedFilename: filename };
  }

  async getSignedUrl(bucket: string, storedFilename: string, expiresIn = 3600): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUrl(storedFilename, expiresIn);

    if (error) throw new Error(`Signed URL failed: ${error.message}`);
    return data.signedUrl;
  }

  async deleteFile(bucket: string, storedFilename: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(bucket)
      .remove([storedFilename]);

    if (error) throw new Error(`Delete failed: ${error.message}`);
  }
}
