import { MutantRunOptions, MutantRunResult, TestRunner2 } from '@stryker-mutator/api/test_runner';

import { StrykerOptions } from '../../../api/src-generated/stryker-core';

import TestRunnerDecorator from './TestRunnerDecorator';

/**
 * Wraps a test runner and implements the retry functionality.
 */
export default class MaxTestRunnerReuseDecorator extends TestRunnerDecorator {
  private runs = 0;
  private readonly restartAfter;

  constructor(testRunnerProducer: () => TestRunner2, options: Pick<StrykerOptions, 'maxTestRunnerReuse'>) {
    super(testRunnerProducer);

    this.restartAfter = options.maxTestRunnerReuse || 0;
  }

  public async mutantRun(options: MutantRunOptions): Promise<MutantRunResult> {
    this.runs++;
    if (this.restartAfter > 0 && this.runs > this.restartAfter) {
      await this.recover();
    }

    return super.mutantRun(options);
  }

  private async recover(): Promise<void> {
    await this.dispose();
    this.createInnerRunner();
    return this.init();
  }

  public dispose(): Promise<any> {
    this.runs = 0;
    return super.dispose();
  }
}
