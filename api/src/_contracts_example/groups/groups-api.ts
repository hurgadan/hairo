import { ApiBase } from '../api-base';
import { CreateGroup } from './create-group.type';
import { Group } from './group.type';
import { UpdateGroup } from './update-group.type';

export abstract class GroupsApi implements ApiBase {
  public readonly baseUrl = '/groups';

  protected abstract createGroup(data: CreateGroup): Promise<Group>;
  protected abstract getGroups(): Promise<Group[]>;
  protected abstract getGroup(id: string): Promise<Group>;
  protected abstract updateGroup(id: string, data: UpdateGroup): Promise<Group>;
}
