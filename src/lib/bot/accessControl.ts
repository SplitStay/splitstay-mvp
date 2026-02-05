import type { AccessControl } from './types';

export const createAccessControl = (adminNumbers: string): AccessControl => {
  const admins = new Set(
    adminNumbers
      .split(',')
      .map((n) => n.trim())
      .filter((n) => n.length > 0),
  );

  return {
    isAdmin: (phone: string): boolean => admins.has(phone),
  };
};
