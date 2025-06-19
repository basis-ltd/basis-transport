export enum Gender {
  MALE = 'M',
  FEMALE = 'F',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export const getGenderLabel = (gender: Gender) => {
  return (
    Object.entries(Gender).find(([, value]) => value === gender)?.[0] || 'N/A'
  );
};
