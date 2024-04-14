import { HttpException, Inject, Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Image, Product, Variant } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ProductResponse } from 'src/model/product.model';
import { WebResponse } from 'src/model/web.model';

@Injectable()
export class SearchService {
  private indexName = 'products';
  constructor(
    private elasticSearch: ElasticsearchService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  async indexProductInElasticsearch(
    product: Product,
    images: Image[],
    variant: Variant[],
  ): Promise<void> {
    // Nama indeks untuk produk

    // Buat indeks baru dengan pengaturan dan mappings
    await this.elasticSearch.indices.create({
      index: this.indexName,
      body: {
        settings: {
          analysis: {
            analyzer: {
              autocomplete_analyzer: {
                type: 'custom',
                tokenizer: 'autocomplete',
                filter: ['lowercase'],
              },
            },
            tokenizer: {
              autocomplete: {
                type: 'edge_ngram',
                min_gram: 1,
                max_gram: 30,
                token_chars: ['letter', 'digit'],
              },
            },
          },
        },
        mappings: {
          properties: {
            name: {
              type: 'text',
              analyzer: 'autocomplete_analyzer', // Pengaturan analisis teks untuk autocompletion
              search_analyzer: 'standard', // Analisis teks untuk pencarian standar
            },
            brand_id: { type: 'keyword' },
            category_id: { type: 'keyword' },
            price: { type: 'integer' },
            description: { type: 'text' }, // Gunakan 'text' untuk field yang besar
            stock_sold: { type: 'integer' },
            weight: { type: 'integer' },
            status: { type: 'keyword' },
            stock: { type: 'integer' },
            is_featured: { type: 'boolean' },
            is_variant: { type: 'boolean' },
            created_at: { type: 'date' },
            updated_at: { type: 'date' },
            images: {
              type: 'nested',
            },
            variants: {
              type: 'nested',
            },
          },
        },
      },
    });
    try {
      // Indexkan data produk ke Elasticsearch
      await this.elasticSearch.index({
        index: this.indexName,
        id: product.id,
        body: {
          name: product.name,
          brand_id: product.brand_id,
          category_id: product.category_id,
          price: product.price,
          weight: product.weight,
          stock: product.stock,
          stock_sold: product.stock_sold,
          description: product.description,
          is_featured: product.is_featured,
          is_variant: product.is_variant,
          status: product.status,
          images: images,
          variants: variant,
          created_at: product.created_at,
          updated_at: product.updated_at,
        },
      });

      // Refresh indeks untuk membuat data tersedia untuk pencarian
      await this.elasticSearch.indices.refresh({ index: this.indexName });
    } catch (error) {
      this.logger.error(error);
    }
  }

  async searchProduct(
    keyword: string,
    page: number = 1,
    size: number = 10,
  ): Promise<WebResponse<ProductResponse[]>> {
    console.log(keyword);
    try {
      const products = await this.querySearchResult(
        {
          must: [
            {
              term: {
                status: 'ACTIVE',
              },
            },
          ],
          should: [
            {
              fuzzy: {
                name: {
                  value: keyword,
                  fuzziness: 'AUTO',
                  prefix_length: 0,
                },
              },
            },
            {
              multi_match: {
                query: keyword,
                fields: ['name', 'description', 'variants'],
              },
            },
            {
              match: {
                description: {
                  query: keyword,
                  fuzziness: 'AUTO',
                },
              },
            },
            {
              match: {
                variants: {
                  query: keyword,
                  fuzziness: 'AUTO',
                },
              },
            },
          ],
          minimum_should_match: 1,
        },
        page,
        size,
      );

      return {
        status: true,
        message: 'Search Success',
        data: products,
        paging: {
          count_item: products.length,
          current_page: page,
          size,
          total_page: Math.ceil(products.length / size),
        },
      };
    } catch (error: any) {
      this.logger.error(error);
      throw new HttpException('Error on search', 500);
    }
  }

  async remove(productId: string) {
    this.elasticSearch.deleteByQuery({
      index: this.indexName,
      body: {
        query: {
          match: {
            id: productId,
          },
        },
      },
    });
  }

  async update(product: Product, images: Image[], variant: Variant[]) {
    try {
      const script = `
      ctx._source.product.name = '${product.name}';
      ctx._source.product.brand_id = '${product.brand_id}';
      ctx._source.product.category_id = '${product.category_id}';
      ctx._source.product.price = ${product.price};
      ctx._source.product.weight = ${product.weight};
      ctx._source.product.stock = ${product.stock};
      ctx._source.product.stock_sold = ${product.stock_sold};
      ctx._source.product.description = '${product.description}';
      ctx._source.product.is_featured = ${product.is_featured};
      ctx._source.product.is_variant = ${product.is_variant};
      ctx._source.product.status = '${product.status}';
      ctx._source.product.images = ${JSON.stringify(images)};
      ctx._source.product.variants = ${JSON.stringify(variant)};
      ctx._source.product.updated_at = '${new Date().toISOString()}';
    `;

      const response = await this.elasticSearch.updateByQuery({
        index: this.indexName,
        body: {
          query: {
            match: {
              _id: product.id,
            },
          },
          script: {
            source: script,
          },
        },
      });

      return response;
    } catch (error) {
      throw new HttpException('Elasticsearch Error', 500);
    }
  }

  private async querySearchResult(
    searchQuery: any,
    page: number = 1,
    size: number = 10,
  ): Promise<ProductResponse[]> {
    try {
      return await this.elasticSearch
        .search<ProductResponse>({
          index: this.indexName,
          query: {
            bool: searchQuery,
          },
          from: (page - 1) * size,
          size: size,
        })
        .then((response) =>
          response.hits.hits.map((product) => product._source),
        )
        .catch((error) => {
          console.log('erorrrrrrrr', error);
          throw new HttpException('Error on search', 500);
        });
    } catch (error) {
      console.log(error);
      throw new HttpException('Error on search', 500);
    }
  }
}
