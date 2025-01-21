# Base image
FROM clojure:openjdk-17-tools-deps

# Install Python, libpython, curl, git, and required system tools
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    libpython3-dev \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy necessary project files
COPY deps.edn .
COPY config.edn .
COPY src ./src
COPY resources ./resources
COPY dist ./dist
COPY requirements.txt .

# Install Python dependencies (if using libpython-clj interop)
RUN pip install -r requirements.txt
RUN pip install earthengine-api

# Download and cache Clojure dependencies
RUN clojure -P

# Expose your server port (adjust to your app's port)
EXPOSE 8080

# Default entry point for running the server
CMD ["clojure", "-M:server", "start"]

