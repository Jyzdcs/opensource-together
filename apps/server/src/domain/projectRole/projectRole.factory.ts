import { ProjectRole } from './projectRole.entity';
import { Result } from '@/shared/result';
import { TechStackFactory } from '@/domain/techStack/techStack.factory';

export class ProjectRoleFactory {
  static create({
    roleTitle,
    skillSet,
    description,
    isFilled,
  }: {
    roleTitle: string;
    skillSet: Array<{ id: string }>;
    description: string;
    isFilled: boolean;
  }): Result<ProjectRole> {
    const techStackResult = TechStackFactory.createManyFromIds(skillSet);
    if (!techStackResult.success) {
      return Result.fail(techStackResult.error);
    }
    return Result.ok(
      new ProjectRole({
        roleTitle,
        skillSet: techStackResult.value,
        description,
        isFilled,
      }),
    );
  }

  static createMany(
    projectRoles: Array<{
      roleTitle: string;
      skillSet: Array<{ id: string }>;
      description: string;
      isFilled: boolean;
    }>,
  ): Result<ProjectRole[]> {
    const results: ProjectRole[] = [];
    const errors: string[] = [];

    for (const projectRole of projectRoles) {
      const projectRoleResult = this.create({
        roleTitle: projectRole.roleTitle,
        skillSet: projectRole.skillSet,
        description: projectRole.description,
        isFilled: projectRole.isFilled,
      });

      if (!projectRoleResult.success) {
        errors.push(projectRoleResult.error);
      } else {
        results.push(projectRoleResult.value);
      }
    }

    if (errors.length > 0) {
      return Result.fail(
        `Erreurs lors de la création des rôles de projet: ${errors.join(', ')}`,
      );
    }

    return Result.ok(results);
  }

  static fromPersistence(
    prismaProjectRoles: {
      id: string;
      projectId: string;
      roleTitle: string;
      description: string;
      isFilled: boolean;
      skillSet: {
        id: string;
        name: string;
        iconUrl: string;
      }[];
    }[],
  ): Result<ProjectRole[]> {
    const projectRoles: ProjectRole[] = [];
    const errors: string[] = [];

    for (const prismaRole of prismaProjectRoles) {
      // Transformer le skillSet pour ce rôle
      const skillSetResult = TechStackFactory.fromPersistence(
        prismaRole.skillSet || [],
      );

      // Si la transformation échoue, échouer rapidement
      if (!skillSetResult.success) {
        errors.push(`Role ${prismaRole.id}: ${skillSetResult.error}`);
        continue; // Passer au rôle suivant
      }

      // Créer un ProjectRole de domaine et l'ajouter au tableau
      try {
        const projectRole = new ProjectRole({
          id: prismaRole.id,
          projectId: prismaRole.projectId,
          roleTitle: prismaRole.roleTitle,
          description: prismaRole.description,
          isFilled: prismaRole.isFilled,
          skillSet: skillSetResult.value, // Le skillSet transformé
        });
        projectRoles.push(projectRole);
      } catch (error) {
        errors.push(`Role ${prismaRole.id}: ${error}`);
        continue; // Passer au rôle suivant
      }
    }

    if (errors.length > 0) {
      return Result.fail(errors.join(', '));
    }

    return Result.ok(projectRoles);
  }
}
