# Setup: build the Make.com scenario

Time: about 30 minutes. You need free accounts on Make.com, Google and Brevo.

## 1. Google Sheet
1. Create a sheet called **Leads**.
2. Paste the header row from [`templates/lead-sheet-columns.csv`](../templates/lead-sheet-columns.csv) into row 1.

## 2. Brevo
1. Contacts → Lists → create a list, e.g. **Website leads**.
2. Contacts → Settings → add attributes `BUSINESS`, `CHALLENGE`, `SOURCE` (text).
3. Automations → create a workflow: trigger **Contact added to list "Website leads"** → send email 1 (the free guide) → wait 2 days → email 2 → wait 3 days → email 3 (invite to book a call).

## 3. Make.com scenario
| # | Module | Settings |
|---|---|---|
| 1 | **Webhooks → Custom webhook** | Create a webhook, copy its URL. Click "Redetermine data structure" and submit the demo form once so Make learns the fields. |
| 2 | **JSON → Parse JSON** | Only needed if the body arrives as text: parse `{{1.value}}`. |
| 3 | **Google Sheets → Add a row** | Sheet **Leads**. Map each column to the matching field; set `status` to `new`. |
| 4 | **Brevo → Create/Update a contact** | Email = `email`, list = **Website leads**, attributes `FIRSTNAME`, `SMS` (= `phone_clean`), `BUSINESS`, `CHALLENGE`, `SOURCE`. Turn on "update if exists". |

Turn the scenario **ON** and set scheduling to **Immediately**.

## 4. Connect the website
1. Copy `src/lead-capture.js` to your site.
2. Set `WEBHOOK_URL` to the webhook from step 3 and `DEFAULT_COUNTRY` to your dialling code.
3. Give your form fields the ids `name`, `phone`, `email`, `business`, `challenge`, wrap the form in `#form-content`, and add a `#success-state` block.

## 5. Track campaigns
Share links like:
- `https://yoursite.com/guide.html?src=instagram-bio`
- `https://yoursite.com/guide.html?src=flyer-lekki&biz=real-estate`

The `source` column in the sheet now tells you which link brought each lead.

## Note on security
A webhook URL in a public web page can be found by anyone. Add a filter in Make.com (e.g. require a valid email and a known `business` value) and turn on webhook IP/rate limits if spam appears.
