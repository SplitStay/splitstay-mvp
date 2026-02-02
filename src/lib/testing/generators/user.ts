import { faker } from '@faker-js/faker';
import type { z } from 'zod';
import { publicUserRowSchema } from '@/lib/schemas/database.schemas';

export type User = z.infer<typeof publicUserRowSchema>;

/**
 * Creates a mock SplitStay user with all required fields.
 *
 * Provides realistic fake data while allowing typed overrides
 * for specific test scenarios.
 */
export const createUser = (overrides: Partial<User> = {}): User => {
  const now = new Date().toISOString();

  const user: User = {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    imageUrl: faker.image.avatar(),
    bio: faker.lorem.sentence(),
    birthPlace: faker.location.city(),
    currentPlace: faker.location.city(),
    dayOfBirth: faker.number.int({ min: 1, max: 28 }),
    monthOfBirth: faker.number.int({ min: 1, max: 12 }),
    yearOfBirth: faker.number.int({ min: 1960, max: 2005 }),
    gender: faker.helpers.arrayElement(['male', 'female', 'other', null]),
    instagramUrl: null,
    languages: null,
    learningLanguages: null,
    mostInfluencedCountry: null,
    mostInfluencedCountryDescription: null,
    mostInfluencedExperience: null,
    personalizedLink: null,
    profileCreated: true,
    profilePicture: null,
    role_id: null,
    shareModalShown: false,
    travelPhotos: null,
    travelTraits: null,
    whatsapp: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };

  return publicUserRowSchema.parse(user);
};
