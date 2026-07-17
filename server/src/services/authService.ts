import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { PrismaClient, Currency } from '@prisma/client';

const prisma = new PrismaClient();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

export const loginWithGoogle = async (idToken: string, fallbackCurrency?: Currency) => {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  
  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    const error = new Error('Invalid Google token: Email missing');
    (error as any).status = 400;
    throw error;
  }

  const { email, sub: googleId, name } = payload;

  let user = await prisma.user.findFirst({
    where: { OR: [{ googleId }, { email }] }
  });

  if (user) {
    // If user exists but lacks googleId, link the account
    if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId }
      });
    }
  } else {
    // Create new user
    user = await prisma.user.create({
      data: {
        email,
        name,
        googleId,
        passwordHash: null,
        currency: fallbackCurrency || Currency.PLN,
      }
    });
  }

  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
};
