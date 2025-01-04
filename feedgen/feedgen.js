const { Kafka } = require("kafkajs");

//require("dotenv").config()


const { EmbeddingModel, FlagEmbedding } = require("fastembed");


const {addToFeed, getFeed} = require("./redis.js");
const {connect} = require("./db.js");
const User = require('./User.js');

const kafka = new Kafka({
    clientId: "contentcuration",
    brokers: ["my-kafka.default.svc.cluster.local:9092"],
    connectionTimeout: 5000,
    sasl: {
      mechanism: 'SCRAM-SHA-256', // scram-sha-256 or scram-sha-512
      username: 'user1',
      password: 'MqvdMTxyt7'
    },
});


const searchUsers = async(topic) => {
    connect(process.env.MONGODB_URI);
    const embeddingModel = await FlagEmbedding.init({ model: EmbeddingModel.BGEBaseEN });
    const topicVectors =  embeddingModel.embed(topic, 768);
    const embeddings = [];
    for await (const batch of topicVectors) {
        // batch is list of Float32 embeddings(number[][]) with length 2
        for (const vec of batch){
            embeddings.push(Array.from(vec));
        }
    }
    console.log("Gettings embeddings for", topic);
    const res = await User.aggregate([
        {
          "$vectorSearch": {
            "index": "vector_index", // Name of Vector Search Index
            "numCandidates": 100,
            "path": "topics",
            "limit": 10,
            "queryVector": embeddings[0],
            "knnBeta": {
            "vector": embeddings[0],
            "path": "topics", // Name of the 'embedding' field
            "k": 5,
            }
          }
        }
        ]);
    return res;
}

const appendToFeed = async (post, user) => {
    try {
        const postKey = `${user._id}-feed`;
        console.log("Adding to redis", post);
        const feed = await getFeed(postKey);
        if (Object.keys(feed.res).length == 0) {
            await addToFeed(postKey, post);
        }
    } catch(err) {
        console.log({
            err: true,
            msg: err,
            hint: "Updating Redis with Feed"
        });
    }
}
const addToAllFeeds = async (users, posts) => {
        console.log("matching users", users);
    for (const user of users) {
        await appendToFeed(posts, user);
    }
}
const createFeed = async (kafka) => {
    try {
        let group = "feedgenerators";
        const consumer = kafka.consumer({ groupId: group });
        await consumer.connect();

        await consumer.subscribe({ topics: ["posts"], fromBeginning: true});

        await consumer.run({
            eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
                console.log("I GOT A MESSAGE FROM KAFKA", message, "TOPIC IS", topic);
                const userTopic = message.key.toString().split("-")[1];
                const src = message.key.toString().split("-")[0];
                const users = await searchUsers([userTopic]);
                //console.log(message.value.toString());
                await addToAllFeeds(users, message.value.toString());
            },
        });
    } catch (err) {
        console.log({
            err:true,
            msg: err,
            hint:"Feed Creation Error"
        })
    }
    
}

setInterval(() => {
    console.log(`Running Create Feed at ${new Date().toISOString()}`);
    createFeed(kafka);
}, 12*60*60000);