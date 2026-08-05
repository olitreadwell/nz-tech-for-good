"""Unit tests for scripts/build_guide.py's pure functions."""

import build_guide


class TestNorm:
    def test_strips_parenthetical_suffix(self):
        assert build_guide.norm("LINZ Data Service (Toitū Te Whenua)") == "linz data service"

    def test_lowercases(self):
        assert build_guide.norm("Access Advisors") == "access advisors"

    def test_no_parenthetical_unchanged_except_case(self):
        assert build_guide.norm("Plain Name") == "plain name"


class TestMid:
    def test_strips_non_alphanumeric(self):
        assert build_guide.mid("Access Advisors (NZ)") == "n_AccessAdvisorsNZ"

    def test_truncates_to_24_chars(self):
        long_name = "A" * 40
        node_id = build_guide.mid(long_name)
        assert node_id == "n_" + "A" * 24

    def test_prefixed_with_n_underscore(self):
        assert build_guide.mid("X").startswith("n_")


class TestBuildNameIndex:
    def test_names_set_contains_all_entries(self):
        entries = [{"name": "Org A"}, {"name": "Org B"}]
        names, _ = build_guide.build_name_index(entries)
        assert names == {"Org A", "Org B"}

    def test_namemap_keyed_by_normalised_name(self):
        entries = [{"name": "LINZ Data Service (Toitū Te Whenua)"}]
        _, namemap = build_guide.build_name_index(entries)
        assert namemap["linz data service"] == "LINZ Data Service (Toitū Te Whenua)"


class TestResolve:
    def test_exact_match_returns_same_name(self):
        names = {"Org A", "Org B"}
        namemap = {"org a": "Org A", "org b": "Org B"}
        assert build_guide.resolve("Org A", names, namemap) == "Org A"

    def test_normalised_match_via_namemap(self):
        names = {"LINZ Data Service (Toitū Te Whenua)"}
        namemap = {"linz data service": "LINZ Data Service (Toitū Te Whenua)"}
        assert build_guide.resolve("LINZ Data Service", names, namemap) == "LINZ Data Service (Toitū Te Whenua)"

    def test_fuzzy_substring_match(self):
        names = {"Access Matters Aotearoa (Access Alliance)"}
        namemap = {"access matters aotearoa": "Access Matters Aotearoa (Access Alliance)"}
        result = build_guide.resolve("Access Matters", names, namemap)
        assert result == "Access Matters Aotearoa (Access Alliance)"

    def test_unresolvable_reference_returns_none(self):
        names = {"Org A"}
        namemap = {"org a": "Org A"}
        assert build_guide.resolve("Nonexistent Org", names, namemap) is None


class TestGroupByDomain:
    def test_groups_entries_under_their_domain(self):
        entries = [
            {"name": "Org A", "domain": "civic-tech"},
            {"name": "Org B", "domain": "open-data"},
            {"name": "Org C", "domain": "civic-tech"},
        ]
        by_domain, domain_order, entry_domain = build_guide.group_by_domain(entries)
        assert {e["name"] for e in by_domain["civic-tech"]} == {"Org A", "Org C"}
        assert domain_order == ["civic-tech", "open-data", "civic-tech"] or set(domain_order) == {"civic-tech", "open-data"}
        assert entry_domain["Org B"] == "open-data"

    def test_domain_order_preserves_first_seen_order_deduped(self):
        entries = [
            {"name": "Org A", "domain": "civic-tech"},
            {"name": "Org B", "domain": "open-data"},
            {"name": "Org C", "domain": "civic-tech"},
        ]
        _, domain_order, _ = build_guide.group_by_domain(entries)
        assert domain_order == ["civic-tech", "open-data"]


class TestBuildEdges:
    def test_resolves_related_to_into_edge_set(self):
        entries = [
            {"name": "Org A", "related_to": ["Org B"]},
            {"name": "Org B", "related_to": []},
        ]
        names, namemap = build_guide.build_name_index(entries)
        edge_set, unresolved = build_guide.build_edges(entries, names, namemap)
        assert ("Org A", "Org B") in edge_set
        assert unresolved == []

    def test_self_reference_is_dropped(self):
        entries = [{"name": "Org A", "related_to": ["Org A"]}]
        names, namemap = build_guide.build_name_index(entries)
        edge_set, unresolved = build_guide.build_edges(entries, names, namemap)
        assert edge_set == set()
        assert unresolved == []

    def test_unresolved_reference_is_recorded(self):
        entries = [{"name": "Org A", "related_to": ["Nonexistent Org"]}]
        names, namemap = build_guide.build_name_index(entries)
        edge_set, unresolved = build_guide.build_edges(entries, names, namemap)
        assert edge_set == set()
        assert unresolved == [("Org A", "Nonexistent Org")]

    def test_missing_related_to_field_handled(self):
        entries = [{"name": "Org A"}]
        names, namemap = build_guide.build_name_index(entries)
        edge_set, unresolved = build_guide.build_edges(entries, names, namemap)
        assert edge_set == set()
        assert unresolved == []

    def test_edge_is_deduped_and_order_independent(self):
        entries = [
            {"name": "Org A", "related_to": ["Org B"]},
            {"name": "Org B", "related_to": ["Org A"]},
        ]
        names, namemap = build_guide.build_name_index(entries)
        edge_set, _ = build_guide.build_edges(entries, names, namemap)
        assert len(edge_set) == 1


class TestBuildDomainEdgeCounts:
    def test_counts_cross_domain_edges(self):
        entry_domain = {"Org A": "civic-tech", "Org B": "open-data"}
        edge_set = {("Org A", "Org B")}
        counts = build_guide.build_domain_edge_counts(edge_set, entry_domain)
        assert counts[("civic-tech", "open-data")] == 1

    def test_same_domain_edges_excluded(self):
        entry_domain = {"Org A": "civic-tech", "Org B": "civic-tech"}
        edge_set = {("Org A", "Org B")}
        counts = build_guide.build_domain_edge_counts(edge_set, entry_domain)
        assert counts == {}


class TestBuildInternalEdges:
    def test_same_domain_edges_grouped_by_domain(self):
        entry_domain = {"Org A": "civic-tech", "Org B": "civic-tech"}
        edge_set = {("Org A", "Org B")}
        internal = build_guide.build_internal_edges(edge_set, entry_domain)
        assert internal["civic-tech"] == [("Org A", "Org B")]

    def test_cross_domain_edges_excluded(self):
        entry_domain = {"Org A": "civic-tech", "Org B": "open-data"}
        edge_set = {("Org A", "Org B")}
        internal = build_guide.build_internal_edges(edge_set, entry_domain)
        assert internal["civic-tech"] == []
        assert internal["open-data"] == []


class TestLoadEntries:
    def test_skips_non_mapping_yaml(self, tmp_path):
        (tmp_path / "list.yaml").write_text("- one\n- two\n", encoding="utf-8")
        entries, skipped = build_guide.load_entries(tmp_path)
        assert entries == []
        assert skipped == 1

    def test_skips_entry_without_name(self, tmp_path):
        (tmp_path / "noname.yaml").write_text("domain: civic-tech\n", encoding="utf-8")
        entries, skipped = build_guide.load_entries(tmp_path)
        assert entries == []
        assert skipped == 1

    def test_skips_invalid_yaml(self, tmp_path):
        (tmp_path / "broken.yaml").write_text("name: [unterminated\n", encoding="utf-8")
        entries, skipped = build_guide.load_entries(tmp_path)
        assert entries == []
        assert skipped == 1

    def test_loads_and_sorts_by_name(self, tmp_path):
        (tmp_path / "b.yaml").write_text("name: Beta Org\n", encoding="utf-8")
        (tmp_path / "a.yaml").write_text("name: Alpha Org\n", encoding="utf-8")
        entries, skipped = build_guide.load_entries(tmp_path)
        assert [e["name"] for e in entries] == ["Alpha Org", "Beta Org"]
        assert skipped == 0
