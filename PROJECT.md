# dealWithIt — Product & Technical Overview

> **Last updated**: 2026-03-10
> Keep this file up-to-date as the product evolves.

---

## What Is dealWithIt?

dealWithIt (dealwithit.io) is an AI-powered administrative assistant that helps consumers draft polished, legally-sound administrative letters in minutes. Users either describe their situation in plain language or upload a document photo, and the app generates a ready-to-send letter.

**Primary market**: France (French-first UI). Expansion planned: US, UK, DE, IT, ES.

---

## Problem It Solves

Administrative letters in France (and most European countries) follow strict formal conventions. Most people don't know the correct formulas, the applicable legal deadlines, or the right authority to address. This creates anxiety, delays, and costly mistakes (e.g. paying a fine before contesting it, which makes contestation impossible).

dealWithIt removes that friction: describe the situation, get a correct draft letter with the right legal references, deadlines, and recipient information — in under 60 seconds.

---

## Letter Types Supported (Intents)

| Intent | French label | Example use case |
|---|---|---|
| `terminate` | Résiliation | Cancel a gym membership, phone contract, insurance |
| `contest` | Contestation | Contest a speeding fine, parking ticket, incorrect invoice |
| `complain` | Réclamation | File a complaint about a service, product, or billing error |
| `request` | Demande | Formal written request to an administration or company |
| `certify` | Attestation | Draft an "attestation sur l'honneur" (statutory declaration) |

---

## User Flows

### Flow 1: Upload a Document (Primary)

1. **Landing** — User sees example cards + "Import a photo" CTA
2. **`/request/new`** — User uploads a document (photo, PDF, scan)
3. **Server action** `createRequestFromUpload()`:
   - Create `requests` row in DB
   - Upload file to Supabase Storage
   - Send file to Claude Vision → extract entities + detect intent
   - Save extracted entities to `extracted_entities`
   - Generate clarification questions (pre-filled with extracted values)
   - Redirect to `/request/[id]/clarify`
4. **`/request/[id]/clarify`** — User reviews pre-filled form, corrects or completes missing fields. Can upload another photo to re-run auto-fill.
5. **`/request/[id]/result`** — Letter generated. User reads, edits, downloads PDF or copies email version.

### Flow 2: Text Description (Secondary)

1. **Landing** — User clicks "Autre situation" card
2. **`/request/new`** (text tab) — User types their situation in free text
3. **Server action** `createRequestFromText()`:
   - Classify intent from text
   - Extract entities from text
   - Generate questions
   - Redirect to `/request/[id]/clarify`
4. Same clarify → result flow as above

### Flow 3: Example Card (Shortcut)

1. User clicks a pre-configured example card on the landing page (e.g. "Résiliation salle de sport")
2. Server action fires with pre-seeded text + intent
3. Skips or fast-tracks clarify step → redirect to result

---

## AI Pipeline

### Step 1 — Vision / OCR (`lib/ai/vision.ts`)
Sends the uploaded file to `claude-sonnet-4-6`. Returns:
```typescript
{
  rawText: string           // full transcript of visible text
  detectedIntent: IntentType | null
  entities: {
    sender_name: string | null
    sender_address: string | null
    company_name: string | null
    contract_number: string | null
    termination_date: string | null  // YYYY-MM-DD
    fine_reference: string | null
    fine_amount: string | null
    vehicle_plate: string | null
    offense_date: string | null      // YYYY-MM-DD
    offense_city: string | null
  }
}
```
- Images: resized to max 1024px via `sharp` before sending (~$0.002–0.004/image)
- PDFs: sent as-is via Anthropic PDF beta

### Step 2 — Intent Classification (`lib/ai/classify.ts`)
Fallback only (used if Claude Vision doesn't detect intent from the document).
Currently a mock; TODO: replace with Claude text classification.

### Step 3 — Question Generation (`lib/ai/questions.ts`)
Generates clarification questions based on intent + already-extracted entities.
Skips questions for fields already populated by OCR.
Currently a mix of rule-based + TODO Claude API.

### Step 4 — Letter Generation (`lib/ai/generate.ts`)
Takes the full `LetterContext` (intent, entities, clarification answers) and generates:
- `postal`: full formal letter with address headers, legal formulas, signature
- `email`: shorter, conversational version of the same content
- `subject`: email subject line

Currently template-based (rule-based per intent). TODO: replace with Claude to handle edge cases and nuance better.

### Letter Post-Processing
After generation:
- **Recipient lookup**: searches `recipients_directory` by company name or fine authority
- **Attachment checklist**: `getAttachmentChecklist()` returns required docs per intent
- **Next steps**: `getNextSteps()` returns action items with legal deadlines (e.g. "45 days to contest a fine")

---

## Data Model (Key Tables)

```
requests           ← one per user request; holds intent, status, raw_input
document_uploads   ← uploaded files (path in Supabase Storage, OCR text)
extracted_entities ← named entities from OCR or text (company, dates, contract numbers…)
clarification_questions ← missing fields asked to user; field_key maps to entity_type
generated_letters  ← postal + email versions; versioned
recipients_directory ← static lookup of company postal/email addresses
attachments_checklists ← per-request list of documents to attach
activity_history   ← audit log of user actions
```

### Status Flow

```
draft → clarifying → generating → complete
```

---

## URL Structure

```
/                          Landing (example cards + upload CTA)
/login                     Auth
/signup                    Auth
/dashboard                 Request history
/request/new               Upload or text input
/request/[id]/clarify      Answer clarification questions
/request/[id]/result       Letter preview + PDF download
```

---

## Letter Output

Each generated letter has two versions:

**Postal version** — formal structure:
```
[Sender name]
[Sender address]

[Company name]
[Service]

[City], le [date]

Objet : [subject]

Madame, Monsieur,

[Body]

[Closing formula]

[Signature]

---
⚠️ Brouillon — À relire avant envoi.
```

**Email version** — shorter, conversational, same information.

Both versions are editable inline on the result page before download.

---

## PDF Generation

`GET /api/requests/[id]/pdf` — renders via `@react-pdf/renderer`:
- `LetterDocument` React PDF component
- Returns PDF blob for download
- Optionally stores path in `generated_letters.pdf_path`

---

## Key Design Decisions

### Why server actions over API routes?
Server actions (Next.js) keep auth and DB logic server-side without extra API boilerplate. All mutation flows (upload, clarify, generate) are server actions. The only API route is PDF generation (needs streaming response).

### Why controlled inputs in ClarificationForm?
Auto-fill from OCR requires programmatic form updates. `defaultValue` is uncontrolled and can't be updated after mount. All form fields use `value` + `onChange` with a central `values` state.

### Why `sharp` for image resize?
Sending 4K phone photos to Claude would cost 5–10× more in tokens. Capping at 1024px reduces cost without meaningful accuracy loss for text extraction.

### Why hardcode `baseURL` in Anthropic client?
The developer machine has a system env var `ANTHROPIC_BASE_URL` pointing to a corporate proxy. Next.js does not override system env vars with `.env.local`. Hardcoding `baseURL: 'https://api.anthropic.com'` in the SDK client bypasses this.

---

## What's Mocked vs Real (as of 2026-03-10)

| Module | Status |
|---|---|
| `lib/ai/vision.ts` — document OCR | **Real** (Claude Vision) |
| `lib/ai/generate.ts` — letter generation | Mock (template-based) — TODO Claude |
| `lib/ai/questions.ts` — question generation | Partially real — TODO Claude |
| `lib/ai/classify.ts` — intent classification | Mock — TODO Claude |
| PDF generation | **Real** (@react-pdf/renderer) |
| Auth | **Real** (Supabase magic link + email/password) |
| Storage | **Real** (Supabase Storage) |
| Recipient lookup | **Real** (static DB table) |
| Billing | Schema only — no Stripe UI yet |

---

## Roadmap (Post-MVP)

- [ ] Replace all mock AI modules with real Claude API calls
- [ ] Multi-language support (EN, DE, UK, IT, ES)
- [ ] Stripe billing integration (3 free letters, then paid)
- [ ] Email sending integration (send directly from app)
- [ ] Mobile app (React Native or PWA)
- [ ] Admin panel for recipient directory management
- [ ] Letter quality feedback loop
- [ ] Auto-detect company address from uploaded document
