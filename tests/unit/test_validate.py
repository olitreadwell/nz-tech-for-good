"""Unit tests for scripts/validate.py's pure functions.

No filesystem I/O beyond loading the real schema (a fixed, versioned
file — treated as a constant, not test data) and no subprocess calls.
"""

import jsonschema
import pytest

import validate


@pytest.fixture(scope="module")
def schema():
    return validate.load_schema()


@pytest.fixture(scope="module")
def validator(schema):
    return jsonschema.Draft202012Validator(schema)


def valid_entry(**overrides):
    entry = {
        "name": "Test Org",
        "domain": "civic-tech",
        "what": "Does a thing.",
        "region": "national",
        "source": "verified via homepage",
    }
    entry.update(overrides)
    return entry


class TestLoadSchema:
    def test_returns_dict_with_expected_top_level_keys(self, schema):
        assert schema["title"] == "NZ Tech-for-Good directory entry"
        assert "domain" in schema["properties"]
        assert set(schema["required"]) == {"name", "domain", "what", "region", "source"}


class TestEntryErrors:
    def test_valid_entry_has_no_errors(self, schema, validator):
        assert validate.entry_errors(valid_entry(), schema, validator) == []

    def test_missing_required_field_fails(self, schema, validator):
        entry = valid_entry()
        del entry["region"]
        errors = validate.entry_errors(entry, schema, validator)
        assert errors
        assert any("region" in msg for msg in errors)

    def test_invalid_domain_enum_value_fails(self, schema, validator):
        entry = valid_entry(domain="not-a-real-domain")
        errors = validate.entry_errors(entry, schema, validator)
        assert errors
        assert any("domain" in msg for msg in errors)

    def test_wrong_type_fails(self, schema, validator):
        entry = valid_entry(founding_year="not a year")
        errors = validate.entry_errors(entry, schema, validator)
        assert errors
        assert any("founding_year" in msg for msg in errors)

    def test_falls_back_to_basic_check_when_validator_is_none(self, schema):
        entry = valid_entry()
        del entry["source"]
        errors = validate.entry_errors(entry, schema, None)
        assert any("source" in msg for msg in errors)


class TestBasicCheck:
    def test_valid_entry_passes(self, schema):
        assert validate.basic_check(valid_entry(), schema) == []

    def test_missing_required_field_reported(self, schema):
        entry = valid_entry()
        del entry["name"]
        errors = validate.basic_check(entry, schema)
        assert "missing required field 'name'" in errors

    def test_empty_string_required_field_reported(self, schema):
        entry = valid_entry(what="")
        errors = validate.basic_check(entry, schema)
        assert "missing required field 'what'" in errors

    def test_unexpected_field_reported(self, schema):
        entry = valid_entry(nonsense_field="oops")
        errors = validate.basic_check(entry, schema)
        assert "unexpected field 'nonsense_field' not in schema" in errors

    def test_schema_without_additional_properties_false_skips_unexpected_field_check(self):
        schema = {"required": ["name"], "properties": {"name": {}}}
        entry = valid_entry(nonsense_field="oops")
        errors = validate.basic_check(entry, schema)
        assert errors == []


class TestNormaliseWebsiteKey:
    def test_strips_trailing_slash(self):
        assert validate.normalise_website_key("https://example.org/") == "https://example.org"

    def test_strips_whitespace(self):
        assert validate.normalise_website_key("  https://example.org  ") == "https://example.org"

    def test_none_becomes_empty_string(self):
        assert validate.normalise_website_key(None) == ""

    def test_empty_string_stays_empty(self):
        assert validate.normalise_website_key("") == ""


class TestFindDuplicates:
    def test_keys_with_one_occurrence_are_excluded(self):
        seen = {"a": ["a.yaml"], "b": ["b.yaml", "c.yaml"]}
        assert validate.find_duplicates(seen) == {"b": ["b.yaml", "c.yaml"]}

    def test_no_duplicates_returns_empty_dict(self):
        seen = {"a": ["a.yaml"], "b": ["b.yaml"]}
        assert validate.find_duplicates(seen) == {}

    def test_empty_input_returns_empty_dict(self):
        assert validate.find_duplicates({}) == {}
