# Airplane E-Ticketing System - Deployment Guide

This guide provides step-by-step instructions to deploy the E-Ticketing-Project on **Render** (backend) and **Vercel** (frontend) for production use.

## Architecture Overview

- **Frontend**: React + Vite application deployed on Vercel (static hosting)
- **Backend**: FastAPI application deployed on Render (serverless container)
- **Database**: MySQL database hosted on Render
- **Environment**: Production-grade with CORS restrictions and environment-based configuration

---

## Prerequisites

Before starting, ensure you have:

1. **GitHub Account**: Repository must be pushed to GitHub (public or private)
2. **Render Account**: Free tier available at [render.com](https://render.com)
3. **Vercel Account**: Free tier available at [vercel.com](https://vercel.com)
4. **Git CLI**: Installed and configured locally
5. **Node.js & npm**: For frontend testing (optional but recommended)
6. **Python 3.11+**: For backend testing (optional but recommended)

---

## Part 1: Deploy Backend on Render

### Step 1.1: Prepare the Backend Repository

1. Ensure all code is committed and pushed to GitHub:
   ```bash
   cd backend
   git add .
   git commit -m "chore: prepare backend for Render deployment"
   git push origin main
   ```

2. Verify the following files exist in the backend directory:
   - `requirements.txt` - Python dependencies
   - `Procfile` - Process definition for Render
   - `runtime.txt` - Python version specification
   - `render.yaml` - Render configuration (optional, can use Render UI instead)
   - `.env.example` - Environment variable template

### Step 1.2: Create Render Account and Connect GitHub

1. Go to [render.com](https://render.com) and sign up
2. Click **Dashboard** → **New +** → **Web Service**
3. Select **Build and deploy from a Git repository**
4. Click **Connect account** to authorize GitHub
5. Select the repository: `LakshyaDuck/E-Ticketing-Project`
6. Choose the branch: `main` (or your deployment branch)

### Step 1.3: Configure Web Service on Render

1. **Service Name**: `airplane-eticketing-api`
2. **Environment**: `Python 3`
3. **Build Command**: `pip install -r requirements.txt`
4. **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. **Plan**: Select **Free** (or Paid if you need production reliability)
6. **Region**: Choose the region closest to your users (e.g., Singapore, US East)

### Step 1.4: Configure Environment Variables

In the Render dashboard, go to **Environment** tab and add the following variables:

| Key | Value | Notes |
|-----|-------|-------|
| `DATABASE_URL` | (Will be set by Render after DB creation) | MySQL connection string |
| `SECRET_KEY` | Generate a strong random string | Use: `python -c "import secrets; print(secrets.token_urlsafe(32))"` |
| `MONGODB_URL` | `mongodb://localhost:27017` | (Mocked for production) |
| `MONGODB_DB_NAME` | `eticketing_logs` | Database name for logging |
| `SMTP_HOST` | `smtp.gmail.com` | Email service host |
| `SMTP_PORT` | `587` | Email service port |
| `SMTP_USER` | Your Gmail address | For sending emails |
| `SMTP_PASSWORD` | Gmail App Password | Generate at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) |
| `SMTP_FROM_EMAIL` | `noreply@eticket.com` | Sender email address |
| `SMTP_FROM_NAME` | `E-Ticketing System` | Sender name |
| `ALLOWED_ORIGINS` | (Will be set after frontend deployment) | Comma-separated list of allowed frontend domains |

### Step 1.5: Create MySQL Database on Render

1. In Render Dashboard, click **New +** → **MySQL**
2. **Database Name**: `airplane-eticketing-db`
3. **User**: `eticketing_user`
4. **Plan**: Select **Free**
5. **Region**: Same as your web service
6. Click **Create Database**

Once created, Render will automatically:
- Provide a `DATABASE_URL` connection string
- Inject it into your web service environment variables

### Step 1.6: Seed the Database

After the web service and database are running:

1. Connect to the database using a MySQL client (e.g., MySQL Workbench, DBeaver)
2. Use the `DATABASE_URL` provided by Render
3. Run the seed script to populate airlines, airports, flights, and test users:
   ```bash
   python backend/seed_data.py
   ```
   Or, if deploying via Render, you can SSH into the service and run:
   ```bash
   render exec airplane-eticketing-api python seed_data.py
   ```

**Test Credentials After Seeding**:
- Admin: `username=admin`, `password=Admin@123`
- User: `username=johndoe`, `password=Test@1234`

### Step 1.7: Verify Backend Deployment

1. Once the build completes, Render will provide a URL like: `https://airplane-eticketing-api.onrender.com`
2. Test the API:
   ```bash
   curl https://airplane-eticketing-api.onrender.com/
   ```
   Expected response: `{"message":"API is running"}`

3. Test the health endpoint:
   ```bash
   curl https://airplane-eticketing-api.onrender.com/api/v1/auth/me
   ```

**Note**: The free tier on Render spins down after 15 minutes of inactivity. The first request after a spin-down may take 30+ seconds.

---

## Part 2: Deploy Frontend on Vercel

### Step 2.1: Prepare the Frontend Repository

1. Ensure all code is committed and pushed to GitHub:
   ```bash
   cd frontend
   git add .
   git commit -m "chore: prepare frontend for Vercel deployment"
   git push origin main
   ```

2. Verify the following files exist in the frontend directory:
   - `package.json` - Node dependencies
   - `vite.config.js` - Vite configuration
   - `vercel.json` - Vercel configuration
   - `.env.example` - Environment variable template

### Step 2.2: Create Vercel Account and Connect GitHub

1. Go to [vercel.com](https://vercel.com) and sign up
2. Click **Add New** → **Project**
3. Select **Import Git Repository**
4. Authorize GitHub and select: `LakshyaDuck/E-Ticketing-Project`
5. Choose the branch: `main`

### Step 2.3: Configure Project Settings

1. **Project Name**: `airplane-eticketing-frontend`
2. **Framework Preset**: Select **Vite**
3. **Root Directory**: Set to `frontend/aeroplane-frontend` (important!)
4. **Build Command**: `npm run build` (Vercel auto-detects this)
5. **Output Directory**: `dist` (Vercel auto-detects this)
6. **Install Command**: `npm install`

### Step 2.4: Configure Environment Variables

Before deploying, add the following environment variable in Vercel:

| Key | Value | Notes |
|-----|-------|-------|
| `VITE_API_URL` | `https://airplane-eticketing-api.onrender.com/api/v1` | Backend API URL from Render |

**To add environment variables in Vercel**:
1. Go to **Settings** → **Environment Variables**
2. Add each variable with the correct value
3. Select which environments it applies to (Production, Preview, Development)

### Step 2.5: Deploy Frontend

1. Click **Deploy**
2. Vercel will build and deploy the frontend
3. Once complete, you'll receive a URL like: `https://airplane-eticketing-frontend.vercel.app`

### Step 2.6: Update Backend CORS Settings

Now that the frontend is deployed, update the backend's `ALLOWED_ORIGINS`:

1. Go to Render Dashboard → **airplane-eticketing-api** → **Environment**
2. Update `ALLOWED_ORIGINS` to include the Vercel domain:
   ```
   http://localhost:3000,http://localhost:5173,https://airplane-eticketing-frontend.vercel.app
   ```
3. Click **Save** (this will trigger a redeploy)

### Step 2.7: Verify Frontend Deployment

1. Open the Vercel URL in your browser
2. Test the following:
   - **Login Page**: Should load without errors
   - **Flight Search**: Try searching for flights (should connect to backend)
   - **Network Tab**: Check that API calls go to the Render backend URL

---

## Part 3: Post-Deployment Configuration

### Step 3.1: Test the Full Application

1. **Frontend URL**: Open `https://airplane-eticketing-frontend.vercel.app`
2. **Login**: Use test credentials:
   - Username: `johndoe`
   - Password: `Test@1234`
3. **Search Flights**: Try searching for flights by origin, destination, and date
4. **Book a Flight**: Select a seat and complete a booking
5. **Admin Dashboard**: Log in with admin credentials and verify the admin panel works

### Step 3.2: Enable Custom Domain (Optional)

**For Vercel Frontend**:
1. Go to **Settings** → **Domains**
2. Add your custom domain (e.g., `eticket.com`)
3. Follow DNS configuration instructions

**For Render Backend**:
1. Go to **Settings** → **Custom Domains**
2. Add your custom domain (e.g., `api.eticket.com`)
3. Follow DNS configuration instructions

### Step 3.3: Set Up Monitoring and Alerts

**Render**:
1. Go to **Settings** → **Notifications**
2. Enable email alerts for deployment failures
3. Set up uptime monitoring (paid feature)

**Vercel**:
1. Go to **Settings** → **Git** → **Deployments**
2. Enable automatic deployments on push
3. Set up preview deployments for pull requests

### Step 3.4: Database Backups

**Important**: Render's free tier does not include automatic backups. To protect your data:

1. Set up manual backups using MySQL tools:
   ```bash
   mysqldump -h <host> -u <user> -p <password> eticketing > backup.sql
   ```
2. Consider upgrading to a paid Render plan for automatic backups
3. Store backups in a secure location (e.g., AWS S3, GitHub)

---

## Part 4: Troubleshooting

### Issue: CORS Error When Accessing Backend

**Symptom**: Browser console shows `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:
1. Verify the frontend domain is added to `ALLOWED_ORIGINS` in Render
2. Redeploy the backend after updating environment variables
3. Clear browser cache and hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Issue: 502 Bad Gateway Error

**Symptom**: Render backend returns `502 Bad Gateway`

**Solution**:
1. Check Render logs: Dashboard → **airplane-eticketing-api** → **Logs**
2. Common causes:
   - Database connection failed: Verify `DATABASE_URL` is correct
   - Missing dependencies: Check `requirements.txt` is complete
   - Startup timeout: Increase timeout in Render settings
3. Restart the service: Click **Manual Deploy**

### Issue: Frontend Not Connecting to Backend

**Symptom**: API calls fail or timeout

**Solution**:
1. Verify `VITE_API_URL` environment variable is set in Vercel
2. Test the backend URL directly in browser:
   ```
   https://airplane-eticketing-api.onrender.com/
   ```
3. Check network tab in browser DevTools for actual request URL
4. Verify backend is not in "spin-down" state (first request may be slow)

### Issue: Database Connection Timeout

**Symptom**: Backend logs show `Connection timeout` or `Can't connect to MySQL server`

**Solution**:
1. Verify `DATABASE_URL` environment variable is set
2. Check Render MySQL database status: Dashboard → **airplane-eticketing-db** → **Info**
3. Ensure database is in the same region as web service
4. Test connection using MySQL client with the provided connection string

### Issue: Static Files Not Loading (404 Errors)

**Symptom**: CSS, JS, or images return 404

**Solution**:
1. Verify `vercel.json` has correct `outputDirectory: "dist"`
2. Check that build completes successfully in Vercel logs
3. Ensure all static assets are in `public/` folder (if any)
4. Clear Vercel cache: **Settings** → **Git** → **Clear Build Cache**

---

## Part 5: Environment Variables Reference

### Backend (.env)

```env
# Database
DATABASE_URL=mysql+pymysql://user:password@host:port/database

# Security
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# MongoDB (for logging)
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=eticketing_logs

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@eticket.com
SMTP_FROM_NAME=E-Ticketing System

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend-domain.vercel.app
```

### Frontend (.env)

```env
VITE_API_URL=https://your-backend-domain.onrender.com/api/v1
VITE_APP_NAME=Airplane E-Ticketing System
VITE_APP_VERSION=1.0.0
```

---

## Part 6: Maintenance & Updates

### Deploying Code Changes

**Backend**:
1. Push changes to GitHub: `git push origin main`
2. Render automatically redeploys on push
3. Monitor deployment in Render Dashboard → **Deploys**

**Frontend**:
1. Push changes to GitHub: `git push origin main`
2. Vercel automatically redeploys on push
3. Monitor deployment in Vercel Dashboard → **Deployments**

### Updating Dependencies

**Backend**:
1. Update `requirements.txt` with new versions
2. Test locally: `pip install -r requirements.txt`
3. Push to GitHub and Render will rebuild

**Frontend**:
1. Update `package.json` with new versions
2. Test locally: `npm install && npm run build`
3. Push to GitHub and Vercel will rebuild

### Database Migrations

If you need to modify the database schema:

1. Update `app/models/` files in the backend
2. Create a migration script (or use Alembic)
3. Test locally with SQLite or local MySQL
4. Deploy backend changes
5. Run migration on Render database (via SSH or manual script)

---

## Part 7: Cost Estimation

| Service | Free Tier | Limitations | Paid Tier |
|---------|-----------|------------|-----------|
| **Render Web Service** | Yes | 0.5 CPU, 512 MB RAM, spins down after 15 min | $7/month |
| **Render MySQL** | Yes | 256 MB storage, limited backups | $15/month |
| **Vercel Frontend** | Yes | 100 GB bandwidth/month, 6 deployments/hour | $20/month |
| **Total (Free)** | ~$0 | Limited performance | - |
| **Total (Recommended)** | - | Production-grade | ~$42/month |

---

## Part 8: Security Checklist

- [ ] `SECRET_KEY` is a strong random string (not default)
- [ ] `ALLOWED_ORIGINS` only includes your frontend domain (not `*`)
- [ ] Database credentials are not committed to GitHub
- [ ] SMTP credentials are stored as environment variables (not hardcoded)
- [ ] HTTPS is enabled on both frontend and backend
- [ ] Database backups are configured
- [ ] Rate limiting is enabled on API endpoints
- [ ] Error messages don't leak sensitive information
- [ ] Authentication tokens are stored securely (httpOnly cookies or secure localStorage)

---

## Support & Resources

- **Render Documentation**: https://render.com/docs
- **Vercel Documentation**: https://vercel.com/docs
- **FastAPI Documentation**: https://fastapi.tiangolo.com
- **React Documentation**: https://react.dev

---

## Next Steps

1. Follow the deployment guide step-by-step
2. Test the application thoroughly after deployment
3. Set up monitoring and alerts
4. Plan for database backups and maintenance
5. Consider upgrading to paid tiers for production reliability

Good luck with your deployment! 🚀
