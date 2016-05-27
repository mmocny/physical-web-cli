#!/usr/bin/env node

'use strict';

/******************************************************************************/

const fetch = require('node-fetch');
const _ = require('lodash');
const Q = require('q');

/******************************************************************************/

function GetConfig() {
  const config = require('./config.json');
  const config_private = require('./config.PRIVATE.json');
  _.merge(config, config_private);
  return config;
}

function GetConfigAt(/* path... */) {
  const path = Array.prototype.slice.call(arguments);
  let config = GetConfig();

  for (let key of path) {
    if (typeof config !== 'object')
      throw new Error("Cannot find config value at: " + path.toString());
    config = config[key];
  }

  return config;
}

/******************************************************************************/

function resolve(urls) {
  console.log('Resolve', urls);

  const pws_resolve_url = GetConfigAt("pws", "resolve", "url");
  const pws_apikey = GetConfigAt("pws", "api-key");
  const pws_url = `${pws_resolve_url}?key=${pws_apikey}`

  const body = JSON.stringify({
    urls: urls.map((url) => { return { url }; })
  });

  fetch(pws_url, {
    method: 'POST',
    headers: GetConfigAt("pws", "resolve", "headers"),
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
  const URL = require('url');

  goo_gl.setKey(GetConfigAt("goo.gl", "api-key"));

  Q.all(urls.map((url) => {
    let short_url_promise = (URL.parse(url).hostname == 'goo.gl') ? Q(url) : goo_gl.shorten(url);
    return short_url_promise
      .then((short_url) => {
        console.log(`Advertising and Watching: ${url} [ short: ${short_url} ]`);
        es_beacon.advertiseUrl(short_url, [GetConfigAt("beacon", "options")]);

        /*
        setInterval(() => {
          goo_gl.analytics(short_url, { projection: "FULL" })
            .then((results) => {
              let last2 = results["twoHours"];
              let clicks = last2["shortUrlClicks"];
              let browsers = (last2["browsers"] || []).map((vals) => `${vals.id}: ${vals.count}`).join(", ");
              let platforms = (last2["platforms"] || []).map((vals) => `${vals.id}: ${vals.count}`).join(", ");
              console.log(`${url}: ${clicks} || ${browsers} || ${platforms}`);
            }).done();
        }, 2000);
        */
      });
    })
  ).done();
}

/******************************************************************************/

function help() {
  console.log('No Help Available.');
}

function usage() {
  console.log('Invalid usage.');
}

/******************************************************************************/

function main() {
  let args = process.argv.slice(2);
  if (args.length == 0)
    return usage();

  let command = args.shift();

  switch (command) {
    case 'help':
      return help();

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
