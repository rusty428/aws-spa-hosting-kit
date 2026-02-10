import { HostingConfig } from '../config/types';
import { BuildSpec } from './buildspec-types';

/**
 * PipelineConfigGenerator generates CodeBuild buildspec configurations
 */
export class PipelineConfigGenerator {
  /**
   * Generate a CodeBuild buildspec from configuration
   * @param config Hosting configuration
   * @returns BuildSpec object
   */
  static generateBuildSpec(config: HostingConfig): BuildSpec {
    const installCommand = config.build?.installCommand || 'npm ci';
    const buildCommand = config.build?.buildCommand || 'npm run build';
    const outputDirectory = config.build?.outputDirectory || 'dist';

    return {
      version: '0.2',
      phases: {
        install: {
          'runtime-versions': {
            nodejs: '20' // Use Node.js 20 LTS
          },
          commands: [installCommand]
        },
        build: {
          commands: [buildCommand]
        }
      },
      artifacts: {
        files: ['**/*'],
        'base-directory': outputDirectory
      }
    };
  }
}
