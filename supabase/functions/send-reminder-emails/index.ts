import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
  const appUrl = "https://kundkollen.se"; // Ändra till din faktiska URL
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
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #2563eb;
          color: white;
          padding: 20px;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background-color: #f9fafb;
          padding: 30px;
          border: 1px solid #e5e7eb;
          border-top: none;
          border-radius: 0 0 8px 8px;
        }
        .reminder-box {
          background-color: white;
          padding: 20px;
          border-radius: 6px;
          border-left: 4px solid #2563eb;
          margin: 20px 0;
        }
        .reminder-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 10px;
        }
        .button {
          display: inline-block;
          background-color: #2563eb;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          margin-top: 20px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="margin: 0; font-size: 24px;">${heading}</h1>
      </div>
      <div class="content">
        <p>${message}</p>
        
        <div class="reminder-box">
          <div class="reminder-title">${reminder.reminder_title}</div>
          ${description}
          ${customerInfo}
          <p><strong>Datum:</strong> ${dueDate}</p>
        </div>
        
        <a href="${appUrl}/reminders" class="button">Se påminnelser i Kundkollen</a>
        
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
        const emailResponse = await resend.emails.send({
          from: "Kundkollen <noreply@kundkollen.se>",
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

serve(handler);
