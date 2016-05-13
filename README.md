## Physical Web CLI

### Install instructions

```
git clone https://github.com/mmocny/physical-web-cli
cd physical-web-cli
npm install
npm link # Optional: this will add `physical-web` command to globally
```

Finally, you will need to create an `API_KEYS.json` file which looks like this:

```
{
  "PWS_KEY":    "...",
  "GOO.GL_KEY": "..."
}
```

### Usage

#### Resolve URL(s) through PWS to test for correctness

`physical-web resolve [URL...]`

Alias: `r`

#### Advertise URL(s) locally using system BLE (e.g. use pc as beacon)

`physical-web advertise [URL...]`

Alias: `a`, `share`, `s`
