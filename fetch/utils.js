const checkIfTopicExists = async (kafka, topicName) => {
    try {
        const admin = kafka.admin();
        console.log("Admin connecting...");
        admin.connect();
        const topics = await admin.listTopics();
        return topics.includes(topicName);

    } catch (err) {
        console.log({
            err: true,
            msg: err,
            hint: "Kafka Error"
        });
        return false;
    }
}

const createTopics = async (kafka, topicName) => {
    try {

        const admin = kafka.admin();
        console.log("Admin connecting...");
        admin.connect();
        console.log("Admin Connection Success...");
    
        console.log(`Creating Topic ${topicName}`);
        await admin.createTopics({
        topics: [
            {
            topic: topicName,
            numPartitions: 2,
            },
        ],
        });
        console.log(`Topic Created Success ${topicName}`);
        console.log("Disconnecting Admin..");
        await admin.disconnect();

    } catch (err) {
        console.log({
            err: true,
            msg: err,
            hint: "Kafka Error"
        });
    }
}
const ensureTopics = async (kafka) => {
    try {
        let isToFeed = await checkIfTopicExists(kafka, "posts");
        if(!isToFeed) {
            await createTopics(kafka, "posts");
        }

    } catch (err) {
        console.log({
            err: true,
            msg: err,
            hint: "Kafka Error"
        });
    }
    
}

exports.pushToKafka = async (kafka, src, topic, result) => {
    try {
        await ensureTopics(kafka);
        const producer = kafka.producer();
        console.log("Connecting Producer");
        await producer.connect();
        console.log("Producer Connected Successfully"); 
       // console.log("To push", JSON.stringify(result), "summary", result.summary);   
        await producer.send({
        topic: "posts",
        messages: [
            {
            key: `${src}-${topic}`,
            value: JSON.stringify(result),
            },
        ],
        });
        await producer.disconnect();

    } catch (err) {
        console.log({
            err: true,
            msg: err,
            hint: "Kafka Error"
        });
    }    
}



exports.summarizeText = async (openai, text) => {
    try {
      const response = await openai.chat.completions.create({
        messages: [
            { role: "system", content: "You are a helpful assistant, that summarizes social media posts for users quick browsing. Your job is to create a summary, which is really just a shorter, precise, non-hallucinating represenatation of the text given. Please keep the first person talk as first psrson, and third person talk as it is, dont interchange for the sake of summary, summmarize it with the given conditions." },
            {
                role: "user", content: `Summarize this text:\n\n${text}`,
            }
        ],
        model: "gpt-3.5-turbo",
      });
        console.log("GOT SUMMARY FROM OPENAI", response.choices[0].message.content); 
      return response.choices[0].message.content;
    } catch (error) {
      console.error("Error summarizing text:", error);
      return "Error occurred while summarizing.";
    }
}