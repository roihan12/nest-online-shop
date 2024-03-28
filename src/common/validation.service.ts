import { Injectable } from '@nestjs/common';
import { ZodType } from 'zod';

@Injectable()
export class ValidationService {
  /**
   * Validates the given data against the provided Zod type and returns the parsed data.
   *
   * @param {ZodType<T>} zodType - The Zod type to validate against.
   * @param {T} data - The data to be validated.
   * @return {T} The parsed and validated data.
   */
  validate<T>(zodType: ZodType<T>, data: T): T {
    return zodType.parse(data);
  }
}
