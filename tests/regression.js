#!/usr/bin/env node

'use strict';

/******************************************************************************/

const _ = require('lodash');
const Q = require('q');

const pw = require('../main.js');

/******************************************************************************/

function compareValues(expected, actual) {
  if (typeof expected === 'function')
    return expected(actual);
  return expected == actual;
}

/******************************************************************************/

function RegEx(regex) {
  return (actual) => (new RegExp(regex)).test(actual);
}

/******************************************************************************/

function Prefix(prefix) {
  return (actual) => actual.startsWith(prefix);
}

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
  Q.spawn(function * () {
    yield resolveAndExpect("https://www.google.com/", {
      "results" : [ {
        "scannedUrl" : "https://www.google.com/",
        "resolvedUrl" : "https://www.google.com/",
        "pageInfo" : {
          "title" : "Google",
          "description" :
              "Search the world's information, including webpages, images, videos and more. Google has many special features to help you find exactly what you're looking for.",
          "icon" : Prefix("https://lh6.googleusercontent.com/proxy/"),
          "groupId" : RegEx(/[1234567890]*/),
        },
        "maxCacheDuration" : /.*/,
      } ]
    });
  });
}

/******************************************************************************/

if (require.main == module) {
    main();
}

/******************************************************************************/
