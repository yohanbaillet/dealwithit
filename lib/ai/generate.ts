import type { IntentType, LetterContext, GeneratedLetterContent, AttachmentItem, NextStep } from '@/types'

// ---------------------------------------------------------------------------
// Language strings
// ---------------------------------------------------------------------------

interface LetterLang {
  salutation: string
  closing: string
  disclaimer: string
  disclaimer_short: string
  greet: string
  regards: string
  date_in: (city: string, date: string) => string
  subject_label: string
  contract_ref: (n: string) => string
  locale_code: string
  // terminate
  terminate_service: string
  terminate_subject: (company: string, ref?: string) => string
  terminate_subject_line: (ref?: string) => string
  terminate_p1: (date: string) => string
  terminate_p2: string
  terminate_p3: string
  terminate_reason_prefix: string
  terminate_email_p1: (date: string) => string
  terminate_email_p2: string
  terminate_email_p3: string
  // contest generic
  contest_service: string
  contest_subject: (company: string, ref?: string) => string
  contest_subject_line: (ref?: string) => string
  contest_p1: string
  contest_p2: string
  contest_p3: string
  contest_email_p1: string
  contest_email_p2: string
  // fine-specific
  radar_subject: (ref: string) => string
  fps_subject: (ref: string) => string
  fine_subject: (ref: string) => string
  fps_p1: (ref: string) => string
  fps_info_header: string
  fine_p1: (ref: string) => string
  fine_info_header: string
  fine_ref_label: (ref: string) => string
  fps_ref_label: (ref: string) => string
  fine_date_label: (date: string) => string
  fps_date_label: (date: string) => string
  fine_city_label: (city: string) => string
  fine_plate_label: (plate: string) => string
  fine_amount_label: (amount: string) => string
  contest_reason_header: string
  fine_conclusion: string
  fps_conclusion: string
  fine_addendum: string
  fps_addendum: string
  fine_disclaimer_postal: string
  fps_disclaimer_postal: string
  // complain
  complain_service: string
  complain_subject: (company: string, ref?: string) => string
  complain_subject_line: (ref?: string) => string
  complain_p1: string
  complain_p2: string
  complain_resolution_prefix: string
  complain_email_p1: string
  complain_email_p2: string
  // request (default)
  request_service: string
  request_subject: (company: string, ref?: string) => string
  request_subject_line: (ref?: string) => string
  request_p1: string
  request_p2: string
  // certify
  certify_subject: (type: string, company: string) => string
  certify_subject_line: (type: string) => string
  certify_opening: (name: string, address: string) => string
  certify_footer: string
  certify_sig: (city: string, date: string, name: string) => string
  certify_type: string
  // placeholders
  ph_name: string
  ph_address: string
  ph_company: string
  ph_date: string
  ph_ref: string
}

const LANG: Record<string, LetterLang> = {
  fr: {
    locale_code: 'fr-FR',
    salutation: 'Madame, Monsieur,',
    closing: "Dans l'attente de votre réponse, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.",
    disclaimer: "Brouillon généré à partir de votre situation — À relire et adapter avant envoi.",
    disclaimer_short: "Brouillon généré à partir de votre situation — À relire avant envoi.",
    greet: 'Bonjour,',
    regards: 'Cordialement,',
    date_in: (city, date) => `À ${city}, le ${date}`,
    subject_label: 'Objet :',
    contract_ref: (n) => `\nRéférence contrat/client : ${n}`,
    ph_name: '[Votre nom]',
    ph_address: '[Votre adresse]',
    ph_company: '[Nom de la société]',
    ph_date: '[date souhaitée]',
    ph_ref: "[n° de l'avis]",
    terminate_service: 'Service Résiliation',
    terminate_subject: (c, r) => `Résiliation de contrat / abonnement — ${c}${r ? ` — Réf. ${r}` : ''}`,
    terminate_subject_line: (r) => `Demande de résiliation de contrat${r ? ` — ${r}` : ''}`,
    terminate_p1: (d) => `Par la présente, je vous notifie ma décision de résilier mon contrat / abonnement auprès de vos services, avec effet au ${d}.`,
    terminate_p2: "Je vous demande de bien vouloir procéder à toutes les démarches nécessaires à la clôture de mon compte et de m'en confirmer la bonne réception par écrit.",
    terminate_p3: "Je vous saurais gré de m'adresser dans les meilleurs délais la confirmation écrite de cette résiliation, ainsi que le décompte définitif de toute somme éventuellement due.",
    terminate_reason_prefix: '\n\nCette décision est motivée par : ',
    terminate_email_p1: (d) => `Je vous contacte afin de vous notifier ma décision de résilier mon contrat / abonnement, avec effet au ${d}.`,
    terminate_email_p2: "Pourriez-vous procéder à la clôture de mon compte et me confirmer la bonne prise en charge de cette demande ?",
    terminate_email_p3: "Merci de m'adresser une confirmation écrite dans les meilleurs délais.",
    contest_service: 'Service Réclamations',
    contest_subject: (c, r) => `Contestation — ${c}${r ? ` — Réf. ${r}` : ''}`,
    contest_subject_line: (r) => `Contestation${r ? ` — ${r}` : ''}`,
    contest_p1: 'Par la présente, je me permets de contester formellement :',
    contest_p2: "Je considère cette situation injustifiée pour les raisons exposées ci-dessus et vous demande de bien vouloir réexaminer ce dossier dans les meilleurs délais.",
    contest_p3: "Je reste disponible pour tout échange complémentaire et vous saurais gré de m'accuser réception de ce courrier.",
    contest_email_p1: 'Je souhaite contester formellement :',
    contest_email_p2: "Je vous demande de réexaminer ce dossier et de me communiquer votre décision dans les meilleurs délais.",
    radar_subject: (r) => `Contestation avis de contravention n° ${r} — Radar`,
    fps_subject: (r) => `RAPO — Forfait Post-Stationnement n° ${r}`,
    fine_subject: (r) => `Contestation avis de contravention n° ${r}`,
    fps_p1: (r) => `Par la présente, j'exerce un Recours Administratif Préalable Obligatoire (RAPO) à l'encontre du Forfait Post-Stationnement (FPS) n° ${r}, conformément à l'article L.2333-87-6 du Code Général des Collectivités Territoriales.`,
    fps_info_header: 'Informations relatives au FPS :',
    fine_p1: (r) => `J'ai l'honneur de contester formellement l'avis de contravention n° ${r}.`,
    fine_info_header: "Informations relatives à l'avis :",
    fine_ref_label: (r) => `- Numéro de l'avis : ${r}`,
    fps_ref_label: (r) => `- Numéro du FPS : ${r}`,
    fine_date_label: (d) => `- Date de l'infraction : ${d}`,
    fps_date_label: (d) => `- Date : ${d}`,
    fine_city_label: (c) => `- Lieu : ${c}`,
    fine_plate_label: (p) => `\nImmatriculation du véhicule : ${p}`,
    fine_amount_label: (a) => `\nMontant de l'amende : ${a}`,
    contest_reason_header: 'Motif de contestation :',
    fine_conclusion: "Pour ces raisons, je vous demande de bien vouloir annuler cet avis de contravention.",
    fps_conclusion: "Pour ces raisons, je vous demande de bien vouloir annuler ce forfait post-stationnement.",
    fine_addendum: "Je tiens à votre disposition toutes les pièces justificatives utiles et reste disponible pour tout complément d'information.",
    fps_addendum: "Je tiens à votre disposition toutes les pièces justificatives utiles.",
    fine_disclaimer_postal: "Vérifiez l'adresse de l'autorité compétente avant envoi. À relire et adapter avant envoi.",
    fps_disclaimer_postal: "Complétez l'adresse de la mairie ou du gestionnaire de stationnement avant envoi. À relire avant envoi.",
    complain_service: 'Service Client / Réclamations',
    complain_subject: (c, r) => `Réclamation — ${c}${r ? ` — Réf. ${r}` : ''}`,
    complain_subject_line: (r) => `Réclamation${r ? ` — ${r}` : ''}`,
    complain_p1: 'Je me permets de vous adresser la présente afin de vous signaler le problème suivant :',
    complain_p2: "Je vous demande de bien vouloir prendre en compte cette réclamation et de me communiquer les mesures que vous envisagez de mettre en place pour y répondre.",
    complain_resolution_prefix: '\n\nJe souhaite que vous procédiez à : ',
    complain_email_p1: 'Je vous contacte au sujet du problème suivant :',
    complain_email_p2: "Je vous remercie de traiter cette réclamation et de revenir vers moi dans les meilleurs délais.",
    request_service: 'Service Client',
    request_subject: (c, r) => `Demande — ${c}${r ? ` — Réf. ${r}` : ''}`,
    request_subject_line: (r) => `Demande${r ? ` — ${r}` : ''}`,
    request_p1: 'Je me permets de vous adresser la présente afin de vous soumettre la demande suivante :',
    request_p2: "Je vous remercie de bien vouloir traiter cette demande dans les meilleurs délais et de m'en confirmer la bonne réception.",
    certify_subject: (t, c) => `Demande d'${t} — ${c}`,
    certify_subject_line: (t) => `Demande d'${t}`,
    certify_opening: (n, a) => `Je soussigné(e) ${n}, demeurant ${a},\n\natteste sur l'honneur [préciser l'objet de l'attestation].`,
    certify_footer: "Cette attestation est établie pour faire valoir ce que de droit.",
    certify_sig: (city, date, name) => `Fait à ${city}, le ${date}.\n\nSignature : ${name}`,
    certify_type: "attestation sur l'honneur",
  },

  en: {
    locale_code: 'en-GB',
    salutation: 'To Whom It May Concern,',
    closing: 'Yours faithfully,',
    disclaimer: 'Draft generated from your situation — Review and adapt before sending.',
    disclaimer_short: 'Draft generated from your situation — Review before sending.',
    greet: 'Hello,',
    regards: 'Kind regards,',
    date_in: (city, date) => `${city}, ${date}`,
    subject_label: 'Subject:',
    contract_ref: (n) => `\nContract/customer reference: ${n}`,
    ph_name: '[Your name]',
    ph_address: '[Your address]',
    ph_company: '[Company name]',
    ph_date: '[desired date]',
    ph_ref: '[notice number]',
    terminate_service: 'Cancellation Department',
    terminate_subject: (c, r) => `Contract / subscription cancellation — ${c}${r ? ` — Ref. ${r}` : ''}`,
    terminate_subject_line: (r) => `Request for contract cancellation${r ? ` — ${r}` : ''}`,
    terminate_p1: (d) => `I am writing to notify you of my decision to cancel my contract / subscription with your services, effective ${d}.`,
    terminate_p2: 'Please proceed with all necessary steps to close my account and confirm receipt of this notice in writing.',
    terminate_p3: 'I would appreciate your written confirmation of this cancellation as soon as possible, along with any final account balance.',
    terminate_reason_prefix: '\n\nThis decision is motivated by: ',
    terminate_email_p1: (d) => `I am contacting you to notify you of my decision to cancel my contract / subscription, effective ${d}.`,
    terminate_email_p2: 'Could you please close my account and confirm that this request has been processed?',
    terminate_email_p3: 'Please send me written confirmation as soon as possible.',
    contest_service: 'Complaints Department',
    contest_subject: (c, r) => `Dispute — ${c}${r ? ` — Ref. ${r}` : ''}`,
    contest_subject_line: (r) => `Dispute${r ? ` — ${r}` : ''}`,
    contest_p1: 'I am writing to formally dispute the following:',
    contest_p2: 'I consider this situation unjustified for the reasons set out above and request that you re-examine this matter as soon as possible.',
    contest_p3: 'I remain available for any further discussion and would appreciate an acknowledgement of receipt of this letter.',
    contest_email_p1: 'I wish to formally dispute the following:',
    contest_email_p2: 'I request that you re-examine this matter and inform me of your decision as soon as possible.',
    radar_subject: (r) => `Dispute — Speed camera fine no. ${r}`,
    fps_subject: (r) => `Appeal — Parking charge no. ${r}`,
    fine_subject: (r) => `Dispute — Fine notice no. ${r}`,
    fps_p1: (r) => `I am writing to formally appeal the parking charge no. ${r}.`,
    fps_info_header: 'Details of the parking charge:',
    fine_p1: (r) => `I am writing to formally dispute the fine notice no. ${r}.`,
    fine_info_header: 'Details of the notice:',
    fine_ref_label: (r) => `- Notice number: ${r}`,
    fps_ref_label: (r) => `- Charge number: ${r}`,
    fine_date_label: (d) => `- Date of offence: ${d}`,
    fps_date_label: (d) => `- Date: ${d}`,
    fine_city_label: (c) => `- Location: ${c}`,
    fine_plate_label: (p) => `\nVehicle registration: ${p}`,
    fine_amount_label: (a) => `\nAmount: ${a}`,
    contest_reason_header: 'Grounds for dispute:',
    fine_conclusion: 'For these reasons, I request that this fine notice be cancelled.',
    fps_conclusion: 'For these reasons, I request that this parking charge be cancelled.',
    fine_addendum: 'I am available to provide any supporting documentation and remain at your disposal for further information.',
    fps_addendum: 'I am available to provide any supporting documentation.',
    fine_disclaimer_postal: 'Verify the address of the relevant authority before sending. Review and adapt before sending.',
    fps_disclaimer_postal: 'Complete the address of the parking authority before sending. Review before sending.',
    complain_service: 'Customer Service / Complaints',
    complain_subject: (c, r) => `Complaint — ${c}${r ? ` — Ref. ${r}` : ''}`,
    complain_subject_line: (r) => `Complaint${r ? ` — ${r}` : ''}`,
    complain_p1: 'I am writing to bring the following issue to your attention:',
    complain_p2: 'I request that you take this complaint into account and inform me of the measures you intend to put in place to address it.',
    complain_resolution_prefix: '\n\nI request that you proceed with: ',
    complain_email_p1: 'I am contacting you regarding the following issue:',
    complain_email_p2: 'Thank you for addressing this complaint and getting back to me as soon as possible.',
    request_service: 'Customer Service',
    request_subject: (c, r) => `Request — ${c}${r ? ` — Ref. ${r}` : ''}`,
    request_subject_line: (r) => `Request${r ? ` — ${r}` : ''}`,
    request_p1: 'I am writing to submit the following request:',
    request_p2: 'Thank you for processing this request as soon as possible and confirming receipt.',
    certify_subject: (t, c) => `Request for ${t} — ${c}`,
    certify_subject_line: (t) => `Request for ${t}`,
    certify_opening: (n, a) => `I, the undersigned, ${n}, residing at ${a},\n\nhereby declare on my honour [specify the subject of the declaration].`,
    certify_footer: 'This declaration is made for use as required.',
    certify_sig: (city, date, name) => `Done at ${city}, on ${date}.\n\nSignature: ${name}`,
    certify_type: 'statutory declaration',
  },

  de: {
    locale_code: 'de-DE',
    salutation: 'Sehr geehrte Damen und Herren,',
    closing: 'Mit freundlichen Grüßen',
    disclaimer: 'Entwurf auf Basis Ihrer Situation — Vor dem Versenden bitte prüfen und anpassen.',
    disclaimer_short: 'Entwurf auf Basis Ihrer Situation — Vor dem Versenden bitte prüfen.',
    greet: 'Guten Tag,',
    regards: 'Mit freundlichen Grüßen,',
    date_in: (city, date) => `${city}, ${date}`,
    subject_label: 'Betreff:',
    contract_ref: (n) => `\nVertrags-/Kundennummer: ${n}`,
    ph_name: '[Ihr Name]',
    ph_address: '[Ihre Adresse]',
    ph_company: '[Unternehmensname]',
    ph_date: '[gewünschtes Datum]',
    ph_ref: '[Bescheid-Nr.]',
    terminate_service: 'Kündigungsabteilung',
    terminate_subject: (c, r) => `Kündigung des Vertrags / Abonnements — ${c}${r ? ` — Ref. ${r}` : ''}`,
    terminate_subject_line: (r) => `Kündigung des Vertrags${r ? ` — ${r}` : ''}`,
    terminate_p1: (d) => `Hiermit kündige ich meinen Vertrag / mein Abonnement bei Ihrem Unternehmen fristgerecht zum ${d}.`,
    terminate_p2: 'Ich bitte Sie, alle erforderlichen Schritte zur Schließung meines Kontos einzuleiten und mir die Bestätigung schriftlich zukommen zu lassen.',
    terminate_p3: 'Ich bitte Sie außerdem um eine schriftliche Kündigungsbestätigung sowie eine abschließende Abrechnung.',
    terminate_reason_prefix: '\n\nDer Grund für diese Entscheidung ist: ',
    terminate_email_p1: (d) => `Ich kontaktiere Sie, um Ihnen meine Kündigung meines Vertrags / Abonnements zum ${d} mitzuteilen.`,
    terminate_email_p2: 'Könnten Sie bitte mein Konto schließen und mir bestätigen, dass diese Anfrage bearbeitet wurde?',
    terminate_email_p3: 'Bitte senden Sie mir schnellstmöglich eine schriftliche Bestätigung.',
    contest_service: 'Reklamationsabteilung',
    contest_subject: (c, r) => `Einspruch — ${c}${r ? ` — Ref. ${r}` : ''}`,
    contest_subject_line: (r) => `Einspruch${r ? ` — ${r}` : ''}`,
    contest_p1: 'Hiermit erhebe ich formellen Einspruch gegen Folgendes:',
    contest_p2: 'Ich halte diese Situation aus den oben genannten Gründen für ungerechtfertigt und bitte Sie, diesen Fall schnellstmöglich zu überprüfen.',
    contest_p3: 'Ich stehe für weitere Rückfragen zur Verfügung und bitte um eine Eingangsbestätigung dieses Schreibens.',
    contest_email_p1: 'Ich möchte formellen Einspruch gegen Folgendes erheben:',
    contest_email_p2: 'Ich bitte Sie, diesen Fall zu überprüfen und mir Ihre Entscheidung mitzuteilen.',
    radar_subject: (r) => `Einspruch gegen Bußgeldbescheid Nr. ${r} — Radar`,
    fps_subject: (r) => `Widerspruch — Parkgebühr Nr. ${r}`,
    fine_subject: (r) => `Einspruch gegen Bußgeldbescheid Nr. ${r}`,
    fps_p1: (r) => `Hiermit lege ich Widerspruch gegen die Parkgebühr Nr. ${r} ein.`,
    fps_info_header: 'Angaben zur Parkgebühr:',
    fine_p1: (r) => `Hiermit erhebe ich formellen Einspruch gegen den Bußgeldbescheid Nr. ${r}.`,
    fine_info_header: 'Angaben zum Bußgeldbescheid:',
    fine_ref_label: (r) => `- Bescheid-Nr.: ${r}`,
    fps_ref_label: (r) => `- Gebühren-Nr.: ${r}`,
    fine_date_label: (d) => `- Datum des Verstoßes: ${d}`,
    fps_date_label: (d) => `- Datum: ${d}`,
    fine_city_label: (c) => `- Ort: ${c}`,
    fine_plate_label: (p) => `\nKennzeichen: ${p}`,
    fine_amount_label: (a) => `\nBetrag: ${a}`,
    contest_reason_header: 'Begründung:',
    fine_conclusion: 'Aus diesen Gründen bitte ich Sie, den Bußgeldbescheid aufzuheben.',
    fps_conclusion: 'Aus diesen Gründen bitte ich Sie, die Parkgebühr aufzuheben.',
    fine_addendum: 'Ich stehe für weitere Informationen und Rückfragen gerne zur Verfügung.',
    fps_addendum: 'Ich stehe für weitere Rückfragen zur Verfügung.',
    fine_disclaimer_postal: 'Bitte überprüfen Sie die Adresse der zuständigen Behörde vor dem Versenden.',
    fps_disclaimer_postal: 'Bitte ergänzen Sie die Adresse der Parkverwaltung vor dem Versenden.',
    complain_service: 'Kundendienst / Reklamationsabteilung',
    complain_subject: (c, r) => `Beschwerde — ${c}${r ? ` — Ref. ${r}` : ''}`,
    complain_subject_line: (r) => `Beschwerde${r ? ` — ${r}` : ''}`,
    complain_p1: 'Ich wende mich an Sie, um auf folgendes Problem aufmerksam zu machen:',
    complain_p2: 'Ich bitte Sie, diese Beschwerde zu berücksichtigen und mir die geplanten Maßnahmen zur Lösung mitzuteilen.',
    complain_resolution_prefix: '\n\nIch bitte Sie, folgendes zu veranlassen: ',
    complain_email_p1: 'Ich kontaktiere Sie bezüglich des folgenden Problems:',
    complain_email_p2: 'Ich danke Ihnen für die Bearbeitung dieser Beschwerde und bitte um schnellstmögliche Rückmeldung.',
    request_service: 'Kundendienst',
    request_subject: (c, r) => `Anfrage — ${c}${r ? ` — Ref. ${r}` : ''}`,
    request_subject_line: (r) => `Anfrage${r ? ` — ${r}` : ''}`,
    request_p1: 'Ich wende mich an Sie, um folgende Anfrage zu stellen:',
    request_p2: 'Ich bitte Sie, diese Anfrage schnellstmöglich zu bearbeiten und mir den Eingang zu bestätigen.',
    certify_subject: (t, c) => `Anfrage ${t} — ${c}`,
    certify_subject_line: (t) => `Anfrage ${t}`,
    certify_opening: (n, a) => `Ich, ${n}, wohnhaft in ${a},\n\nbescheinige hiermit an Eides statt [Gegenstand der Erklärung angeben].`,
    certify_footer: 'Diese Erklärung wird zur Vorlage bei den zuständigen Behörden erstellt.',
    certify_sig: (city, date, name) => `Ausgefertigt in ${city}, am ${date}.\n\nUnterschrift: ${name}`,
    certify_type: 'eidesstattliche Erklärung',
  },

  es: {
    locale_code: 'es-ES',
    salutation: 'Estimados señores,',
    closing: 'En espera de su respuesta, les saluda atentamente,',
    disclaimer: 'Borrador generado a partir de su situación — Revise y adapte antes de enviar.',
    disclaimer_short: 'Borrador generado a partir de su situación — Revise antes de enviar.',
    greet: 'Estimados señores,',
    regards: 'Atentamente,',
    date_in: (city, date) => `${city}, a ${date}`,
    subject_label: 'Asunto:',
    contract_ref: (n) => `\nNúmero de contrato/cliente: ${n}`,
    ph_name: '[Su nombre]',
    ph_address: '[Su dirección]',
    ph_company: '[Nombre de la empresa]',
    ph_date: '[fecha deseada]',
    ph_ref: '[n.° de notificación]',
    terminate_service: 'Departamento de Cancelaciones',
    terminate_subject: (c, r) => `Cancelación de contrato / suscripción — ${c}${r ? ` — Ref. ${r}` : ''}`,
    terminate_subject_line: (r) => `Solicitud de cancelación de contrato${r ? ` — ${r}` : ''}`,
    terminate_p1: (d) => `Por medio de la presente, les notifico mi decisión de cancelar mi contrato / suscripción con sus servicios, con efectividad a partir del ${d}.`,
    terminate_p2: 'Les ruego que procedan con todos los trámites necesarios para cerrar mi cuenta y que me confirmen la recepción de este escrito.',
    terminate_p3: 'Les agradecería que me envíen la confirmación escrita de esta cancelación a la mayor brevedad, junto con la liquidación final de cualquier importe pendiente.',
    terminate_reason_prefix: '\n\nEsta decisión está motivada por: ',
    terminate_email_p1: (d) => `Me pongo en contacto para notificarles mi decisión de cancelar mi contrato / suscripción, con efectividad a partir del ${d}.`,
    terminate_email_p2: '¿Podrían proceder al cierre de mi cuenta y confirmarme que esta solicitud ha sido tramitada?',
    terminate_email_p3: 'Les agradecería que me envíen una confirmación escrita a la mayor brevedad.',
    contest_service: 'Departamento de Reclamaciones',
    contest_subject: (c, r) => `Reclamación — ${c}${r ? ` — Ref. ${r}` : ''}`,
    contest_subject_line: (r) => `Reclamación${r ? ` — ${r}` : ''}`,
    contest_p1: 'Por medio de la presente, me permito impugnar formalmente lo siguiente:',
    contest_p2: 'Considero esta situación injustificada por los motivos expuestos anteriormente y les solicito que revisen este expediente a la mayor brevedad.',
    contest_p3: 'Quedo a su disposición para cualquier aclaración adicional y les agradecería que acusen recibo de esta carta.',
    contest_email_p1: 'Deseo impugnar formalmente lo siguiente:',
    contest_email_p2: 'Les solicito que revisen este asunto y me comuniquen su decisión a la mayor brevedad.',
    radar_subject: (r) => `Recurso contra multa de radar n.° ${r}`,
    fps_subject: (r) => `Recurso contra multa de estacionamiento n.° ${r}`,
    fine_subject: (r) => `Recurso contra multa n.° ${r}`,
    fps_p1: (r) => `Por medio de la presente, interpongo recurso contra la multa de estacionamiento n.° ${r}.`,
    fps_info_header: 'Datos de la multa de estacionamiento:',
    fine_p1: (r) => `Por medio de la presente, impugno formalmente la notificación de multa n.° ${r}.`,
    fine_info_header: 'Datos de la notificación:',
    fine_ref_label: (r) => `- Número de notificación: ${r}`,
    fps_ref_label: (r) => `- Número de multa: ${r}`,
    fine_date_label: (d) => `- Fecha de la infracción: ${d}`,
    fps_date_label: (d) => `- Fecha: ${d}`,
    fine_city_label: (c) => `- Lugar: ${c}`,
    fine_plate_label: (p) => `\nMatrícula del vehículo: ${p}`,
    fine_amount_label: (a) => `\nImporte: ${a}`,
    contest_reason_header: 'Motivo de la impugnación:',
    fine_conclusion: 'Por estos motivos, les solicito que anulen esta notificación de multa.',
    fps_conclusion: 'Por estos motivos, les solicito que anulen esta multa de estacionamiento.',
    fine_addendum: 'Quedo a su disposición para aportar cualquier documentación justificativa.',
    fps_addendum: 'Quedo a su disposición para aportar cualquier documentación justificativa.',
    fine_disclaimer_postal: 'Verifique la dirección de la autoridad competente antes de enviar.',
    fps_disclaimer_postal: 'Complete la dirección del organismo gestor del estacionamiento antes de enviar.',
    complain_service: 'Servicio de Atención al Cliente / Reclamaciones',
    complain_subject: (c, r) => `Reclamación — ${c}${r ? ` — Ref. ${r}` : ''}`,
    complain_subject_line: (r) => `Reclamación${r ? ` — ${r}` : ''}`,
    complain_p1: 'Me dirijo a ustedes para informarles del siguiente problema:',
    complain_p2: 'Les solicito que tengan en cuenta esta reclamación y me informen de las medidas que prevén adoptar para resolverla.',
    complain_resolution_prefix: '\n\nSolicito que procedan a: ',
    complain_email_p1: 'Me pongo en contacto por el siguiente problema:',
    complain_email_p2: 'Les agradezco que tramiten esta reclamación y me respondan a la mayor brevedad.',
    request_service: 'Servicio de Atención al Cliente',
    request_subject: (c, r) => `Solicitud — ${c}${r ? ` — Ref. ${r}` : ''}`,
    request_subject_line: (r) => `Solicitud${r ? ` — ${r}` : ''}`,
    request_p1: 'Me dirijo a ustedes para presentar la siguiente solicitud:',
    request_p2: 'Les agradezco que tramiten esta solicitud a la mayor brevedad y que me confirmen la recepción.',
    certify_subject: (t, c) => `Solicitud de ${t} — ${c}`,
    certify_subject_line: (t) => `Solicitud de ${t}`,
    certify_opening: (n, a) => `Yo, ${n}, con domicilio en ${a},\n\ndeclaro bajo juramento [especificar el objeto de la declaración].`,
    certify_footer: 'Esta declaración se hace para los efectos oportunos.',
    certify_sig: (city, date, name) => `Hecho en ${city}, a ${date}.\n\nFirma: ${name}`,
    certify_type: 'declaración jurada',
  },

  it: {
    locale_code: 'it-IT',
    salutation: 'Gentili Signori,',
    closing: 'In attesa di un Vostro riscontro, porgo distinti saluti,',
    disclaimer: "Bozza generata in base alla Sua situazione — Verificare e adattare prima dell'invio.",
    disclaimer_short: "Bozza generata in base alla Sua situazione — Verificare prima dell'invio.",
    greet: 'Gentili Signori,',
    regards: 'Cordiali saluti,',
    date_in: (city, date) => `${city}, ${date}`,
    subject_label: 'Oggetto:',
    contract_ref: (n) => `\nNumero contratto/cliente: ${n}`,
    ph_name: '[Suo nome]',
    ph_address: '[Suo indirizzo]',
    ph_company: "[Nome dell'azienda]",
    ph_date: '[data desiderata]',
    ph_ref: '[n. del verbale]',
    terminate_service: 'Ufficio Disdette',
    terminate_subject: (c, r) => `Disdetta contratto / abbonamento — ${c}${r ? ` — Rif. ${r}` : ''}`,
    terminate_subject_line: (r) => `Richiesta di disdetta contratto${r ? ` — ${r}` : ''}`,
    terminate_p1: (d) => `Con la presente Le comunico la mia decisione di recedere dal contratto / abbonamento stipulato con la Sua azienda, con decorrenza dal ${d}.`,
    terminate_p2: "La prego di voler procedere con tutte le pratiche necessarie per la chiusura del mio conto e di confermarmi per iscritto la ricezione di questa comunicazione.",
    terminate_p3: "Le sarei grato di ricevere conferma scritta della disdetta quanto prima, unitamente al conteggio definitivo di eventuali somme dovute.",
    terminate_reason_prefix: '\n\nQuesta decisione è motivata da: ',
    terminate_email_p1: (d) => `La contatto per comunicarLe la mia intenzione di recedere dal contratto / abbonamento con decorrenza dal ${d}.`,
    terminate_email_p2: 'Potrebbe procedere con la chiusura del mio conto e confermarmi che la richiesta è stata elaborata?',
    terminate_email_p3: 'La prego di inviarmi conferma scritta quanto prima.',
    contest_service: 'Ufficio Reclami',
    contest_subject: (c, r) => `Contestazione — ${c}${r ? ` — Rif. ${r}` : ''}`,
    contest_subject_line: (r) => `Contestazione${r ? ` — ${r}` : ''}`,
    contest_p1: 'Con la presente mi permetto di contestare formalmente quanto segue:',
    contest_p2: 'Ritengo questa situazione ingiustificata per i motivi sopra esposti e Le chiedo di voler riesaminare la questione quanto prima.',
    contest_p3: 'Rimango a Sua disposizione per qualsiasi ulteriore chiarimento e Le chiedo di voler accusare ricevuta della presente.',
    contest_email_p1: 'Desidero contestare formalmente quanto segue:',
    contest_email_p2: 'Le chiedo di voler riesaminare la questione e di comunicarmi la Sua decisione quanto prima.',
    radar_subject: (r) => `Ricorso contro multa autovelox n. ${r}`,
    fps_subject: (r) => `Ricorso contro multa sosta n. ${r}`,
    fine_subject: (r) => `Ricorso contro verbale n. ${r}`,
    fps_p1: (r) => `Con la presente presento ricorso contro la multa per sosta n. ${r}.`,
    fps_info_header: 'Dati relativi alla multa:',
    fine_p1: (r) => `Con la presente contesto formalmente il verbale n. ${r}.`,
    fine_info_header: 'Dati relativi al verbale:',
    fine_ref_label: (r) => `- Numero verbale: ${r}`,
    fps_ref_label: (r) => `- Numero multa: ${r}`,
    fine_date_label: (d) => `- Data dell'infrazione: ${d}`,
    fps_date_label: (d) => `- Data: ${d}`,
    fine_city_label: (c) => `- Luogo: ${c}`,
    fine_plate_label: (p) => `\nTarga del veicolo: ${p}`,
    fine_amount_label: (a) => `\nImporto: ${a}`,
    contest_reason_header: 'Motivo del ricorso:',
    fine_conclusion: 'Per questi motivi, Le chiedo di voler annullare il verbale.',
    fps_conclusion: 'Per questi motivi, Le chiedo di voler annullare la multa per sosta.',
    fine_addendum: 'Sono disponibile a fornire qualsiasi documentazione a supporto.',
    fps_addendum: 'Sono disponibile a fornire qualsiasi documentazione a supporto.',
    fine_disclaimer_postal: "Verificare l'indirizzo dell'autorità competente prima dell'invio.",
    fps_disclaimer_postal: "Completare l'indirizzo dell'ente di gestione della sosta prima dell'invio.",
    complain_service: 'Servizio Clienti / Ufficio Reclami',
    complain_subject: (c, r) => `Reclamo — ${c}${r ? ` — Rif. ${r}` : ''}`,
    complain_subject_line: (r) => `Reclamo${r ? ` — ${r}` : ''}`,
    complain_p1: 'Con la presente mi rivolgo a Voi per segnalare il seguente problema:',
    complain_p2: 'Le chiedo di voler prendere in considerazione questo reclamo e di comunicarmi le misure che intende adottare per risolverlo.',
    complain_resolution_prefix: '\n\nLe chiedo di voler provvedere a: ',
    complain_email_p1: 'La contatto riguardo al seguente problema:',
    complain_email_p2: 'La ringrazio per la gestione di questo reclamo e attendo una Sua risposta quanto prima.',
    request_service: 'Servizio Clienti',
    request_subject: (c, r) => `Richiesta — ${c}${r ? ` — Rif. ${r}` : ''}`,
    request_subject_line: (r) => `Richiesta${r ? ` — ${r}` : ''}`,
    request_p1: 'Con la presente mi permetto di sottoporLe la seguente richiesta:',
    request_p2: 'La ringrazio per aver elaborato questa richiesta quanto prima e per avermi confermato la ricezione.',
    certify_subject: (t, c) => `Richiesta di ${t} — ${c}`,
    certify_subject_line: (t) => `Richiesta di ${t}`,
    certify_opening: (n, a) => `Il/La sottoscritto/a ${n}, residente in ${a},\n\ndichiarano sotto giuramento [specificare l'oggetto della dichiarazione].`,
    certify_footer: 'La presente dichiarazione è resa ai sensi e per gli effetti di legge.',
    certify_sig: (city, date, name) => `Firmato a ${city}, in data ${date}.\n\nFirma: ${name}`,
    certify_type: 'dichiarazione sostitutiva',
  },
}

// ---------------------------------------------------------------------------
// TODO: replace with Claude API call
// ---------------------------------------------------------------------------
export async function generateLetter(ctx: LetterContext): Promise<GeneratedLetterContent> {
  await new Promise((r) => setTimeout(r, 1200))

  const L = LANG[ctx.language] ?? LANG.fr
  const entityMap = new Map(ctx.entities.map((e) => [e.entity_type, e.value]))
  const answers = ctx.answers

  const senderName = answers.sender_name || entityMap.get('sender_name') || L.ph_name
  const senderAddress = answers.sender_address || entityMap.get('sender_address') || L.ph_address
  const company = answers.company_name || entityMap.get('company_name') || L.ph_company
  const contractNumber = answers.contract_number || entityMap.get('contract_number')
  const today = new Date().toLocaleDateString(L.locale_code, { day: '2-digit', month: 'long', year: 'numeric' })

  const contractRef = contractNumber ? L.contract_ref(contractNumber) : ''
  const city = senderAddress.split(',')[0]?.trim() || (ctx.language === 'fr' ? 'Paris' : ctx.language === 'de' ? 'Berlin' : ctx.language === 'es' ? 'Madrid' : ctx.language === 'it' ? 'Roma' : 'London')

  let postalBody = ''
  let emailBody = ''
  let subject = ''

  // -------------------------------------------------------------------------
  if (ctx.intent === 'terminate') {
    const terminationDate = answers.termination_date || entityMap.get('termination_date') || L.ph_date
    const reason = answers.termination_reason || entityMap.get('notice_reason') || ''
    const reasonLine = reason ? `${L.terminate_reason_prefix}${reason}.` : ''

    subject = L.terminate_subject(company, contractNumber)

    postalBody = `${senderName}
${senderAddress}

${company}
${L.terminate_service}

${L.date_in(city, today)}

${L.subject_label} ${L.terminate_subject_line(contractRef.trim() || undefined)}

${L.salutation}

${L.terminate_p1(terminationDate)}${contractRef}${reasonLine}

${L.terminate_p2}

${L.terminate_p3}

${L.closing}

${senderName}

---
⚠️ ${L.disclaimer}`

    emailBody = `${L.greet}

${L.terminate_email_p1(terminationDate)}${contractRef}${reasonLine}

${L.terminate_email_p2}

${L.terminate_email_p3}

${L.regards}
${senderName}

---
⚠️ ${L.disclaimer_short}`
  }

  // -------------------------------------------------------------------------
  else if (ctx.intent === 'contest') {
    const fineType = entityMap.get('fine_type') || null
    const contestReason = answers.contest_reason || entityMap.get('contest_reason') || '[motif de contestation]'
    const fineAmount = answers.fine_amount || entityMap.get('fine_amount') || ''

    if (fineType) {
      const fineRef = answers.fine_reference || entityMap.get('fine_reference') || L.ph_ref
      const offenseDate = answers.offense_date || entityMap.get('offense_date') || ''
      const vehiclePlate = answers.vehicle_plate || entityMap.get('vehicle_plate') || ''
      const offenseCity = answers.offense_city || entityMap.get('offense_city') || city

      const amountLine = fineAmount ? L.fine_amount_label(fineAmount) : ''
      const plateLine = vehiclePlate ? L.fine_plate_label(vehiclePlate) : ''

      if (fineType === 'stationnement' || fineType === 'parking') {
        subject = L.fps_subject(fineRef)

        postalBody = `${senderName}
${senderAddress}

${L.date_in(city, today)}

${L.subject_label} ${subject}

${L.salutation}

${L.fps_p1(fineRef)}

${L.fps_info_header}
${L.fps_ref_label(fineRef)}
${L.fps_date_label(offenseDate || '')}
${L.fine_city_label(offenseCity)}${plateLine}${amountLine}

${L.contest_reason_header}
${contestReason}

${L.fps_conclusion}

${L.fps_addendum}

${L.closing}

${senderName}

---
⚠️ ${L.fps_disclaimer_postal}`

        emailBody = `${L.greet}

${L.fps_p1(fineRef)}

${L.fps_info_header}
${L.fps_ref_label(fineRef)}
${L.fps_date_label(offenseDate || '')}
${L.fine_city_label(offenseCity)}${plateLine}${amountLine}

${L.contest_reason_header}
${contestReason}

${L.fps_conclusion}

${L.regards}
${senderName}

---
⚠️ ${L.disclaimer_short}`
      } else {
        subject = fineType === 'radar' ? L.radar_subject(fineRef) : L.fine_subject(fineRef)

        postalBody = `${senderName}
${senderAddress}

${L.date_in(city, today)}

${L.subject_label} ${subject}

${L.salutation}

${L.fine_p1(fineRef)}

${L.fine_info_header}
${L.fine_ref_label(fineRef)}
${L.fine_date_label(offenseDate || '')}
${L.fine_city_label(offenseCity)}${plateLine}${amountLine}

${L.contest_reason_header}
${contestReason}

${L.fine_conclusion}

${L.fine_addendum}

${L.closing}

${senderName}

---
⚠️ ${L.fine_disclaimer_postal}`

        emailBody = `${L.greet}

${L.fine_p1(fineRef)}

${L.fine_info_header}
${L.fine_ref_label(fineRef)}
${L.fine_date_label(offenseDate || '')}
${L.fine_city_label(offenseCity)}${plateLine}${amountLine}

${L.contest_reason_header}
${contestReason}

${L.fine_conclusion}

${L.regards}
${senderName}

---
⚠️ ${L.disclaimer_short}`
      }
    } else {
      const amountLine = fineAmount ? ` (${fineAmount})` : ''
      subject = L.contest_subject(company, contractNumber)

      postalBody = `${senderName}
${senderAddress}

${company}
${L.contest_service}

${L.date_in(city, today)}

${L.subject_label} ${L.contest_subject_line(contractRef.trim() || undefined)}${amountLine}

${L.salutation}

${L.contest_p1}

${contestReason}${contractRef}

${L.contest_p2}

${L.contest_p3}

${L.closing}

${senderName}

---
⚠️ ${L.disclaimer}`

      emailBody = `${L.greet}

${L.contest_email_p1}

${contestReason}${contractRef}

${L.contest_email_p2}

${L.regards}
${senderName}

---
⚠️ ${L.disclaimer_short}`
    }
  }

  // -------------------------------------------------------------------------
  else if (ctx.intent === 'complain') {
    const complaint = answers.complaint_description || '[description du problème]'
    const resolution = answers.expected_resolution || ''
    const resolutionLine = resolution ? `${L.complain_resolution_prefix}${resolution}.` : ''

    subject = L.complain_subject(company, contractNumber)

    postalBody = `${senderName}
${senderAddress}

${company}
${L.complain_service}

${L.date_in(city, today)}

${L.subject_label} ${L.complain_subject_line(contractRef.trim() || undefined)}

${L.salutation}

${L.complain_p1}

${complaint}${contractRef}${resolutionLine}

${L.complain_p2}

${L.closing}

${senderName}

---
⚠️ ${L.disclaimer}`

    emailBody = `${L.greet}

${L.complain_email_p1}

${complaint}${contractRef}${resolutionLine}

${L.complain_email_p2}

${L.regards}
${senderName}

---
⚠️ ${L.disclaimer_short}`
  }

  // -------------------------------------------------------------------------
  else if (ctx.intent === 'certify') {
    const certType = answers.certificate_type || L.certify_type
    subject = L.certify_subject(certType, company)

    postalBody = `${senderName}
${senderAddress}

${today}

${L.subject_label} ${L.certify_subject_line(certType)}

${L.certify_opening(senderName, senderAddress)}

${L.certify_footer}

${L.certify_sig(city, today, senderName)}

---
⚠️ ${L.disclaimer}`

    emailBody = postalBody
  }

  // -------------------------------------------------------------------------
  else {
    const details = answers.request_details || '[description de votre demande]'
    subject = L.request_subject(company, contractNumber)

    postalBody = `${senderName}
${senderAddress}

${company}
${L.request_service}

${L.date_in(city, today)}

${L.subject_label} ${L.request_subject_line(contractRef.trim() || undefined)}

${L.salutation}

${L.request_p1}

${details}${contractRef}

${L.request_p2}

${L.closing}

${senderName}

---
⚠️ ${L.disclaimer}`

    emailBody = `${L.greet}

${details}${contractRef}

${L.regards}
${senderName}

---
⚠️ ${L.disclaimer_short}`
  }

  return { postal: postalBody, email: emailBody, subject }
}

// ---------------------------------------------------------------------------
// TODO: replace with Claude API call
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// TODO: replace with Claude API call
// ---------------------------------------------------------------------------
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
