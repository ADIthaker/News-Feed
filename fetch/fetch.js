const { google } = require("googleapis");
const { Kafka } = require("kafkajs");
const NewsAPI = require('newsapi');
// const {unlink} = require('fs');
// const ytdl = require('ytdl-core');
// const { whisper } = require('whisper-node');
const OpenAIApi = require("openai");

const {getYoutubeVideos, getTranscript, getYtAudio, ytAAISummary} = require("./ytWorker");
const {getTopHeadlines} = require("./newsWorker");
const {getRedditPosts} = require("./redditWorker");
const {getAPIResult, setAPIResult} = require("./redis");
const {pushToKafka, summarizeText} = require("./utils");
const {AssemblyAI} = require("assemblyai");

const topics = ["sports", "USA", "politics", "olympics", "music", "books", "finance", "technology", "healthcare", "education"];

const aaiClient = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
});

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

const youtube = google.youtube({
    version: "v3",
    auth: process.env.GOOGLE_API_KEY,
});

const openai = new OpenAIApi({
    apiKey: process.env.OPENAI_KEY,
});

const newsapi = new NewsAPI(process.env.NEWS_KEY);

const processYtResults = async (results) => {
    for (const video of results) {
        //await getYtAudio(ytdl, video.id.videoId);
        //const audioFilePath = `./audios/${video.id.videoId}.wav`;

        //const transcript = await getTranscript(whisper, audioFilePath);

        //unlink(audioFilePath, (err) => {
        //if (err) {
           // console.error('Error deleting file:', err);
           // return;
        // }});
        //const summary = await ytSummary(aaiClient, video.id.videoId);
        //const summary = await summarizeText(openai, transcript);
        video.summary = "";
    }
    return results;
}

const processRedditResults = async (results) => {
    for (const post of results) {
        if (post.selftext != "" && post.selftext)
        {   
            console.log(post.selftext, "TO SUMMARIZE");
            const summary = await summarizeText(openai, post.selftext);
            post.summary = summary;
        } else {
        console.log("shows empty post");
            post.summary = "";
        }
    }
    return results;
}

const processNewsResults = async (results) => {
    for (const post of results) {
        const summary = await summarizeText(openai, post.content);
        post.summary = summary;
    }
    return results;
}

const getAllPosts = async (kafka, query, newsapi, youtube) => {
    try {
        // Check if cache already has results for this topic
            const isCached = await getAPIResult(`${query}-api`);
        if (!isCached.res || Object.keys(isCached.res).length === 0) {
            // Get Posts
            console.log("Getting posts for ", query);
            let newsResult = await getTopHeadlines(query, newsapi);
            let youtubeResult = await getYoutubeVideos(query, youtube);
            let redditResult = await getRedditPosts(query);
            // Summarize Posts
            console.log("Summarizing posts for ", query);
            youtubeResult = await processYtResults(youtubeResult);
            redditResult = await processRedditResults(redditResult);
            newsResult = await processNewsResults(newsResult.articles);

            // Push to Kafka
            console.log("Pushing posts for ", query);
            await pushToKafka(kafka, "news", query, newsResult);
            await pushToKafka(kafka, "reddit", query, redditResult);
            await pushToKafka(kafka, "youtube", query, youtubeResult);

            //  Add to Cache
            const toCache = {
                news: newsResult,
                reddit: redditResult,
                youtube: youtubeResult
            }
            await setAPIResult(`${query}-api`, toCache);
        } else {
            // Add old ones to cache
            //console.log("FROM CACHE FOR KAFKA",isCached.res.reddit);
            await pushToKafka(kafka, "news", query, isCached.res.news);
            await pushToKafka(kafka, "reddit", query, isCached.res.reddit);
            await pushToKafka(kafka, "youtube", query, isCached.res.youtube);
        }
        
    } catch (err) {
        console.log({
            err: true,
            msg: err,
            hint: "Fetch Error / Push Error"
        });
    }
    
}

setInterval(() => {
    console.log(`Running fetch at ${new Date().toISOString()}`);
    for(const topic of topics)
    {
        console.log(topic);
        getAllPosts(kafka, topic, newsapi, youtube);
    }
}, 12*60*60000);