# Quick Start: Deployment on Render & Vercel

## 📋 Pre-Deployment Checklist

- [ ] GitHub repository is up to date with all changes
- [ ] Render account created (render.com)
- [ ] Vercel account created (vercel.com)
- [ ] GitHub connected to both Render and Vercel

## 🚀 Backend Deployment (Render)

### 1. Create Web Service
- Go to Render Dashboard → **New +** → **Web Service**
- Connect GitHub repository: `LakshyaDuck/E-Ticketing-Project`
- **Service Name**: `airplane-eticketing-api`
- **Environment**: Python 3
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Plan**: Free (or Paid for production)

### 2. Create MySQL Database
- Go to Render Dashboard → **New +** → **MySQL**
- **Database Name**: `airplane-eticketing-db`
- **User**: `eticketing_user`
- **Plan**: Free
- Copy the `DATABASE_URL` connection string

### 3. Configure Environment Variables
Add these in Render Dashboard → **Environment**:

```
DATABASE_URL=<from MySQL database>
SECRET_KEY=<generate: python -c "import secrets; print(secrets.token_urlsafe(32))">
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=eticketing_logs
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your-gmail>
SMTP_PASSWORD=<gmail-app-password>
SMTP_FROM_EMAIL=noreply@eticket.com
SMTP_FROM_NAME=E-Ticketing System
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 4. Deploy & Get Backend URL
- Click **Deploy**
- Wait for build to complete
- Copy the service URL (e.g., `https://airplane-eticketing-api.onrender.com`)

### 5. Seed Database
```bash
# After backend is running, seed the database
python backend/seed_data.py
```

## 🎨 Frontend Deployment (Vercel)

### 1. Create Project
- Go to Vercel Dashboard → **Add New** → **Project**
- Select GitHub repository: `LakshyaDuck/E-Ticketing-Project`
- **Root Directory**: `frontend/aeroplane-frontend`
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 2. Add Environment Variable
- Go to **Settings** → **Environment Variables**
- Add: `VITE_API_URL` = `https://airplane-eticketing-api.onrender.com/api/v1`

### 3. Deploy
- Click **Deploy**
- Wait for build to complete
- Copy the frontend URL (e.g., `https://airplane-eticketing-frontend.vercel.app`)

## 🔗 Wire Backend & Frontend

### Update Backend CORS
1. Go to Render Dashboard → **airplane-eticketing-api** → **Environment**
2. Update `ALLOWED_ORIGINS`:
   ```
   http://localhost:3000,http://localhost:5173,https://airplane-eticketing-frontend.vercel.app
   ```
3. Click **Save** (triggers redeploy)

## ✅ Verify Deployment

1. **Backend Test**:
   ```bash
   curl https://airplane-eticketing-api.onrender.com/
   # Expected: {"message":"API is running"}
   ```

2. **Frontend Test**:
   - Open `https://airplane-eticketing-frontend.vercel.app`
   - Login with: `johndoe` / `Test@1234`
   - Search for flights
   - Complete a booking

3. **Check CORS**:
   - Open DevTools (F12) → Network tab
   - Perform an API action
   - Verify no CORS errors

## 📊 Cost Breakdown

| Service | Free Tier | Notes |
|---------|-----------|-------|
| Render Web | Yes | Spins down after 15 min inactivity |
| Render MySQL | Yes | 256 MB storage |
| Vercel Frontend | Yes | 100 GB bandwidth/month |
| **Total** | **~$0** | Limited performance |

## 🔐 Security Notes

- CORS restricted to specific domains
- Environment variables for secrets
- HTTPS enabled by default
- Database credentials not in code

## 📞 Support

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Full Guide**: See `DEPLOYMENT_GUIDE.md`

## 🎯 Next Steps

1. Follow the deployment steps above
2. Test the full application flow
3. Set up monitoring (optional)
4. Configure custom domains (optional)
5. Plan database backups

---

**Time Estimate**: 20-30 minutes for complete deployment

**Questions?** Refer to `DEPLOYMENT_GUIDE.md` for detailed troubleshooting
