# How to Generate and Download Compliance Certificates

## Overview
The system automatically generates **two official documents** when you approve a case:
1. **Compliance Certificate** - Official notice of compliance from Minnesota Management & Budget
2. **Test Results Letter** - Detailed results showing which tests were passed

## Where to Find the Download Buttons

### Step 1: Navigate to Approval Dashboard
1. Log in as an admin user
2. Click **Admin** in the top navigation
3. Select **Case Approval Dashboard**

### Step 2: Review a Case
1. Find a submitted case in the list
2. Click the **Review** button (eye icon)
3. This opens the **Case Review Page**

### Step 3: Approve the Case
On the Case Review Page, you'll see two sections:

#### Section 1: Approval Actions (Before Approval)
- If the case hasn't been approved yet, you'll see approval options
- Select an approval reason
- Click **Mark In Compliance**
- **This generates both documents automatically**

#### Section 2: Official Documents (After Approval)
After approval, you'll see a green box that says:
```
📄 Official Documents Generated
   Issued on [date]

[Compliance Certificate] [Test Results] [Download Both]
```

## Download Options

You have three buttons to download the documents:

1. **Compliance Certificate** - Downloads just the official compliance certificate
2. **Test Results** - Downloads just the detailed test results letter
3. **Download Both** - Downloads both documents sequentially

## What If I Don't See the Download Buttons?

### Reason 1: Case Not Yet Approved
**Problem:** The documents are only generated when you approve a case.

**Solution:**
1. Make sure you've clicked **Mark In Compliance**
2. Wait for the success message
3. Refresh the page if needed

### Reason 2: Old Approvals (Before System Update)
**Problem:** Cases approved before this feature was implemented don't have certificates yet.

**Solution:**
You have two options:
- **Option A:** Reopen and re-approve the case (generates new documents)
- **Option B:** Contact an admin to manually regenerate certificates

### Reason 3: Database Connection Issue
**Problem:** The certificates were generated but the page can't retrieve them.

**Solution:**
1. Check browser console for errors (F12 → Console tab)
2. Verify you're connected to the internet
3. Try refreshing the page
4. If CORS errors appear, see `CORS_FIX_INSTRUCTIONS.md`

## Testing the Feature

### Quick Test:
1. Find any submitted case that's pending approval
2. Click **Review** on that case
3. Click **Mark In Compliance** (select a reason first)
4. Wait for "Case approved successfully!" message
5. Scroll down - you should now see the green "Official Documents Generated" box
6. Click any of the three download buttons

### Expected Result:
- Both documents should download as PDFs
- The Compliance Certificate has the official MMB header and commissioner signature
- The Test Results Letter shows checkboxes for each compliance test

## Document Contents

### Compliance Certificate Contains:
- Official MMB logo
- "Notice of Pay Equity Compliance" header
- Jurisdiction name and ID
- Official compliance text
- Commissioner signature (or typed name)
- Date issued

### Test Results Letter Contains:
- MMB logo
- Results of all 4 compliance tests:
  1. Completeness and Accuracy Test
  2. Alternative Analysis Test (3 options with checkboxes)
  3. Salary Range Test (2 options with checkboxes)
  4. Exceptional Service Pay Test (2 options with checkboxes)
- Contact information for questions

## Configuring Document Settings

Admins can customize the documents:

1. Click **Admin** → **System Settings**
2. Configure:
   - Commissioner name and title
   - Commissioner signature image (or use typed name)
   - Contact person details
   - MMB logo
3. Click **Preview Documents** to see how they'll look
4. Click **Save Settings**

**Note:** Settings apply to all future generated documents. Existing certificates are not updated.

## Troubleshooting

### Problem: Documents won't download
**Check:**
- Pop-up blocker isn't blocking downloads
- Browser has permission to download files
- Sufficient disk space

### Problem: "Download Both" only downloads one
**Explanation:** Some browsers block multiple downloads at once.

**Solution:** Download each document individually using the first two buttons.

### Problem: Blank or corrupted PDFs
**Possible causes:**
- Large logo images causing memory issues
- Browser PDF viewer incompatibility

**Solution:**
1. Try downloading with a different browser
2. In System Settings, try using a smaller logo image
3. Open PDFs with Adobe Reader instead of browser viewer

## Need Help?

If you continue having issues:
1. Check the browser console for error messages (F12)
2. Verify the case is actually approved (status shows green checkmark)
3. Check that `compliance_certificates` table has data (admin can query database)
4. Review `CORS_FIX_INSTRUCTIONS.md` if you see CORS errors

## Database Query (For Admins)

To verify certificates exist in the database:

```sql
SELECT
  id,
  report_id,
  document_issue_date,
  commissioner_name,
  CASE WHEN certificate_data IS NOT NULL THEN 'YES' ELSE 'NO' END as has_certificate,
  CASE WHEN test_results_document IS NOT NULL THEN 'YES' ELSE 'NO' END as has_test_results
FROM compliance_certificates
ORDER BY created_at DESC
LIMIT 10;
```

This shows the 10 most recently generated certificates and confirms both documents exist.
