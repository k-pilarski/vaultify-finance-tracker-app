import bcrypt from 'bcrypt';
import { PrismaClient, Currency } from '@prisma/client';

const prisma = new PrismaClient();

export const register = async (email: string, password: string, name?: string, currency?: Currency) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const error = new Error('User already exists');
    (error as any).status = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      currency: currency || Currency.PLN,
    },
    select: {
      id: true,
      email: true,
      name: true,
      currency: true,
      createdAt: true,
      updatedAt: true,
    }
  });

  return user;
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    const error = new Error('Invalid email or password');
    (error as any).status = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    (error as any).status = 401;
    throw error;
  }

  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
};
