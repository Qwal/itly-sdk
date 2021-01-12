---
to: packages/sdk-<%= name %>/lib/index.ts
---
/* eslint-disable no-unused-vars, class-methods-use-this */
import {
  Itly as ItlySdk,
  Options,
  Event,
  Properties,
  Plugin,
  ValidationOptions,
  ValidationResponse,
} from '<%= itlySdkModule %>';

export {
  Options,
  Plugin,
  Event,
  Properties,
  ValidationOptions,
  ValidationResponse,
};

export class Itly {
  private itly: ItlySdk;

  constructor() {
    this.itly = new ItlySdk();
  }

  load = (
    options: Options,
  ) => this.itly.load(options);

  alias = (
    userId: string, previousId?: string,
  ) => this.itly.alias(userId, previousId);

  /**
   * Identify a user and set or update that user's properties.
   * @param userId The user's ID.
   */
  identify = (
    userId: string | undefined, identifyProperties?: Properties,
  ) => this.itly.identify(userId, identifyProperties);

  group = (
    userId:string | undefined, groupId: string, groupProperties?: Properties,
  ) => this.itly.group(userId, groupId, groupProperties);

  page = (
    userId: string | undefined, category: string, name: string, pageProperties?: Properties,
  ) => this.itly.page(userId, category, name, pageProperties);

  track = (
    userId: string | undefined,
    event: Event,
  ) => this.itly.track(userId, event);

  reset = () => this.itly.reset();
}

export default Itly;
