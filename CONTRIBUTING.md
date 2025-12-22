# Contributing to VMS

First off, thank you for considering contributing to the Vehicle Management System! It's people like you that make VMS such a great tool.

**Version:** 1.0  
**Last Updated:** December 21, 2024

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [How Can I Contribute?](#how-can-i-contribute)
3. [Getting Started](#getting-started)
4. [Development Workflow](#development-workflow)
5. [Coding Standards](#coding-standards)
6. [Commit Guidelines](#commit-guidelines)
7. [Pull Request Process](#pull-request-process)
8. [Bug Reports](#bug-reports)
9. [Feature Requests](#feature-requests)
10. [Documentation](#documentation)
11. [Community](#community)

---

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to contact@basepan.com.

---

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

**Bug Report Template:**
```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. Ubuntu 20.04]
 - Browser: [e.g. Chrome 120]
 - Version: [e.g. 1.0.0]

**Additional context**
Add any other context about the problem here.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Clear title and description**
- **Step-by-step description** of the suggested enhancement
- **Explain why this enhancement would be useful**
- **List any alternatives** you've considered

### Your First Code Contribution

Unsure where to begin? You can start by looking through these issues:

- `good-first-issue` - Issues that should only require a few lines of code
- `help-wanted` - Issues that may be more involved but are good for newcomers

### Pull Requests

The process described here has several goals:

- Maintain VMS's quality
- Fix problems that are important to users
- Engage the community in working toward the best possible VMS
- Enable a sustainable system for maintainers to review contributions

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

**Backend:**
- PHP 8.1 or higher
- Composer 2.5+
- MySQL 8.0+ or PostgreSQL 13+
- Redis (optional, for caching)

**Frontend:**
- Node.js 18+
- npm 9+

**Tools:**
- Git
- Code editor (VS Code recommended)
- Postman or similar API testing tool

### Fork & Clone

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
```bash
git clone https://github.com/YOUR_USERNAME/vms.git
cd vms
```

3. **Add upstream remote:**
```bash
git remote add upstream https://github.com/original-owner/vms.git
```

### Backend Setup

1. **Install PHP dependencies:**
```bash
composer install
```

2. **Copy environment file:**
```bash
cp .env.example .env
```

3. **Generate application key:**
```bash
php artisan key:generate
```

4. **Configure database:**

Edit `.env` and set your database credentials:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=vms_dev
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

5. **Run migrations:**
```bash
php artisan migrate
```

6. **Seed database:**
```bash
php artisan db:seed
```

7. **Start development server:**
```bash
php artisan serve
```

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment:**

Create `.env` file:
```env
VITE_API_URL=http://localhost:8000/api
```

4. **Start development server:**
```bash
npm run dev
```

### Verify Setup

**Backend:** Visit http://localhost:8000  
**Frontend:** Visit http://localhost:5173  
**API:** Test http://localhost:8000/api/health

---

## Development Workflow

### Branching Strategy

We use **Git Flow** branching model:

**Main Branches:**
- `main` - Production-ready code
- `develop` - Latest development changes

**Supporting Branches:**
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical production fixes
- `release/*` - Release preparation

### Creating a Feature Branch

1. **Update your local develop branch:**
```bash
git checkout develop
git pull upstream develop
```

2. **Create feature branch:**
```bash
git checkout -b feature/your-feature-name
```

**Naming Convention:**
- `feature/add-vehicle-export` - New feature
- `bugfix/fix-login-validation` - Bug fix
- `hotfix/critical-security-patch` - Hotfix
- `docs/update-readme` - Documentation

### Making Changes

1. **Make your changes** in your feature branch
2. **Write/update tests** for your changes
3. **Run tests** to ensure nothing breaks:
```bash
# Backend tests
php artisan test

# Frontend tests
npm test
```

4. **Follow coding standards** (see below)
5. **Commit your changes** with descriptive messages

### Testing Your Changes

**Backend Testing:**
```bash
# Run all tests
php artisan test

# Run specific test
php artisan test --filter VehicleTest

# With coverage
php artisan test --coverage
```

**Frontend Testing:**
```bash
# Run all tests
npm test

# Run in watch mode
npm test -- --watch

# With coverage
npm test -- --coverage
```

**Manual Testing:**
- Test in browser
- Check console for errors
- Verify API responses
- Test different user roles
- Test edge cases

### Keeping Your Branch Updated

Regularly sync with upstream:
```bash
git checkout develop
git pull upstream develop
git checkout feature/your-feature-name
git rebase develop
```

---

## Coding Standards

### Backend (PHP/Laravel)

**Follow PSR-12 Standards:**
```php
<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    /**
     * Display a listing of vehicles.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $vehicles = Vehicle::query()
            ->when($request->search, function ($query, $search) {
                $query->where('plate_number', 'like', "%{$search}%");
            })
            ->paginate(15);

        return response()->json($vehicles);
    }
}
```

**Best Practices:**

✅ **Use type hints:**
```php
public function store(StoreVehicleRequest $request): JsonResponse
```

✅ **Use dependency injection:**
```php
public function __construct(
    private VehicleService $vehicleService
) {}
```

✅ **Use Eloquent relationships:**
```php
$vehicle = Vehicle::with(['owner', 'driver', 'maintenance'])->find($id);
```

✅ **Use Request classes for validation:**
```php
public function store(StoreVehicleRequest $request)
```

✅ **Use Resource classes for transformations:**
```php
return VehicleResource::collection($vehicles);
```

❌ **Don't use raw queries (unless necessary):**
```php
// Bad
DB::select("SELECT * FROM vehicles WHERE id = $id");

// Good
Vehicle::find($id);
```

### Frontend (JavaScript/React)

**Follow Airbnb JavaScript Style Guide:**
```jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

function VehicleList() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/vehicles');
      setVehicles(response.data.data);
    } catch (error) {
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;

    try {
      await api.delete(`/vehicles/${id}`);
      setVehicles(vehicles.filter(v => v.id !== id));
      toast.success('Vehicle deleted');
    } catch (error) {
      toast.error('Failed to delete vehicle');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="vehicle-list">
      {vehicles.map(vehicle => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}

export default VehicleList;
```

**Best Practices:**

✅ **Use functional components:**
```jsx
function Component() { }
```

✅ **Use hooks appropriately:**
```jsx
const [state, setState] = useState(initialValue);
useEffect(() => { }, [dependencies]);
```

✅ **Destructure props:**
```jsx
function Component({ title, description }) { }
```

✅ **Use meaningful names:**
```jsx
const [isLoading, setIsLoading] = useState(false);
const handleSubmit = () => { };
```

✅ **Keep components small and focused:**
```jsx
// One component, one responsibility
```

❌ **Don't mutate state:**
```jsx
// Bad
users.push(newUser);

// Good
setUsers([...users, newUser]);
```

### Code Formatting

**Backend (PHP):**

Use PHP CS Fixer:
```bash
composer require --dev friendsofphp/php-cs-fixer

# Format code
vendor/bin/php-cs-fixer fix
```

**Frontend (JavaScript):**

Use Prettier and ESLint:
```bash
npm install --save-dev prettier eslint

# Format code
npm run format

# Lint code
npm run lint
```

**.prettierrc:**
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

---

## Commit Guidelines

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(vehicles): add vehicle export functionality

Add ability to export vehicle list to PDF and Excel formats.
Includes filters and custom date ranges.

Closes #123
```
```
fix(auth): resolve token expiration issue

Fix bug where tokens were not being properly refreshed,
causing users to be logged out prematurely.

Fixes #456
```
```
docs(readme): update installation instructions

Add missing step for running migrations in README.
```

### Commit Best Practices

✅ **Write clear, descriptive messages**
✅ **Use present tense** ("add feature" not "added feature")
✅ **Keep subject line under 50 characters**
✅ **Separate subject from body** with blank line
✅ **Reference issues** in footer
✅ **Make atomic commits** (one logical change per commit)

❌ **Don't commit commented code**
❌ **Don't commit debugging statements**
❌ **Don't commit secrets or credentials**
❌ **Don't use vague messages** ("fix bug", "update code")

---

## Pull Request Process

### Before Submitting

**Checklist:**

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] No console errors
- [ ] Rebased with latest develop
- [ ] Conflicts resolved

### Creating Pull Request

1. **Push your branch:**
```bash
git push origin feature/your-feature-name
```

2. **Open Pull Request** on GitHub

3. **Fill in PR template:**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested?
Describe testing performed

## Screenshots (if applicable)
Add screenshots

## Checklist
- [ ] My code follows style guidelines
- [ ] I have performed self-review
- [ ] I have commented complex code
- [ ] I have updated documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests
- [ ] All tests pass
- [ ] Any dependent changes have been merged

## Related Issues
Closes #123
```

4. **Request reviewers**

5. **Link related issues**

### During Review

**Be responsive:**
- Respond to feedback promptly
- Make requested changes
- Push updates to same branch
- Mark conversations as resolved

**Be respectful:**
- Accept constructive criticism
- Ask questions if unclear
- Explain your reasoning
- Thank reviewers

### After Approval

1. **Squash commits** (if requested)
2. **Rebase with develop** (if needed)
3. **Wait for maintainer to merge**
4. **Delete branch** after merge

---

## Bug Reports

### Security Vulnerabilities

⚠️ **DO NOT** create public GitHub issues for security vulnerabilities.

**Instead:**
- Email: security@basepan.com
- Include detailed description
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We'll respond within 48 hours.

### Regular Bugs

**Before Reporting:**
1. Check existing issues
2. Verify it's reproducible
3. Test with latest version
4. Gather relevant information

**Information to Include:**
- VMS version
- Operating system
- Browser (if frontend)
- PHP version (if backend)
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/logs
- Error messages

---

## Feature Requests

We love feature ideas! Before suggesting:

1. **Check existing issues** - Someone may have suggested it already
2. **Consider if it fits** - Does it align with VMS goals?
3. **Think about scope** - Is it too broad or too narrow?

**When Requesting:**
- Describe the problem it solves
- Explain proposed solution
- Provide use cases
- Suggest alternatives considered
- Add mockups/wireframes if possible

---

## Documentation

Documentation contributions are always welcome!

**Types of Documentation:**

**Code Documentation:**
- PHPDoc comments for PHP
- JSDoc comments for JavaScript
- Inline comments for complex logic
```php
/**
 * Create a new vehicle.
 *
 * @param  \App\Http\Requests\StoreVehicleRequest  $request
 * @return \Illuminate\Http\JsonResponse
 */
public function store(StoreVehicleRequest $request)
```

**API Documentation:**
- Endpoint descriptions
- Request/response examples
- Parameter details
- Error codes

**User Documentation:**
- User manual updates
- Tutorial additions
- FAQ entries
- Troubleshooting guides

**Developer Documentation:**
- Setup instructions
- Architecture explanations
- Design decisions
- Contributing guide updates

---

## Community

### Communication Channels

**GitHub:**
- Issues: Bug reports and feature requests
- Discussions: Questions and general discussions
- Pull Requests: Code contributions

**Email:**
- General: contact@basepan.com
- Support: support@basepan.com
- Development: contact@basepan.com

**Social Media:**
- Twitter: @vms_official
- LinkedIn: VMS Company Page

### Getting Help

**Before Asking:**
1. Read the documentation
2. Search existing issues
3. Check Stack Overflow
4. Review closed issues

**When Asking:**
- Be specific
- Provide context
- Include code samples
- Show what you've tried
- Be patient and respectful

---

## Recognition

### Contributors

All contributors will be recognized in:
- CHANGELOG.md
- GitHub contributors page
- Release notes
- Annual contributor highlights

### Levels of Contribution

**🌟 Core Contributor:**
- 10+ merged PRs
- Active in code reviews
- Helps with issues
- Maintains documentation

**⭐ Regular Contributor:**
- 5+ merged PRs
- Participates in discussions
- Reports bugs
- Suggests features

**✨ Community Member:**
- 1+ merged PR
- Active in community
- Helps others
- Shares knowledge

---

## License

By contributing to VMS, you agree that your contributions will be licensed under the same license as the project.

---

## Questions?

Don't hesitate to ask! We're here to help:

- **Email:** contact@basepan.com
- **GitHub Discussions:** https://github.com/yourorg/vms/discussions
- **Twitter:** @vms_official

---

## Thank You! 🎉

Your contributions make VMS better for everyone. We appreciate your time and effort!

---

*Last Updated: December 21, 2024*  
*Version: 1.0*