# 🧠 The Brain - Next-Gen News Portal

The Brain is a professional, feature-rich news portal built with Next.js 16, featuring a powerful admin dashboard with Firebase Authentication and Cloud Firestore.

## ✨ Features

### Public Site
- 📰 Browse news articles by category
- 🔍 Search functionality
- 📱 Responsive design
- 🎨 Modern UI with Material-UI
- ⚡ Fast performance with Next.js

### Admin Dashboard
- 🔐 Secure Firebase Authentication
- 📝 Create, Edit, Delete articles
- 🗄️ Cloud Firestore database integration
- 🛡️ Protected routes with middleware
- 📊 Dashboard overview with statistics
- 🎯 Category management
- 👤 Author management

## 🚀 Quick Start

**New to this project? Start here:**

1. **[QUICK_START.md](./QUICK_START.md)** - Get running in 30 minutes
2. **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** - Step-by-step setup guide

## 📚 Documentation

### Setup & Configuration
- **[QUICK_START.md](./QUICK_START.md)** - Fast setup guide (30 min)
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Detailed setup instructions
- **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** - Interactive checklist

### Daily Use
- **[ADMIN_QUICK_REFERENCE.md](./ADMIN_QUICK_REFERENCE.md)** - Quick reference for admins
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture overview

### Development
- **[PRIORITY_1_COMPLETED.md](./PRIORITY_1_COMPLETED.md)** - Completed features
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Implementation details

## 🛠️ Tech Stack

- **Frontend:** Next.js 16, React 19, Material-UI
- **Authentication:** Firebase Authentication
- **Database:** Cloud Firestore
- **Styling:** Emotion, Tailwind CSS
- **Deployment:** Vercel (recommended)

## 📦 Installation

```bash
# Install dependencies
npm install

# Set up environment variables
# Copy .env.example to .env.local and fill in your credentials
cp .env.example .env.local

# Start development server
npm run dev
```

## 🔑 Environment Variables

Required in `.env.local`:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Security
JWT_SECRET=
ADMIN_EMAIL=
```

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions.

## 🎯 Admin Dashboard

Access the admin dashboard at `/login`

**Features:**
- Dashboard overview with statistics
- Manage all articles (create, edit, delete)
- Category-based organization
- Author management
- Real-time updates

## 📱 Routes

### Public Routes
- `/` - Home page
- `/news` - All news
- `/categories/[id]` - Category page
- `/[news]/[id]` - Article detail
- `/about` - About page
- `/contact` - Contact page

### Admin Routes (Protected)
- `/login` - Admin login
- `/dashboard` - Dashboard overview
- `/dashboard/news` - Manage articles
- `/dashboard/news/create` - Create article
- `/dashboard/news/edit/[id]` - Edit article

## 🔒 Security

- Firebase Authentication for admin access
- Route protection with Next.js middleware
- Environment variables for sensitive data
- Cloud Firestore with security rules
- Cookie-based session management

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

See [Next.js deployment documentation](https://nextjs.org/docs/deployment) for details.

### Environment Variables in Production

Make sure to add all environment variables from `.env.local` to your hosting platform.

## 📊 Database Schema

### News Collection
```javascript
{
  _id: ObjectId,
  title: String,
  category: String,
  details: String,
  thumbnail_url: String,
  image_url: String,
  author: {
    name: String,
    published_date: String,
    img: String
  },
  total_view: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

- Check the [SETUP_GUIDE.md](./SETUP_GUIDE.md) for setup issues
- Review [ADMIN_QUICK_REFERENCE.md](./ADMIN_QUICK_REFERENCE.md) for usage help
- Check [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details

## 🎯 Roadmap

### ✅ Priority 1 (Completed)
- Firebase Authentication
- Cloud Firestore integration
- Edit article functionality
- Route protection
- Environment variables

### 🔄 Priority 2 (Planned)
- Rich text editor (TinyMCE/Quill)
- Image upload system
- Category CRUD operations
- Search and filter

### 📋 Priority 3 (Future)
- Draft/publish workflow
- Article scheduling
- Analytics dashboard
- Bulk operations
- SEO optimization

## 👨‍💻 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Start production server
npm start
```

## 📞 Contact

For questions or support, please refer to the documentation files or create an issue.

---

**Built with ❤️ using Next.js and Firebase**
