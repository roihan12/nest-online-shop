import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

@Module({
  imports: [
    ConfigModule,
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        node: configService.get('ELASTICSEARCH_NODE'),
        auth: {
          username: configService.get('ELASTICSEARCH_USERNAME'),
          password: configService.get('ELASTIC_PASSWORD'),
        },
        maxRetries: configService.get('ELASTICSEARCH_MAX_RETRIES'),
        requestTimeout: configService.get('ELASTICSEARCH_REQ_TIMEOUT'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
