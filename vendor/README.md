# vendor/sharky-sdk-<version>.tgz

The `@sharky/sdk` package is **vendored** (committed to the repo) instead of
pulled from a registry. This keeps the project self-contained: the build
resolves the SDK from this `.tgz` (`file:./vendor/sharky-sdk-<version>.tgz` in
`package.json`) with no sibling folder, deploy key or registry needed.

## The file name carries the version

Package managers cache `file:` dependencies aggressively. If you overwrite a
`.tgz` with **the same name and version**, the old package may be reused from
the cache and the update never reaches `node_modules`. That's why the file is
named after its version and `package.json` points to that exact path. Every
update is a new path that always gets re-resolved.

## Updating the SDK

```bash
cd path/to/sdk
# 1. bump the version in the SDK's package.json (e.g. 0.8.0 -> 0.9.0)
npm run build
npm pack --pack-destination path/to/yardsale/vendor   # creates sharky-sdk-<new>.tgz
cd path/to/yardsale
# 2. point the dependency to the new file and delete the old one
#    package.json: "@sharky/sdk": "file:./vendor/sharky-sdk-<new>.tgz"
rm vendor/sharky-sdk-<old>.tgz
npm install            # updates package-lock.json
```

Commit the new `.tgz`, `package.json` and `package-lock.json`. Once the SDK is
published to a registry, switch the dependency to `^x.y.z` and remove this folder.
