import { Injectable, UploadedFiles } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import { v4 as uuid } from 'uuid';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {}

  async uploadImageProductToS3(
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const s3 = new S3({
      accessKeyId: this.configService.get<string>('BUCKET_ACCESS_KEY'), //configService just fetches fields from env
      secretAccessKey: this.configService.get<string>('BUCKET_SECRET_KEY'),
    });
    // This creates an s3 instance which can be used to call inbuilt functions of s3
    const uploadedFiles = [];
    for (const file of files) {
      const params = {
        Bucket: this.configService.get<string>('BUCKET_NAME'),
        Key: uuid(), // Adjust path as needed
        Body: file.buffer,
      };

      try {
        const data = await s3.upload(params).promise();
        uploadedFiles.push(data.Location);
      } catch (error) {
        console.error('Error uploading file to S3:', error);
      }
    }
    return uploadedFiles;
  }

  async deleteImageProductFromS3(keyToDelete: string): Promise<void> {
    const s3 = new S3({
      accessKeyId: this.configService.get<string>('BUCKET_ACCESS_KEY'), //configService just fetches fields from env
      secretAccessKey: this.configService.get<string>('BUCKET_SECRET_KEY'),
      endpoint: this.configService.get<string>('BUCKET_ENDPOINT'),
    });

    const params = {
      Bucket: this.configService.get<string>('BUCKET_NAME'), // Replace with your S3 bucket name
      Key: keyToDelete, // The key of the file you want to delete
    };

    try {
      await s3.deleteObject(params).promise();
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw new Error('Failed to delete file from S3');
    }
  }
}
