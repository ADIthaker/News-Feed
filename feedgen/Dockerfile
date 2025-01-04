FROM node:18

# Set the working directory
WORKDIR /app

# Install dependencies
RUN npm i kafkajs nodemon mongoose redis fastembed 
RUN apt-get update && apt-get install -y cron

# Copy the app source code
COPY . .
#RUN echo "0 */5 * * * root /usr/local/bin/node /app/feedgen.js >/proc/1/fd/1 2>/proc/1/fd/2" > /etc/cron.d/my_cron

# Give execution permissions to the cron job file
#RUN chmod 0644 /etc/cron.d/my_cron

# Start cron in the foreground
CMD ["node", "feedgen.js"]