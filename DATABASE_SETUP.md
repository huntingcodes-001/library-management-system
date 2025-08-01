# PostgreSQL Database Setup Guide

## Windows Setup

### Method 1: Using PostgreSQL Installer (Recommended)

1. **Download PostgreSQL**
   - Go to https://www.postgresql.org/download/windows/
   - Download the latest version of PostgreSQL installer
   - Run the installer as Administrator

2. **Installation Process**
   - Choose installation directory (default: `C:\Program Files\PostgreSQL\15`)
   - Select components (keep all selected)
   - Set data directory (default: `C:\Program Files\PostgreSQL\15\data`)
   - Set password for `postgres` superuser (remember this!)
   - Set port (default: 5432)
   - Set locale (default is fine)
   - Complete installation

3. **Add PostgreSQL to PATH**
   - Open System Properties → Advanced → Environment Variables
   - Add `C:\Program Files\PostgreSQL\15\bin` to PATH
   - Restart command prompt

4. **Verify Installation**
   ```cmd
   psql --version
   ```

### Method 2: Using Chocolatey

1. **Install Chocolatey** (if not installed)
   - Open PowerShell as Administrator
   - Run: `Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))`

2. **Install PostgreSQL**
   ```powershell
   choco install postgresql
   ```

## macOS Setup

### Method 1: Using Homebrew (Recommended)

1. **Install Homebrew** (if not installed)
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Install PostgreSQL**
   ```bash
   brew install postgresql@15
   ```

3. **Start PostgreSQL Service**
   ```bash
   brew services start postgresql@15
   ```

4. **Add to PATH**
   ```bash
   echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
   source ~/.zshrc
   ```

### Method 2: Using PostgreSQL.app

1. **Download PostgreSQL.app**
   - Go to https://postgresapp.com/
   - Download and install PostgreSQL.app
   - Launch the app and initialize a new server

2. **Add to PATH**
   ```bash
   echo 'export PATH="/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"' >> ~/.zshrc
   source ~/.zshrc
   ```

## Database Setup

### 1. Connect to PostgreSQL

**Windows:**
```cmd
psql -U postgres
```

**macOS:**
```bash
psql postgres
```

### 2. Create Database and User

```sql
-- Create database
CREATE DATABASE library_management;

-- Create user
CREATE USER library_user WITH PASSWORD 'library_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE library_management TO library_user;

-- Exit
\q
```

### 3. Initialize Database Schema

1. **Connect to the new database**
   ```bash
   psql -U library_user -d library_management -h localhost
   ```

2. **Run the initialization script**
   ```bash
   psql -U library_user -d library_management -h localhost -f server/init-db.sql
   ```

   Or copy and paste the contents of `server/init-db.sql` into the psql prompt.

### 4. Verify Setup

```sql
-- List tables
\dt

-- Check users table
SELECT * FROM users;

-- Check books table
SELECT * FROM books;
```

## Environment Configuration

1. **Create `.env` file** in your project root:
   ```env
   DATABASE_URL=postgresql://library_user:library_password@localhost:5432/library_management
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=library_management
   DB_USER=library_user
   DB_PASSWORD=library_password
   PORT=3001
   NODE_ENV=development
   ```

2. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

3. **Start the application**:
   ```bash
   # Start both server and client
   npm run dev:full
   
   # Or start separately
   npm run server  # Terminal 1
   npm run dev     # Terminal 2
   ```

## Troubleshooting

### Common Issues

1. **Connection refused**
   - Ensure PostgreSQL service is running
   - Check if port 5432 is available
   - Verify credentials in `.env` file

2. **Permission denied**
   - Make sure user has proper privileges
   - Check database and user exist

3. **Module not found**
   - Run `npm install` to install dependencies
   - Ensure all required packages are installed

### Service Management

**Windows:**
```cmd
# Start service
net start postgresql-x64-15

# Stop service
net stop postgresql-x64-15
```

**macOS:**
```bash
# Start service
brew services start postgresql@15

# Stop service
brew services stop postgresql@15

# Restart service
brew services restart postgresql@15
```

## Default Credentials

- **Admin Login:**
  - Username: `LibAdmin`
  - Password: `12qwaszx`

- **Database:**
  - Host: `localhost`
  - Port: `5432`
  - Database: `library_management`
  - Username: `library_user`
  - Password: `library_password`

The database will persist all data permanently, and you can access it using any PostgreSQL client like pgAdmin, DBeaver, or command line tools.