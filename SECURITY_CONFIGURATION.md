# Security Configuration Guide for PortfolioHub

This document outlines the security configurations needed to address the Supabase security warnings.

## 1. Database Function Security Issues ✅ Fixed

The mutable search_path issues in database functions have been addressed in the migration `fix_security_functions.sql`.

### Functions Fixed:
- `update_updated_at_column()` - Now uses `SECURITY DEFINER` and `SET search_path = public`
- `is_admin()` - Now uses `SECURITY DEFINER` and `SET search_path = public`

## 2. Supabase Auth Configuration (Manual Steps Required)

### Enable Password Security (HaveIBeenPwned Integration)

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Settings**
3. Scroll down to **Password Protection**
4. Enable **"Check passwords against HaveIBeenPwned"**
5. Save the configuration

### Enable Additional MFA Methods

1. Go to **Authentication** → **Settings**
2. Scroll to **Multi-Factor Authentication**
3. Enable the following MFA methods:
   - **TOTP (Time-based One-Time Password)** - Recommended
   - **SMS** - Optional (requires phone number verification)
   - **Email** - Optional (for backup codes)

### Recommended MFA Configuration:
```
✅ TOTP (Google Authenticator, Authy, etc.)
✅ Email verification codes
❌ SMS (optional, can be expensive)
```

## 3. Additional Security Recommendations

### Row Level Security (RLS)
✅ Already implemented in the schema:
- Portfolios table has proper RLS policies
- Collaborations table has proper RLS policies
- Admin users table has proper RLS policies

### API Security
- All API routes should validate user authentication
- Use Supabase RLS policies for database access control
- Implement rate limiting for API endpoints

### Environment Variables
Ensure these are properly configured:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (server-side only)
```

## 4. Performance Optimization

The performance score of 15 suggests some optimization opportunities:

### Database Indexes
Consider adding indexes for frequently queried columns:
```sql
-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_skills ON portfolios USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_portfolios_job_title ON portfolios(job_title);
CREATE INDEX IF NOT EXISTS idx_collaborations_portfolio_id ON collaborations(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_status ON collaborations(status);
```

### Query Optimization
- Use `select()` with specific columns instead of `select('*')`
- Implement pagination for large result sets
- Use database functions for complex operations

## 5. Monitoring and Alerts

Set up monitoring for:
- Failed authentication attempts
- Unusual API usage patterns
- Database performance metrics
- Security events

## 6. Regular Security Maintenance

- Review and update dependencies regularly
- Monitor Supabase security advisories
- Conduct periodic security audits
- Keep Supabase CLI and tools updated

## Implementation Status

- [x] Database function security fixes
- [ ] Enable HaveIBeenPwned password checking (Manual)
- [ ] Enable additional MFA methods (Manual)
- [ ] Add database indexes for performance
- [ ] Set up monitoring and alerts

## Next Steps

1. Apply the database migration: `supabase db push`
2. Configure Supabase Auth settings manually in the dashboard
3. Add the recommended database indexes
4. Set up monitoring and alerts
5. Review and test all security configurations
