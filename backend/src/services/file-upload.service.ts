import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { v4 as uuid4 } from 'uuid';
import { Multer } from 'multer';

@Injectable()
export class FileUploadService {
  private readonly uploadDir = join(process.cwd(), 'uploads');

  constructor() {
    // Ensure upload directory exists
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(
    file: { buffer: Buffer; originalname: string; mimetype: string },
    type: 'image' | 'video',
  ): Promise<string> {
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${type}-${uuid4()}.${fileExt}`;
    const filePath = join(this.uploadDir, fileName);

    await fs.writeFile(filePath, file.buffer);

    // Return the URL that can be used to access the file
    return `/uploads/${fileName}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const fileName = fileUrl.split('/').pop();
    if (!fileName) return;

    const filePath = join(this.uploadDir, fileName);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // Ignore errors if file doesn't exist
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }
}
