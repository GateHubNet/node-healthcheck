require('../index.js')({
	port: 40124,
	enable: ['redis', 'amqp', 'mysql-ping'],
	verbose: true,
})