# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.0.1](https://github.com/es-shims/es-arraybuffer-base64/compare/v1.0.0...v1.0.1) - 2024-02-28

### Commits

- [Fix] `Uint8Array.prototype.setFromBase64`: avoid invoking toString on a non-string `string` argument [`ef96249`](https://github.com/es-shims/es-arraybuffer-base64/commit/ef9624916544e28fe4f51c098437c9971b3c0c23)
- [Fix] `Uint8Array.fromBase64`: properly throw in some cases with `strict` lastChunkHandling [`aae0940`](https://github.com/es-shims/es-arraybuffer-base64/commit/aae0940145a9c46f4ebdc18db4233f2911b85838)
- [Fix] `Uint8Array.prototype.toBase64`: properly check detachment; avoid invoking toString on a non-string `string` argument [`97ea97f`](https://github.com/es-shims/es-arraybuffer-base64/commit/97ea97f2c1ccbe77ea6a03d8a3ddf60112a23ef6)
- [Fix] `Uint8Array.prototype.setFromHex`: avoid invoking toString on a non-string `string` argument [`e8f558a`](https://github.com/es-shims/es-arraybuffer-base64/commit/e8f558a930d445c3bdb21d191fc89dd9f160bed7)
- [Tests] `Uint8Array.prototype.toHex`: add test coverage from https://github.com/tc39/test262/pull/3994 [`cc72c2f`](https://github.com/es-shims/es-arraybuffer-base64/commit/cc72c2f5c7c34a52dfd7793d840ea5b0a22f3982)
- [Fix] `Uint8Array.fromHex`: avoid invoking toString on a non-string `string` argument [`85c927f`](https://github.com/es-shims/es-arraybuffer-base64/commit/85c927f6fda4c99ad89f1eebc1d6e8ceef825ca6)
- [Tests] fix `.test` param order [`fae569b`](https://github.com/es-shims/es-arraybuffer-base64/commit/fae569b64a3a8e62fd8b1c187621b37738726b02)
- [Tests] use es-abstract forEach helper [`5438ba6`](https://github.com/es-shims/es-arraybuffer-base64/commit/5438ba651dcf0ad65eee4d9367f0a0f3b5b18078)
- [Deps] update `call-bind`, `es-abstract` [`5490f60`](https://github.com/es-shims/es-arraybuffer-base64/commit/5490f60b57b90f60c3f1c5390193ed982340e5ac)
- [Deps] update `es-abstract`, `is-shared-array-buffer`, `typed-array-buffer`, `typed-array-byte-offset`, `typed-array-length` [`bab0110`](https://github.com/es-shims/es-arraybuffer-base64/commit/bab01100eb483896f00eb7a9ee48753ff4be194e)
- [Deps] add missing prod deps [`a68ccf5`](https://github.com/es-shims/es-arraybuffer-base64/commit/a68ccf516a65658594df63d927c430eb05f1ef01)
- [Dev Deps] pin `jackspeak` and `glob`, since v2.1.2+ and v10.3.8+ respectively depend on npm aliases, which kill the install process in npm &lt; 6 [`1b9056b`](https://github.com/es-shims/es-arraybuffer-base64/commit/1b9056b7ac74ac802acd51433754c6e24f739338)
- [Dev Deps] update `tape` [`100b0d1`](https://github.com/es-shims/es-arraybuffer-base64/commit/100b0d1106eacec07e8b5e88f5f3f5610eee34f0)
- [readme] fix spec link [`ccc5bfc`](https://github.com/es-shims/es-arraybuffer-base64/commit/ccc5bfca6717b781221599aba6b63ad8872e1349)
- [Deps] remove unused dep [`feef0aa`](https://github.com/es-shims/es-arraybuffer-base64/commit/feef0aa4be049016608564452790469e81672e75)

## v1.0.0 - 2024-02-07

### Commits

- Initial implementation, tests, readme [`ed4e571`](https://github.com/es-shims/es-arraybuffer-base64/commit/ed4e571a8b2d2589f161b054751fb4b34d67ade1)
- [Refactor] move `into` static methods to prototype and rename [`3a52985`](https://github.com/es-shims/es-arraybuffer-base64/commit/3a529856c124303f7ad4206a0f994e6f4e6757f2)
- Initial commit [`a18dcfd`](https://github.com/es-shims/es-arraybuffer-base64/commit/a18dcfdd63d7c072fbd8d29dfc65d0a76f2913de)
- [Deps] update `array-buffer-byte-length`, `is-array-buffer`, `which-typed-array` [`698a83e`](https://github.com/es-shims/es-arraybuffer-base64/commit/698a83e1ca56e36c582741d3a288b6848b951157)
- npm init [`48175a7`](https://github.com/es-shims/es-arraybuffer-base64/commit/48175a7831e92ddd2622d53f0a3b0bafa02196cc)
- [Deps] update `call-bind`, `es-errors`, `safe-regex-test`, `typed-array-buffer`, `typedarray.prototype.slice` [`87095c4`](https://github.com/es-shims/es-arraybuffer-base64/commit/87095c43276149dca081dd1afcc2ea79e6b61198)
- Only apps should have lockfiles [`57d2588`](https://github.com/es-shims/es-arraybuffer-base64/commit/57d258854e1a864521c2b93b2f8fc6087962e581)
- [meta] add missing `version` script [`19d805a`](https://github.com/es-shims/es-arraybuffer-base64/commit/19d805a358e5cdbb0572fca6317ebe3fdf084648)
