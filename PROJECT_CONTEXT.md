# PROJECT CONTEXT

## General overview

This repository contains a lost-and-found application with two main parts:
- `backend`: FastAPI + SQLModel backend API
- `frontend`: Next.js 16 app router frontend

Include files for AI context:
- overall folder structure
- relevant source files and functions
- backend high-level architecture
- frontend high-level architecture
- notes about generated and dependency folders

---

## Root files

- `README.md`
- `backend/README.md`
- `.env` (backend environment)
- `frontend/.env.local` (frontend environment)

---

## Backend architecture

### backend/app
- `__init__.py`
- `database.py`
  - `get_session`
- `main.py`
  - `create_db_and_tables`
  - `root`

### backend/controllers
- `__init__.py`
- `admin_controller.py`
  - `get_users`
  - `get_user`
  - `update_user`
  - `delete_user`
  - `get_items`
  - `get_item`
  - `update_item`
  - `delete_item`
  - `get_claims`
  - `get_claim`
  - `update_claim_status`
  - `delete_claim`
- `auth_controller.py`
  - `register`
  - `login`
  - `me`
- `claim_controller.py`
  - `create_claim`
  - `get_my_claims`
  - `get_claim_by_id`
  - `get_claims_for_item`
  - `update_my_claim`
  - `update_claim_status`
  - `delete_my_claim`
- `item_controller.py`
  - `create_item`
  - `get_items`
  - `get_my_items`
  - `get_my_item_by_id`
  - `get_item_by_id`
  - `update_item`
  - `delete_item`
  - `resolve_item`
  - `expire_item`
- `upload_controller.py`
  - `upload_item_image`
  - `upload_profile_image`
- `user_controller.py`
  - `update_me`
  - `change_password`

### backend/core
- `__init__.py`
- `dependencies.py`
  - `get_current_user`
  - `require_admin`
- `security.py`
  - `hash_password`
  - `verify_password`
  - `create_access_token`
  - `decode_access_token`

### backend/cruds
- `__init__.py`

### backend/models
- `__init__.py`
- `claim_model.py`
- `item_model.py`
- `user_model.py`

### backend/repositories
- `__init__.py`
- `claim_repository.py`
  - `create_claim`
  - `get_claim_by_id`
  - `get_claims_by_user_id`
  - `get_claims_by_item_id`
  - `update_claim`
  - `delete_claim`
  - `get_all_claims`
- `item_repository.py`
  - `create_item`
  - `get_item_by_id`
  - `get_items`
  - `get_items_by_user_id`
  - `update_item`
  - `delete_item`
- `user_repository.py`
  - `create`
  - `get_all`
  - `get_by_id`
  - `get_by_username`
  - `get_by_email`
  - `update`
  - `delete`
  - `update_password`

### backend/schemas
- `__init__.py`
- `claim_schema.py`
- `item_schema.py`
  - `validate_reward_amount`
- `upload_schema.py`
- `user_schema.py`

### backend/services
- `__init__.py`
- `admin_service.py`
  - `get_all_users`
  - `get_user_by_id`
  - `update_user_as_admin`
  - `delete_user_as_admin`
  - `get_all_items_for_admin`
  - `get_item_for_admin`
  - `update_item_as_admin`
  - `delete_item_as_admin`
  - `get_all_claims_for_admin`
  - `get_claim_for_admin`
  - `update_claim_status_as_admin`
  - `delete_claim_as_admin`
- `auth_service.py`
  - `register_user`
  - `login_user`
- `claim_service.py`
  - `create_claim`
  - `get_my_claims`
  - `get_claim_by_id`
  - `get_claims_for_item`
  - `update_my_claim`
  - `update_claim_status`
  - `delete_my_claim`
- `item_service.py`
  - `create_item`
  - `get_public_items`
  - `get_public_item_by_id`
  - `get_my_items`
  - `get_my_item_by_id`
  - `update_item`
  - `delete_item`
  - `resolve_item`
  - `expire_item`
- `upload_service.py`
  - `save_item_image`
  - `save_profile_image`
- `user_service.py`
  - `update_current_user`
  - `update_current_user_password`

---

## Frontend architecture

### frontend/app
- `globals.css`
- `layout.tsx`
- `page.tsx`
- `AddItem/page.tsx`
- `admin/page.tsx`
- `AllItems/page.tsx`
- `login/page.tsx`
- `profile/page.tsx`
- `register/page.tsx`

### frontend/components/admin
- `AdminPanel.module.css`
- `AdminPanel.tsx`
  - `formatDate`
  - `AdminPanel`

### frontend/components/auth
- `AuthGuard.tsx`
  - `AuthGuard`

### frontend/components/common
- `Container.tsx`
  - `Container`
- `SectionHeading.module.css`
- `SectionHeading.tsx`
  - `SectionHeading`
- `StatusBadge.module.css`
- `StatusBadge.tsx`
  - `StatusBadge`

### frontend/components/home
- `FeaturedListings.module.css`
- `FeaturedListings.tsx`
  - `FeaturedListings`
- `Hero.module.css`
- `Hero.tsx`
  - `Hero`
- `QuickSearch.module.css`
- `QuickSearch.tsx`
  - `QuickSearch`

### frontend/components/layout
- `Footer.tsx`
  - `Footer`
- `Header.tsx`
  - `Header`

### frontend/components/listings
- `ListingCard.module.css`
- `ListingCard.tsx`
  - `ListingCard`

### frontend/components/profile
- `ProfileForm.tsx`
  - `ProfileForm`
- `ProfileHeader.tsx`
  - `ProfileHeader`
- `ProfileListings.tsx`
  - `ProfileListings`
- `ProfileStyles.module.css`
- `ProfileSummary.tsx`
  - `ProfileSummary`

### frontend/data
- `homepageListings.ts`
- `mockProfileListings.ts`

### frontend/types
- `claim.ts`
- `listing.ts`
- `user.ts`

---

## Key frontend config files

- `frontend/package.json`
  - dependencies: Next.js, React, FontAwesome
  - devDependencies: TypeScript, ESLint, Next ESLint config
- `frontend/tsconfig.json`
- `frontend/next.config.ts`
- `frontend/next-env.d.ts`

## Notes for AI context

- Backend is a FastAPI API with router-based controllers and SQLModel models.
- Authentication and authorization use JWT tokens and admin role checks.
- File uploads served under `/media` and managed by `upload_controller` + `upload_service`.
- Frontend is a Next.js app router project with React components for pages, profile, admin, authentication, and listing flow.
- Ignore generated folders: `frontend/.next` and dependency folders such as `backend/venv` and `frontend/node_modules`.
