# antibot

```
A simple spamfilter with autotraining
```

## Install

```bash
npm i --save antibot
```

## Example

```js
const spamfilter = require("antibot");

const instance = spamfilter.create(["spam"], {
  onFiltered: (spam) =>
    spam.split(" ").flatMap((word) => [`_${word}_`, `-${word}-`]),
  skipOnFilteredOnInit: true,
});

const isSpam = instance.test("SPAM filter"); // true
const isSpamToo = instance.test("_FILTER_"); // true, because it learned from onFiltered call
```

## API

```js
const instance = instance.create();
```

Creates a new `Spamfilter` instance

```js
instance.test(content);
```

Returns `true` if spam detected, otherwise `false`.

By default will split words and lowercase them, banning those too. You might want to override the tactic with `onFiltered` second parameter of the `.create` method:

```js
const instance = spamfilter.create(["spam"], {
  onFiltered: (spam) =>
    spam.split(" ").flatMap((word) => [`_${word}_`, `-${word}-`]),
  skipOnFilteredOnInit: true,
});
```

`onFiltered` - function that predicts the new banned words derived from detected content

`skipOnFilteredOnInit` - the words passed in `.create()` method will not be transformed through `onFiltered` and leave intact

```js
const tree = instance.explain();
```

Explains the reason of detection as a tree, e.g.

```js
{
  spam: {
    filter: {},
    test: {},
  },
  filter: {
    word: {},
  },
};
```

## Plugins

```js
const spamfilter = require("antibot");

class CustomPlugin extends spamfilter.Plugin {
  beforeFiltered(content: string) {
    // ... preprocessing returning string
    return content;
  }

  afterFiltered(contents: string[]) {
    // ... postprocessing returning string array
    return contents;
  }
}

const filter = spamfilter.create(...);

filter.inject(new CustomPlugin())
```

`beforeFiltered` fires before main intermediate processing as asserted in `Spamfilter` params `onFiltered`

`afterFiltered` fires after main intermediate processing as asserted in `Spamfilter` params `onFiltered`

## Test

```bash
npm test
```
