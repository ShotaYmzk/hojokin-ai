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
 * @interface CompanyProfile
 */
export interface CompanyProfile {
  /**
   *
   * @type {string}
   * @memberof CompanyProfile
   */
  companyName: string;
  /**
   *
   * @type {string}
   * @memberof CompanyProfile
   */
  industry: string;
  /**
   *
   * @type {string}
   * @memberof CompanyProfile
   */
  postalCode?: string;
  /**
   *
   * @type {string}
   * @memberof CompanyProfile
   */
  prefecture?: string;
  /**
   *
   * @type {string}
   * @memberof CompanyProfile
   */
  city?: string;
  /**
   *
   * @type {string}
   * @memberof CompanyProfile
   */
  addressLine1?: string;
  /**
   *
   * @type {string}
   * @memberof CompanyProfile
   */
  phoneNumber?: string;
  /**
   *
   * @type {string}
   * @memberof CompanyProfile
   */
  email?: string;
  /**
   *
   * @type {string}
   * @memberof CompanyProfile
   */
  website?: string;
  /**
   *
   * @type {string}
   * @memberof CompanyProfile
   */
  establishmentYear?: string;
  /**
   *
   * @type {string}
   * @memberof CompanyProfile
   */
  employeeCountCategory?: string;
  /**
   *
   * @type {string}
   * @memberof CompanyProfile
   */
  capitalAmount?: string;
  /**
   *
   * @type {string}
   * @memberof CompanyProfile
   */
  annualSales?: string;
  /**
   *
   * @type {string}
   * @memberof CompanyProfile
   */
  businessDescription?: string;
  /**
   *
   * @type {boolean}
   * @memberof CompanyProfile
   */
  isSmallBusiness?: boolean;
}

/**
 * Check if a given object implements the CompanyProfile interface.
 */
export function instanceOfCompanyProfile(
  value: object,
): value is CompanyProfile {
  if (!("companyName" in value) || value["companyName"] === undefined)
    return false;
  if (!("industry" in value) || value["industry"] === undefined) return false;
  return true;
}

export function CompanyProfileFromJSON(json: any): CompanyProfile {
  return CompanyProfileFromJSONTyped(json, false);
}

export function CompanyProfileFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean,
): CompanyProfile {
  if (json == null) {
    return json;
  }
  return {
    companyName: json["companyName"],
    industry: json["industry"],
    postalCode: json["postalCode"] == null ? undefined : json["postalCode"],
    prefecture: json["prefecture"] == null ? undefined : json["prefecture"],
    city: json["city"] == null ? undefined : json["city"],
    addressLine1:
      json["addressLine1"] == null ? undefined : json["addressLine1"],
    phoneNumber: json["phoneNumber"] == null ? undefined : json["phoneNumber"],
    email: json["email"] == null ? undefined : json["email"],
    website: json["website"] == null ? undefined : json["website"],
    establishmentYear:
      json["establishmentYear"] == null ? undefined : json["establishmentYear"],
    employeeCountCategory:
      json["employeeCountCategory"] == null
        ? undefined
        : json["employeeCountCategory"],
    capitalAmount:
      json["capitalAmount"] == null ? undefined : json["capitalAmount"],
    annualSales: json["annualSales"] == null ? undefined : json["annualSales"],
    businessDescription:
      json["businessDescription"] == null
        ? undefined
        : json["businessDescription"],
    isSmallBusiness:
      json["isSmallBusiness"] == null ? undefined : json["isSmallBusiness"],
  };
}

export function CompanyProfileToJSON(json: any): CompanyProfile {
  return CompanyProfileToJSONTyped(json, false);
}

export function CompanyProfileToJSONTyped(
  value?: CompanyProfile | null,
  ignoreDiscriminator: boolean = false,
): any {
  if (value == null) {
    return value;
  }

  return {
    companyName: value["companyName"],
    industry: value["industry"],
    postalCode: value["postalCode"],
    prefecture: value["prefecture"],
    city: value["city"],
    addressLine1: value["addressLine1"],
    phoneNumber: value["phoneNumber"],
    email: value["email"],
    website: value["website"],
    establishmentYear: value["establishmentYear"],
    employeeCountCategory: value["employeeCountCategory"],
    capitalAmount: value["capitalAmount"],
    annualSales: value["annualSales"],
    businessDescription: value["businessDescription"],
    isSmallBusiness: value["isSmallBusiness"],
  };
}
