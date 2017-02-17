## Physical Web CLI

### Install instructions

```
git clone https://github.com/mmocny/physical-web-cli
cd physical-web-cli
npm install
npm link # Optional: this will add `physical-web` command to globally
```

Finally, you will need to update `config.json` file to add various api keys.

### Usage

#### Resolve URL(s) through PWS to test for correctness

`physical-web resolve [URLs]`

Alias: `r`

#### Advertise URL(s) locally using system BLE (e.g. use pc as beacon)

`physical-web advertise [URL...]`

Alias: `a`, 'broadcast', 'b', `share`

#### Scan for URL(s) locally using system BLE

`physical-web [scan]`

Default action with no arguments.
Alias: `s`
