import { names, Tree } from '@nx/devkit';
import {
  determineProjectNameAndRootOptions,
  ensureRootProjectName,
} from '@nx/devkit/src/generators/project-name-and-root-utils';
import { NormalizedSchema, Schema } from '../schema';
import { isUsingTsSolutionSetup } from '@nx/js/src/utils/typescript/ts-solution-setup';

export async function normalizeOptions(
  host: Tree,
  options: Schema
): Promise<NormalizedSchema> {
  await ensureRootProjectName(options, 'application');
  const {
    projectName,
    names: projectNames,
    projectRoot: appProjectRoot,
    importPath,
  } = await determineProjectNameAndRootOptions(host, {
    name: options.name,
    projectType: 'application',
    directory: options.directory,
    rootProject: options.rootProject,
  });
  options.rootProject = appProjectRoot === '.';

  const isUsingTsSolutionConfig = isUsingTsSolutionSetup(host);
  const appProjectName =
    !isUsingTsSolutionConfig || options.name ? projectName : importPath;

  const e2eProjectName = options.rootProject ? 'e2e' : `${appProjectName}-e2e`;
  const e2eProjectRoot = options.rootProject ? 'e2e' : `${appProjectRoot}-e2e`;

  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  const normalized = {
    ...options,
    name: projectNames.projectFileName,
    projectName: appProjectName,
    appProjectRoot,
    importPath,
    e2eProjectName,
    e2eProjectRoot,
    parsedTags,
    style: options.style ?? 'none',
    isUsingTsSolutionConfig,
    useProjectJson: options.useProjectJson ?? !isUsingTsSolutionConfig,
  } as NormalizedSchema;

  normalized.unitTestRunner ??= 'vitest';
  normalized.e2eTestRunner = normalized.e2eTestRunner ?? 'playwright';

  return normalized;
}
