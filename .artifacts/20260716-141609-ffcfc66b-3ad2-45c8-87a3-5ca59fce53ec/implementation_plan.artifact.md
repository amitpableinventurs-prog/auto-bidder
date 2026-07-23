# Fix Prisma Schema Mismatch and Seeding Errors

The goal is to resolve `PrismaClientValidationError` by adding missing fields to the `Listing` model in `schema.prisma` and to fix `PrismaClientKnownRequestError` (P2002) by clearing existing listings before seeding in the `/admin/seed-rich` route.

## User Review Required

> [!IMPORTANT]
> I am adding missing fields to the `Listing` model as `String?` instead of `Json?` to maintain consistency with existing project patterns (where `Json` was explicitly commented out in favor of `String`). Array fields like `images` will be stored as JSON-stringified arrays.

## Proposed Changes

### Database Schema

#### [schema.prisma](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/services/api/prisma/schema.prisma)

- Add missing fields to the `Listing` model to match the Zod schema and `devStore.ts`.
- Fields to add: `images`, `rcImages`, `invoiceImages`, `bankNocImages`, `rtoIssues`, `ownershipType`, `cngLpgStatus`, `registrationDate`, `accidentalHistory`.

```prisma
model Listing {
  ...
  // Images (Stored as JSON stringified arrays)
  images           String?
  rcImages         String?
  invoiceImages    String?
  bankNocImages    String?

  // Additional fields
  rtoIssues        String?
  ownershipType    String?
  cngLpgStatus     String?
  registrationDate String?
  accidentalHistory String?
  ...
}
```

---

### API Routes

#### [index.ts](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/services/api/src/routes/index.ts)

- Update `post('/listings')` to stringify array fields (`images`, `rcImages`, `invoiceImages`, `bankNocImages`) before passing them to Prisma.
- Update `post('/admin/seed-rich')` to delete all existing listings before seeding to avoid unique constraint violations on IDs.

```typescript
// In post('/listings')
const listing = await prisma.listing.create({
  data: {
    ...body,
    images: body.images ? JSON.stringify(body.images) : undefined,
    rcImages: body.rcImages ? JSON.stringify(body.rcImages) : undefined,
    invoiceImages: body.invoiceImages ? JSON.stringify(body.invoiceImages) : undefined,
    bankNocImages: body.bankNocImages ? JSON.stringify(body.bankNocImages) : undefined,
    title,
    ...
  },
  include: listingInclude(),
});
```

```typescript
// In post('/admin/seed-rich')
await prisma.listing.deleteMany();
// ... proceed with seeding
```

## Verification Plan

### Automated Tests
- Run `npx prisma generate` to ensure the Prisma client is updated.
- Run `npx prisma db push` to apply schema changes to the SQLite database.

### Manual Verification
1. **Seeding**: Call the `/admin/seed-rich` endpoint (via the Admin Panel or CURL) and verify it succeeds without `P2002` error.
2. **Listing Creation**: Attempt to create a listing through the mobile app or a direct POST request to `/api/listings` with images and verify it succeeds without `PrismaClientValidationError`.
3. **Data Integrity**: Check the database (using `npx prisma studio` or similar) to ensure `images` are correctly stored as stringified JSON.
