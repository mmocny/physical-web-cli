#!/usr/bin/env node

'use strict';

/******************************************************************************/

const fetch = require('node-fetch');
const Q = require('q');

/******************************************************************************/

const PWS_SERVER = "https://physicalweb.googleapis.com/v1alpha1";
const PWS_ENDPOINT = "urls:resolve";

function api_key(which) {
  let keys = require('./API_KEYS.json');
  return keys[which];
}

/******************************************************************************/

function resolve(urls) {
  console.log('Resolve', urls);

  const PWS_API_KEY = api_key("PWS_KEY");
  const PWS_URL = `${PWS_SERVER}/${PWS_ENDPOINT}?key=${PWS_API_KEY}`

  const body = JSON.stringify({
    urls: urls.map((url) => { return { url }; })
  });

  fetch(PWS_URL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body
  }).then(function(response) {
    return response.json();
  }).then(function(json) {
    console.log(JSON.stringify(json, null, 4));
  }).catch(function(ex) {
    console.log('parsing failed', ex);
  });
}

/******************************************************************************/

function advertise(urls) {
  console.log('Advertise', urls);
  // TODO: try to resolve to make sure this works

  const es_beacon = require('eddystone-beacon');
  const es_url_encode = require('eddystone-url-encoding').encode;
  const goo_gl = require('goo.gl');

  const GOOGL_API_KEY = api_key("GOO.GL_KEY");
  goo_gl.setKey(GOOGL_API_KEY);

  let options = {
    name: 'Physical Web Beacon',    // set device name when advertising (Linux only)
    txPowerLevel: -22, // override TX Power Level, default value is -21,
    //tlmCount: 2,       // 2 TLM frames
    //tlmPeriod: 10      // every 10 advertisements
  };

  Q.all(urls.map((url) => {
    return goo_gl.shorten(url)
      .then((short_url) => {
        console.log(`Advertising and Watching: ${url} [short: ${short_url}]`);
        es_beacon.advertiseUrl(short_url, [options]);
        setInterval(() => {
          goo_gl.analytics(short_url, { projection: "FULL" })
            .then((results) => {
              let last2 = results["twoHours"];
              let clicks = last2["shortUrlClicks"];
              let browsers = last2["browsers"].map((vals) => `${vals.id}: ${vals.count}`).join(", ");
              let platforms = last2["platforms"].map((vals) => `${vals.id}: ${vals.count}`).join(", ");
              console.log(`${url}: ${clicks} || ${browsers} || ${platforms}`);
            }).done();
        }, 2000);
      });
    })
  ).done();
}

/******************************************************************************/

function usage() {
  console.log('Invalid command');
}

/******************************************************************************/

function main() {
  let args = process.argv.slice(2);
  if (args.length == 0)
    return usage();

  let command = args.shift();

  switch (command) {
    case 'help':
      return usage();

    case 'advertise':
    case 'a':
    case 'share':
    case 's':
      return advertise(args);

    case 'resolve':
    case 'r':
      return resolve(args);

    default:
      return usage();
  }
}

/******************************************************************************/

main();
