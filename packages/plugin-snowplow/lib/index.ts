/* eslint-disable no-unused-vars, class-methods-use-this, import/no-unresolved */
import {
  Event, PageOptions, TrackOptions, Properties, RequestLoggerPlugin, PluginLoadOptions,
} from '@itly/sdk';

export type SnowplowOptions = {
  url: string;
  config?: {};
};

export interface SnowplowContext {
  schema: string;
  data: { [key: string]: any };
}

export type SnowplowCallback = (...args: any[]) => void;

export interface SnowplowCallOptions {
  callback?: SnowplowCallback;
}
export interface SnowplowAliasOptions extends SnowplowCallOptions {}
export interface SnowplowIdentifyOptions extends SnowplowCallOptions {}
export interface SnowplowGroupOptions extends SnowplowCallOptions {}
export interface SnowplowPageOptions extends SnowplowCallOptions {}
export interface SnowplowTrackOptions extends SnowplowCallOptions {
  options?: {
    contexts?: SnowplowContext[];
  },
}

/**
 * Snowplow Browser Plugin for Iteratively SDK
 */
export class SnowplowPlugin extends RequestLoggerPlugin {
  get snowplow(): any {
    // eslint-disable-next-line no-restricted-globals
    const s: any = typeof self === 'object' && self.self === self && self;
    return s && s.snowplow;
  }

  constructor(
    readonly vendor: string,
    private options: SnowplowOptions,
  ) {
    super('snowplow');
  }

  load(options: PluginLoadOptions) {
    super.load(options);
    if (!this.snowplow) {
      // Snowplow (https://github.com/snowplow/snowplow/wiki/1-General-parameters-for-the-Javascript-tracker#21-loading-snowplowjs)
      // @ts-ignore
      // eslint-disable-next-line
      ;(function(p,l,o,w,i,n,g){if(!p[i]){p.GlobalSnowplowNamespace=p.GlobalSnowplowNamespace||[];p.GlobalSnowplowNamespace.push(i);p[i]=function(){(p[i].q=p[i].q||[]).push(arguments)};p[i].q=p[i].q||[];n=l.createElement(o);g=l.getElementsByTagName(o)[0];n.async=1;n.src=w;g.parentNode.insertBefore(n,g)}}(window,document,"script","//d1fc8wv8zag5ca.cloudfront.net/2.10.2/sp.js","snowplow"));
      this.snowplow('newTracker', 'itly', this.options.url, this.options.config);
    }
  }

  identify(userId: string | undefined, properties?: Properties) {
    this.snowplow('setUserId', userId);
  }

  page(userId?: string, category?: string, name?: string, properties?: Properties, options?: PageOptions) {
    const { callback } = this.getPluginCallOptions<SnowplowPageOptions>(options);
    const responseLogger = this.logger!.logRequest('page', `${userId}, ${category}, ${name}, ${JSON.stringify(properties)}`);
    this.snowplow('trackPageView', name, undefined, undefined, undefined, (...args: any[]) => {
      responseLogger.success(`done: ${JSON.stringify(args)}`);
      callback?.(...args);
    });
  }

  track(userId: string | undefined, { name, properties, version }: Event, options?: TrackOptions) {
    const schemaVer = version && version.replace(/\./g, '-');
    const { callback, options: snowplowOptions } = this.getPluginCallOptions<SnowplowTrackOptions>(options);
    const responseLogger = this.logger!.logRequest('track', `${userId}, ${name}, ${JSON.stringify(properties)}`);
    this.snowplow('trackSelfDescribingEvent', {
      schema: `iglu:${this.vendor}/${name}/jsonschema/${schemaVer}`,
      data: properties,
    }, snowplowOptions?.contexts, undefined, (...args: any[]) => {
      responseLogger.success(`done: ${JSON.stringify(args)}`);
      callback?.(...args);
    });
  }
}

export default SnowplowPlugin;
