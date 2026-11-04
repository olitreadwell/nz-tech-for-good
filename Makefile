SHELL := /bin/bash
.DEFAULT_GOAL := check
ENGINE := uvx --from git+https://github.com/olitreadwell/awesome-list-template

.PHONY: check readme-check list-check toc-check awesome-lint

check: readme-check list-check toc-check awesome-lint

readme-check:
	python3 scripts/build_readme.py --check

list-check:
	$(ENGINE) awesome-list-check --readme README.md --config awesome.toml

toc-check:
	$(ENGINE) awesome-list-toc --check --readme README.md --config awesome.toml

awesome-lint:
	npx --yes awesome-lint README.md
