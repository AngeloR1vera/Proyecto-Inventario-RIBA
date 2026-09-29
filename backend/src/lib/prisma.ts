import { PrismaClient } from '@prisma/client';

// Instancia única del cliente de Prisma para conectarse a Supabase
export const prisma = new PrismaClient();