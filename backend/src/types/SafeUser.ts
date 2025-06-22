import { User } from '../generated/prisma';

export type SafeUser = Omit<User, 'password'>; 