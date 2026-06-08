# Stage 1: Build the React frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the .NET backend
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-builder
WORKDIR /app/backend
# Copy project file and restore
COPY backend/Maintenance_System/MaintenanceSystem.csproj ./Maintenance_System/
RUN dotnet restore ./Maintenance_System/MaintenanceSystem.csproj

# Copy everything else and build/publish
COPY backend/Maintenance_System/ ./Maintenance_System/
# Copy the built React app into the backend's wwwroot folder
COPY --from=frontend-builder /app/frontend/dist ./Maintenance_System/wwwroot/

WORKDIR /app/backend/Maintenance_System
RUN dotnet publish -c Release -o /app/publish

# Stage 3: Final runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=backend-builder /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
ENV PORT=8080
EXPOSE 8080
CMD ["sh", "-c", "dotnet MaintenanceSystem.dll --urls http://0.0.0.0:${PORT:-8080}"]
