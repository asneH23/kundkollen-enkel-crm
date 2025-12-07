
import { Invoice } from "@/components/InvoiceCard";

interface CompanyInfo {
    name: string;
    orgNumber?: string;
    contactPerson?: string;
}

export const generateSieContent = (invoices: Invoice[], companyInfo: CompanyInfo, startDate: Date, endDate: Date): string => {
    const NOW = new Date();
    const DATE_GENERATED = NOW.toISOString().split('T')[0].replace(/-/g, '');
    const TIME_GENERATED = NOW.toTimeString().split(' ')[0].replace(/:/g, '');
    const USER_SIGN = companyInfo.contactPerson ? companyInfo.contactPerson.substring(0, 3).toUpperCase() : "UNK";

    // Formatting helpers
    const formatDate = (dateString: string) => dateString.replace(/-/g, '');
    const formatString = (str: string) => `"${str.substring(0, 30)}"`; // Max 30 chars usually safe

    let content = "";

    // --- 1. HEADER ---
    content += `#FLAGGA 0\n`;
    content += `#PROGRAM "KungKollen" "1.0"\n`;
    content += `#FORMAT PC8\n`; // Character encoding
    content += `#GEN ${DATE_GENERATED} ${TIME_GENERATED} "${USER_SIGN}"\n`;
    content += `#SIETYP 4\n`; // Typ 4 = Import/Export transactions
    content += `#FNAMN ${formatString(companyInfo.name)}\n`;
    if (companyInfo.orgNumber) {
        content += `#ORGNR ${companyInfo.orgNumber.replace(/[^0-9]/g, '')}\n`; // Clean non-digits
    }
    content += `#RAR 0 ${formatDate(startDate.toISOString().split('T')[0])} ${formatDate(endDate.toISOString().split('T')[0])}\n`;
    content += `\n`;

    // --- 2. ACCOUNTS (KONTO) ---
    // We declare the standard accounts we use
    content += `#KONTO 1510 "Kundfordringar"\n`;
    content += `#KONTO 3001 "Försäljning varor/tjänster inom Sverige, 25% moms"\n`; // Simplified to one sales account for now
    content += `#KONTO 3041 "Försäljning ROT/RUT-tjänster"\n`; // Good to have separate
    content += `#KONTO 2611 "Utgående moms på försäljning inom Sverige, 25%"\n`;
    content += `#KONTO 1513 "Fordran Skatteverket ROT/RUT"\n`; // For the deduction part
    content += `\n`;

    // --- 3. VOUCHERS (VERIFIKATIONER) ---
    // Loop through invoices and create a verification for each

    invoices.forEach((invoice, index) => {
        if (invoice.status !== 'sent' && invoice.status !== 'paid') return; // Only booked invoices

        // We use invoice number as verification number for simplicity, or generate a sequence
        // Warning: This assumes invoice numbers never clash with other verifications.
        // A real system might need a separate 'journal number'.
        const verNum = invoice.invoice_number;
        const date = formatDate(invoice.issue_date);
        const text = formatString(`Faktura ${invoice.invoice_number}`);

        content += `#VER A ${verNum} ${date} ${text}\n`;
        content += `{\n`;

        // Calculations
        const totalAmount = invoice.amount; // Incl VAT
        const rotRutAmount = invoice.rot_rut_amount || 0;
        const customerToPay = totalAmount - rotRutAmount;

        // Back-calculate pure sales amounts. 
        // This logic simplifies: assuming 25% VAT on EVERYTHING for now.
        // Real world is complex (some services 6%, 12%, or 0%).
        const vatRate = 0.25;
        const netAmount = totalAmount / (1 + vatRate);
        const vatAmount = totalAmount - netAmount;

        // DEBIT 1510 (Customer Debt) - What customer pays
        content += `   #TRANS 1510 {} ${customerToPay.toFixed(2)} ${date} ${text}\n`;

        // IF ROT/RUT: DEBIT 1513 (Tax Agency Debt)
        if (rotRutAmount > 0) {
            content += `   #TRANS 1513 {} ${rotRutAmount.toFixed(2)} ${date} ${text}\n`;
        }

        // CREDIT 3001 (Sales) OR 3041 (ROT Sales) - Net Sales
        // If ROT/RUT is present, we put it on 3041 to distinguish labor services usually
        const salesAccount = rotRutAmount > 0 ? 3041 : 3001;
        content += `   #TRANS ${salesAccount} {} -${netAmount.toFixed(2)} ${date} ${text}\n`;

        // CREDIT 2611 (Output VAT)
        content += `   #TRANS 2611 {} -${vatAmount.toFixed(2)} ${date} ${text}\n`;

        content += `}\n`;
    });

    return content;
};

export const downloadSieFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=cp437;' }); // CP437 is standard for legacy SIE, but UTF-8 often works in modern
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
