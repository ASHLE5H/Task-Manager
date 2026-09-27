const amqb = require("amqplib")

async function start() {
        try{
            connection = await amqb.connect("amqp://rabbitmq");
            channel = await connection.createChannel();

            await channel.assertQueue("task_created");
            console.log("connected to RabbitMQ");

            channel.consume("task_created" , (msg)=>{
                const taskData = JSON.parse(msg.content.toString());
                console.log("Notification New Task: ", taskData.title);
                console.log("Task: ", taskData);
                channel.ack(msg)
            })
        }catch(error){
            console.error("RabbitMQ connection error: " , error.message);
        }
}

start();