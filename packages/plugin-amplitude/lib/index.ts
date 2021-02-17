/* eslint-disable no-unused-vars, class-methods-use-this */
/* eslint-disable no-restricted-syntax, no-prototype-builtins, no-continue */
import {
  Event, EventOptions, Properties, Plugin,
} from '@itly/sdk';

export type AmplitudeOptions = {};

export interface AmplitudeMetadata {
  callback?: (...args: any[]) => void;
}

/**
 * Amplitude Browser Plugin for Iteratively SDK
 */
export class AmplitudePlugin extends Plugin {
  get amplitude(): any {
    // eslint-disable-next-line no-restricted-globals
    const s: any = typeof self === 'object' && self.self === self && self;
    return s && s.amplitude;
  }

  constructor(
    private apiKey: string,
    private options?: AmplitudeOptions,
  ) {
    super('amplitude');
  }

  load() {
    if (!this.amplitude) {
      // Amplitude (https://help.amplitude.com/hc/en-us/articles/115001361248-JavaScript-SDK-Installation)
      // @ts-ignore
      // eslint-disable-next-line
      (function(e,t){var n=e.amplitude||{_q:[],_iq:{}};var r=t.createElement("script");r.type="text/javascript";r.integrity="sha384-girahbTbYZ9tT03PWWj0mEVgyxtZoyDF9KVZdL+R53PP5wCY0PiVUKq0jeRlMx9M";r.crossOrigin="anonymous";r.async=true;r.src="https://cdn.amplitude.com/libs/amplitude-7.2.1-min.gz.js";r.onload=function(){if(!e.amplitude.runQueuedFunctions){console.log("[Amplitude] Error: could not load SDK")}};var i=t.getElementsByTagName("script")[0];i.parentNode.insertBefore(r,i);function s(e,t){e.prototype[t]=function(){this._q.push([t].concat(Array.prototype.slice.call(arguments,0)));return this}}var o=function(){this._q=[];return this};var a=["add","append","clearAll","prepend","set","setOnce","unset"];for(var c=0;c<a.length;c++){s(o,a[c])}n.Identify=o;var u=function(){this._q=[];return this};var l=["setProductId","setQuantity","setPrice","setRevenueType","setEventProperties"];for(var p=0;p<l.length;p++){s(u,l[p])}n.Revenue=u;var d=["init","logEvent","logRevenue","setUserId","setUserProperties","setOptOut","setVersionName","setDomain","setDeviceId","enableTracking","setGlobalUserProperties","identify","clearUserProperties","setGroup","logRevenueV2","regenerateDeviceId","groupIdentify","onInit","logEventWithTimestamp","logEventWithGroups","setSessionId","resetSessionId"];function v(e){function t(t){e[t]=function(){e._q.push([t].concat(Array.prototype.slice.call(arguments,0)))}}for(var n=0;n<d.length;n++){t(d[n])}}v(n);n.getInstance=function(e){e=(!e||e.length===0?"$default_instance":e).toLowerCase();if(!n._iq.hasOwnProperty(e)){n._iq[e]={_q:[]};v(n._iq[e])}return n._iq[e]};e.amplitude=n})(window,document);
      this.amplitude.getInstance().init(this.apiKey, undefined, this.options);
    }
  }

  identify(userId: string | undefined, properties?: Properties, options?: EventOptions) {
    if (userId) {
      this.amplitude.getInstance().setUserId(userId);
    }

    if (properties) {
      const identifyObject = new this.amplitude.Identify();
      for (const p in properties) {
        if (!properties.hasOwnProperty(p)) {
          continue;
        }

        identifyObject.set(p, (properties as any)[p]);
      }

      const { callback } = (options?.metadata?.[this.id] ?? {}) as Partial<AmplitudeMetadata>;
      this.amplitude.getInstance().identify(identifyObject, callback);
    }
  }

  track(userId: string | undefined, event: Event) {
    const { callback } = (event.metadata?.[this.id] ?? {}) as Partial<AmplitudeMetadata>;
    this.amplitude.getInstance().logEvent(
      event.name,
      event.properties,
      callback,
    );
  }

  reset() {
    this.amplitude.getInstance().setUserId(null);
    this.amplitude.getInstance().regenerateDeviceId();
  }
}

export default AmplitudePlugin;
