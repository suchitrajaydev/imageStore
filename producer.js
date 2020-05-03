const kafka = require('kafka-node');

// Kafka
try {
	var Producer = kafka.Producer,
	  client = new kafka.KafkaClient(),
	  producer = new Producer(client);
  
	var kafka_topic = "create-album";
  
	producer.on('ready', function () {
	  console.log("Producer is ready to send message!");
	});
  
	producer.on('error', function (err) {})
  }catch (e) {
	console.log("Producer refuses to come up!!");
  }

module.exports = {
	producer,
	kafka_topic
}
