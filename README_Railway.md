# Deploying Campus Maintenance System (CMMS) on Railway

This repository is configured for a unified deployment on Railway where the ASP.NET Core backend hosts and serves the compiled Vite React frontend SPA.

## Project Structure
- `Dockerfile`: Multi-stage build script in the root directory.
- `backend/`: ASP.NET Core C# 10 Web API.
- `frontend/`: Vite React SPA.
- `.gitignore`: Root exclusions file.

---

## Deployment Steps on Railway

1. **Create a New Project on Railway:**
   - Log in to your Railway dashboard and click **New Project**.
   - Choose **Deploy from GitHub repo** and select this repository.

2. **Add a PostgreSQL Database:**
   - In your Railway project canvas, click **New** -> **Database** -> **Add PostgreSQL**.
   - Railway will provision PostgreSQL and automatically link it to your project.
   - It will inject the `DATABASE_URL` environment variable into your service container, which our application detects and parses automatically on startup.

3. **Configure Service Variables:**
   Under your service's **Variables** tab, add the following variables:
   
   | Variable Name | Value / Description | Notes |
   |---|---|---|
   | `Jwt__SecretKey` | `YourSuperSecretKeyStringThatIsLongEnough!` | Custom JWT sign key (min 32 characters) |
   | `Jwt__Issuer` | `RedeemersUniversityCMMS` | JWT issuer string |
   | `Jwt__Audience` | `RedeemersUniversityCMMSUsers` | JWT audience string |
   | `Cloudinary__CloudName` | `your-cloudinary-cloud-name` | From your Cloudinary dashboard |
   | `Cloudinary__ApiKey` | `your-cloudinary-api-key` | From your Cloudinary dashboard |
   | `Cloudinary__ApiSecret` | `your-cloudinary-api-secret` | From your Cloudinary dashboard |
   | `PORT` | `8080` | (Railway defines this automatically) |

4. **Deploy:**
   - Railway will read the `Dockerfile` at the root, start the build stages (compiling the React app, packaging the .NET app), and run the unified service.
   - Database migrations will execute automatically on startup, and the default admin account will be seeded (`admin@redeemers.edu.ng` / `Admin@123!`).
