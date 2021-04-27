/* eslint-disable no-unused-vars, class-methods-use-this, import/no-unresolved */
import {
  Event, Properties, RequestLoggerPlugin, PluginLoadOptions, ResponseLogger, PluginCallOptions,
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

export interface SnowplowCallOptions extends PluginCallOptions {}
export interface SnowplowAliasOptions extends SnowplowCallOptions {}
export interface SnowplowIdentifyOptions extends SnowplowCallOptions {}
export interface SnowplowGroupOptions extends SnowplowCallOptions {}
export interface SnowplowPageOptions extends SnowplowCallOptions {
  callback?: SnowplowCallback;
  contexts?: SnowplowContext[];
}
export interface SnowplowTrackOptions extends SnowplowCallOptions {
  callback?: SnowplowCallback;
  contexts?: SnowplowContext[];
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
      // Snowplow (https://docs.snowplowanalytics.com/docs/collecting-data/collecting-from-own-applications/javascript-tracker/web-quick-start-guide/)
      // @ts-ignore
      // eslint-disable-next-line
      ;(function(p,l,o,w,i,n,g){if(!p[i]){p.GlobalSnowplowNamespace=p.GlobalSnowplowNamespace||[];p.GlobalSnowplowNamespace.push(i);p[i]=function(){(p[i].q=p[i].q||[]).push(arguments)};p[i].q=p[i].q||[];n=l.createElement(o);g=l.getElementsByTagName(o)[0];n.async=1;n.src=w;g.parentNode.insertBefore(n,g)}}(window,document,"script","//cdn.jsdelivr.net/gh/snowplow/sp-js-assets@2.17.3/sp.js","snowplow"));
    }
    this.snowplow('newTracker', 'itly', this.options.url, this.options.config);
  }

  identify(userId: string | undefined, properties?: Properties) {
    this.snowplow('setUserId:itly', userId);
  }

  page(userId?: string, category?: string, name?: string, properties?: Properties, options?: SnowplowPageOptions) {
    const { callback, contexts } = options ?? {};
    const responseLogger = this.logger.logRequest(
      'page',
      `${userId}, ${category}, ${name}, ${this.toJsonStr(properties, contexts)}`,
    );
    this.snowplow('trackPageView:itly', name, undefined, contexts, undefined, this.wrapCallback(responseLogger, callback));
  }

  track(userId: string | undefined, { name, properties, version }: Event, options?: SnowplowTrackOptions) {
    const schemaVer = version && version.replace(/\./g, '-');
    const { callback, contexts } = options ?? {};
    const responseLogger = this.logger.logRequest(
      'track',
      `${userId}, ${name}, ${this.toJsonStr(properties, contexts)}`,
    );
    this.snowplow('trackSelfDescribingEvent:itly', {
      schema: `iglu:${this.vendor}/${name}/jsonschema/${schemaVer}`,
      data: properties,
    }, contexts, undefined, this.wrapCallback(responseLogger, callback));
  }

  private toJsonStr = (properties?: Properties, contexts?: SnowplowContext[]) =>
    `${JSON.stringify(properties)}${contexts ? `, ${JSON.stringify(contexts)}` : ''}`;

  private wrapCallback(responseLogger: ResponseLogger, callback: SnowplowCallback | undefined) {
    return (...args: any[]) => {
      responseLogger.success(`done: ${JSON.stringify(args)}`);
      callback?.(...args);
    };
  }
}

export default SnowplowPlugin;
