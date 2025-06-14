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
import type { User } from "./User";
import {
  UserFromJSON,
  UserFromJSONTyped,
  UserToJSON,
  UserToJSONTyped,
} from "./User";

/**
 *
 * @export
 * @interface LoginResponse
 */
export interface LoginResponse {
  /**
   *
   * @type {string}
   * @memberof LoginResponse
   */
  token: string;
  /**
   *
   * @type {User}
   * @memberof LoginResponse
   */
  user: User;
}

/**
 * Check if a given object implements the LoginResponse interface.
 */
export function instanceOfLoginResponse(value: object): value is LoginResponse {
  if (!("token" in value) || value["token"] === undefined) return false;
  if (!("user" in value) || value["user"] === undefined) return false;
  return true;
}

export function LoginResponseFromJSON(json: any): LoginResponse {
  return LoginResponseFromJSONTyped(json, false);
}

export function LoginResponseFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean,
): LoginResponse {
  if (json == null) {
    return json;
  }
  return {
    token: json["token"],
    user: UserFromJSON(json["user"]),
  };
}

export function LoginResponseToJSON(json: any): LoginResponse {
  return LoginResponseToJSONTyped(json, false);
}

export function LoginResponseToJSONTyped(
  value?: LoginResponse | null,
  ignoreDiscriminator: boolean = false,
): any {
  if (value == null) {
    return value;
  }

  return {
    token: value["token"],
    user: UserToJSON(value["user"]),
  };
}
