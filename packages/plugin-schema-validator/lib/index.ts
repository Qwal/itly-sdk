
/* eslint-disable no-unused-vars, class-methods-use-this */
import Ajv from 'ajv';
import {
  ItlyEvent,
  ItlyPluginBase,
  ValidationResponse,
} from '@itly/sdk-core';

export type ValidationResponseHandler = (
  validation: ValidationResponse,
  event: ItlyEvent,
  schema: any
) => any;

const DEFAULT_VALIDATION_RESPONSE_HANDLER: ValidationResponseHandler = () => {};

const SYSTEM_EVENTS = ['identify', 'context', 'group', 'page'];
function isSystemEvent(name: string) {
  return SYSTEM_EVENTS.includes(name);
}

function isEmpty(obj: any) {
  return obj === undefined || Object.keys(obj).length === 0;
}

export default class SchemaValidatorPlugin extends ItlyPluginBase {
  static ID: string = 'schema-validator';

  private schemas: { [id: string]: any };

  private validators: { [id: string]: any };

  private ajv: Ajv.Ajv;

  private validationErrorHandler: ValidationResponseHandler;

  constructor(schemas: { [id: string]: any }, validationErrorHandler?: ValidationResponseHandler) {
    super();
    this.schemas = schemas;
    this.ajv = new Ajv();
    this.validators = {};
    this.validationErrorHandler = validationErrorHandler || DEFAULT_VALIDATION_RESPONSE_HANDLER;
  }

  id = () => SchemaValidatorPlugin.ID;

  validate(event: ItlyEvent): ValidationResponse {
    const schemaKey = this.getSchemaKey(event);
    // Check that we have a schema for this event
    if (!this.schemas[schemaKey]) {
      if (isSystemEvent(schemaKey)) {
        // pass system events by default
        if (isEmpty(event.properties)) {
          return {
            valid: true,
            pluginId: this.id(),
          };
        }

        return {
          valid: false,
          message: `'${event.name}' schema is empty but properties were found. properties=${JSON.stringify(event.properties)}`,
          pluginId: this.id(),
        };
      }

      return {
        valid: false,
        message: `Event ${event.name} not found in tracking plan.`,
        pluginId: this.id(),
      };
    }

    // Compile validator for this event if needed
    if (!this.validators[schemaKey]) {
      this.validators[schemaKey] = this.ajv.compile(this.schemas[schemaKey]);
    }

    const validator = this.validators[schemaKey];
    if (event.properties && !(validator(event.properties) === true)) {
      const errors = validator.errors.map((e: any) => {
        let extra = '';
        if (e.keyword === 'additionalProperties') {
          extra = ` (${e.params.additionalProperty})`;
        }
        return `\`properties${e.dataPath}\` ${e.message}${extra}.`;
      }).join(' ');

      return {
        valid: false,
        message: `Passed in ${event.name} properties did not validate against your tracking plan. ${errors}`,
        pluginId: this.id(),
      };
    }

    return {
      valid: true,
      pluginId: this.id(),
    };
  }

  validationError(validation: ValidationResponse, event: ItlyEvent) {
    const schemaKey = this.getSchemaKey(event);
    this.validationErrorHandler(validation, event, this.schemas[schemaKey]);
  }

  getSchemaKey(event: ItlyEvent) {
    return event.name;
  }
}
