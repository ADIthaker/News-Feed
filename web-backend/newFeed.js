const {getYoutubeVideos} = require("./utils/ytWorker");
const {getTopHeadlines} = require("./utils/newsWorker");
const {getRedditPosts} = require("./utils/redditWorker");
const {summarizeText} = require("./utils/summarize");
const {addToFeed} = require('./utils/redis');
const OpenAIApi = require("openai");
const NewsAPI = require('newsapi');
const { google } = require("googleapis");

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


exports.getNewUserFeed = async (userId, topics) => {
    try {
        let newsResults = [];
        let youtubeResults = [];
        let redditResults = [];
        for (const query of topics) {
            
            console.log("Getting posts for ", query);
            let newsResult = await getTopHeadlines(query, newsapi);
            let youtubeResult = await getYoutubeVideos(query, youtube);
            let redditResult = await getRedditPosts(query);
            // Summarize Posts
            console.log("Summarizing posts for ", query);
            youtubeResult = await processYtResults(youtubeResult);
            redditResult = await processRedditResults(redditResult);
            newsResult = await processNewsResults(newsResult.articles);

            newsResults = newsResults.concat(newsResult);
            redditResults = redditResults.concat(redditResult);
            youtubeResults = youtubeResults.concat(youtubeResult);
            
        }

        await addToFeed(`${userId}-feed`, JSON.stringify(newsResults));
        await addToFeed(`${userId}-feed`, JSON.stringify(redditResults));
        await addToFeed(`${userId}-feed`, JSON.stringify(youtubeResults)); 
        return {res:[youtubeResults, redditResults, newsResults]};

    } catch (err) {
        console.log(err);
        return [];
    }
    

}