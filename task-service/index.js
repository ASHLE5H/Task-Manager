const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const amqb = require('amqplib')

const app = express();

const port = 3002

app.use(bodyParser.json())

mongoose.connect('mongodb://mongo:27017/tasks').then(()=>console.log("connected to task mongodb"))
.catch(err => console.log("mongodb connection error:" , err));

const TaskSchema = new mongoose.Schema({
   title: String,
   description: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
},
   createdAt:{
    type:Date,
    default: Date.now
   }
});

const Task = mongoose.model('Task' , TaskSchema)

let channel , connection;

async function connectRabbitMQWithRetry(retries = 5 , delay = 3000) {
    while(retries){
        try{
            connection = await amqb.connect("amqp://rabbitmq");
            channel = await connection.createChannel();
            await channel.assertQueue("task_created");
            console.log("connected to RabbitMQ");
            return;
        }catch(error){
            console.error("RabbitMQ connection error: " , error.message);
            retries--;
            console.log("Retrying Again: ", retries);
            await new Promise(res => setTimeout(res, delay));
        }
    }
}

app.get('/' , (req , res)=>{
    res.send("Wrong Page");
})


app.get("/tasks" , async(req , res)=>{
    const tasks = await Task.find();
    res.json(tasks);    
})

app.post('/tasks' , async(req , res)=>{
    const {title , description ,userId  } = req.body;
    try{
        const task = new Task( {title , description ,userId  });

        await task.save();

        const message = {taskId: task._id , userId , title};

        if(!channel){
            return res.status(503).json({error:"RabbitMQ not connected"})
        }

        channel.sendToQueue("task_created" , Buffer.from(
            JSON.stringify(message)
        ));

        res.status(201).json(task);
    }catch(err){
        console.log("Error:", err);
        res.status(500).json({error : "Internal Server Error"});
    }
})




app.listen(port , (req , res)=>{
    console.log(`Task Service Running on port localhost:${port}`);
    connectRabbitMQWithRetry();
})