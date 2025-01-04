FROM node:18

# Set the working directory
WORKDIR /app

# Install dependencies
RUN npm install --save googleapis redis axios nodemon express mongoose bcrypt jsonwebtoken fastembed newsapi openai cors

# Copy the app source code
COPY . .

# Run the fetcher code
CMD ["npx", "nodemon", "app.js"]