import type { IntentType, LetterContext, GeneratedLetterContent, AttachmentItem, NextStep } from '@/types'

// TODO: replace with Claude API call
// Send full context to Claude, get back formatted letter + email + subject
export async function generateLetter(ctx: LetterContext): Promise<GeneratedLetterContent> {
  await new Promise((r) => setTimeout(r, 1200))

  const entityMap = new Map(ctx.entities.map((e) => [e.entity_type, e.value]))
  const answers = ctx.answers

  const senderName = answers.sender_name || entityMap.get('sender_name') || '[Votre nom]'
  const senderAddress = answers.sender_address || entityMap.get('sender_address') || '[Votre adresse]'
  const company = answers.company_name || entityMap.get('company_name') || '[Nom de la société]'
  const contractNumber = answers.contract_number || entityMap.get('contract_number')
  const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })

  const contractRef = contractNumber ? `\nRéférence contrat/client : ${contractNumber}` : ''

  let postalBody = ''
  let emailBody = ''
  let subject = ''

  if (ctx.intent === 'terminate') {
    const terminationDate = answers.termination_date || entityMap.get('termination_date') || '[date souhaitée]'
    const reason = answers.termination_reason || entityMap.get('notice_reason') || ''
    const reasonLine = reason ? `\n\nCette décision est motivée par : ${reason}.` : ''

    subject = `Résiliation de contrat / abonnement — ${company}${contractNumber ? ` — Réf. ${contractNumber}` : ''}`

    postalBody = `${senderName}
${senderAddress}

${company}
Service Résiliation

À ${senderAddress.split(',')[0] || 'Paris'}, le ${today}

Objet : Demande de résiliation de contrat${contractRef ? ` — ${contractRef.trim()}` : ''}

Madame, Monsieur,

Par la présente, je vous notifie ma décision de résilier mon contrat / abonnement auprès de vos services, avec effet au ${terminationDate}.${contractRef}${reasonLine}

Je vous demande de bien vouloir procéder à toutes les démarches nécessaires à la clôture de mon compte et de m'en confirmer la bonne réception par écrit.

Je vous saurais gré de m'adresser dans les meilleurs délais la confirmation écrite de cette résiliation, ainsi que le décompte définitif de toute somme éventuellement due.

Dans l'attente de votre confirmation, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

${senderName}

---
⚠️ Brouillon généré à partir de votre situation — À relire et adapter avant envoi.`

    emailBody = `Bonjour,

Je vous contacte afin de vous notifier ma décision de résilier mon contrat / abonnement, avec effet au ${terminationDate}.${contractRef}${reasonLine}

Pourriez-vous procéder à la clôture de mon compte et me confirmer la bonne prise en charge de cette demande ?

Merci de m'adresser une confirmation écrite dans les meilleurs délais.

Cordialement,
${senderName}

---
⚠️ Brouillon généré à partir de votre situation — À relire avant envoi.`
  }

  else if (ctx.intent === 'contest') {
    const fineType = entityMap.get('fine_type') || null
    const contestReason = answers.contest_reason || entityMap.get('contest_reason') || '[motif de contestation]'
    const fineAmount = answers.fine_amount || entityMap.get('fine_amount') || ''

    if (fineType) {
      // Fine / amende contestation
      const fineRef = answers.fine_reference || entityMap.get('fine_reference') || '[n° de l\'avis]'
      const offenseDate = answers.offense_date || entityMap.get('offense_date') || '[date de l\'infraction]'
      const vehiclePlate = answers.vehicle_plate || entityMap.get('vehicle_plate') || ''
      const offenseCity = answers.offense_city || entityMap.get('offense_city') || '[lieu de l\'infraction]'
      const amountLine = fineAmount ? `\nMontant de l'amende : ${fineAmount}` : ''
      const plateLine = vehiclePlate ? `\nImmatriculation du véhicule : ${vehiclePlate}` : ''

      let authorityName: string
      let authorityTitle: string
      let authorityAddress: string

      if (fineType === 'radar') {
        authorityName = 'ANTAI\nService de traitement des avis de contravention\nCS 41101\n78201 Mantes-la-Jolie Cedex'
        authorityTitle = 'Madame, Monsieur,'
        subject = `Contestation avis de contravention n° ${fineRef} — Radar`
      } else if (fineType === 'stationnement') {
        authorityName = `Service du stationnement payant\nMairie de ${offenseCity}\n[Adresse de la mairie ou du gestionnaire délégué — à compléter]`
        authorityTitle = 'Madame, Monsieur,'
        subject = `RAPO — Forfait Post-Stationnement n° ${fineRef}`
      } else {
        authorityName = `Monsieur l'Officier du Ministère Public\nTribunal de Police de ${offenseCity}\n[Adresse du tribunal — à compléter]`
        authorityTitle = 'Monsieur l\'Officier du Ministère Public,'
        subject = `Contestation avis de contravention n° ${fineRef}`
      }

      if (fineType === 'stationnement') {
        postalBody = `${senderName}
${senderAddress}

${authorityName}

${senderAddress.split(',')[0] || 'Paris'}, le ${today}

Objet : ${subject}

${authorityTitle}

Par la présente, j'exerce un Recours Administratif Préalable Obligatoire (RAPO) à l'encontre du Forfait Post-Stationnement (FPS) n° ${fineRef}, conformément à l'article L.2333-87-6 du Code Général des Collectivités Territoriales.

Informations relatives au FPS :
- Numéro du FPS : ${fineRef}
- Date : ${offenseDate}
- Lieu : ${offenseCity}${plateLine}${amountLine}

Motif de contestation :
${contestReason}

Pour ces raisons, je vous demande de bien vouloir annuler ce forfait post-stationnement.

Je tiens à votre disposition toutes les pièces justificatives utiles.

Dans l'attente de votre décision dans le délai légal d'un mois, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

${senderName}

---
⚠️ Brouillon généré à partir de votre situation — Complétez l'adresse de la mairie ou du gestionnaire de stationnement avant envoi. À relire avant envoi.`

        emailBody = `Bonjour,

Je vous adresse ce recours (RAPO) concernant le FPS n° ${fineRef}.

Informations :
- Numéro du FPS : ${fineRef}
- Date : ${offenseDate}
- Lieu : ${offenseCity}${plateLine}${amountLine}

Motif de contestation :
${contestReason}

Je vous demande de bien vouloir annuler ce forfait post-stationnement.

Cordialement,
${senderName}

---
⚠️ Brouillon généré à partir de votre situation — À relire avant envoi.`
      } else {
        postalBody = `${senderName}
${senderAddress}

${authorityName}

${senderAddress.split(',')[0] || 'Paris'}, le ${today}

Objet : ${subject}

${authorityTitle}

J'ai l'honneur de contester formellement l'avis de contravention n° ${fineRef}.

Informations relatives à l'avis :
- Numéro de l'avis : ${fineRef}
- Date de l'infraction : ${offenseDate}
- Lieu : ${offenseCity}${plateLine}${amountLine}

Motif de contestation :
${contestReason}

Pour ces raisons, je vous demande de bien vouloir annuler cet avis de contravention.

Je tiens à votre disposition toutes les pièces justificatives utiles et reste disponible pour tout complément d'information.

Dans l'attente de votre décision, je vous prie d'agréer ${authorityTitle.replace(',', '')} l'expression de mes salutations distinguées.

${senderName}

---
⚠️ Brouillon généré à partir de votre situation — Vérifiez l'adresse de l'autorité compétente avant envoi. À relire et adapter avant envoi.`

        emailBody = `Bonjour,

Je vous contacte afin de contester formellement l'avis de contravention n° ${fineRef}.

Informations :
- Numéro de l'avis : ${fineRef}
- Date : ${offenseDate}
- Lieu : ${offenseCity}${plateLine}${amountLine}

Motif de contestation :
${contestReason}

Je vous demande de bien vouloir annuler cet avis. Je reste disponible pour tout renseignement complémentaire.

Cordialement,
${senderName}

---
⚠️ Brouillon généré à partir de votre situation — À relire avant envoi.`
      }
    } else {
      // Generic contestation (bill, charge dispute, etc.)
      const amountLine = fineAmount ? ` d'un montant de ${fineAmount}` : ''

      subject = `Contestation — ${company}${contractNumber ? ` — Réf. ${contractNumber}` : ''}`

      postalBody = `${senderName}
${senderAddress}

${company}
Service Réclamations

À ${senderAddress.split(',')[0] || 'Paris'}, le ${today}

Objet : Contestation${amountLine}${contractRef ? ` — ${contractRef.trim()}` : ''}

Madame, Monsieur,

Par la présente, je me permets de contester formellement :

${contestReason}${contractRef}

Je considère cette situation injustifiée pour les raisons exposées ci-dessus et vous demande de bien vouloir réexaminer ce dossier dans les meilleurs délais.

Je reste disponible pour tout échange complémentaire et vous saurais gré de m'accuser réception de ce courrier.

Dans l'attente de votre réponse, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

${senderName}

---
⚠️ Brouillon généré à partir de votre situation — À relire et adapter avant envoi.`

      emailBody = `Bonjour,

Je souhaite contester formellement :

${contestReason}${contractRef}

Je vous demande de réexaminer ce dossier et de me communiquer votre décision dans les meilleurs délais.

Cordialement,
${senderName}

---
⚠️ Brouillon généré à partir de votre situation — À relire avant envoi.`
    }
  }

  else if (ctx.intent === 'complain') {
    const complaint = answers.complaint_description || '[description du problème]'
    const resolution = answers.expected_resolution || ''
    const resolutionLine = resolution ? `\n\nJe souhaite que vous procédiez à : ${resolution}.` : ''

    subject = `Réclamation — ${company}${contractNumber ? ` — Réf. ${contractNumber}` : ''}`

    postalBody = `${senderName}
${senderAddress}

${company}
Service Client / Réclamations

À ${senderAddress.split(',')[0] || 'Paris'}, le ${today}

Objet : Réclamation${contractRef ? ` — ${contractRef.trim()}` : ''}

Madame, Monsieur,

Je me permets de vous adresser la présente afin de vous signaler le problème suivant :

${complaint}${contractRef}${resolutionLine}

Je vous demande de bien vouloir prendre en compte cette réclamation et de me communiquer les mesures que vous envisagez de mettre en place pour y répondre.

Dans l'attente de votre retour, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

${senderName}

---
⚠️ Brouillon généré à partir de votre situation — À relire et adapter avant envoi.`

    emailBody = `Bonjour,

Je vous contacte au sujet du problème suivant :

${complaint}${contractRef}${resolutionLine}

Je vous remercie de traiter cette réclamation et de revenir vers moi dans les meilleurs délais.

Cordialement,
${senderName}

---
⚠️ Brouillon généré à partir de votre situation — À relire avant envoi.`
  }

  else if (ctx.intent === 'certify') {
    const certType = answers.certificate_type || 'attestation sur l\'honneur'
    subject = `Demande d'${certType} — ${company}`

    postalBody = `${senderName}
${senderAddress}

${today}

Objet : Demande d'${certType}

Je soussigné(e) ${senderName}, demeurant ${senderAddress},

atteste sur l'honneur [préciser l'objet de l'attestation].

Cette attestation est établie pour faire valoir ce que de droit.

Fait à ${senderAddress.split(',')[0] || 'Paris'}, le ${today}.

Signature : ${senderName}

---
⚠️ Brouillon généré à partir de votre situation — À relire et adapter avant envoi.`

    emailBody = postalBody
  }

  else {
    const details = answers.request_details || '[description de votre demande]'
    subject = `Demande — ${company}${contractNumber ? ` — Réf. ${contractNumber}` : ''}`

    postalBody = `${senderName}
${senderAddress}

${company}
Service Client

À ${senderAddress.split(',')[0] || 'Paris'}, le ${today}

Objet : Demande${contractRef ? ` — ${contractRef.trim()}` : ''}

Madame, Monsieur,

Je me permets de vous adresser la présente afin de vous soumettre la demande suivante :

${details}${contractRef}

Je vous remercie de bien vouloir traiter cette demande dans les meilleurs délais et de m'en confirmer la bonne réception.

Dans l'attente de votre réponse, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

${senderName}

---
⚠️ Brouillon généré à partir de votre situation — À relire et adapter avant envoi.`

    emailBody = `Bonjour,

${details}${contractRef}

Merci de revenir vers moi dans les meilleurs délais.

Cordialement,
${senderName}

---
⚠️ Brouillon généré à partir de votre situation — À relire avant envoi.`
  }

  return { postal: postalBody, email: emailBody, subject }
}

// TODO: replace with Claude API call
export function getAttachmentChecklist(intent: IntentType, company?: string | null, fineType?: string | null): AttachmentItem[] {
  const base: AttachmentItem[] = [
    { item_name: 'Copie de votre pièce d\'identité', description: 'Carte nationale d\'identité ou passeport', is_required: true },
  ]

  if (intent === 'terminate') {
    return [
      ...base,
      { item_name: 'Justificatif de domicile', description: 'Facture de moins de 3 mois', is_required: false },
      { item_name: 'Contrat ou bon d\'adhésion original', description: 'Si disponible', is_required: false },
    ]
  }

  if (intent === 'contest') {
    if (fineType) {
      return [
        { item_name: 'Avis de contravention original', description: 'Le document reçu (recto/verso)', is_required: true },
        { item_name: 'Copie de votre pièce d\'identité', description: 'Carte nationale d\'identité ou passeport', is_required: true },
        { item_name: 'Copie de la carte grise du véhicule', description: 'Certificat d\'immatriculation', is_required: fineType !== 'stationnement' },
        { item_name: 'Copie du permis de conduire', description: 'Recto/verso', is_required: fineType !== 'stationnement' },
        { item_name: 'Justificatifs du motif de contestation', description: 'Photos, témoignages, preuves d\'absence, autre certificat médical...', is_required: false },
      ]
    }
    return [
      ...base,
      { item_name: 'Document contesté', description: 'Facture, avis ou courrier en question', is_required: true },
      { item_name: 'Preuves à l\'appui', description: 'Photos, captures d\'écran, témoignages', is_required: false },
    ]
  }

  if (intent === 'complain') {
    return [
      ...base,
      { item_name: 'Historique des échanges', description: 'Courriers ou emails précédents avec le service client', is_required: false },
      { item_name: 'Justificatifs du préjudice', description: 'Photos, factures de réparation...', is_required: false },
    ]
  }

  return base
}

// TODO: replace with Claude API call
export function getNextSteps(intent: IntentType, fineType?: string | null): NextStep[] {
  if (intent === 'terminate') {
    return [
      { step: 'Envoyez la lettre en recommandé avec accusé de réception', important: true },
      { step: 'Conservez le récépissé d\'envoi et l\'accusé de réception' },
      { step: 'Si aucune réponse sous 30 jours, relancez par écrit' },
      { step: 'Vérifiez que les prélèvements automatiques sont bien arrêtés', deadline: '30 jours après envoi' },
    ]
  }

  if (intent === 'contest') {
    if (fineType === 'stationnement') {
      return [
        { step: 'Ne payez PAS le FPS avant la décision — tout paiement vaut acceptation et rend le recours impossible', important: true },
        { step: 'Étape 1 — Envoyez ce RAPO en recommandé à la mairie ou au gestionnaire de stationnement dans le délai d\'1 mois', deadline: '1 mois', important: true },
        { step: 'L\'autorité a 1 mois pour répondre. Silence = refus implicite', deadline: '1 mois' },
        { step: 'Étape 2 — Si refus ou absence de réponse : saisissez le Tribunal du stationnement payant (TSP) dans les 2 mois', deadline: '2 mois après refus/silence', important: true },
        { step: 'TSP : 2 rue Edouard Michaud, CS 25601, 87056 LIMOGES CEDEX — recours possible en ligne sur tribunal-stationnement-payant.fr' },
        { step: 'Conservez tous les justificatifs : RAPO envoyé, AR, réponse de la mairie' },
      ]
    }
    if (fineType) {
      return [
        { step: 'Ne payez PAS l\'amende avant la décision — tout paiement vaut acceptation et annule la contestation', important: true },
        { step: 'Vous avez 45 jours à compter de la date de l\'avis pour contester', deadline: '45 jours', important: true },
        { step: 'Envoyez votre courrier en recommandé avec accusé de réception', important: true },
        { step: 'Conservez une copie de votre courrier, de l\'avis de contravention et de l\'accusé de réception' },
        { step: 'L\'Officier du Ministère Public dispose de 3 mois pour vous répondre', deadline: '3 mois' },
        { step: 'En cas de rejet, vous pouvez saisir le Tribunal de Police dans les 30 jours', deadline: '30 jours après refus' },
      ]
    }
    return [
      { step: 'Envoyez votre contestation en recommandé avec accusé de réception', important: true },
      { step: 'La société dispose généralement de 30 jours pour vous répondre', deadline: '30 jours' },
      { step: 'En cas de refus, vous pouvez saisir le médiateur du secteur' },
      { step: 'En dernier recours, une action en justice reste possible' },
    ]
  }

  if (intent === 'complain') {
    return [
      { step: 'Envoyez votre réclamation et attendez une réponse sous 10 jours ouvrés', deadline: '10 jours ouvrés' },
      { step: 'Si insatisfaisant, saisissez le médiateur de la consommation' },
      { step: 'Vous pouvez également signaler sur SignalConso (DGCCRF)' },
    ]
  }

  return [
    { step: 'Envoyez votre courrier et conservez une copie', important: true },
    { step: 'Attendez une réponse dans un délai raisonnable (15-30 jours)' },
    { step: 'Relancez si nécessaire' },
  ]
}
