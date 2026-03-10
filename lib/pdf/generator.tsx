import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 60,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.6,
    color: '#1a1a1a',
  },
  disclaimer: {
    fontSize: 8,
    color: '#999999',
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
    paddingTop: 10,
    marginTop: 40,
  },
  content: {
    whiteSpace: 'pre-wrap',
    fontSize: 11,
    lineHeight: 1.7,
  },
})

interface LetterDocumentProps {
  content: string
  subject?: string | null
}

export function LetterDocument({ content, subject }: LetterDocumentProps) {
  // Strip the disclaimer from content (it's added separately)
  const cleanContent = content.replace(/---\n⚠️.*$/s, '').trim()

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={{ flex: 1 }}>
          <Text style={styles.content}>{cleanContent}</Text>
        </View>
        <View style={styles.disclaimer}>
          <Text>
            Brouillon généré par dealWithIt (dealwithit.io) — Ce document n'est pas un conseil juridique.
            Relisez et adaptez avant envoi.
          </Text>
        </View>
      </Page>
    </Document>
  )
}
