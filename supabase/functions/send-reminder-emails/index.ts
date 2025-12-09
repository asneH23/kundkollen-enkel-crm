
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Reminder {
  user_id: string;
  user_email: string;
  reminder_id: string;
  reminder_title: string;
  reminder_description: string | null;
  customer_name: string | null;
  due_date: string;
  days_until: number;
  notification_type: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('sv-SE');
}

function getEmailContent(reminder: Reminder): { subject: string; html: string } {
  // Use configured App URL or fallback to production
  const appUrl = Deno.env.get("APP_URL") || "https://kundkollen-enkel-crm.vercel.app";

  const dueDate = formatDate(reminder.due_date);
  const customerInfo = reminder.customer_name ? `<p><strong>Kund:</strong> ${reminder.customer_name}</p>` : '';
  const description = reminder.reminder_description ? `<p>${reminder.reminder_description}</p>` : '';

  let subject = '';
  let heading = '';
  let message = '';

  switch (reminder.notification_type) {
    case '7_days':
      subject = `Påminnelse om 1 vecka: ${reminder.reminder_title}`;
      heading = 'Påminnelse om 1 vecka';
      message = 'Detta är en påminnelse om att du har en påminnelse som är 1 vecka bort:';
      break;
    case '1_day':
      subject = `Påminnelse imorgon: ${reminder.reminder_title}`;
      heading = 'Påminnelse imorgon';
      message = 'Detta är en påminnelse om att du har en påminnelse imorgon:';
      break;
    case 'today':
      subject = `Påminnelse idag: ${reminder.reminder_title}`;
      heading = 'Påminnelse idag';
      message = 'Detta är en påminnelse om att du har en påminnelse idag:';
      break;
    case 'overdue':
      const daysOverdue = Math.abs(reminder.days_until);
      subject = `⚠️ Försenad påminnelse: ${reminder.reminder_title}`;
      heading = 'Försenad påminnelse';
      message = `Detta är en varning om att du har en försenad påminnelse (${daysOverdue} dagar):`;
      break;
    default:
      subject = `Påminnelse: ${reminder.reminder_title}`;
      heading = 'Påminnelse';
      message = 'Du har en påminnelse:';
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #1a1a1a;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          font-size: 16px;
        }
        .header {
          background-color: #16A34A;
          color: white;
          padding: 24px;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background-color: #ffffff;
          padding: 32px;
          border: 1px solid #e5e7eb;
          border-top: none;
          border-radius: 0 0 8px 8px;
        }
        .reminder-box {
          background-color: #f8fafc;
          padding: 24px;
          border-radius: 8px;
          border-left: 6px solid #16A34A;
          margin: 24px 0;
        }
        .reminder-title {
          font-size: 20px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 12px;
        }
        .button {
          display: inline-block;
          background-color: #16A34A;
          color: white;
          padding: 14px 28px;
          text-decoration: none;
          border-radius: 8px;
          margin-top: 24px;
          font-weight: 600;
          text-align: center;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="margin: 0; font-size: 24px; font-weight: 700;">${heading}</h1>
      </div>
      <div class="content">
        <p style="margin-bottom: 24px;">${message}</p>
        
        <div class="reminder-box">
          <div class="reminder-title">${reminder.reminder_title}</div>
          ${description}
          ${customerInfo}
          <p style="margin-top: 12px;"><strong>Datum:</strong> ${dueDate}</p>
        </div>
        
        <div style="text-align: center;">
            <a href="${appUrl}/paminnelser" class="button">Se påminnelser i Kundkollen</a>
        </div>
        
        <div class="footer">
          <p>Med vänliga hälsningar,<br><strong>Kundkollen</strong></p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check for test mode
    let body: { test_email?: string } = {};
    try {
      body = await req.json();
    } catch {
      // No body or invalid JSON, continue with normal operation
    }

    // Test mode: send a test email directly
    if (body.test_email) {
      console.log(`Test mode: sending test email to ${body.test_email}`);

      const testEmailResponse = await resend.emails.send({
        from: "Kundkollen <onboarding@resend.dev>",
        to: [body.test_email],
        subject: "Test: Email-påminnelser fungerar!",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; font-size: 16px; }
              .header { background-color: #16A34A; color: white; padding: 24px; border-radius: 8px 8px 0 0; }
              .content { background-color: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">Test av email-påminnelser</h1>
            </div>
            <div class="content">
              <p>Detta är ett testmail från Kundkollen för att verifiera att email-påminnelser fungerar korrekt.</p>
              <p>Om du ser detta meddelande fungerar systemet som det ska!</p>
              <p style="margin-top: 30px;">Med vänliga hälsningar,<br><strong>Kundkollen</strong></p>
            </div>
          </body>
          </html>
        `,
      });

      console.log("Test email sent:", testEmailResponse);

      return new Response(
        JSON.stringify({ message: "Test email sent", email: body.test_email, response: testEmailResponse }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Starting reminder email job...");

    // Create Supabase client with service role key (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all reminders that need notifications
    const { data: reminders, error: remindersError } = await supabase.rpc('get_reminders_to_notify');

    if (remindersError) {
      console.error("Error fetching reminders:", remindersError);
      throw remindersError;
    }

    console.log(`Found ${reminders?.length || 0} reminders to notify`);

    if (!reminders || reminders.length === 0) {
      return new Response(
        JSON.stringify({ message: "No reminders to notify", count: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = [];

    for (const reminder of reminders as Reminder[]) {
      try {
        console.log(`Processing reminder ${reminder.reminder_id} for user ${reminder.user_email}`);

        const { subject, html } = getEmailContent(reminder);

        // Send email via Resend
        const SENDER_EMAIL = Deno.env.get("SENDER_EMAIL");
        const fromEmail = SENDER_EMAIL || "onboarding@resend.dev";

        const emailResponse = await resend.emails.send({
          from: `Kundkollen <${fromEmail}>`,
          to: [reminder.user_email],
          subject,
          html,
        });

        console.log(`Email sent successfully:`, emailResponse);

        // Log the notification
        const { error: logError } = await supabase
          .from("notification_logs")
          .insert({
            reminder_id: reminder.reminder_id,
            notification_type: reminder.notification_type,
            user_id: reminder.user_id,
          });

        if (logError) {
          console.error("Error logging notification:", logError);
        }

        results.push({
          reminder_id: reminder.reminder_id,
          email: reminder.user_email,
          status: "sent",
          notification_type: reminder.notification_type,
        });
      } catch (error: any) {
        console.error(`Error processing reminder ${reminder.reminder_id}:`, error);
        results.push({
          reminder_id: reminder.reminder_id,
          email: reminder.user_email,
          status: "failed",
          error: error.message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: "Reminder emails processed",
        total: reminders.length,
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-reminder-emails function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

// Deno.serve is built-in
Deno.serve(handler);
