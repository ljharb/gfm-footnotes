### Added
* support eslint v9 ([#3759][] @mdjermanovic)
* export flat configs from plugin root and fix flat config crash ([#3694][] @bradzacher @mdjermanovic)
* add [`jsx-props-no-spread-multi`] ([#3724][] @SimonSchick)
* [`forbid-component-props`]: add `propNamePattern` to allow / disallow prop name patterns ([#3774][] @akulsr0)
* [`jsx-handler-names`]: support ignoring component names ([#3772][] @akulsr0)
* version settings: Allow react defaultVersion to be configurable ([#3771][] @onlywei)
* [`jsx-closing-tag-location`]: add `line-aligned` option ([#3777] @kimtaejin3)
* [`no-danger`]: add `customComponentNames` option ([#3748][] @akulsr0)

### Fixed
* [`no-invalid-html-attribute`]: substitute placeholders in suggestion messages ([#3759][] @mdjermanovic)
* [`sort-prop-types`]: single line type ending without semicolon ([#3784][] @akulsr0)
* [`require-default-props`]: report when required props have default value ([#3785][] @akulsr0)

### Refactors
* `variableUtil`: Avoid creating a single flat variable scope for each lookup ([#3782][] @DanielRosenwasser)

[#3759]: https://github.com/jsx-eslint/eslint-plugin-react/pull/3759
[#3694]: https://github.com/jsx-eslint/eslint-plugin-react/pull/3694
[#3771]: https://github.com/jsx-eslint/eslint-plugin-react/pull/3771
[#3724]: https://github.com/jsx-eslint/eslint-plugin-react/pull/3724
[#3748]: https://github.com/jsx-eslint/eslint-plugin-react/pull/3748
[#3772]: https://github.com/jsx-eslint/eslint-plugin-react/pull/3772
[#3774]: https://github.com/jsx-eslint/eslint-plugin-react/pull/3774
[#3777]: https://github.com/jsx-eslint/eslint-plugin-react/pull/3777
[#3782]: https://github.com/jsx-eslint/eslint-plugin-react/pull/3782
[#3784]: https://github.com/jsx-eslint/eslint-plugin-react/pull/3784
[#3785]: https://github.com/jsx-eslint/eslint-plugin-react/pull/3785
[`forbid-component-props`]: docs/rules/forbid-component-props.md
[`jsx-closing-tag-location`]: docs/rules/jsx-closing-tag-location.md
[`jsx-handler-names`]: docs/rules/jsx-handler-names.md
[`jsx-props-no-spread-multi`]: docs/rules/jsx-props-no-spread-multi.md
[`no-danger`]: docs/rules/no-danger.md
[`no-invalid-html-attribute`]: docs/rules/no-invalid-html-attribute.md
[`require-default-props`]: docs/rules/require-default-props.md
[`sort-prop-types`]: docs/rules/sort-prop-types.md