# Footprint Sentinel

A tool for **developers** and **editors** to measure and visualize the footprint of a web page or web application. It gives a first indication if your application 
is optimized for a small footprint. 

You can also use it to track the footprint of your application over time using tools like Matomto or Google Analytics. This way you 
can see if your changes have a positive or negative impact on the footprint of your application. You can also monitor the footprint
of individual urls. This way you can spend your time on the most important parts of your application.

We do not measure the footprint in CO2, but in bytes. This is more useful for developers and editors to understand the impact of their changes.

We use this Article from [sustainablewebdesign.org](https://sustainablewebdesign.org/digital-carbon-ratings/) as a reference to calculate the footprint of your
application.

## If you are a developer

* use this tool during development to always see the part of your application you are currently working on
* instead of displaying CO2 we display the footprint in bytes, which is more useful for developers
* you always see the footprint so you will notice if changes you make increase the footprint without always checking the network tab
* use the network tab or other dev tools of your choice to inspect further
* get inline hints for images to see if they are optimized correctly
* identify issues with the editorial content of your application and get in touch with the editors faster

## If you are an editor

* use this tool when creating or editing content to see the impact of your changes
* get inline hints for images to see if they are optimized correctly
* identify technical issues with optimization of your content and get in touch with the developers faster
* if a technical optimization is not possible, you can still optimize the content to reduce the footprint. E.g. correctly sized images, 
  removing redundant images, etc.

## Installation

`npm install footprint-sentinel`

`yarn add footprint-sentinel`

## Usage

### Give me the defaults

This will give you the full UI (sentinel at the bottom and inline hints for large resources).
The thresholds for inline hints are set to reasonable defaults.

```ts
FootprintSentinel.getInstance()
```

All default options can be found [here](src/FSOptions.ts).

### Customize thresholds

```ts
FootprintSentinel.getInstance()({
    // Threshold for the maximum size of a single resource
    // This is a hard limit even if the maxBytesPer100x100Threshold would allow a bigger resources.
    maxBytesPerResourceThreshold: 200 * 1024,
    // Threshold used for calculating the maximum size of a resource based on its rendered size.
    maxBytesPer100x100Threshold: 10 * 1024,
    // Threshold for the minimum size of a resource to be considered for inline hints.
    // We want to improve performanc and not clutter the UI hints that have a very small impact.
    ignoreResourcesBelowBytesThreshold: 40 * 1024,
})
```

### Headless mode and tracking

Use callbacks to track the footprint of your application. You might want to use the headless mode to not display the UI, but still track the footprint.

We recommend to use the delta for tracking the footprint over time. This way you do not lose too much information if the user
navigates to a different page or reloads the page. The delta is the difference between the current footprint and the last footprint.

We will provide more examples for Matomo and Google Analytics in the future.

```ts
FootprintSentinel.getInstance()({
    showSentinel: false,
    showResourceHints: false,
    onInitialFootprint: (footprint) => console.log("onInitialFootprint", footprint),
    onFootprintChange: (footprint) => console.log("onFootprintChange", footprint)
})
```

```ts
// Calbacks are called with the footprint object

const footprint = {
    total: {
        bytes: 204800,
        bytesFormatted: "200 KB",
        rating: "A+",
        color: "#00febc"
    },
    lastDelta: { bytes: 10240, bytesFormatted: "10 KB"},
}
```

## Motivation

TODO


## Roadmap/Ideas

* provide more hints e.g. if resource is a gif: "Use webp animation instead, ...", "Do not use autoload="metadata", ...
* provide knowledge base
* cach bust mode so reload without cache is not need
	* if transfered size is 0 fetch resource with cachebust -> should never be activated on production site
* more evolved algorithm to decide if resource size is to big for rendered size
* add hints for hidden resources -> css, js, ...
