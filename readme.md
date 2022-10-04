# pino-systemd-prefix-transport

*pino-systemd-prefix-transport* is a [transport][transport] for the [pino][pino] logger. *pino-systemd-prefix-transport* receives *pino* logs and adds a 3-character prefix '<' N '>' to the log, where N is a digit from 0 to 7 indicating severity of the log line.

Systemd interprets the prefix as the log level, omits it, and logs the rest of the string at the specified level.

Reference:
[systemd.exec(5)][systemd], 
[sd-daemon(3)][sd-daemon]

[systemd]: https://www.freedesktop.org/software/systemd/man/systemd.exec.html#Logging%20and%20Standard%20Input/Output
[sd-daemon]: https://www.freedesktop.org/software/systemd/man/sd-daemon.html
[transport]: https://getpino.io/#/docs/transports
[pino]: https://www.npmjs.com/package/pino


## Example

Given the log:

```json
{"level":30,"time":1664851979134,"pid":20379,"hostname":"MacBook-Pro-3","msg":"hello world!"}
```

*pino-systemd-prefix-transport* will write out:

```
<6>{"level":30,"time":1664851979134,"pid":20379,"hostname":"MacBook-Pro-3","msg":"hello world!"}
```

## Usage

```js
const pino = require('pino')
const transport = pino.transport({
  target: 'pino-systemd-prefix-transport',
  level: 'info',
  options: {
    enablePipelining: false, // optional (default: true)
    destination: 1, // optional (default: stdout)
  }
})
pino(transport)
```

There are two configurable properties:

+ `enablePipelining`: set to `false` to disable the pino transport pipeline.
+ `destination`: an integer which is used to specify the destination of the log messages. `1` is stdout, `2` is stderr and others numbers must be a file descriptor. This option is used only when the pipelining is disabled.

### Pipelining

This feature is enabled by default and let you to submit the output to another destination at your choice, such as a `socket` using the `pino-socket` module:

```js
const transport = pino.transport({
  pipeline: [
    {
      target: 'pino-systemd-prefix-transport',
      level: 'info',
      options: {
        ... // other options
      }
    },
    {
      target: 'pino-socket',
      options: {
        mode: 'tcp',
        address: '127.0.0.1',
        port: 8001
      }
    }
  ]
})
pino(transport)
```
### Note

[pino legacy transport](https://getpino.io/#/docs/transports?id=legacy-transports)
is not supported.

## License

MIT
