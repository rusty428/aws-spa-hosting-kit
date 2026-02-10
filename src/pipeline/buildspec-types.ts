/**
 * BuildSpec types for CodeBuild configuration
 */

export interface BuildSpec {
  version: string;
  phases: BuildPhases;
  artifacts: BuildArtifacts;
  env?: BuildEnvironment;
}

export interface BuildPhases {
  install?: BuildPhase;
  pre_build?: BuildPhase;
  build?: BuildPhase;
  post_build?: BuildPhase;
}

export interface BuildPhase {
  commands: string[];
  'runtime-versions'?: Record<string, string>;
}

export interface BuildArtifacts {
  files: string[];
  'base-directory': string;
}

export interface BuildEnvironment {
  variables?: Record<string, string>;
}
