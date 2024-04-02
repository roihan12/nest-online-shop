import { Type, applyDecorators } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiProperty,
  getSchemaPath,
} from '@nestjs/swagger';

export class WebResponse<T> {
  @ApiProperty({
    example: 'true',
  })
  status: boolean;
  @ApiProperty({
    example: 'Register success',
  })
  message: string;

  data?: T;
  errors?: string;
}

export class BadRequestResponse {
  @ApiProperty({
    example: 400,
  })
  statusCode: number;
  @ApiProperty({
    example: [
      'full_name - Required',
      'username - Required',
      'email - Required',
      'password - Password is required',
      'confirmPassword - Please confirm your password',
    ],
  })
  message: Array<string>;
  @ApiProperty({
    example: 'Bad Request',
  })
  errors: string;
}

export class UnauthorizedResponse {
  @ApiProperty({
    example: 401,
  })
  statusCode: number;
  @ApiProperty({
    example: ['Unauthorized'],
  })
  message: Array<string>;
  @ApiProperty({
    example: 'UnauthorizedException',
  })
  errors: string;
}

export class ForbiddenResponse {
  @ApiProperty({
    example: 403,
  })
  statusCode: number;
  @ApiProperty({
    example: ['Forbidden'],
  })
  message: Array<string>;
  @ApiProperty({
    example: 'ForbiddenException',
  })
  errors: string;
}
export class InternalServerErrorResponse {
  @ApiProperty({
    example: 500,
  })
  statusCode: number;
  @ApiProperty({
    example: [
      'An unexpected error occurred while processing your request.',
      'Please try again later.',
    ],
  })
  message: Array<string>;
  @ApiProperty({
    example: 'Internal Server Error',
  })
  errors: string;
}

export const ApiSucessResponse = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiExtraModels(WebResponse, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(WebResponse) },
          {
            properties: {
              data: {
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    }),
  );
};

export const ApiCreateResponse = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiExtraModels(WebResponse, model),
    ApiCreatedResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(WebResponse) },
          {
            properties: {
              data: {
                oneOf: [{ $ref: getSchemaPath(model) }],
              },
            },
          },
        ],
      },
    }),
  );
};
