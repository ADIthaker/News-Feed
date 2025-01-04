const mongoose = require('mongoose');
exports.connect = async (uri) => {
    try {
        await mongoose.connect(uri);
        console.log('db connected to', uri);
    } catch (err) {
        console.log(err);
    }
};

exports.disconnect = async () => {
    try {
        await mongoose.disconnect();
        console.log('db disconnected');
    } catch (err) {
        console.log(err);
    }
};

