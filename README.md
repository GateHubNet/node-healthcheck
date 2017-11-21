# Node auto services health checking
Library takes care of automatically recognizing and tracking services such as databases. 

## Running the library
The easiest and least intrusive way of running this library is with the `-r` Node flag. This will enable all available probes, run a http server on the default port and expose a `/healtz` endpoint. 
```
node -r gatehub/node-healthcheck/all index.js
```

You can manually require the package, which gives you additional configuration options.
```
let config = {
	port: 65000,
	enable: ['redis', 'mysql-ping', 'amqp'],
	verbose: true,
};
require('gatehubnet/node-healthcheck')(config);
```

In some cases you don't want an extra http server running. If you pass value `null` as `port`, the initialization will not create a http server, but rather return a health reporting function, which can be used to manually create a health check endpoint.
```
let config = {
	port: null,
	enable: ['redis'],
};

let healthFn = require('gatehubnet/node-healthcheck')(config);
// healthFn() returns { status: <http status code>, [services: [{ redis: <OK|FAIL> }]]}
```


### Configuration options
| Option        | Description   | Default  |
| ------------- |:-------------:| --------:|
| port      	| The port on which to run the http server with the `/healthz` endpoint. If set to `null` the server won't start. | 40124 |
| enable        | Array of probes to enable | `[]` |
| verbose		| Sepcifies whether the response should include only the status code or additional information about the services | `false` |

## Supported services
| Service    | Compatibility           																						  | Probes  	 |
| -----------|:--------------------------------------------------------------------------------------------------------------:| ------------:|
| mysql      | library that uses `mysql` library underneath ([mysqljs/mysql](https://github.com/mysqljs/mysql)) 			  | `mysql-ping` |
| redis      | library that uses `redis` library underneath ([NodeRedis/node_redis](https://github.com/NodeRedis/node_redis)) | `redis` 	 |
| amqp 		 | library that uses `amqplib` library underneath ([squaremo/amqp.node](https://github.com/squaremo/amqp.node))   | `amqp` 		 |
 
## Using
