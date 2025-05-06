# Use Node.js base image
FROM node:20

# Set working directory in the container
WORKDIR /app

# Copy package.json files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all project files
COPY . .

# Expose port
EXPOSE 3000

# Command to run the app
CMD ["node", "app.js"]
