// tslint:disable
/**
 * Yugabyte Cloud
 * YugabyteDB as a Service
 *
 * The version of the OpenAPI document: v1
 * Contact: support@yugabyte.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


// eslint-disable-next-line no-duplicate-imports
import type { CustomImageInfo } from './CustomImageInfo';
// eslint-disable-next-line no-duplicate-imports
import type { CustomImageSpec } from './CustomImageSpec';


/**
 * Custom Image data
 * @export
 * @interface CustomImageData
 */
export interface CustomImageData  {
  /**
   * 
   * @type {CustomImageSpec}
   * @memberof CustomImageData
   */
  spec?: CustomImageSpec;
  /**
   * 
   * @type {CustomImageInfo}
   * @memberof CustomImageData
   */
  info?: CustomImageInfo;
}


