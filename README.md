# gfm-footnotes <sup>[![Version Badge][npm-version-svg]][package-url]</sup>

[![github actions][actions-image]][actions-url]
[![coverage][codecov-image]][codecov-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

[![npm badge][npm-badge-png]][package-url]

Prune unused footnote references in GitHub-flavored Markdown.

## Usage

```sh
npx gfm-footnotes # if not installed

gfm-footnotes # if installed and in the PATH
```

```sh
$ gfm-footnotes --help
Usage: gfm-footnotes [options]

Options:
  --input <path>        File path containing GFM markdown content. If omitted, input must be piped in.
    [string]

  --output-file <path>  File path to write output to. If omitted, output will be printed to stdout.
    [string]
```

## Install

```
npm install --save-dev gfm-footnotes
```

## License

MIT

[package-url]: https://npmjs.org/package/gfm-footnotes
[npm-version-svg]: https://versionbadg.es/ljharb/gfm-footnotes.svg
[deps-svg]: https://david-dm.org/ljharb/gfm-footnotes.svg
[deps-url]: https://david-dm.org/ljharb/gfm-footnotes
[dev-deps-svg]: https://david-dm.org/ljharb/gfm-footnotes/dev-status.svg
[dev-deps-url]: https://david-dm.org/ljharb/gfm-footnotes#info=devDependencies
[npm-badge-png]: https://nodei.co/npm/gfm-footnotes.png?downloads=true&stars=true
[license-image]: https://img.shields.io/npm/l/gfm-footnotes.svg
[license-url]: LICENSE
[downloads-image]: https://img.shields.io/npm/dm/gfm-footnotes.svg
[downloads-url]: https://npm-stat.com/charts.html?package=gfm-footnotes
[codecov-image]: https://codecov.io/gh/ljharb/gfm-footnotes/branch/main/graphs/badge.svg
[codecov-url]: https://app.codecov.io/gh/ljharb/gfm-footnotes/
[actions-image]: https://img.shields.io/endpoint?url=https://github-actions-badge-u3jn4tfpocch.runkit.sh/ljharb/gfm-footnotes
[actions-url]: https://github.com/ljharb/gfm-footnotes/actions
