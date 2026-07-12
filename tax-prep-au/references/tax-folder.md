# Tax Folder Resolution

**Status: DRIVE CANDIDATE CONFIRMED-BY-DISCOVERY, LOCAL PATH UNCONFIRMED.** Michael to confirm which is canonical; until then, resolution order below applies and the run header must state which root was used.

## Resolution order

1. **Local (Cowork)** ... a Cowork-granted folder whose path ends in `/Tax` or is explicitly named by Michael in the session. Expected neighbourhood based on his iCloud structure:
   `/Users/michaeldavidson/Library/Mobile Documents/com~apple~CloudDocs/iCloud drive (Personal files)/Business/Tax`
   (unverified ... the Business parent was outside the access grant at discovery time). If Cowork has been granted a Tax folder, it wins.
2. **Google Drive** ... folder "Tax - BrizTax", owned by michaelkd01@gmail.com
   Folder ID: `133I1NvjJaTDqJuPPRbIBfz-TwMsj9i9-`
   URL: https://drive.google.com/drive/folders/133I1NvjJaTDqJuPPRbIBfz-TwMsj9i9-
   Known subfolders at discovery (2026-07-07): Receipts, Property, Health. Legacy structure ... map contents into the FY convention on first Cowork run rather than assuming FY subfolders exist.
3. **Fallback (claude.ai)** ... session uploads in, `/mnt/user-data/outputs/` out. State this loudly in the run header.

## Do not use

- The Propell workspace "Tax" folders (modified by propell.au staff ... Gary, Julienne, Jia) and "5. Tax". Those are Propell corporate records, out of scope for the Personal / Social Club Ventures / Remida Trust pipeline. Propell-related spend is handled via the PROPELL-REIMB bucket, not via Propell's Drive.

## First-run migration note

The Drive folder's legacy layout (Receipts / Property / Health) predates the FY convention. On the first Cowork run: create `FY{yy}/{statements,evidence,workpapers}` under the resolved root, leave legacy folders untouched, and index any prior-year returns found anywhere under the root for Phase 0.
