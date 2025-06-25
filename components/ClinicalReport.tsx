import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 12, fontFamily: 'Helvetica' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  section: { marginBottom: 20 },
  item: { marginBottom: 6 },
  signature: { marginTop: 30, fontSize: 10, fontStyle: 'italic' },
})

export const ClinicalSummaryPdf = ({ summary }: { summary: string }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Clinical Summary</Text>
      <View style={styles.section}>
        {summary.split('\n').map((line, i) => (
          <Text key={i} style={styles.item}>
            • {line}
          </Text>
        ))}
      </View>
      <Text style={styles.signature}>Dr. Smith{'\n'}Provider Signature</Text>
    </Page>
  </Document>
)
