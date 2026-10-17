/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { FeatureFlag, isFeatureEnabled } from './featureFlags';

/**
 * Opareta fork patch.
 *
 * Some on-prem network firewalls inspect form-encoded request bodies and
 * drop requests whose form_data contains SQL or JavaScript (e.g. custom SQL
 * metrics, js_tooltip). When ENCODE_FORM_DATA_BASE64 is enabled the payload
 * is sent base64-encoded under `form_data_encoded`; the backend decodes it in
 * superset.views.utils.get_request_form_data.
 */
export const FORM_DATA_ENCODED_KEY = 'form_data_encoded';

/** UTF-8 safe base64 (plain btoa throws on non-Latin1 characters). */
export function utf8ToBase64(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

/**
 * Returns the form fields to submit for a JSON-serialised form_data string:
 * `{ form_data_encoded: <base64> }` when the feature flag is on, otherwise
 * `{ form_data: <json> }`.
 */
export function formDataParam(formDataJson: string): Record<string, string> {
  if (isFeatureEnabled(FeatureFlag.EncodeFormDataBase64)) {
    return { [FORM_DATA_ENCODED_KEY]: utf8ToBase64(formDataJson) };
  }
  return { form_data: formDataJson };
}
