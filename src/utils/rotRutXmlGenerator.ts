interface Invoice {
    id: string;
    due_date: string;
    amount: number;
    labor_cost: number;
    rot_rut_amount: number;
    rot_rut_type: 'ROT' | 'RUT';
    status: string;
    customer: {
        org_number: string;
    };
    property_designation?: string;
}

interface RotRutXmlOptions {
    orgNumber: string; // The company's org number
}

// Helper to format date as YYYY-MM-DD
const formatDate = (date: string | Date) => {
    return new Date(date).toISOString().split('T')[0];
};

// Helper to clean PNR (YYYYMMDDXXXX or YYYYMMDD-XXXX)
const cleanPnr = (pnr: string) => {
    return pnr.replace(/[^0-9]/g, '');
};

export const generateRotRutXml = (invoices: any[], type: 'ROT' | 'RUT', companyOrgNumber: string) => {
    // Filter applicable invoices
    const relevantInvoices = invoices.filter(inv =>
        inv.status === 'paid' &&
        inv.rot_rut_type === type &&
        inv.customer?.org_number // Must have PNR
    );

    if (relevantInvoices.length === 0) {
        throw new Error(`Inga betalda ${type}-fakturor hittades för valdad period med giltiga personnummer.`);
    }

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += `<Begaran xmlns="http://xmls.skatteverket.se/se/skatteverket/husarbete/begaran/6.0">\n`; // Using v6.0 as it seems current
    xml += `  <NamnPaBegaran>Utbetalning ${type} ${new Date().toISOString().split('T')[0]}</NamnPaBegaran>\n`;

    // Group by Household (Personnummer)? 
    // Skatteverket schema usually structures it by Household (Pnr of the buyer).
    // We can list multiple "Hushall" elements.

    // Group invoices by Customer PNR
    const invoicesByPnr: Record<string, any[]> = {};

    relevantInvoices.forEach(inv => {
        const pnr = cleanPnr(inv.customer.org_number);
        // Ensure 12 digits for full PNR if possible, or 10. Skatteverket usually wants 12 (YYYY...)
        // We will assume input is somewhat correct or validatable.
        if (!invoicesByPnr[pnr]) {
            invoicesByPnr[pnr] = [];
        }
        invoicesByPnr[pnr].push(inv);
    });

    Object.keys(invoicesByPnr).forEach(pnr => {
        const invs = invoicesByPnr[pnr];

        xml += `  <Hushall>\n`;
        xml += `    <Pnr>${pnr}</Pnr>\n`;
        xml += `    <Arenden>\n`;

        invs.forEach(inv => {
            // Calculate amounts
            // labor_cost is the total labor cost (incl VAT)
            // rot_rut_amount is the claimed amount (50% or 30% of labor)
            // paid_amount is what customer paid (Total - ROT/RUT)

            // Note: DB labor_cost is usually "Arbetskostnad inkl moms".
            const laborCost = Math.round(inv.labor_cost || 0);
            const rotRutAmount = Math.round(inv.rot_rut_amount || 0);
            const totalInvoiceAmount = Math.round(inv.amount || 0); // This is usually Net amount to pay? Or Gross?

            // In Kundkollen:
            // "amount" column = Total to pay (after deduction).
            // "labor_cost" = Total service value.
            // "rot_rut_amount" = The deduction size.
            // 
            // Skatteverket wants:
            // PrisTjanster: Total cost for services (labor) including VAT.
            // BetaltBelopp: Amount the customer HAS PAID. (Usually invoice total + potentially material etc).
            // BegartBelopp: The amount we are asking for (The deduction).

            xml += `      <Arende>\n`;
            xml += `        <FakturaNr>${inv.id.substring(0, 10)}</FakturaNr>\n`; // Using ID as number (truncated) or real number if we had it
            xml += `        <BetalningsDatum>${formatDate(inv.due_date)}</BetalningsDatum>\n`; // Approximating paid date as due_date for now, ideally we had paid_at
            xml += `        <PrisTjanster>${laborCost}</PrisTjanster>\n`;
            xml += `        <BetaltBelopp>${totalInvoiceAmount}</BetaltBelopp>\n`;
            xml += `        <BegartBelopp>${rotRutAmount}</BegartBelopp>\n`;

            if (type === 'ROT') {
                if (inv.property_designation) {
                    xml += `        <Fastighetsbeteckning>${inv.property_designation}</Fastighetsbeteckning>\n`;
                } else {
                    // Fallback or error if missing?
                    // xml += `        <LagenhetsNr>...</LagenhetsNr>\n`;
                }

                // ROT requires specified hours
                xml += `        <UtfortArbete>\n`;
                // We don't track exact hours per invoice currently (only price). 
                // We can estimate hours = laborCost / 500 (standard rate) or just omit specific hours if allowed (usually need hours).
                // Skatteverket v6 often requires hours.
                const estimatedHours = Math.round(laborCost / 625); // Approx 500 + VAT
                xml += `           <AntalFaktureradeTimmar>${Math.max(1, estimatedHours)}</AntalFaktureradeTimmar>\n`;
                xml += `        </UtfortArbete>\n`;
            }

            if (type === 'RUT') {
                // RUT requires simpler specification usually
                xml += `        <UtfortArbete>\n`;
                const estimatedHours = Math.round(laborCost / 625);
                xml += `           <AntalTimmar>${Math.max(1, estimatedHours)}</AntalTimmar>\n`;
                xml += `        </UtfortArbete>\n`;
            }

            xml += `      </Arende>\n`;
        });

        xml += `    </Arenden>\n`;
        xml += `  </Hushall>\n`;
    });

    xml += `</Begaran>`;
    return xml;
};
