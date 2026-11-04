"""Unit tests for scripts/build_readme.py."""

import build_readme


def entry(**overrides):
    value = {
        "slug": "example-org",
        "name": "Example Org",
        "domain": "open-data",
        "what": "Publishes open data for public use.",
        "website": "https://example.org/",
        "github": "",
        "linkedin_org": "",
        "community_url": "",
        "events_url": "",
    }
    value.update(overrides)
    return value


class TestRenderEntry:
    def test_uses_website_and_awesome_grammar(self):
        assert (
            build_readme.render_entry(entry())
            == "- [Example Org](https://example.org/) - Publishes open data for public use."
        )

    def test_falls_back_to_github_when_website_is_missing(self):
        assert (
            build_readme.render_entry(entry(website="", github="https://github.com/example"))
            == "- [Example Org](https://github.com/example) - Publishes open data for public use."
        )

    def test_escapes_markdown_brackets_in_names(self):
        assert (
            build_readme.render_entry(entry(name="Example [Org]"))
            == "- [Example \\[Org\\]](https://example.org/) - Publishes open data for public use."
        )

    def test_adds_a_period_when_the_description_has_none(self):
        assert build_readme.render_entry(entry(what="Example Org publishes open data")).endswith(
            "Publishes open data."
        )

    def test_falls_back_to_the_entry_page_when_no_public_url_exists(self):
        assert (
            build_readme.render_entry(entry(website="", github="", linkedin_org=""))
            == f"- [Example Org]({build_readme.SITE_URL}/entry/example-org) - Publishes open data for public use."
        )

    def test_splits_semicolons_into_sentences(self):
        assert build_readme.normalise_description("Uses data ; publishes it", "Example Org") == (
            "Uses data. Publishes it."
        )

    def test_does_not_strip_a_longer_word_that_starts_with_the_name(self):
        assert build_readme.normalise_description("Karori is a suburb.", "Karo") == (
            "Karori is a suburb."
        )

    def test_returns_none_when_there_is_no_slug_or_url(self):
        value = entry(website="", github="", linkedin_org="")
        del value["slug"]
        assert build_readme.render_entry(value) is None


class TestRenderReadme:
    def test_has_badge_contents_categories_and_entries(self):
        text = build_readme.render_readme([entry()])

        assert text.startswith(f"# {build_readme.TITLE} [![Awesome]")
        assert "## Contents" in text
        assert "- [Data and knowledge](#data-and-knowledge)" in text
        assert "### Open data" in text
        assert "- [Example Org](https://example.org/)" in text
        assert "## Footnotes" in text
        assert "131" not in text or "1 organisation" in text

    def test_counts_entries_in_plain_language(self):
        text = build_readme.render_readme([entry(), entry(slug="second-org", name="Second Org")])

        assert "2 organisations" in text and build_readme.REGION_LABEL in text

    def test_keeps_an_entry_with_no_public_url_by_linking_its_entry_page(self):
        text = build_readme.render_readme([entry(website="", github="", linkedin_org="")])

        assert f"{build_readme.SITE_URL}/entry/example-org" in text


class TestCheckReadme:
    def test_reports_stale_content(self, tmp_path):
        readme = tmp_path / "README.md"
        readme.write_text("# Old\n", encoding="utf-8")

        assert build_readme.check_readme(readme, [entry()]) is False

    def test_accepts_matching_content(self, tmp_path):
        readme = tmp_path / "README.md"
        readme.write_text(build_readme.render_readme([entry()]), encoding="utf-8")

        assert build_readme.check_readme(readme, [entry()]) is True
