# dealWithIt — Project Rules & Context

## What This Project Is
AI-powered administrative letter generator (SaaS MVP) — dealwithit.io.
Users describe their situation or upload a document photo, and the app generates polished administrative letters (cancellations, contestations, complaints, attestations) in French first, then multi-language.

> For full product context, user flows, and AI pipeline details — see [PROJECT.md](PROJECT.md).
> This file (`CLAUDE.md`) covers rules, conventions, and gotchas for working on the codebase.

---

## Tech Stack
| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, RSC + Server Actions) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | Supabase (Postgres + Auth + Storage) |
| PDF | `@react-pdf/renderer` |
| AI | `@anthropic-ai/sdk` v0.78+ — Claude `claude-sonnet-4-6` |
| Image resize | `sharp` (available via Next.js) |

---

## Critical Environment Notes

### Logitech Corporate Machine Proxy Issue
**Problem**: The system environment variable `ANTHROPIC_BASE_URL=https://logiq-service.logitech.io/anthropic` is set at the OS level on Yohan's work machine. Next.js does NOT override system env vars with `.env.local`. This routes all Anthropic SDK calls through the Logitech corporate proxy, which rejects personal API keys with `{"detail":"Invalid Credential"}` (not the standard Anthropic error format).

**Fix**: Always hardcode `baseURL: 'https://api.anthropic.com'` in every Anthropic SDK client instantiation:
```typescript
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: 'https://api.anthropic.com', // Override system-level proxy
})
```
This is already done in `lib/ai/vision.ts`. Any future file that creates an Anthropic client MUST include this override.

**Diagnosis command**: `printenv | grep -iE "proxy|https?_proxy|anthropic_base"`

### API Key Security
- **NEVER ask for or accept API keys in chat** — keys shared in conversation context are auto-revoked by Anthropic security scanning.
- Tell the user to paste keys directly in `.env.local` only.
- If a key gets revoked, user must generate a new one at console.anthropic.com.

### `.env.local` Structure
```
NEXT_PUBLIC_SUPABASE_URL=https://euarcnsepxyhlwinafwt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
ANTHROPIC_BASE_URL=https://api.anthropic.com
ANTHROPIC_API_KEY=...
```
The `ANTHROPIC_BASE_URL` line in `.env.local` is documentation only — it doesn't actually override the system var. The SDK `baseURL` override is what matters.

---

## File Structure (Key Paths)
```
app/
  page.tsx                    ← Landing (ExampleCards + TrustBanner, no Hero)
  (auth)/login/               ← Auth pages
  (app)/
    layout.tsx                ← Authenticated shell + Navbar
    dashboard/page.tsx        ← Request history
    request/
      new/page.tsx            ← Upload drag-drop + text input
      [id]/
        clarify/page.tsx      ← ClarificationForm with photo auto-fill
        result/page.tsx       ← Letter preview + PDF download

actions/
  upload.ts                   ← createRequestFromUpload, extractFromDocumentForClarify
  clarify.ts                  ← submitAnswers
  generate.ts                 ← runGenerationPipeline

lib/ai/
  vision.ts                   ← Real Claude Vision OCR (extractFromDocument)
  classify.ts                 ← Mock intent classifier (fallback)
  extract.ts                  ← Mock entity extractor (fallback)
  questions.ts                ← Claude-powered question generation
  generate.ts                 ← Claude-powered letter generation

lib/supabase/
  client.ts                   ← Browser Supabase client
  server.ts                   ← Server Supabase client (RSC / server actions)

components/
  landing/ExampleCards.tsx    ← Full-page hero with upload CTA + 7 example cards
  request/ClarificationForm.tsx ← Controlled form with photo auto-fill
  letter/LetterPreview.tsx    ← Editable letter + PDF download

types/index.ts                ← All DB + app types
```

---

## Key Architectural Decisions

### Vision / OCR Pipeline
`lib/ai/vision.ts` — `extractFromDocument(file: File)` returns:
```typescript
{ rawText: string, detectedIntent: IntentType | null, entities: Record<string, string | null> }
```
- Images: resized to max 1024px via `sharp` before sending → ~800–1200 input tokens
- PDFs: sent as-is via `anthropic.beta.messages.create` with `betas: ['pdfs-2024-09-25']`
- Always check `isPDF` branch for PDF handling vs image handling

### Entity → Form Field Mapping
`entity_type` in `extracted_entities` matches `field_key` in `clarification_questions` 1:1.
Entity types: `sender_name`, `sender_address`, `company_name`, `contract_number`, `termination_date`, `fine_reference`, `fine_amount`, `vehicle_plate`, `offense_date`, `offense_city`

### Single-Step Upload Flow
`createRequestFromUpload(formData)` in `actions/upload.ts`:
1. Create `requests` row
2. Upload file to Supabase Storage at `{user_id}/{request_id}/{timestamp}_{filename}`
3. Call Claude Vision → extract entities + detect intent
4. Save `document_uploads`, `extracted_entities`, update `requests`
5. Generate questions with pre-filled answers from entities
6. `redirect('/request/{id}/clarify')`

### Auto-Fill on Clarify Page
`extractFromDocumentForClarify(requestId, formData)` in `actions/upload.ts`:
- Called from `ClarificationForm` when user uploads a photo on the clarify page
- Returns `{ extractedValues: Record<string, string> }` to client
- Client merges into controlled `values` state and marks fields green

### Controlled Form Inputs
`ClarificationForm.tsx` uses fully controlled inputs (not `defaultValue`). This is necessary for programmatic auto-fill from OCR. State shape: `Record<field_key, string>`.

### Landing Page Structure
`app/page.tsx` renders only `<ExampleCards />` and `<TrustBanner />` — no Hero component.
`ExampleCards` is full-page with:
1. Upload/photo CTA banner at top
2. "ou choisissez un cas" divider
3. 6 example cards (fire server actions)
4. 7th "Autre situation" card → `<Link href="/request/new">` (no server action)

---

## Supabase Schema Notes
- Tables: `requests`, `document_uploads`, `extracted_entities`, `clarification_questions`, `generated_letters`, `recipients_directory`, `activity_history`, `user_profiles`, `billing_plans`
- All tables scoped to `auth.uid() = user_id` via RLS
- `recipients_directory` is public read
- Storage bucket: `documents` — private, path `{user_id}/{request_id}/{filename}`
- `updated_at` trigger on all mutable tables

### Pending Migrations
Check `supabase/migrations/` for any unapplied migrations before schema changes.
Migration `003_add_fine_authorities.sql` may not be applied yet — verify before using fine-related recipient lookup.

---

## Code Conventions
- All server actions start with `'use server'`
- All client components start with `'use client'`
- Supabase client: always `await createClient()` from `@/lib/supabase/server` in server contexts
- Never use `supabase.from()` in client components — always go through server actions
- Toast notifications via `sonner` (`toast.success`, `toast.error`, `toast.info`)
- Icons from `lucide-react`
- Use `clsx` / `cn()` for conditional class names

---

## Commit & Push Rules

### When to Commit
Commit after every **major feature** or **significant modification**, including:
- New page or route added
- New server action or AI pipeline step
- UI component with new behavior
- Bug fix that required non-trivial investigation
- Any change that affects the user flow

### Commit Message Format
```
<type>: <short description>

- bullet 1
- bullet 2
```
Types: `feat`, `fix`, `refactor`, `style`, `docs`, `chore`

Example:
```
feat: merge upload + clarify flow with Claude Vision auto-fill

- Single createRequestFromUpload action: create → upload → OCR → clarify
- Photo auto-fill on clarify page via extractFromDocumentForClarify
- Hardcode baseURL to bypass Logitech corporate proxy
- Server-side image resize to 1024px (sharp) for token cost control
```

### When to Push
Push to `origin main` after each session or after 2+ commits. Always confirm with user before pushing.

### Git Remote
If `git remote -v` returns empty, the remote hasn't been configured yet. Ask user for the GitHub repo URL before pushing.

---

## AI Model Usage
- Vision / OCR: `claude-sonnet-4-6` (fast, cost-effective for image analysis)
- Letter generation: `claude-sonnet-4-6`
- Question generation: `claude-sonnet-4-6`
- Always use the latest model in the `claude-sonnet-4-6` family unless user specifies otherwise
- Cost estimate: ~$0.002–0.004 per image at 1024px with claude-sonnet-4-6

---

## What NOT to Do
- Don't add features beyond what's asked
- Don't refactor code that isn't broken
- Don't add comments to code you didn't change
- Don't create new files when editing an existing one suffices
- Don't add error handling for impossible scenarios
- Don't use `any` type — prefer explicit types from `types/index.ts`
- Don't commit `.env.local` — it's in `.gitignore`
