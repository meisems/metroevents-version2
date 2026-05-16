import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';
import * as path from 'path';

@Injectable()
export class StorageService {
  private s3: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor(private config: ConfigService) {
    this.s3 = new S3Client({
      endpoint: config.get('S3_ENDPOINT'),
      region: config.get('S3_REGION'),
      credentials: {
        accessKeyId: config.get('S3_ACCESS_KEY_ID'),
        secretAccessKey: config.get('S3_SECRET_ACCESS_KEY'),
      },
      forcePathStyle: true, // required for Backblaze B2
    });
    this.bucket = config.get('S3_BUCKET');
    this.publicUrl = config.get('S3_PUBLIC_URL');
  }

  /**
   * Upload a file buffer to S3
   * @param folder - logical folder prefix (e.g. 'payments', 'moodboard', 'avatars')
   * @param originalName - original filename (for extension detection)
   * @param buffer - file content
   * @param mimeType - MIME type
   */
  async upload(
    folder: string,
    originalName: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<{ key: string; url: string }> {
    const ext = path.extname(originalName);
    const key = `${folder}/${uuid()}${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        ACL: 'public-read',
      }),
    );

    return {
      key,
      url: `${this.publicUrl}/${key}`,
    };
  }

  /**
   * Delete a file from S3 by key
   */
  async delete(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  /**
   * Generate a pre-signed URL for temporary private access
   */
  async getSignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    return getSignedUrl(
      this.s3,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn: expiresInSeconds },
    );
  }
}
