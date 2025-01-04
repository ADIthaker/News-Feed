FROM node:18

# Set the working directory
WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y cron
RUN npm install --save googleapis kafkajs axios newsapi openai nodemon ytdl-core whisper-node 
RUN npm i redis assemblyai youtube-dl-exec
RUN npx whisper-node download
COPY . .
#RUN echo "0 */5  * * * root /usr/local/bin/node /app/fetch.js >/proc/1/fd/1 2>/proc/1/fd/2" > /etc/cron.d/my_cron

# Give execution permissions to the cron job file
#RUN chmod 0644 /etc/cron.d/my_cron

# Start cron in the foreground
CMD ["node", "fetch.js"]