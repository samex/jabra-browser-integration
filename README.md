Install the old v16 Web-Extension: https://chrome.google.com/webstore/detail/3cx/dijllljhgnommpcoogbfcnadmnleeook

Updated  Linux SDK to version 1.10.1.0 & created linux installer file (64bit only)

Download install script: [install.sh](https://github.com/samex/jabra-browser-integration/raw/master/src/InstallerLinux/install.sh)

-------------------------------

![Banner](/docs/banner.png)

# Overview

This software project from Jabra helps developers to make solutions, where basic headset call control can be used from within a browser app using JavaScript. Since it is not possible to access USB devices directly from JavaScript, this library provides a solution of getting a route from the JavaScript to the Jabra USB device. The API is a JavaScript library with a facade that hides implementation details. Basic call control is defined by off-hook/on-hook, ringer, mute/unmute and hold/resume. With these features, it is possible to implement a browser based softphone app. Combined with the [WebRTC](https://en.wikipedia.org/wiki/WebRTC) technology it is possible to create a softphone that only requires small software components installed locally on the computer, while the business logic is implemented in JavaScript.

## Project goals

- be able to control a headset from JS
- be a lightweight solution
- support the platforms: Windows and macOS

## Bug reports
If you find any bug or have any suggestion then fill in the form at [Jabra developer support site](https://developer.jabra.com) with below details:

1. Bug description with steps to reproduce the issue.
2. Console log after enabling debug mode for this module, see [Logging](#logging) section for more.
3. File logs, see [Logging](#logging) section for more.

## System requirements

With current internal implementation of this software package, the following is supported:

### Jabra devices

All professional Jabra headsets and Jabra speakerphones are supported. I.e. the [Jabra Evolve series](https://www.jabra.com/business/office-headsets/jabra-evolve), the Jabra Pro series, the Jabra Biz series, the [Jabra Speak series](https://www.jabra.com/business/speakerphones/jabra-speak-series), and the [Jabra Engage series](https://www.jabra.com/business/office-headsets/jabra-engage).

### Operating system support

The following desktop operating systems are supported:

| Operating system | Version              |
| ---------------- | -------------------  |
| Windows 64 bit   | Windows 7 or newer   |
| Windows 32 bit   | Windows 7 or newer   |
| macOS            | El Capitan or newer  |
| Linux   64 bit   | Generic              |

### Browser support

Google Chrome web browser - stable channel - 32 bit and 64 bit.

# Using the library

The solution consists of a Javascript API that webpages can consume, a chrome web extension and a native chromehost that must be installed separately.

## Javascript/typescript API

Developers must use the versioned JavaScript library file with the format `jabra.browser.integration.<majorVersion>.<minorVersion>.js` and the associated [typescript \*.d.ts](https://www.typescriptlang.org/) definition file which
documents the API in detail, including exactly what each API method expect for parameters and what each method returns. Alternatively,
the [@gnaudio/jabra-browser-integration](https://www.npmjs.com/package/@gnaudio/jabra-browser-integration) npm
package can be used together with a browser bundler.

These files adhere to semantic versioning
so increases in majorVersion between releases indicate breaking changes so developers using the software
may need to change their code when updating. Increases in minorVersion indicates that all changes are backwards compatible.

> _Tip: Javascript developers can use the supplied typescript file with a [reference path comment](https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html) on top of your javascript files to get code completion for the Jabra API in many development tools._

Latest API versions are:

| API packages/downloads                                                                                                                             | Description                |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| [@gnaudio/jabra-browser-integration](https://www.npmjs.com/package/@gnaudio/jabra-browser-integration) | Npm package |
| [jabra.browser.integration-3.0.js](https://gnaudio.github.io/jabra-browser-integration/JavaScriptLibrary/jabra.browser.integration-3.0.js)     | Javascript API client file |
| [jabra.browser.integration-3.0.d.ts](https://gnaudio.github.io/jabra-browser-integration/JavaScriptLibrary/jabra.browser.integration-3.0.d.ts) | Typescript definition file |


The API v3.0 is fully backward compatible with v2.0, and works with the current 2.x version of the Chrome Host and Chrome Extension.

The library internally checks for dependencies – and will report this to the app using the library. An example: When trying to initialize Jabra library the promise might fail with an error “You need to use this Extension and then reload this page” if the browser extension is missing.

## WebExtension

[![Banner](/docs/ChromeWebStoreBadge.png)](https://chrome.google.com/webstore/detail/jabra-browser-integration/okpeabepajdgiepelmhkfhkjlhhmofma)

## Native Chromehost downloads

| Operating systems             | Chrome host native download             | Description                             |
| ----------------------------- | --------------------------------------- | --------------------------------------- |
| Windows (Windows 7 or newer)  | [JabraChromeHost2.1.0.msi](https://gnaudio.github.io/jabra-browser-integration/download/JabraChromeHost2.1.0.msi) | Chromehost 2.1.0 |
| macOS (El Capitan or newer)   | [JabraChromeHost2.1.1.dmg](https://gnaudio.github.io/jabra-browser-integration/download/JabraChromeHost2.1.1.dmg) | Chromehost 2.1.1 |
| Linux  (64-bit only)          | [install.sh](https://github.com/samex/jabra-browser-integration/raw/master/src/InstallerLinux/install.sh)  |                                 |

The Chromehost can also be downloaded from [Jabra developer zone](https://developer.jabra.com)

## Getting started with using the API in your web applications

First, make sure the [jabra library javascript file](https://gnaudio.github.io/jabra-browser-integration/JavaScriptLibrary/jabra.browser.integration-3.0.js) is included in your HTML page (use a local copy - don't link directly).

Secondly, the library must be initialized using javascript like this:

```javascript
jabra
  .init()
  .then(() => {
    // Handle success
  })
  .catch(err => {
    // Handle error
  });
```

Generally, you will also need to setup various
event handlers, like for example for when a new Jabra device has been attached to the computer or when the device has requested to be muted _(just be aware that some events are only send if the device is in a specific state. For example, mute is only send when the device is off hook)_:

```javascript
jabra.addEventListener("device attached", event => {
  // Handle new device
});

jabra.addEventListener("mute", event => {
  // Handle mute event.
});
```

When issuing commands, this API only works with one (active/selected) jabra device at the time _(only an issue if you have multiple Jabra devices connected at the same time)_. You can easily issue specific commands to the active device like this example:

```javascript
jabra.offHook();
```

Importantly, please do consult the
[typescript definition file](https://gnaudio.github.io/jabra-browser-integration/JavaScriptLibrary/jabra.browser.integration-3.0.d.ts) for a full description of how to use the API. See also the [source code for the examples](https://github.com/gnaudio/jabra-browser-integration/tree/master/src/DeveloperSupportRelease) listed below for usage details.

For many editors and IDE's, the above typescript definition file can be used to provide code completion and context sensitive help. For example for Visual Code, this requires top-level comment like this to your javascript source file:

```javascript
/// <reference path="<your-path-to-a-local-copy-here>/jabra.browser.integration-3.0.d.ts" />
```
### Dongle devices

Some Jabra headsets connect via Bluetooth to a USB-connected dongle. In the `getDevices` list, dongle and headset will appear separately, and the SDK will automatically sort out sending commands to the headset if called on the connected dongle and vice versa. _However_, the `devlog` event needs to be subscribed to the headset only.

## Development tools/demos
* [Call control test](https://gnaudio.github.io/jabra-browser-integration/release/development/) - test page to try out basic call control in the library
* [Library api test](https://gnaudio.github.io/jabra-browser-integration/release/test/) - advanced test page that allows detailed testing of individual API calls)
* [Playback demo with auto selection](https://gnaudio.github.io/jabra-browser-integration/release/playback/) - demo page showing auto selection of jabra device with simple audio playback example
* [Amazon Connect client demo](https://gnaudio.github.io/jabra-browser-integration/release/amazonconnectclient/) - demo showing Jabra and [Amazon Connect](https://aws.amazon.com/connect) integration

## Sequence diagrams

These sequence diagrams shows typical use of the browser sdk:

![Sequence diagram](docs/outgoing-call-then-end-call.png)

![Sequence diagram](docs/incoming-call-then-accept-on-device-then-end-call.png)

![Sequence diagram](docs/incoming-call-then-user-rejects.png)

![Sequence diagram](docs/mute-unmute-from-device.png)

![Sequence diagram](docs/hold-resume-from-device.png)

## Deployment

Documentation about [mass deployment](docs/Deployment.md)

## Upgrading API from 2.0 to 3.0

The API v3.0 is backward compatible with v2.0, and works with the current version of the Chrome Host and Chrome Extension. The new version can be consumed directly as previous versions by including the [jabra library javascript file](https://gnaudio.github.io/jabra-browser-integration/JavaScriptLibrary/jabra.browser.integration-3.0.js) or by using the new npm package [@gnaudio/jabra-browser-integration](https://www.npmjs.com/package/@gnaudio/jabra-browser-integration) in combination with a browser bundler.

### Analytics API (Preview)

This new version also includes a preview of the upcoming `Analytics` module (for supported headsets). It will analyze DevLog events and turn them into human readable statistics. The API is a pre-release and is subject to change without warning, so only use for evaluation purposes.

The following is a simple use example:

```typescript
// Start by importing the module if using our npm module.
// If using direct includes (UMD), it will be available globally under jabra.Analytics
import { Analytics } from "jabra-browser-integration";

// Create an instance of the Analytics class, if you only want analytics
// for a specific device, supply a deviceID in the constructor.
const analytics = new Analytics();

// The analytics instance exposes a bunch of methods allowing you to pull data
// as speech status, speech time, muted status, boom arm position and much more
const speechStatus = analytics.getSpeechStatus();
const speechTime = analytics.getSpeechTime();
const mutedStatus = analytics.getMutedStatus();
const boomArmStatus = analytics.getBoomArmStatus();

// You can also listen to specific events, and only fetch analytics data, when
// you believe you want

// We start by defining an event handler that reports the current speech status
const handleSpeechEvent = event => {
  console.log(analytics.getSpeechStatus());
};

// We will then add the listener transmitter speech event, and the reciever
// speech event
analytics.addEventListener("txspeech", handleSpeechEvent);
analytics.addEventListener("rxspeech", handleSpeechEvent);

// At last we will tell the analytics module to start collection analytics data
analytics.start();
```

For more information see the TypeScript declaration, where every method is documented.

## Upgrading API from 1.2 to 2.0

As noted in the [changelog](CHANGELOG.md) all methods now return values using [Javascript promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) rather than callbacks. Also, events are now subscribed to using a `addEventListener(nameSpec, callback)` and `removeEventListener(nameSpec, callback)` similar to standard libraries. With this new way of subscribing to events, the old `requestEnum` is removed as it is no longer necessary to switch on events.

The above changes were made to better handle a future expansion of events efficiently and to streamline testing and API usage in a modern way. For example, the changes made it easy to create our new API test tool. With the addition of typescript, the new API is also much easier to use ... and type safe.

The example below shows how to convert old 1.2 code like this:

```javascript
jabra.init(
  function () {
    // Handle success
  },
  function(msg) {
   // Handle error
  },
  function (req) {
    if (req == jabra.requestEnum.mute) {
      // Handle mute event
    } else if (req == jabra.requestEnum.unmute) {
      // Handle unmute event.
    }
  }
);
```

to new 2.0 compliant code:

```javascript
jabra.init().then(() => {
 // Handle success
}).catch((err) => {
 // Handle error
});

jabra.addEventListener("mute", (event) => {
 // Handle mute event.
});

jabra.addEventListener("unmute", (event) => {
 // Handle unmute event.
});
```

## Version information.

For information about individual releases see [changelog](CHANGELOG.md).
