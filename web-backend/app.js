const express = require("express");
const User = require('./models/User.js');
const {connect} = require("./utils/db.js");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const {getFeed} = require('./utils/redis.js');
const { EmbeddingModel, FlagEmbedding } = require("fastembed");
const {getNewUserFeed} = require('./newFeed.js');
const app = express();
const verifyToken = require("./middlewares/auth.js");
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log("Body", req.body);
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.log("Body", req.body);
        res.status(500).json({ error: 'Registration failed', msg: error });
    }
});
   
// User login
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'Authentication failed, No such User' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Authentication failed, Password wrong' });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '30d',
        });
        res.status(200).json({ token, user }); // send user with login
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});
//verifyToken
app.get("/feed",  verifyToken, async (req, res) => {
    let feed = [
        {
            userId: req.userId,
            title:"title",
            summary: "summary",
            link:"link"
        },
    ]
    try {
    let key = `${req.userId}-feed`;
    let userFeed = await getFeed(key);
            console.log(userFeed.res.length);
    let toSend = [];
    for (const setOfPosts of userFeed.res)
        {
                console.log(JSON.parse(setOfPosts).length);
                for(const post of JSON.parse(setOfPosts))
                {
                      console.log("POST",post.length);
                if ("kind" in post && post.kind == "youtube#searchResult"){
                        toSend.push({
                                title: post.snippet.title,
                                summary: post.snippet.description,
                                link: `https://www.youtube.com/watch?v=${post.id.videoId}`,
                                img: post.snippet.thumbnails.default.url,
                                src: "youtube"
                        });
                } else if ("subreddit" in post) {
                        toSend.push ({
                                title: post.title,
                                summary: post.summary,
                                link: post.url,
                                img: null,
                                src: "reddit"
                        })

                } else {
                        toSend.push({
                        title: post.title,
                        summary: post.summary,
                        link: post.url,
                        img: post.urlToImage,
                        src: "news"
                        });
                }
                }

        }
        //console.log(toSend);
    res.status(200).json({msg:"GOT FEED", toSend});
    } catch(err) {
    console.log(err);
            res.status(500).json({res:{}, err, msg:"Cant get feed"});
    }
});

app.post("/topics", verifyToken, async (req, res) => {
    try {
        let userId = req.userId;
        let { topics } = req.body;
        const feed = await getNewUserFeed(userId, topics);
        console.log(userId, topics, feed);
        let toSend = [];
        for (const setOfPosts of feed.res)
        {
            //console.log(setOfPosts);
            for(const post of setOfPosts)
            {
                console.log("POST", post);
                if ("kind" in post && post.kind == "youtube#searchResult"){
                    toSend.push({
                            title: post.snippet.title,
                            summary: post.snippet.description,
                            link: `https://www.youtube.com/watch?v=${post.id.videoId}`,
                            img: post.snippet.thumbnails.default.url,
                            src: "youtube"
                    });
                } else if ("subreddit" in post) {
                    toSend.push ({
                            title: post.title,
                            summary: post.summary,
                            link: post.url,
                            img: null,
                            src: "reddit"
                    })

                } else {
                    toSend.push({
                        title: post.title,
                        summary: post.summary,
                        link: post.url,
                        img: post.urlToImage,
                        src: "news"
                    });
                }
            }

        }
        //console.log(topics);
        const embeddingModel = await FlagEmbedding.init({ model: EmbeddingModel.BGEBaseEN });
        const topicVectors =  embeddingModel.embed(topics, 768);
        const embeddings = [];
        for await (const batch of topicVectors) {
            // batch is list of Float32 embeddings(number[][]) with length 2
            for (const vec of batch){
                embeddings.push(Array.from(vec));
            }
        }
        console.log("GOT EMBEDDINGS", embeddings);
        const topicVec = [];
        for ( let j=0;  j< 768; j++)
        {
            let temp = 0;
            for(let i=0; i < embeddings.length; i++)
            {
                temp += embeddings[i][j];
            }
            temp /= embeddings.length;
            topicVec.push(temp);
        }
        console.log("tp", topicVec);
        const up = await User.findByIdAndUpdate(userId, {topics: topicVec}, {new: true});
        console.log(up);
        res.status(200).json({msg: "Topics Added", toSend});
    } catch (err) {
        console.log(err);
        res.status(500).json({msg: "Cannot Add Topics", err})
    }

});

connect(process.env.MONGODB_URI);
app.listen(PORT, () => {
    console.log("Server Listening on PORT:", PORT);
});