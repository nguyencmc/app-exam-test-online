# Hướng Dẫn Cài Đặt Môi Trường Local

Hướng dẫn này giúp bạn cài đặt môi trường development để chạy và test ứng dụng AI-Exam.cloud.

---

## 1. Cài Đặt Node.js

### Cách 1: Homebrew (Khuyến nghị cho macOS)

```bash
# Cài Homebrew nếu chưa có
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Thêm Homebrew vào PATH (cho Apple Silicon/M1/M2)
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
source ~/.zshrc

# Cài Node.js
brew install node@20

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### Cách 2: NVM (Node Version Manager)

```bash
# Cài NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash

# Restart terminal hoặc source profile
source ~/.zshrc

# Cài Node 20
nvm install 20
nvm use 20

# Verify
node --version
npm --version
```

### Cách 3: Download trực tiếp

1. Truy cập https://nodejs.org/en/download/
2. Tải bản LTS (20.x)
3. Chạy installer
4. Restart Terminal

---

## 2. Cài Đặt Dependencies

```bash
# Di chuyển vào thư mục project
cd /Users/maytinhtranvy/Documents/app-exam-test-online

# Cài đặt tất cả dependencies
npm install

# Cài thêm testing và Sentry
npm install -D vitest @vitest/ui @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom jsdom
npm install @sentry/react
```

---

## 3. Cấu Hình Environment Variables

```bash
# Tạo file .env.local
cat > .env.local << 'EOF'
# Supabase (đã có sẵn trong integrations)
VITE_SUPABASE_URL=https://xhmsgvlnrhpscehzpqad.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Sentry (optional - tạo project tại https://sentry.io)
VITE_SENTRY_DSN=

# Development
VITE_APP_ENV=development
EOF
```

---

## 4. Chạy Ứng Dụng

### Development Server

```bash
npm run dev
```

Mở http://localhost:3000 trong browser.

### Build Production

```bash
npm run build
npm run preview
```

---

## 5. Chạy Tests

### Chạy tất cả tests (watch mode)

```bash
npm test
```

### Chạy tests một lần

```bash
npm run test:run
```

### Chạy với coverage report

```bash
npm run test:coverage
```

### Chạy với UI (dashboard đẹp)

```bash
npm run test:ui
```

---

## 6. Kiểm Tra Cài Đặt

```bash
# Check Node version
node --version
# Expected: v20.x.x

# Check npm
npm --version
# Expected: 10.x.x

# Check project deps
npm ls vitest @sentry/react
# Should show installed versions

# Run quick test
npm run test:run
```

---

## 7. Troubleshooting

### npm: command not found

```bash
# Check if Node is installed
which node

# If empty, reinstall Node.js using one of the methods above

# If installed but not found, add to PATH:
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# For Homebrew on Apple Silicon:
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
source ~/.zshrc
```

### Permission errors

```bash
# Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
```

### Module not found errors

```bash
# Clear cache và reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 8. VS Code Extensions (Khuyến nghị)

```bash
# Install extensions
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension bradlc.vscode-tailwindcss
code --install-extension vitest.explorer
```

---

## Quick Start (Copy & Paste)

```bash
# All-in-one setup
cd /Users/maytinhtranvy/Documents/app-exam-test-online

# Install deps
npm install
npm install -D vitest @vitest/ui @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom jsdom
npm install @sentry/react

# Run dev server
npm run dev
```
