const fs = require("fs");
const path = require("path");
exports.getYoutubeVideos = async (searchQuery, youtube) => {
    try {
            let maxResults = 10;
   const res = await youtube.search.list({
        part: "snippet",
        type: "video",
        maxResults,
        q: searchQuery,
      });
       //console.log(res.data.items);
        return res.data.items;

      }catch(err) {
              console.log(err); 
              throw err;
        };
  
}

exports.getYtAudio = (ytdl, videoId) => {
  let url = `https://www.youtube.com/watch?v=${videoId}`
  let outputFilePath = path.resolve(__dirname,`./audios/${videoId}.wav`)
  return new Promise((resolve, reject) =>{
    ytdl(url, {filter:'audioonly', format:'wav'})
    .pipe(fs.createWriteStream(outputFilePath))
    .on('finish', () => {
      console.log('Video downloaded successfully!');
      resolve();
    })
    .on('error', (err) => {
      console.error('Error downloading video:', err);
      reject(err);
    });
  });
}

exports.getTranscript = async (whisper, filePath) =>
{
  const transcript = await whisper(filePath);
  return transcript;
}

exports.ytAAISummary = async (aaiClient, videoId) => {
        console.log("Retrieving audio URL from YouTube video");
  let url = `https://www.youtube.com/watch?v=${videoId}`
const videoInfo = await youtubeDl(url, {
  dumpSingleJson: true,
  preferFreeFormats: true,
  addHeader: ["referer:youtube.com", "user-agent:googlebot"],
});

const audioUrl = videoInfo.formats.reverse().find(
  (format) => format.resolution === "audio only" && format.ext === "m4a",
)?.url;

if (!audioUrl) {
  throw new Error("No audio only format found");
}
console.log("Audio URL retrieved successfully");
console.log("Audio URL:", audioUrl);
const transcript = await aaiClient.transcripts.transcribe({
  audio: audioUrl,
});
if (transcript.status === "error") {
  throw new Error("Transcription failed: " + transcript.error);
}

console.log("Transcription complete");

const prompt = "Summarize this video using bullet points";
const lemurResponse = await aaiClient.lemur.task({
  transcript_ids: [transcript.id],
  prompt,
  final_model: "default"
});

return lemurResponse.response;
}


// [
//     {
//       kind: 'youtube#searchResult',
//       etag: '-JB2wzvCtIAc2j91EEZdmsD1oOg',
//       id: { kind: 'youtube#video', videoId: 'vCqZQOqUiqo' },
//       snippet: {
//         publishedAt: '2024-11-24T17:00:49Z',
//         channelId: 'UC-lHJZR3Gqxm24_Vd_AJ5Yw',
//         title: 'Happy Wheels in 2024 is crazy..',
//         description: "Get exclusive NordVPN deal here ➵ https://NordVPN.com/pewdiepie It's risk free with Nord's 30 day money-back guarantee!",
//         thumbnails: [Object],
//         channelTitle: 'PewDiePie',
//         liveBroadcastContent: 'none',
//         publishTime: '2024-11-24T17:00:49Z'
//       }
//     },
//     {
//       kind: 'youtube#searchResult',
//       etag: 'iF8JrfHd-C6OeveSmoQfH79crJs',
//       id: { kind: 'youtube#video', videoId: 'IkU3c1kERcw' },
//       snippet: {
//         publishedAt: '2024-11-15T17:00:25Z',
//         channelId: 'UC-lHJZR3Gqxm24_Vd_AJ5Yw',
//         title: 'I put on a suit and went to Australia for this',
//         description: "Get exclusive NordVPN deal here ➵ https://NordVPN.com/pewdiepie It's risk free with Nord's 30 day money-back guarantee!",
//         thumbnails: [Object],
//         channelTitle: 'PewDiePie',
//         liveBroadcastContent: 'none',
//         publishTime: '2024-11-15T17:00:25Z'
//       }
//     },
//     {
//       kind: 'youtube#searchResult',
//       etag: '1uxeSQQigQaAkAIzoQ-fbHP8oOM',
//       id: { kind: 'youtube#video', videoId: 'GPLImB-I71w' },
//       snippet: {
//         publishedAt: '2024-10-29T17:00:14Z',
//         channelId: 'UC-lHJZR3Gqxm24_Vd_AJ5Yw',
//         title: 'I Drew Every Day for 365 Days..... *it was painful*',
//         description: 'Stock Up On ➡️  Gfuel (affiliate): https://affiliateshop.gfuel.com/pewdiepie #Code #Pewdiepie Get exclusive NordVPN deal here ...',
//         thumbnails: [Object],
//         channelTitle: 'PewDiePie',
//         liveBroadcastContent: 'none',
//         publishTime: '2024-10-29T17:00:14Z'
//       }
//     },
//     {
//       kind: 'youtube#searchResult',
//       etag: '1ocec6Qej2l3uptlkshgKxH_I3k',
//       id: { kind: 'youtube#video', videoId: 'l3CxJTx_KX0' },
//       snippet: {
//         publishedAt: '2024-10-31T18:15:02Z',
//         channelId: 'UCewMTclBJZPaNEfbf-qYMGA',
//         title: 'How PewDiePie lost 1 million subscribers',
//         description: 'How PewDiePie lost 1 million subscribers.',
//         thumbnails: [Object],
//         channelTitle: 'JackSucksAtLife',
//         liveBroadcastContent: 'none',
//       etag: '1ocec6Qej2l3uptlkshgKxH_I3k',
//       id: { kind: 'youtube#video', videoId: 'l3CxJTx_KX0' },
//       snippet: {
//         publishedAt: '2024-10-31T18:15:02Z',
//         channelId: 'UCewMTclBJZPaNEfbf-qYMGA',
//         title: 'How PewDiePie lost 1 million subscribers',
//         description: 'How PewDiePie lost 1 million subscribers.',
//         thumbnails: [Object],
//         channelTitle: 'JackSucksAtLife',
//         liveBroadcastContent: 'none',
//       snippet: {
//         publishedAt: '2024-10-31T18:15:02Z',
//         channelId: 'UCewMTclBJZPaNEfbf-qYMGA',
//         title: 'How PewDiePie lost 1 million subscribers',
//         description: 'How PewDiePie lost 1 million subscribers.',
//         thumbnails: [Object],
//         channelTitle: 'JackSucksAtLife',
//         liveBroadcastContent: 'none',
//         publishedAt: '2024-10-31T18:15:02Z',
//         channelId: 'UCewMTclBJZPaNEfbf-qYMGA',
//         title: 'How PewDiePie lost 1 million subscribers',
//         description: 'How PewDiePie lost 1 million subscribers.',
//         thumbnails: [Object],
//         channelTitle: 'JackSucksAtLife',
//         liveBroadcastContent: 'none',
//         channelId: 'UCewMTclBJZPaNEfbf-qYMGA',
//         title: 'How PewDiePie lost 1 million subscribers',
//         description: 'How PewDiePie lost 1 million subscribers.',
//         thumbnails: [Object],
//         channelTitle: 'JackSucksAtLife',
//         liveBroadcastContent: 'none',
//         description: 'How PewDiePie lost 1 million subscribers.',
//         thumbnails: [Object],
//         channelTitle: 'JackSucksAtLife',
//         liveBroadcastContent: 'none',
//         channelTitle: 'JackSucksAtLife',
//         liveBroadcastContent: 'none',
//         publishTime: '2024-10-31T18:15:02Z'
//       }
//         publishTime: '2024-10-31T18:15:02Z'
//       }
//     },
//     },
//     {
//     {
//       kind: 'youtube#searchResult',
//       etag: 'MTgt98kOealuK_xk7rp6ZJNc9tk',
//       id: { kind: 'youtube#video', videoId: 'Tbwbq-03aOc' },
//       etag: 'MTgt98kOealuK_xk7rp6ZJNc9tk',
//       id: { kind: 'youtube#video', videoId: 'Tbwbq-03aOc' },
//       id: { kind: 'youtube#video', videoId: 'Tbwbq-03aOc' },
//       snippet: {
//       snippet: {
//         publishedAt: '2024-10-14T17:00:20Z',
//         channelId: 'UC-lHJZR3Gqxm24_Vd_AJ5Yw',
//         title: 'If you laugh... You&#39;re a bad person..',
//         description: "Get exclusive NordVPN deal here ➵ https://NordVPN.com/pewdiepie It's risk free with Nord's 30 day money-back guarantee!",
//         thumbnails: [Object],
//         channelTitle: 'PewDiePie',
//         liveBroadcastContent: 'none',
//         publishTime: '2024-10-14T17:00:20Z'
//       }
//     }
//   ]