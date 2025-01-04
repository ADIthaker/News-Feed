const { createClient } = require('redis');

let connect = async (url) => {
    const client = await createClient({url: process.env.REDIS}).on('error', err => console.log('Redis Client Error', err)).connect();
    return client;
}

let setAPIResult = async (topic, results) => {
    try {
        const client = await connect();
        results.timeCached = Date.now();
        results = JSON.stringify(results)
        await client.hSet(topic, results);
        return {
            err: false,
            msg: "Added to cache"
        }
    } catch (err) {
        throw err;
    }
}

let getAPIResult = async (topic) => {
    let currTime = Date.now();
    try {
        const client = await connect();
        const res = await client.hGetAll(topic);
        res = JSON.parse(res);
        if(res.timeCached - currTime > 86400000)
        {
            await client.del(topic);
            return {
                err: false,
                msg: "Cache Stale",
                res: null
            }
        }
        return {
            err: false,
            msg: "Got from cache",
            res
        }
    } catch (err) {
        throw err;
    }
}
let getFeed = async (key) => {
    let currTime = Date.now();
    try {
        const client = await connect();
        let res = await client.lRange(key, 0, -1);
        if (res && res.length > 0) {
            res = res.map(JSON.parse);
            return {
                err: false,
                msg: "Got feed from cache",
                res
            }
        } else {
            return {
                err: false,
                msg: "Cache Empty",
                res: {}
            }
        }
        
    } catch (err) {
        throw err;
    }
}

let addToFeed = async (key, value) => {
    try {
        const client = await connect();
        await client.rPush(key, JSON.stringify(value));
        await client.sendCommand(["EXPIRE", key, "86400"]);
        return {
            err: false,
            msg: "Added feed to cache"
        }
    } catch (err) {
        throw err;
    }
}

module.exports = {
    getAPIResult,
    setAPIResult,
    getFeed,
    addToFeed,
};