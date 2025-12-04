import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts (optional - using default fonts for now)
// Font.register({
//   family: 'Inter',
//   src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
// });

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
    quoteNumber: {
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
    table: {
        marginTop: 15,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        padding: 10,
        fontWeight: 'bold',
        fontSize: 10,
        borderBottom: '2px solid #10B981',
    },
    tableRow: {
        flexDirection: 'row',
        padding: 10,
        borderBottom: '1px solid #E5E7EB',
    },
    tableCol1: {
        width: '60%',
    },
    tableCol2: {
        width: '20%',
        textAlign: 'right',
    },
    tableCol3: {
        width: '20%',
        textAlign: 'right',
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
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    statusPending: {
        backgroundColor: '#FEF3C7',
        color: '#92400E',
    },
    statusAccepted: {
        backgroundColor: '#D1FAE5',
        color: '#065F46',
    },
    statusRejected: {
        backgroundColor: '#FEE2E2',
        color: '#991B1B',
    },
});

interface QuotePDFProps {
    quote: {
        id: string;
        title: string;
        description?: string;
        amount: number;
        status: string;
        created_at: string;
        valid_until?: string;
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

const QuotePDF = ({ quote, customer, companyInfo }: QuotePDFProps) => {
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
            case 'accepted':
                return 'Accepterad';
            case 'rejected':
                return 'Nekad';
            default:
                return 'Väntande';
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'accepted':
                return styles.statusAccepted;
            case 'rejected':
                return styles.statusRejected;
            default:
                return styles.statusPending;
        }
    };

    // Calculate VAT (25%)
    const vatRate = 0.25;
    const amountExclVAT = quote.amount / (1 + vatRate);
    const vatAmount = quote.amount - amountExclVAT;

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
                <Text style={styles.title}>OFFERT</Text>
                <Text style={styles.quoteNumber}>Offertnummer: #{quote.id.slice(0, 8).toUpperCase()}</Text>

                {/* Status Badge */}
                <View style={[styles.statusBadge, getStatusStyle(quote.status)]}>
                    <Text>Status: {getStatusText(quote.status)}</Text>
                </View>

                {/* Customer Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Kund</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Namn:</Text>
                        <Text style={styles.value}>{customer.name}</Text>
                    </View>
                    {customer.company && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Företag:</Text>
                            <Text style={styles.value}>{customer.company}</Text>
                        </View>
                    )}
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

                {/* Quote Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Offertdetaljer</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Datum:</Text>
                        <Text style={styles.value}>{formatDate(quote.created_at)}</Text>
                    </View>
                    {quote.valid_until && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Giltig till:</Text>
                            <Text style={styles.value}>{formatDate(quote.valid_until)}</Text>
                        </View>
                    )}
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Beskrivning</Text>
                    <Text style={styles.value}>{quote.title}</Text>
                    {quote.description && (
                        <Text style={styles.description}>{quote.description}</Text>
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
                        <Text style={styles.grandTotalLabel}>Totalt inkl. moms:</Text>
                        <Text style={styles.grandTotalValue}>{formatCurrency(quote.amount)}</Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>
                        Denna offert är giltig i 30 dagar från utfärdandedatum.
                        {companyInfo?.email && ` Vid frågor, kontakta oss på ${companyInfo.email}.`}
                    </Text>
                    <Text style={{ marginTop: 5 }}>
                        Genererad med Kundkollen - {formatDate(new Date().toISOString())}
                    </Text>
                </View>
            </Page>
        </Document>
    );
};

export default QuotePDF;
