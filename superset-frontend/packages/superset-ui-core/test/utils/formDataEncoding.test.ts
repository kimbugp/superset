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
import {
  FORM_DATA_ENCODED_KEY,
  formDataParam,
  utf8ToBase64,
} from '@superset-ui/core';

const decode = (value: string) =>
  new TextDecoder().decode(
    Uint8Array.from(atob(value), char => char.charCodeAt(0)),
  );

const setFlag = (enabled: boolean) =>
  Object.defineProperty(window, 'featureFlags', {
    value: { ENCODE_FORM_DATA_BASE64: enabled },
    writable: true,
    configurable: true,
  });

const formDataJson = JSON.stringify({
  sql: "SELECT * FROM t WHERE x = 'Kwacha – ZMW ✓'",
  js_tooltip: 'd => `<b>${d.value}</b>`',
});

test('utf8ToBase64 round-trips non-Latin1 characters', () => {
  expect(decode(utf8ToBase64(formDataJson))).toEqual(formDataJson);
});

test('formDataParam sends form_data_encoded when the flag is on', () => {
  setFlag(true);
  const param = formDataParam(formDataJson);
  expect(Object.keys(param)).toEqual([FORM_DATA_ENCODED_KEY]);
  expect(param[FORM_DATA_ENCODED_KEY]).not.toContain('SELECT');
  expect(decode(param[FORM_DATA_ENCODED_KEY])).toEqual(formDataJson);
});

test('formDataParam sends plain form_data when the flag is off', () => {
  setFlag(false);
  expect(formDataParam(formDataJson)).toEqual({ form_data: formDataJson });
});
