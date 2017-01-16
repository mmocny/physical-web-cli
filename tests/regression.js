#!/usr/bin/env node

'use strict';

/******************************************************************************/

const _ = require('lodash');
const Q = require('q');

const pw = require('../main.js');

/******************************************************************************/

function resolveAndExpect(url, expected) {
  return pw.resolve([url])
    .then(function(actual) {
      console.log("expected", JSON.stringify(expected, null, 4));
      console.log("actual", JSON.stringify(actual, null, 4));
    });
}

/******************************************************************************/

function main() {
  Q.spawn(function*() {
    yield resolveAndExpect("https://www.google.com/", {
    "results": [
        {
            "scannedUrl": "https://www.google.com/",
            "resolvedUrl": "https://www.google.com/",
            "pageInfo": {
                "title": "Google",
                "description": "Search the world's information, including webpages, images, videos and more. Google has many special features to help you find exactly what you're looking for.",
                "icon": "https://lh6.googleusercontent.com/proxy/hxv-69RTITGyZThmOiJBTI0y6zCyNL99X3Kr_J0qx3gQxXLDIEx19Yl98-ZX4Rf5e97O1RVSqWZNOQGCmT6AcTHWJHNGHC6044bTAi5DG8F9udLwFRI-0AWgWQ",
                "groupId": "6464022343067968234"
            },
            "maxCacheDuration": "86400s"
        }
    ]
});
  });
}

/******************************************************************************/

if (require.main == module) {
    main();
}

/******************************************************************************/
