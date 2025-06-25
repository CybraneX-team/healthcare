import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 12, fontFamily: 'Helvetica' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  section: { marginBottom: 20 },
  line: { marginBottom: 8, lineHeight: 1.5 },
})

export const SalesScriptPdf = ({ script }: { script: string }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Personalized Sales Script</Text>
      <View style={styles.section}>
        {script.split('\n').map((line, i) => (
          <Text key={i} style={styles.line}>
            {line}
          </Text>
        ))}
      </View>
    </Page>
  </Document>
)
