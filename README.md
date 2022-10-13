# Messenger Api
Messenger api built with express &amp; mongodb.<br>
based on the internet engineering course assignment at shahid beheshti university.<br>
Swagger: <a href="https://app.swaggerhub.com/apis/nimah79/Messenger/1.0.0">https://app.swaggerhub.com/apis/nimah79/Messenger/1.0.0</a>

## How To Run
to run on docker, for the first time, you need to build the nodejs image:
```
docker build .
```

then start the container:
```
docker compose up
```

i config nodemon in docker compose file, so if you want to use this project on production environment, you should replace it with node script.

if you don't want to use docker, start mongodb server seperately and run app.js with 'npm start' or 'npm run nodemon'.

config.json:
```json
{
    "secret": "secret",
    "db": {
        "name": "api",
        "url": "mongodb://mongo:27017/api",
        "users": "users",
        "groups": "groups",
        "usergroups": "usergroups",
        "requestgroups": "requestgroups",
        "connectionrequests": "connectionrequests",
        "chats": "chats"
    }
}
```

mongodb port is 27017 and nodejs port is 3000, feel free to edit.

## How To Test
i used Jest library for writing tests. if you ran the database on docker, you should first get into the container bash:
```bash
 docker exec -it messenger-app bash
```
to run the tests, simply execute this:
```bash
npm test
```
i didn't create another database for test(because it's just a test product), feel free to create seperate database for yourself.

## Loggers
[Morgan](https://www.npmjs.com/package/morgan) Package used to log http requests. logs will be written into logs/access.log file.

```js
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'logs/access.log'), { flags: 'a' })
app.use(morgan('combined', { stream: accessLogStream }))
```
[Winston](https://www.npmjs.com/package/winston) package used to create custom logger. i created winston.js file just for sample, you can modify and use it.
```js
import { createLogger, format, transports, config } from 'winston';

const customLogger = createLogger({

    levels: config.syslog.levels,
    format: combine(
        timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        })),
    transports: [
        new transports.File({ filename: '../logs/custom.log' })
    ]
});

module.exports = {
    customLogger
}
``` 

## Requests
Beside Postman, i used [REST Client](https://marketplace.visualstudio.com/items?itemName=MadsKristensen.RestClient) Extension in VS Code to send https request. sample files are in requests folder.
