/**
 * Decorator @Public(): marca rota como pública (não exige JWT quando JWT_REQUIRED=true).
 */
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
