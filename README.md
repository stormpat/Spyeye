## Spyeye

A very tiny program that finds info about a person by their email address. Theres also [Ruby](https://github.com/the4dpatrick/find-any-email),
[PHP](https://github.com/florianv/snoop) and [Python](https://github.com/jordan-wright/rapportive) ports.

![Demo picture](http://imgur.com/yAVdh2Y)

#### Usage

```sh
node spyeye.js find email@address.com
```

Or you can move it to your bin and make it executable.
 ```sh
 mv spyeye.js /bin/spyeye && chmod +x /bin/spyeye
 spyeye find email@address.com
 ```

#### Notice

 The API rate limit is currently set to 50 requests per hour.

