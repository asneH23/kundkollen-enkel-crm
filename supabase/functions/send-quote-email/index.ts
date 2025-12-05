import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
    to: string[];
    subject: string;
    html: string;
    pdfBase64?: string;
    filename?: string;
    replyTo?: string;
    fromName?: string;
}

const handler = async (req: Request): Promise<Response> => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { to, subject, html, pdfBase64, filename, replyTo, fromName }: EmailRequest = await req.json();

        if (!to || !subject || !html) {
            return new Response(
                JSON.stringify({ error: "Missing required fields" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const attachments = pdfBase64 && filename ? [
            {
                content: pdfBase64,
                filename: filename,
                type: "application/pdf",
                disposition: "attachment",
            },
        ] : [];

        const fromEmail = "onboarding@resend.dev"; // Använd denna tills domänen är verifierad
        const from = fromName ? `${fromName} <${fromEmail}>` : "Kundkollen <" + fromEmail + ">";

        const emailData = {
            from: from,
            to: to,
            reply_to: replyTo,
            subject: subject,
            html: html,
            attachments: attachments,
        };

        console.log(`Sending email to ${to} with subject "${subject}"`);

        const data = await resend.emails.send(emailData);

        console.log("Email sent successfully:", data);

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error: any) {
        console.error("Error sending email:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
};

serve(handler);
