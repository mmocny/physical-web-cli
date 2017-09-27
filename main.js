#!/usr/bin/env node

'use strict';

/******************************************************************************/

const fetch = require('node-fetch');
const _ = require('lodash');
const Q = require('q');
const extend = require('extend');

/******************************************************************************/

let config = null;
function GetConfig() {
  if (!config) {
    config = _.merge(require('./config.json'), require('./config.PRIVATE.json'));
  }
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
  const body = JSON.stringify({
    urls: urls.map((url) => ({ url })),
    options: { is_user_facing: false }
  });

  return fetch(pws_resolve_url, {
    method: 'POST',
    headers: GetConfigAt("pws", "resolve", "headers"),
    body
  }).then(function(response) {
    return response.json();
  })
  .catch(function(ex) {
    console.error(ex);
  });
}

/******************************************************************************/

function scan() {
  return require('physical-web-scan');
}

/******************************************************************************/

function advertise(urls) {
  return resolve(urls)
    .then(function(json) {
      console.log(JSON.stringify(json, null, 4));

      if (!('results' in json)) {
        console.warn('WARNING: URLs did not resolve in PWS.');
      }
    })
    .then(function() {
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
    })
    .catch(function(ex) {
      console.error(ex);
    });
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

  let command = args.shift();

  if (command == '--test') {
    // Hack: since GetConfig() returns shared state, we can modify it globally
    let config = GetConfig();
    config['pws'] = config['pws-test'];

    command = args.shift();
  }

  if (command.startsWith('http')) {
    args.unshift(command);
    command = 'resolve';
  } else if (!command) {
    command = 'scan';
  }

  switch (command) {
    case 'advertise':
    case 'a':
    case 'broadcast':
    case 'b':
    case 'share':
      return advertise(args);

    case 'scan':
    case 's':
      return scan(args);

    case 'resolve':
    case 'r':
      return resolve(args)
        .then(function(json) {
          console.log(JSON.stringify(json, null, 4));
        });

    case 'help':
    default:
      return help();
  }
}

/******************************************************************************/

if (require.main == module) {
  main();
}

/******************************************************************************/

extend(module.exports, {
  advertise,
  resolve
});
