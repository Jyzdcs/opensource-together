import { Result } from '@/shared/result';
import { Project } from './project.entity';

export class ProjectFactory {
  static create(
    id: string,
    title: string,
    description: string,
    link: string | null,
    status: any,
    userId: string,
    techStacks: any,
  ): Result<Project> {
    return Result.ok(
      new Project({
        id: id,
        title: title,
        description: description,
        link: link,
        status: status,
        userId: userId,
        techStacks: techStacks,
      }),
    );
  }
}
