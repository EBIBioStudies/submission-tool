# Stage 1: Build JAR with Maven and Node
FROM maven:3.9.5-eclipse-temurin-21 AS build
WORKDIR /app

# Copy the pom.xml first for better caching
COPY pom.xml .
COPY frontend frontend

# Copy the rest of the application
COPY src src

# Create .env file for frontend build (you'll need to pass this as build arg or copy it)
# If you need VITE_CONFIG, uncomment and modify:
# ARG VITE_CONFIG
# RUN echo "$VITE_CONFIG" > frontend/.env

# Build the application (this will install node, npm, build frontend, and package jar)
RUN mvn clean package -DskipTests

# Verify the jar was created
RUN ls -la /app/target/

# Stage 2: Runtime Image
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copy the jar file from build stage
COPY --from=build /app/target/submission-tool-0.0.1-SNAPSHOT.jar app.jar

# Verify the jar was copied
RUN ls -la /app/

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]