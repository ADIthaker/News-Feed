const { createClient } = require('redis');
let connect = async () => {
    const client = await createClient({url: process.env.REDIS}).on('error', err => console.log('Redis Client Error', err)).connect();
    return client;
}

let setAPIResult = async (topic, results) => {
    try {
        const client = await connect();
        results.timeCached = Date.now();
        console.log("Adding to cache", JSON.stringify(results));
        await client.hSet(topic, {op:JSON.stringify(results)});
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
        let res = await client.hGetAll(topic);
        res = JSON.parse(JSON.stringify(res));
        if (!res || res == [] || Object.keys(res).length === 0)
        {
            return {
                err: false,
                msg: "Cache Empty",
                res: null
            }
        }
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
            res:JSON.parse(res.op)
        }
    } catch (err) {
        throw err;
    }
}


module.exports = {
    getAPIResult,
    setAPIResult,
};