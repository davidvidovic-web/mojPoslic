# README - Documentation

This folder contains important documentation for the mojPoslic project refactoring and improvements.

## 📋 Documents

### [Changelog - January 6, 2025](./changelog-2025-01-06.md)
Complete record of all changes made during the dashboard refactoring and connection system implementation. Includes:
- Dashboard role-based redesign
- Smart connection system implementation
- Data caching optimization
- UI/UX improvements
- Bug fixes and technical improvements

### [Caveats and Attention Points](./caveats-and-attention-points.md)
Critical document outlining potential issues, limitations, and important considerations for the current implementation. **Required reading** for:
- Developers working on the codebase
- DevOps/Operations team
- Product managers planning future features

## 🎯 Quick Reference

### Key Changes Summary
- **Role-based dashboards** with unique themes and workflows
- **Smart connection system** with role-specific rules
- **Data caching** for cities and categories (30min TTL)
- **Real-time UI updates** for connection counts
- **Improved UX** with better mobile responsiveness and theme consistency

### Critical Attention Points
- ⚠️ UTC timezone implications for "daily" job logic
- ⚠️ Manual cache invalidation needed for admin data changes
- ⚠️ Client-side role checks are UX-only, not security
- ⚠️ No audit trail for connection usage history

## 🔧 For Developers

When working on this codebase:
1. Read the caveats document thoroughly
2. Test role-based features across all user types
3. Consider cache implications when modifying cities/categories
4. Validate connection logic changes carefully
5. Maintain consistent component organization

## 📞 Support

For questions about the implementation or to report issues with the documented changes, please:
1. Check the caveats document first
2. Review the changelog for context
3. Test in development environment
4. Document any new issues or edge cases discovered

---

*These documents reflect the state of the project as of January 2025 and should be updated as the system evolves.*
