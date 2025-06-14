/* tslint:disable */
/* eslint-disable */
/**
 * Subsidy Automation API
 * API for the 補助金AI platform. Covers authentication, company profiles, subsidy search & matching, AI‐generated document drafts, application submission, and progress tracking.
 *
 * The version of the OpenAPI document: 0.1.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from "../runtime";
/**
 *
 * @export
 * @interface GeneratedSection
 */
export interface GeneratedSection {
  /**
   *
   * @type {string}
   * @memberof GeneratedSection
   */
  title?: string;
  /**
   *
   * @type {string}
   * @memberof GeneratedSection
   */
  content?: string;
  /**
   *
   * @type {boolean}
   * @memberof GeneratedSection
   */
  editable?: boolean;
}

/**
 * Check if a given object implements the GeneratedSection interface.
 */
export function instanceOfGeneratedSection(
  value: object,
): value is GeneratedSection {
  return true;
}

export function GeneratedSectionFromJSON(json: any): GeneratedSection {
  return GeneratedSectionFromJSONTyped(json, false);
}

export function GeneratedSectionFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean,
): GeneratedSection {
  if (json == null) {
    return json;
  }
  return {
    title: json["title"] == null ? undefined : json["title"],
    content: json["content"] == null ? undefined : json["content"],
    editable: json["editable"] == null ? undefined : json["editable"],
  };
}

export function GeneratedSectionToJSON(json: any): GeneratedSection {
  return GeneratedSectionToJSONTyped(json, false);
}

export function GeneratedSectionToJSONTyped(
  value?: GeneratedSection | null,
  ignoreDiscriminator: boolean = false,
): any {
  if (value == null) {
    return value;
  }

  return {
    title: value["title"],
    content: value["content"],
    editable: value["editable"],
  };
}
