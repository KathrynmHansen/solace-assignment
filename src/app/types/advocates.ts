export type Advocate = {
  id: number;
  firstName: string;
  lastName: string;
  city: string;
  degree: string;
  specialties: unknown;
  yearsOfExperience: number;
  phoneNumber: number;
  createdAt: Date;
};

export type GetAdvocatesResponse = {
  data: Advocate[];
};