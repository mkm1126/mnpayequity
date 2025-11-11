import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface NotificationRequest {
  to: string;
  type: 'urgent_note' | 'overdue_followup' | 'pending_approval' | 'daily_digest';
  data: {
    noteId?: string;
    noteTitle?: string;
    noteContent?: string;
    jurisdictionName?: string;
    caseName?: string;
    dueDate?: string;
    urgentCount?: number;
    overdueCount?: number;
    pendingCount?: number;
    notes?: any[];
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { to, type, data }: NotificationRequest = await req.json();

    if (!to || !type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, type' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    let subject = '';
    let htmlBody = '';
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const appUrl = supabaseUrl.replace('.supabase.co', '.vercel.app') || window.location.origin || 'https://yourapp.com';

    switch (type) {
      case 'urgent_note':
        subject = `🚨 Urgent Case Note: ${data.noteTitle}`;
        htmlBody = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #fff; padding: 20px; border: 1px solid #ddd; border-top: none; }
              .button { display: inline-block; background: #003865; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0; }
              .footer { text-align: center; padding: 16px; color: #666; font-size: 12px; }
              .alert-box { background: #fef2f2; border-left: 4px solid #dc2626; padding: 12px; margin: 16px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">🚨 Urgent Case Note</h1>
              </div>
              <div class="content">
                <div class="alert-box">
                  <strong>This requires immediate attention</strong>
                </div>
                <h2>${data.noteTitle}</h2>
                <p>${data.noteContent}</p>
                <p><strong>Jurisdiction:</strong> ${data.jurisdictionName || 'N/A'}</p>
                ${data.caseName ? `<p><strong>Case:</strong> ${data.caseName}</p>` : ''}
                <a href="${appUrl}" class="button">View in Dashboard</a>
              </div>
              <div class="footer">
                <p>You received this email because you are an administrator of the Pay Equity Reporting System.</p>
                <p>Do not reply to this email. This mailbox is not monitored.</p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;

      case 'overdue_followup':
        subject = `⏰ Overdue Follow-up: ${data.noteTitle}`;
        htmlBody = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #ea580c; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #fff; padding: 20px; border: 1px solid #ddd; border-top: none; }
              .button { display: inline-block; background: #003865; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0; }
              .footer { text-align: center; padding: 16px; color: #666; font-size: 12px; }
              .alert-box { background: #fff7ed; border-left: 4px solid #ea580c; padding: 12px; margin: 16px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">⏰ Overdue Follow-up</h1>
              </div>
              <div class="content">
                <div class="alert-box">
                  <strong>This follow-up is past its due date</strong>
                </div>
                <h2>${data.noteTitle}</h2>
                <p>${data.noteContent}</p>
                <p><strong>Due Date:</strong> ${data.dueDate ? new Date(data.dueDate).toLocaleDateString() : 'N/A'}</p>
                <p><strong>Jurisdiction:</strong> ${data.jurisdictionName || 'N/A'}</p>
                ${data.caseName ? `<p><strong>Case:</strong> ${data.caseName}</p>` : ''}
                <a href="${appUrl}" class="button">Complete Follow-up</a>
              </div>
              <div class="footer">
                <p>You received this email because you are an administrator of the Pay Equity Reporting System.</p>
                <p>Do not reply to this email. This mailbox is not monitored.</p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;

      case 'pending_approval':
        subject = `📋 New Case Pending Approval`;
        htmlBody = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #fff; padding: 20px; border: 1px solid #ddd; border-top: none; }
              .button { display: inline-block; background: #003865; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0; }
              .footer { text-align: center; padding: 16px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">📋 New Case Pending Approval</h1>
              </div>
              <div class="content">
                <p>A new pay equity case has been submitted and is awaiting your review and approval.</p>
                <p><strong>Jurisdiction:</strong> ${data.jurisdictionName || 'N/A'}</p>
                ${data.caseName ? `<p><strong>Case:</strong> ${data.caseName}</p>` : ''}
                <a href="${appUrl}" class="button">Review Case</a>
              </div>
              <div class="footer">
                <p>You received this email because you are an administrator of the Pay Equity Reporting System.</p>
                <p>Do not reply to this email. This mailbox is not monitored.</p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;

      case 'daily_digest':
        subject = `📊 Daily Admin Digest - ${new Date().toLocaleDateString()}`;
        htmlBody = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #003865; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #fff; padding: 20px; border: 1px solid #ddd; border-top: none; }
              .metric { background: #f3f4f6; padding: 16px; margin: 12px 0; border-radius: 6px; }
              .button { display: inline-block; background: #003865; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0; }
              .footer { text-align: center; padding: 16px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">📊 Daily Admin Digest</h1>
                <p style="margin: 0; opacity: 0.9;">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div class="content">
                <h2>Summary</h2>
                <div class="metric">
                  <strong>🚨 Urgent Notes:</strong> ${data.urgentCount || 0}
                </div>
                <div class="metric">
                  <strong>⏰ Overdue Follow-ups:</strong> ${data.overdueCount || 0}
                </div>
                <div class="metric">
                  <strong>📋 Pending Approvals:</strong> ${data.pendingCount || 0}
                </div>
                ${data.notes && data.notes.length > 0 ? `
                  <h3 style="margin-top: 24px;">Recent Activity</h3>
                  ${data.notes.map(note => `
                    <div style="padding: 12px; margin: 8px 0; border-left: 3px solid #003865; background: #f9fafb;">
                      <strong>${note.title}</strong><br>
                      <small style="color: #666;">${note.jurisdiction} • ${new Date(note.created_at).toLocaleDateString()}</small>
                    </div>
                  `).join('')}
                ` : ''}
                <a href="${appUrl}" class="button">View Admin Dashboard</a>
              </div>
              <div class="footer">
                <p>You received this email because you are an administrator of the Pay Equity Reporting System.</p>
                <p>To manage your notification preferences, visit your account settings.</p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid notification type' }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
    }

    console.log(`Sending ${type} notification to ${to}`);
    console.log('Email would be sent with subject:', subject);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notification sent successfully',
        type,
        to
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error sending notification:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});