# Knowledge Base Configuration

This file defines the structure and metadata for the mojPoslić knowledge base.

## Categories

### getting-started
- **Order**: 1
- **Icon**: BookOpen
- **Color**: blue
- **Description**: Essential information for new users

### for-clients  
- **Order**: 2
- **Icon**: Users
- **Color**: green
- **Description**: Guide for posting jobs and hiring taskers

### for-taskers
- **Order**: 3
- **Icon**: Briefcase
- **Color**: purple
- **Description**: Guide for finding and completing tasks

### payments
- **Order**: 4
- **Icon**: CreditCard
- **Color**: yellow
- **Description**: Payment methods, billing, and transactions

### security
- **Order**: 5
- **Icon**: Shield
- **Color**: red
- **Description**: Safety, privacy, and security measures

### policies
- **Order**: 6
- **Icon**: FileText
- **Color**: gray
- **Description**: Terms of service, privacy policy, and guidelines

### troubleshooting
- **Order**: 7
- **Icon**: HelpCircle
- **Color**: orange
- **Description**: Common issues and solutions

## Article Structure

Each markdown file should include:

```markdown
---
title: "Article Title"
description: "Brief description"
category: "category-name"
order: 1
tags: ["tag1", "tag2"]
lastUpdated: "2025-10-29"
author: "mojPoslić Team"
---

# Article Content

Content goes here...
```

## Naming Convention

- Files: `kebab-case.md`
- Categories: `kebab-case`
- Images: `category/article-name/image.png`