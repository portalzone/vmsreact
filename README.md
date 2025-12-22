# 🚗 VMS - Vehicle Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Laravel](https://img.shields.io/badge/Laravel-11.x-red.svg)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org)
[![PHP](https://img.shields.io/badge/PHP-8.1+-purple.svg)](https://php.net)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://mysql.com)

A comprehensive, modern vehicle fleet management system built with Laravel 11 and React 18.

**[Live Demo](#) | [Documentation](#documentation) | [Report Bug](https://github.com/yourorg/vms/issues) | [Request Feature](https://github.com/yourorg/vms/discussions)**

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

---

## 🌟 Overview

VMS is a complete vehicle management solution designed for organizations managing fleets of any size. From small businesses with a few vehicles to large enterprises with hundreds, VMS provides all the tools needed to efficiently track, maintain, and optimize your fleet operations.

### Why VMS?

✅ **Complete Fleet Management** - Track vehicles, drivers, maintenance, expenses, and more  
✅ **Real-Time Updates** - WebSocket-powered live notifications and updates  
✅ **Role-Based Access** - Granular permissions for different user types  
✅ **Comprehensive Reports** - PDF and Excel exports with analytics  
✅ **Modern Stack** - Built with latest Laravel and React  
✅ **Mobile Responsive** - Works seamlessly on all devices  
✅ **Easy to Deploy** - Comprehensive deployment documentation  

---

## 🎯 Features

### Core Functionality

**Vehicle Management**
- Complete CRUD operations
- Photo gallery with multiple images
- Status tracking (Active, Maintenance, Inactive, Sold)
- Advanced search and filtering
- Vehicle assignment to drivers
- Ownership tracking (Organization/Individual)

**Driver Management**
- Driver profiles with license tracking
- Vehicle assignments
- Performance monitoring
- License expiry reminders
- Driver type classification

**Maintenance Tracking**
- Schedule and track maintenance
- Cost tracking and reporting
- Document attachments
- Automatic expense creation
- Email reminders

**Expense Management**
- Multi-category expenses (Fuel, Maintenance, Insurance, Repairs)
- Receipt uploads
- High-value expense alerts
- Detailed reporting and analytics
- PDF/Excel export

**Trip Management**
- Create and track trips
- Distance and duration calculation
- Real-time status updates
- Trip-based income tracking
- Comprehensive trip reports

**Check-In/Check-Out System**
- Track vehicles on premises
- Duration calculation
- Purpose documentation
- Real-time updates
- Historical records

**Reports & Analytics**
- Vehicle reports (PDF)
- Expense reports (PDF & Excel)
- Maintenance summaries
- Trip analytics
- Monthly trend charts
- Custom date ranges

**Notifications**
- Email notifications
- In-app notifications
- Maintenance reminders
- Expense alerts
- Weekly summaries
- Customizable preferences

---

## 📸 Screenshots

### Dashboard
![Dashboard](docs/images/dashboard.png)

### Vehicle Management
![Vehicles](docs/images/vehicles.png)

### Reports
![Reports](docs/images/reports.png)

*More screenshots available in [docs/images/](docs/images/)*

---

## 🛠️ Tech Stack

### Backend
- **Framework:** Laravel 11.x
- **Authentication:** Laravel Sanctum
- **Authorization:** Spatie Laravel Permission
- **Database:** MySQL 8.0+ / PostgreSQL 13+
- **Queue:** Redis / Database
- **Real-time:** Laravel Reverb (WebSockets)
- **PDF Generation:** DomPDF
- **Excel:** PhpSpreadsheet

### Frontend
- **Framework:** React 18.x
- **Build Tool:** Vite 5.x
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Styling:** Tailwind CSS 3.x
- **Notifications:** React Hot Toast
- **Charts:** Recharts
- **Icons:** Lucide React

### DevOps
- **Web Server:** Nginx / Apache
- **Process Manager:** Supervisor
- **SSL:** Let's Encrypt
- **Version Control:** Git

---

## 🚀 Quick Start

### Prerequisites

- PHP 8.1+
- Composer 2.5+
- Node.js 18+
- MySQL 8.0+ / PostgreSQL 13+
- npm 9+

### Installation

**1. Clone the repository:**
```bash
git clone https://github.com/yourorg/vms.git
cd vms
```

**2. Backend Setup:**
```bash
# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database in .env
# Then run migrations
php artisan migrate --seed

# Start server
php artisan serve
```

**3. Frontend Setup:**
```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start development server
npm run dev
```

**4. Access the application:**

- **Backend:** http://localhost:8000
- **Frontend:** http://localhost:5173

**Default Credentials:**
- **Email:** admin@basepan.com
- **Password:** password

**⚠️ Change default password after first login!**

For detailed installation instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 📚 Documentation

### For Users
- **[User Manual](USER_MANUAL.md)** - Complete guide for end users
- **[Quick Start Guide](docs/QUICK_START.md)** - Get started in 5 minutes

### For Administrators
- **[Admin Guide](ADMIN_GUIDE.md)** - System administration guide
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment
- **[Security Policy](SECURITY.md)** - Security best practices

### For Developers
- **[API Documentation](API_DOCUMENTATION.md)** - Complete API reference
- **[Database Schema](DATABASE_SCHEMA.md)** - Database structure
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute
- **[Testing Guide](TESTING.md)** - Testing procedures

### Additional Resources
- **[Troubleshooting](TROUBLESHOOTING.md)** - Common issues and solutions
- **[Changelog](CHANGELOG.md)** - Version history
- **[Code of Conduct](CODE_OF_CONDUCT.md)** - Community guidelines
- **[License](LICENSE)** - MIT License

---

## 🤝 Contributing

We love contributions! Please read our [Contributing Guide](CONTRIBUTING.md) to learn about our development process, how to propose bugfixes and improvements, and how to build and test your changes.

### Quick Contribution Steps

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## 🧪 Testing
```bash
# Backend tests
php artisan test

# Frontend tests
npm test

# With coverage
php artisan test --coverage
npm test -- --coverage
```

For comprehensive testing guide, see [TESTING.md](TESTING.md)

---

## 📦 Deployment

### Production Deployment

**Quick Deploy:**
```bash
# Backend
composer install --optimize-autoloader --no-dev
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Frontend
npm run build
```

For complete deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)

### Docker (Coming Soon)
```bash
docker-compose up -d
```

---

## 🛡️ Security

Security is our top priority. Please read our [Security Policy](SECURITY.md) for:

- Reporting vulnerabilities
- Security best practices
- Authentication & authorization
- Data protection

**Found a security issue?** Email security@basepan.com (Do not create public issues)

---

## 📊 Project Status

- **Version:** 1.0.0
- **Status:** Production Ready ✅
- **Last Updated:** December 21, 2024
- **Maintenance:** Actively Maintained

### Roadmap

**Version 1.1 (Q1 2025)**
- [ ] Two-factor authentication
- [ ] Advanced analytics dashboard
- [ ] Fuel consumption tracking
- [ ] Mobile app (React Native)

**Version 1.2 (Q2 2025)**
- [ ] GPS tracking integration
- [ ] Route optimization
- [ ] Multi-language support
- [ ] Dark mode

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

## 👥 Team

**Core Team:**
- Lead Developer - [Your Name](https://github.com/yourname)
- Backend Developer - [Name](https://github.com/username)
- Frontend Developer - [Name](https://github.com/username)
- DevOps Engineer - [Name](https://github.com/username)

**Contributors:**
- See [Contributors](https://github.com/yourorg/vms/graphs/contributors)

---

## 📞 Support

### Getting Help

**Documentation:** https://docs.basepan.com  
**Email:** support@basepan.com  
**Phone:** +1 (709) 771-8379  
**Hours:** Mon-Fri, 9AM-5PM EST

### Community

- **GitHub Discussions:** https://github.com/yourorg/vms/discussions
- **Issue Tracker:** https://github.com/yourorg/vms/issues
- **Twitter:** [@vms_official](https://twitter.com/vms_official)
- **LinkedIn:** [VMS Company Page](https://linkedin.com/company/vms)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Third-Party Licenses

This software uses open-source packages with their own licenses:
- Laravel (MIT)
- React (MIT)
- And many more - see [LICENSE](LICENSE) for complete list

---

## 🙏 Acknowledgments

Special thanks to:
- Laravel community
- React community
- All our contributors
- Beta testers
- Open-source maintainers

---

## 📈 Stats

![GitHub stars](https://img.shields.io/github/stars/yourorg/vms?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourorg/vms?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourorg/vms)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourorg/vms)

---

**Made with ❤️ by the VMS Team**

*Empowering efficient fleet management worldwide*

---

## 🔗 Links

- **Website:** https://vms.basepan.com
- **Documentation:** https://docs.basepan.com
- **API Docs:** https://vms.basepan.com/docs
- **GitHub:** https://github.com/yourorg/vms
- **NPM Package:** Coming soon

---

*Last Updated: December 21, 2024 | Version 1.0.0*