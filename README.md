# 🛒 Super Mall Web App

>A modern, full-stack shopping mall management platform built with React, TypeScript, Vite, TailwindCSS, and Firebase. Designed for real-world deployment and scalable for production use.

---

## 🚀 Project Overview

Super Mall Web App is a responsive, feature-rich platform for managing shops, offers, products, categories, and users in a shopping mall environment. It supports both admin and user roles, with secure authentication, real-time data, and a beautiful, mobile-first UI.

---

## ✨ Features
- User & Admin authentication (Firebase Auth)
- Shop management (CRUD, filter, view details)
- Offer management (CRUD, by shop/category/floor)
- Product management (CRUD, compare features/cost)
- Category & floor management
- Responsive dashboard UI (TailwindCSS)
- Logging for all CRUD actions
- Modular, reusable React components
- Modern gradients, icons, and accessibility
- Comprehensive automated tests (Vitest)
- Firebase Hosting ready

---

## 🛠️ Tech Stack
- **Frontend:** React 18, TypeScript, Vite
- **Styling:** TailwindCSS
- **Backend/DB:** Firebase (Auth, Firestore, Storage)
- **Routing:** React Router DOM
- **Testing:** Vitest, React Testing Library, JSDOM
- **CI/CD:** (Optional) GitHub Actions

---

## 📁 Project Structure

```
Super_mall_web_app/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── contexts/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── test/
│   ├── types/
│   └── App.tsx, main.tsx, index.css, ...
├── package.json
├── tailwind.config.js
├── vite.config.ts
├── README.md
└── ...
```

---

## ⚡ Getting Started

1. **Clone the repo:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/super-mall-web-app.git
   cd super-mall-web-app
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up Firebase:**
   - Create a Firebase project at [firebase.google.com](https://firebase.google.com/)
   - Add your Firebase config to `.env.local`:
     ```env
     VITE_FIREBASE_API_KEY=your_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
     VITE_FIREBASE_PROJECT_ID=your_project_id
     VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     VITE_FIREBASE_APP_ID=your_app_id
     ```
4. **Start the dev server:**
   ```bash
   npm run dev
   ```
5. **Run tests:**
   ```bash
   npm test
   ```
6. **Build for production:**
   ```bash
   npm run build
   ```
7. **Deploy to Firebase Hosting:**
   ```bash
   npm run deploy
   ```

---

## 🧪 Testing
- All core components and services are covered by automated tests (see `src/components/__tests__`, `src/services/__tests__`, etc.)
- Run all tests: `npm test`
- Test utilities and mocks are in `src/test/`

---

## 📸 Screenshots
> _Add screenshots or GIFs of your app here for demo purposes._

---

## 📄 Documentation
- [x] Project overview & features
- [x] Tech stack & structure
- [x] Setup & usage
- [x] Testing
- [x] Deployment
- [ ] LLD & architecture diagrams (add to `/docs` or as images)
- [ ] Final report (add to `/docs` or submit separately)

---

## 🗄️ Firebase Firestore Structure

```
Firestore Root
├── users (Collection)
│   └── {userId} (Document)
│        ├── email: string
│        ├── displayName: string
│        ├── role: 'admin' | 'user'
│        └── ...
├── shops (Collection)
│   └── {shopId} (Document)
│        ├── name: string
│        ├── category: string
│        ├── floor: string
│        ├── address: string
│        ├── ownerId: string (ref: users)
│        ├── ...
│        └── offers (Subcollection)
│             └── {offerId} (Document)
│                  ├── title: string
│                  ├── description: string
│                  ├── validFrom: timestamp
│                  ├── validTo: timestamp
│                  ├── isActive: boolean
│                  ├── ...
├── offers (Collection)
│   └── {offerId} (Document)
│        ├── shopId: string (ref: shops)
│        ├── title: string
│        ├── ...
├── products (Collection)
│   └── {productId} (Document)
│        ├── name: string
│        ├── features: array
│        ├── price: number
│        ├── shopId: string (ref: shops)
│        └── ...
├── categories (Collection)
│   └── {categoryId} (Document)
│        ├── name: string
│        └── ...
├── floors (Collection)
│   └── {floorId} (Document)
│        ├── name: string
│        └── ...
```

- **users:** Stores user profiles and roles (admin/user)
- **shops:** Main shop data, each with an `offers` subcollection
- **offers:** Global offers for querying/filtering
- **products:** Products with features and price, linked to shops
- **categories:** Shop/product categories
- **floors:** Floor information for filtering and navigation

---

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📝 License
MIT
