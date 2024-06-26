import { Inject, Injectable, Logger, UploadedFiles } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class UploadService {
  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  async uploadImageProductToS3(
    productId: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<void> {
    const s3 = new S3Client({
      credentials: {
        accessKeyId: this.configService.get<string>('BUCKET_ACCESS_KEY'), //configService just fetches fields from env
        secretAccessKey: this.configService.get<string>('BUCKET_SECRET_KEY'),
      },
      region: 'idn',
      endpoint: this.configService.get<string>('BUCKET_ENDPOINT'),
    });
    for (const file of files) {
      const command = new PutObjectCommand({
        Bucket: this.configService.get<string>('BUCKET_NAME'),
        Key: new Date().getTime().toString() + file.originalname, // Adjust path as needed
        Body: file.buffer,
        ACL: 'public-read',
      });

      try {
        await s3.send(command);
        const url = `https://nest-bucket.nos.jkt-1.neo.id/${command.input.Key}`;
        await this.prismaService.image.create({
          data: {
            product_id: productId,
            url,
          },
        });
      } catch (error) {
        this.logger.error('Error uploading product to S3:', error);
      }
    }
  }

  async uploadImageVariantToS3(
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<string> {
    const s3 = new S3Client({
      credentials: {
        accessKeyId: this.configService.get<string>('BUCKET_ACCESS_KEY'), //configService just fetches fields from env
        secretAccessKey: this.configService.get<string>('BUCKET_SECRET_KEY'),
      },
      region: 'idn',
      endpoint: this.configService.get<string>('BUCKET_ENDPOINT'),
    });
    for (const file of files) {
      const command = new PutObjectCommand({
        Bucket: this.configService.get<string>('BUCKET_NAME'),
        Key: new Date().getTime().toString() + file.originalname, // Adjust path as needed
        Body: file.buffer,
        ACL: 'public-read',
      });

      try {
        await s3.send(command);
        const url = `https://nest-bucket.nos.jkt-1.neo.id/${command.input.Key}`;
        return url;
      } catch (error) {
        this.logger.error('Error uploading variant file to S3:', error);
      }
    }
  }
  async uploadSingleImageVariantToS3(
    @UploadedFiles() file: Express.Multer.File,
  ): Promise<string> {
    const s3 = new S3Client({
      credentials: {
        accessKeyId: this.configService.get<string>('BUCKET_ACCESS_KEY'), //configService just fetches fields from env
        secretAccessKey: this.configService.get<string>('BUCKET_SECRET_KEY'),
      },
      region: 'idn',
      endpoint: this.configService.get<string>('BUCKET_ENDPOINT'),
    });

    const command = new PutObjectCommand({
      Bucket: this.configService.get<string>('BUCKET_NAME'),
      Key: new Date().getTime().toString() + file.originalname, // Adjust path as needed
      Body: file.buffer,
      ACL: 'public-read',
    });
    try {
      await s3.send(command);
      const url = `https://nest-bucket.nos.jkt-1.neo.id/${command.input.Key}`;
      return url;
    } catch (error) {
      this.logger.error('Error uploading profile file to S3:', error);
    }
  }

  async uploadImageProfileToS3(
    @UploadedFiles() file: Express.Multer.File,
  ): Promise<string> {
    const s3 = new S3Client({
      credentials: {
        accessKeyId: this.configService.get<string>('BUCKET_ACCESS_KEY'), //configService just fetches fields from env
        secretAccessKey: this.configService.get<string>('BUCKET_SECRET_KEY'),
      },
      region: 'idn',
      endpoint: this.configService.get<string>('BUCKET_ENDPOINT'),
    });

    const command = new PutObjectCommand({
      Bucket: this.configService.get<string>('BUCKET_NAME'),
      Key: new Date().getTime().toString() + file.originalname, // Adjust path as needed
      Body: file.buffer,
      ACL: 'public-read',
    });
    try {
      await s3.send(command);
      const url = `https://nest-bucket.nos.jkt-1.neo.id/${command.input.Key}`;
      return url;
    } catch (error) {
      this.logger.error('Error uploading profile file to S3:', error);
    }
  }
  async deleteFromS3(url: string): Promise<void> {
    const s3 = new S3Client({
      credentials: {
        accessKeyId: this.configService.get<string>('BUCKET_ACCESS_KEY'), //configService just fetches fields from env
        secretAccessKey: this.configService.get<string>('BUCKET_SECRET_KEY'),
      },
      region: 'idn',
      endpoint: this.configService.get<string>('BUCKET_ENDPOINT'),
    });
    // Mendapatkan bagian URL setelah garis miring terakhir
    const afterLastSlash = url.substring(url.lastIndexOf('/') + 1);

    // Mendapatkan bagian nama file tanpa ekstensi
    const keyToDelete = afterLastSlash.split('.')[0];

    const command = new DeleteObjectCommand({
      Bucket: this.configService.get<string>('BUCKET_NAME'),
      Key: keyToDelete,
    });
    try {
      await s3.send(command);
    } catch (err) {
      this.logger.error(err);
    }
  }
}
