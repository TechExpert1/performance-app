export interface ISkillLevel {
  name: string;
  image: string;
}

export interface ISkillLevelSet {
  name: string;
  levels: ISkillLevel[];
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
