# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
"""Opareta fork patch: base64-encoded form_data (ENCODE_FORM_DATA_BASE64)."""

from base64 import b64encode

from flask import Flask

from superset.utils import json
from superset.views.utils import get_request_form_data

FORM_DATA = {"sql": "SELECT * FROM t WHERE x = 'Kwacha – ZMW'", "emoji": "📊"}
FORM_DATA_JSON = json.dumps(FORM_DATA)
ENCODED = b64encode(FORM_DATA_JSON.encode("utf-8")).decode("ascii")


def test_plain_form_data(app: Flask) -> None:
    with app.test_request_context(method="POST", data={"form_data": FORM_DATA_JSON}):
        assert get_request_form_data() == FORM_DATA_JSON


def test_encoded_form_data(app: Flask) -> None:
    with app.test_request_context(method="POST", data={"form_data_encoded": ENCODED}):
        form_data = get_request_form_data()
        assert form_data is not None
        assert json.loads(form_data) == FORM_DATA


def test_json_quoted_encoded_form_data(app: Flask) -> None:
    # SupersetClient postPayload JSON-stringifies each field
    with app.test_request_context(
        method="POST", data={"form_data_encoded": f'"{ENCODED}"'}
    ):
        form_data = get_request_form_data()
        assert form_data is not None
        assert json.loads(form_data) == FORM_DATA


def test_invalid_encoded_falls_back_to_form_data(app: Flask) -> None:
    with app.test_request_context(
        method="POST",
        data={"form_data_encoded": "not base64!!", "form_data": FORM_DATA_JSON},
    ):
        assert get_request_form_data() == FORM_DATA_JSON


def test_no_form_data(app: Flask) -> None:
    with app.test_request_context(method="POST", data={}):
        assert get_request_form_data() is None
