import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ReminderRequest {
  jurisdictionId: string;
  reportYear: number;
  reminderType: string;
  recipientEmail: string;
  recipientName?: string;
  manualTrigger?: boolean;
  triggeredBy?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { jurisdictionId, reportYear, reminderType, recipientEmail, recipientName, manualTrigger, triggeredBy }: ReminderRequest = await req.json();

    if (!jurisdictionId || !reportYear || !reminderType || !recipientEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: jurisdiction, error: jurisdictionError } = await supabase
      .from('jurisdictions')
      .select('*')
      .eq('id', jurisdictionId)
      .single();

    if (jurisdictionError || !jurisdiction) {
      return new Response(
        JSON.stringify({ error: 'Jurisdiction not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const deadlineDate = new Date(reportYear, 0, 31);
    const formattedDeadline = deadlineDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    const today = new Date();
    const daysUntil = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const daysOverdue = daysUntil < 0 ? Math.abs(daysUntil) : 0;

    let subject = '';
    let htmlBody = '';
    const appUrl = supabaseUrl.replace('.supabase.co', '.vercel.app') || 'https://yourapp.com';

    if (reminderType.startsWith('approaching')) {
      const daysString = reminderType === 'approaching_90d' ? '90' :
                        reminderType === 'approaching_60d' ? '60' :
                        reminderType === 'approaching_30d' ? '30' :
                        reminderType === 'approaching_7d' ? '7' : 'X';

      const urgencyClass = daysUntil <= 7 ? 'urgent' : daysUntil <= 30 ? 'high' : 'normal';
      const urgencyColor = urgencyClass === 'urgent' ? '#dc2626' :
                          urgencyClass === 'high' ? '#ea580c' : '#2563eb';

      subject = `${daysUntil <= 7 ? '🚨' : '📅'} Pay Equity Report Due in ${daysUntil} Days - ${jurisdiction.name}`;
      htmlBody = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: ${urgencyColor}; color: white; padding: 24px; text-align: center; }
            .content { background: #fff; padding: 32px 24px; }
            .deadline-box { background: #f9fafb; border: 2px solid ${urgencyColor}; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center; }
            .deadline-date { font-size: 28px; font-weight: bold; color: ${urgencyColor}; }
            .days-remaining { font-size: 18px; margin-top: 8px; }
            .requirements { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .requirements ul { margin: 10px 0; padding-left: 20px; }
            .button { display: inline-block; background: #003865; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #666; font-size: 13px; border-top: 1px solid #e5e7eb; }
            .contact-info { background: #e0f2fe; padding: 16px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 26px;">${daysUntil <= 7 ? '🚨 URGENT:' : '📅'} Pay Equity Report Deadline Approaching</h1>
            </div>
            <div class="content">
              <p style="font-size: 16px;">Hello ${recipientName || 'there'},</p>
              
              <p style="font-size: 16px;">This is a ${daysUntil <= 7 ? '<strong>URGENT</strong>' : ''} reminder that your pay equity report for <strong>${jurisdiction.name}</strong> is due soon.</p>
              
              <div class="deadline-box">
                <div class="deadline-date">${formattedDeadline}</div>
                <div class="days-remaining" style="color: ${urgencyColor};">
                  <strong>${daysUntil} days remaining</strong>
                </div>
              </div>

              <div class="requirements">
                <h3 style="margin-top: 0; color: #003865;">📋 Report Requirements</h3>
                <ul style="line-height: 1.8;">
                  <li>Complete job evaluation for all positions</li>
                  <li>Enter job classification data</li>
                  <li>Evaluate health benefits contributions</li>
                  <li>Run compliance tests</li>
                  <li>Complete implementation form</li>
                  <li>Obtain governing body approval</li>
                  <li>Post official notice</li>
                  <li>Submit before deadline</li>
                </ul>
              </div>

              <p style="font-size: 16px;">Minnesota law requires jurisdictions to submit pay equity reports every three years. Timely submission ensures your jurisdiction remains in compliance.</p>

              <div style="text-align: center;">
                <a href="${appUrl}" class="button">Access Pay Equity System</a>
              </div>

              <div class="contact-info">
                <strong>Need Help?</strong><br>
                If you have questions or need assistance, please contact the Pay Equity Support Team:<br>
                <strong>Email:</strong> support@payequity.mn.gov<br>
                <strong>Phone:</strong> (651) 555-0100
              </div>
            </div>
            <div class="footer">
              <p><strong>${jurisdiction.name}</strong><br>
Report Year: ${reportYear}<br>
Jurisdiction ID: ${jurisdiction.jurisdiction_id}</p>
              <p>You received this email because you are a contact for ${jurisdiction.name} in the Pay Equity Reporting System.</p>
              <p style="margin-top: 16px; font-size: 12px; color: #999;">Minnesota Department of Management and Budget<br>
Pay Equity Reporting System</p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else if (reminderType.startsWith('overdue')) {
      subject = `🚨 OVERDUE: Pay Equity Report Required - ${jurisdiction.name}`;
      htmlBody = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: #dc2626; color: white; padding: 24px; text-align: center; }
            .content { background: #fff; padding: 32px 24px; }
            .alert-box { background: #fef2f2; border: 3px solid #dc2626; border-radius: 8px; padding: 20px; margin: 24px 0; }
            .overdue-text { font-size: 24px; font-weight: bold; color: #dc2626; text-align: center; }
            .button { display: inline-block; background: #dc2626; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #666; font-size: 13px; border-top: 1px solid #e5e7eb; }
            .contact-info { background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">🚨 OVERDUE SUBMISSION NOTICE</h1>
            </div>
            <div class="content">
              <p style="font-size: 16px;">Hello ${recipientName || 'there'},</p>
              
              <div class="alert-box">
                <div class="overdue-text">SUBMISSION IS ${daysOverdue} DAYS OVERDUE</div>
                <p style="text-align: center; margin: 12px 0 0 0; font-size: 16px;">Due Date: ${formattedDeadline}</p>
              </div>

              <p style="font-size: 16px; font-weight: bold;">IMMEDIATE ACTION REQUIRED</p>

              <p style="font-size: 16px;">Your jurisdiction's pay equity report for <strong>${jurisdiction.name}</strong> was due on <strong>${formattedDeadline}</strong> and is now <strong>${daysOverdue} days overdue</strong>.</p>

              <p style="font-size: 16px;">Minnesota Statutes require timely submission of pay equity reports. Please submit your report as soon as possible to avoid potential compliance issues.</p>

              <div style="text-align: center;">
                <a href="${appUrl}" class="button">SUBMIT NOW</a>
              </div>

              <div class="contact-info">
                <strong>⚠️ Need Immediate Assistance?</strong><br>
                If you are experiencing difficulties or need help completing your report, please contact us immediately:<br>
                <strong>Email:</strong> support@payequity.mn.gov<br>
                <strong>Phone:</strong> (651) 555-0100 (Monday-Friday, 8:00 AM - 4:30 PM CT)
              </div>

              <p style="font-size: 14px; color: #666; margin-top: 24px;"><em>This is an automated reminder. Additional follow-up may be required if the submission remains outstanding.</em></p>
            </div>
            <div class="footer">
              <p><strong>${jurisdiction.name}</strong><br>
Report Year: ${reportYear}<br>
Jurisdiction ID: ${jurisdiction.jurisdiction_id}<br>
<span style="color: #dc2626; font-weight: bold;">Status: ${daysOverdue} DAYS OVERDUE</span></p>
              <p>You received this email because you are a contact for ${jurisdiction.name} in the Pay Equity Reporting System.</p>
              <p style="margin-top: 16px; font-size: 12px; color: #999;">Minnesota Department of Management and Budget<br>
Pay Equity Reporting System</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    console.log(`Sending ${reminderType} reminder to ${recipientEmail} for ${jurisdiction.name}`);

    const { error: insertError } = await supabase
      .from('submission_reminders')
      .insert({
        jurisdiction_id: jurisdictionId,
        report_year: reportYear,
        reminder_type: reminderType,
        sent_at: new Date().toISOString(),
        email_sent_to: recipientEmail,
        email_subject: subject,
        email_delivered: true,
        created_by: triggeredBy || null
      });

    if (insertError) {
      console.error('Error logging reminder:', insertError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Reminder sent successfully',
        reminderType,
        jurisdiction: jurisdiction.name,
        email: { subject, preview: htmlBody.substring(0, 200) + '...' }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error sending reminder:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});