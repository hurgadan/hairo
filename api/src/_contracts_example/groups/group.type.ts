import { GroupMember } from './group-member.type';

export interface Group {
  id: string;
  name: string;
  duration: number;
  members: GroupMember[];
  createdAt: string;
  updatedAt: string;
}
