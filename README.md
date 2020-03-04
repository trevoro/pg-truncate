# pg-truncate

This is a simple NPM library to easily truncate postgres databases when doing
integration tests. It's meant to be used in test suites environments. It takes
a few options, so to make things ergonomic, you can build it into a `clean`
method that you run before and/or after tests using your test library of
choice. 

**This will wipe your entire database** so be careful. There is a `guard`
method built into the library that prevents this from running when the
`NODE_ENV=production` but it can be disabled. You can supply a separate
`guardMethod` which is a function that has to return `true` if we should
proceed or `false` if we should not. Go ahead, get creative.

## Example

```
const truncate = require('pg-truncate');

const clean = async () => {
  await truncate(db, {
    guard: true,
    guardMethod: name => /.*_test$/.test(name),
  });
}

/// somewhere magical in your tests
before(async () => {
  await clean();
})
```

## Options

You can pass in an options object to `truncate` after the required `db`
argument. The options can match the following:

```
{
  guard: <bool> default: true,
  guardMethod: <function> default: name => /.*_test/.test(name),
  schema: <string> default: 'public',
}
```

## Development

```
$ cp .env.example .env
$ $EDITOR .env
$ npm install
$ npm test
$ # begin your journey
```

