import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts if needed (using default Helvetica)

// Define styles
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 11,
        fontFamily: 'Helvetica',
        backgroundColor: '#FFFFFF',
    },
    header: {
        marginBottom: 30,
        borderBottom: '2px solid #10B981',
        paddingBottom: 15,
    },
    logo: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 5,
    },
    companyInfo: {
        fontSize: 10,
        color: '#666666',
        lineHeight: 1.4,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000000',
        marginTop: 20,
        marginBottom: 10,
    },
    invoiceNumber: {
        fontSize: 12,
        color: '#666666',
        marginBottom: 20,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 10,
        paddingBottom: 5,
        borderBottom: '1px solid #E5E7EB',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    label: {
        width: '30%',
        fontSize: 10,
        color: '#666666',
        fontWeight: 'bold',
    },
    value: {
        width: '70%',
        fontSize: 10,
        color: '#000000',
    },
    description: {
        fontSize: 10,
        color: '#000000',
        lineHeight: 1.6,
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#F9FAFB',
        borderRadius: 4,
    },
    totalSection: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#F9FAFB',
        borderRadius: 4,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    totalLabel: {
        fontSize: 12,
        color: '#666666',
    },
    totalValue: {
        fontSize: 12,
        color: '#000000',
        fontWeight: 'bold',
    },
    grandTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        paddingTop: 10,
        borderTop: '2px solid #10B981',
    },
    grandTotalLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000000',
    },
    grandTotalValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#10B981',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 9,
        color: '#999999',
        borderTop: '1px solid #E5E7EB',
        paddingTop: 10,
    },
    statusBadge: {
        display: 'flex',
        padding: '4px 12px',
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    statusDraft: {
        backgroundColor: '#F3F4F6',
        color: '#374151',
    },
    statusSent: {
        backgroundColor: '#FEF3C7',
        color: '#92400E',
    },
    statusPaid: {
        backgroundColor: '#D1FAE5',
        color: '#065F46',
    },
    statusOverdue: {
        backgroundColor: '#FEE2E2',
        color: '#991B1B',
    },
});

interface InvoicePDFProps {
    invoice: {
        id: string;
        invoice_number: number;
        issue_date: string;
        due_date: string;
        amount: number;
        status: string;
        description?: string;
    };
    customer: {
        name: string;
        email?: string;
        phone?: string;
        company?: string;
        address?: string;
    };
    companyInfo?: {
        name: string;
        email?: string;
        phone?: string;
        address?: string;
        orgNumber?: string;
    };
}

const InvoicePDF = ({ invoice, customer, companyInfo }: InvoicePDFProps) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('sv-SE');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('sv-SE', {
            style: 'currency',
            currency: 'SEK',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'paid':
                return 'Betald';
            case 'sent':
                return 'Skickad';
            case 'overdue':
                return 'Förfallen';
            default:
                return 'Utkast';
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'paid':
                return styles.statusPaid;
            case 'sent':
                return styles.statusSent;
            case 'overdue':
                return styles.statusOverdue;
            default:
                return styles.statusDraft;
        }
    };

    // Calculate VAT (25%)
    const vatRate = 0.25;
    const amountExclVAT = invoice.amount / (1 + vatRate);
    const vatAmount = invoice.amount - amountExclVAT;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.logo}>{companyInfo?.name || 'Kundkollen'}</Text>
                    {companyInfo && (
                        <View style={styles.companyInfo}>
                            {companyInfo.address && <Text>{companyInfo.address}</Text>}
                            {companyInfo.phone && <Text>Tel: {companyInfo.phone}</Text>}
                            {companyInfo.email && <Text>E-post: {companyInfo.email}</Text>}
                            {companyInfo.orgNumber && <Text>Org.nr: {companyInfo.orgNumber}</Text>}
                        </View>
                    )}
                </View>

                {/* Title */}
                <Text style={styles.title}>FAKTURA</Text>
                <Text style={styles.invoiceNumber}>Fakturanummer: #{invoice.invoice_number}</Text>

                {/* Status Badge */}
                <View style={[styles.statusBadge, getStatusStyle(invoice.status)]}>
                    <Text>Status: {getStatusText(invoice.status)}</Text>
                </View>

                {/* Customer Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Kund</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Namn:</Text>
                        <Text style={styles.value}>{customer.name}</Text>
                    </View>
                    {customer.email && (
                        <View style={styles.row}>
                            <Text style={styles.label}>E-post:</Text>
                            <Text style={styles.value}>{customer.email}</Text>
                        </View>
                    )}
                    {customer.phone && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Telefon:</Text>
                            <Text style={styles.value}>{customer.phone}</Text>
                        </View>
                    )}
                    {customer.address && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Adress:</Text>
                            <Text style={styles.value}>{customer.address}</Text>
                        </View>
                    )}
                </View>

                {/* Invoice Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Fakturadetaljer</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Fakturadatum:</Text>
                        <Text style={styles.value}>{formatDate(invoice.issue_date)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Förfallodatum:</Text>
                        <Text style={styles.value}>{formatDate(invoice.due_date)}</Text>
                    </View>
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Beskrivning</Text>
                    {invoice.description && (
                        <Text style={styles.description}>{invoice.description}</Text>
                    )}
                </View>

                {/* Price Breakdown */}
                <View style={styles.totalSection}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Belopp exkl. moms:</Text>
                        <Text style={styles.totalValue}>{formatCurrency(amountExclVAT)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Moms (25%):</Text>
                        <Text style={styles.totalValue}>{formatCurrency(vatAmount)}</Text>
                    </View>
                    <View style={styles.grandTotal}>
                        <Text style={styles.grandTotalLabel}>Att betala:</Text>
                        <Text style={styles.grandTotalValue}>{formatCurrency(invoice.amount)}</Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>
                        Betalning oss tillhanda senast {formatDate(invoice.due_date)}.
                        {companyInfo?.email && ` Vid frågor, kontakta oss på ${companyInfo.email}.`}
                    </Text>
                    {/* Add Bankgiro/Plusgiro here if user has it in profile settings future */}
                    <Text style={{ marginTop: 5 }}>
                        Genererad med Kundkollen
                    </Text>
                </View>
            </Page>
        </Document>
    );
};

export default InvoicePDF;
