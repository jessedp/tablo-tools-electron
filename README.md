<a href="https://travis-ci.com/github/jessedp/tablo-tools-electron" title="Travis - Linux, Mac">
<img src="https://travis-ci.com/jessedp/tablo-tools-electron.svg?branch=master" />
</a>

<a href="https://ci.appveyor.com/project/jessedp/tablo-tools-electron" title="Appveyor (Win)">
<img src="https://ci.appveyor.com/api/projects/status/github/jessedp/tablo-tools-electron">
</a>

<br/>
<br/>

<a href="https://jessedp.github.io/tablo-tools-electron/">
<img src="https://jessedp.github.io/tablo-tools-electron/resources/tablo_title_350_trans.png"/>
</a>

<br/>

Tablo Tools allows you to Bulk Export and Delete recordings from your Tablo as well as minimally (sans guide) watch Live TV.
<br/>

### Hi!

### You likely want to <a href="https://jessedp.github.io/tablo-tools-electron/">head on over to the main site</a> for install instructions, documentation and videos to get started wrangling your Tablo.

<br/><br/><br/><br/>

### _If you're interested in the code and/or contributing, Welcome and I hope this helps..._

# Development

## What This Is

The obvious:

- **Cross-platform GUI** Win/Mac/Linux
- **Export** easily put all of my recordings elsewhere
- **Delete** please go away _quickly_

And then doing other fun, weird, and/or hopefully useful things with/for/to a Tablo.

## Parts and Pieces

At its simplest, this is a web app being distributed with a modified browser. If you're familiar with React/Vue/etc, this is mostly nothing new.

[Electon React Boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate) (< v1, flow, not typescript) was the base, thus this is a [React](https://reactjs.org/)+[Redux](https://redux.js.org/)+[Node](https://nodejs.org/en/) app.

Aside from that, the two main cogs are [ffmpeg](https://ffmpeg.org/)
[nedb](https://github.com/louischatriot/nedb)/[nedb-async](https://github.com/Akumzy/nedb-async) (document database) and [tablo-api-js](https://github.com/jessedp/tablo-api-js).

## Setup

Something like this should work...

```bash
 (clone this repo via git or https)
$ git clone git@github.com:jessedp/tablo-tools-electron.git
$ yarn install
$ yarn dev
```

## Packaging

If you get this far, we've probably already talked - but this isn't going to work out of the box because of the [Sentry.io](Sentry.io) integrations.

To package apps for the local platform:

```bash
$ yarn package-linux
$ yarn package-win
$ yarn package-mac
```

To package apps for all platforms:

First, refer to the [Multi Platform Build docs](https://www.electron.build/multi-platform-build) for dependencies.

Then,

```bash
$ yarn package-all
  - or -
$ yarn package-linux
$ yarn pacakge-win
```

To run End-to-End Test

```bash
$ yarn build-e2e
$ yarn test-e2e

# Running e2e tests in a minimized window
$ START_MINIMIZED=true yarn build-e2e
$ yarn test-e2e
```

:bulb: You can debug your production build with devtools by simply setting the `DEBUG_PROD` env variable:

```bash
DEBUG_PROD=true yarn package
```

#### CSS Modules

This boilerplate is configured to use [css-modules](https://github.com/css-modules/css-modules) out of the box.

All `.css` file extensions will use css-modules unless it has `.global.css`.

If you need global styles, stylesheets with `.global.css` will not go through the
css-modules loader. e.g. `app.global.css`

If you want to import global css libraries (like `bootstrap`), you can just write the following code in `.global.css`:

```css
@import '~bootstrap/dist/css/bootstrap.css';
```

#### SASS support

If you want to use Sass in your app, you only need to import `.sass` files instead of `.css` once:

```js
import './app.global.scss';
```

#### Static Type Checking

This project comes with Flow support out of the box! You can annotate your code with types, [get Flow errors as ESLint errors](https://github.com/amilajack/eslint-plugin-flowtype-errors), and get [type errors during runtime](https://github.com/codemix/flow-runtime) during development. Types are completely optional.

#### Dispatching redux actions from main process

See [#118](https://github.com/electron-react-boilerplate/electron-react-boilerplate/issues/118) and [#108](https://github.com/electron-react-boilerplate/electron-react-boilerplate/issues/108)

MIT © [Electron React Boilerplate](https://github.com/electron-react-boilerplate) and kinda me
