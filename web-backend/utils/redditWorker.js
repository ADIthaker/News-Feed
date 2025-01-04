const axios = require('axios');

const getRedditSubreddits = (query) => {
        // https://oauth.reddit.com/r/${subreddit}/hot
        const response = axios.get(`https://www.reddit.com/search.json?q=${query}&type=sr`, {  
        }).then(res => 
        {
            console.log(res);
            console.log(res.data.data.children.map(post => post.data));
            return res.data.data.children.map(post => post.data);
        }
        ).catch (error => {
            console.error('Error:', error.response?.data || error.message);
        });

}
const getRedditPosts = async (query) => {
    try {
        // Get access token
        const USER_AGENT = "contentcuration/1.0.0 by u/b3astmast3r69";
        const tokenResponse = await axios.post(
            'https://www.reddit.com/api/v1/access_token',
            'grant_type=client_credentials',
            {
                auth: {
                    username: process.env.REDDIT_CLIENT_ID,
                    password: process.env.REDDIT_CLIENT_SECRET
                },
                headers: {
                    'User-Agent': USER_AGENT,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const accessToken = tokenResponse.data.access_token;

        // Fetch subreddit posts
        const response = await axios.get(`https://oauth.reddit.com/search.json?q=${query}&type=posts`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'User-Agent': USER_AGENT
            }
        });
        return response.data.data.children.filter(post => post.data.is_self).map(post => post.data);
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
    // axios.get(`https://oauth.reddit.com/search.json?q=${query}&type=link`, {  
    // }).then(res => 
    // {
    //     //console.log(res);
    //     //console.log(res.data.data.children.map(post => post.data));
    //     return res.data.data.children.map(post => post.data);
    // }
    // ).catch (error => {
    //     console.error('Error:', error.response?.data || error.message);
    // });
}

module.exports = {
    getRedditPosts,
    getRedditSubreddits
}