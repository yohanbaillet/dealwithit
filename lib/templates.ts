import type { IntentType } from '@/types'

export interface TemplateField {
  key: string          // field_key in clarification_questions AND entity_type in extracted_entities
  question: string     // French — shown in form, used by AI letter generator
  required?: boolean   // default true
  type?: 'text' | 'date' | 'textarea'
  companyOptionsByLocale?: Partial<Record<string, string[]>>  // locale-keyed choices; falls back to 'fr'
}

export interface Template {
  key: string
  intent: IntentType
  emoji: string
  badge: string               // intent label key — used for translation lookup
  iconBg: string
  badgeColor: string
  // French strings kept here — used server-side for AI (rawInput, letter generation)
  // Display strings (title, hint) come from messages/*/templates.*
  description: string         // seeded as raw_input to AI; always French
  fields: TemplateField[]     // static field config — no AI needed when template selected
  presetEntities?: Record<string, string>
}

// Shared sender fields added to every template
const SENDER_FIELDS: TemplateField[] = [
  { key: 'sender_name', question: 'Quel est votre nom complet ?' },
  { key: 'sender_address', question: 'Quelle est votre adresse postale complète ?' },
]

export const POPULAR_TEMPLATE_KEYS = [
  'gym_cancel',
  'phone_cancel',
  'radar_fine',
  'lost_parcel',
  'invoice_dispute',
  'insurance_home_cancel',
  'parking_fine',
  'streaming_cancel',
  'defective_product',
]

export const TEMPLATES: Template[] = [
  // ── Most popular (shown by default) ────────────────────────────────────────
  {
    key: 'gym_cancel',
    intent: 'terminate',
    emoji: '🏋️',
    badge: 'terminate',
    iconBg: 'bg-orange-50',
    badgeColor: 'bg-orange-100 text-orange-700',
    description: 'Je veux résilier mon abonnement à ma salle de sport',
    fields: [
      ...SENDER_FIELDS,
      {
        key: 'company_name',
        question: 'Quel est le nom de votre salle de sport ?',
        companyOptionsByLocale: {
          fr: ['Basic-Fit', 'Fitness Park', 'Keep Cool', "L'Orange Bleue", 'Neoness', 'Club Med Gym', 'Gofit'],
          en: ['PureGym', 'The Gym Group', 'David Lloyd', 'Virgin Active', 'Anytime Fitness', 'Basic-Fit', 'JD Gyms'],
          de: ['McFit', 'FitX', 'John Reed', 'INJOY', 'Clever Fit', 'FitnessFirst', 'RSG Group'],
          es: ['Holmes Place', 'Metropolitan', 'VivaGym', 'Anytime Fitness', 'Basic-Fit', 'Supera', 'Go Fit'],
          it: ['Virgin Active', 'McFit', 'Anytime Fitness', 'Basic-Fit', 'Klab', 'FitnessFirst', 'Technogym Club'],
        },
      },
      { key: 'contract_number', question: 'Avez-vous un numéro de membre ou de contrat ?', required: false },
      { key: 'termination_date', question: 'À quelle date souhaitez-vous résilier ?', type: 'date' },
    ],
  },
  {
    key: 'phone_cancel',
    intent: 'terminate',
    emoji: '📱',
    badge: 'terminate',
    iconBg: 'bg-violet-50',
    badgeColor: 'bg-violet-100 text-violet-700',
    description: 'Je veux résilier mon abonnement téléphonique',
    fields: [
      ...SENDER_FIELDS,
      {
        key: 'company_name',
        question: 'Quel est votre opérateur mobile ?',
        companyOptionsByLocale: {
          fr: ['Orange', 'SFR', 'Bouygues Telecom', 'Free Mobile', 'Coriolis', 'Prixtel', 'NRJ Mobile', 'Auchan Telecom'],
          en: ['EE', 'O2', 'Vodafone', 'Three', 'Sky Mobile', 'Virgin Mobile', 'giffgaff', 'Tesco Mobile'],
          de: ['Deutsche Telekom', 'Vodafone', 'O2', '1&1', 'congstar', 'Aldi Talk', 'Lidl Connect'],
          es: ['Movistar', 'Orange', 'Vodafone', 'Jazztel', 'MásMóvil', 'Yoigo', 'Digi', 'Simyo'],
          it: ['TIM', 'Vodafone', 'Wind Tre', 'Iliad', 'PosteMobile', 'Fastweb', 'CoopVoce'],
        },
      },
      { key: 'contract_number', question: 'Quel est votre numéro de client ou de ligne ?' },
      { key: 'termination_date', question: 'À quelle date souhaitez-vous résilier ?', type: 'date' },
    ],
  },
  {
    key: 'radar_fine',
    intent: 'contest',
    emoji: '📷',
    badge: 'contest',
    iconBg: 'bg-red-50',
    badgeColor: 'bg-red-100 text-red-700',
    description: "J'ai reçu un avis de contravention par radar que je veux contester",
    presetEntities: { fine_type: 'radar' },
    fields: [
      ...SENDER_FIELDS,
      { key: 'fine_reference', question: "Quel est le numéro de l'avis de contravention ?" },
      { key: 'offense_date', question: "Quelle est la date de l'infraction indiquée sur l'avis ?", type: 'date' },
      { key: 'vehicle_plate', question: "Quel est le numéro d'immatriculation du véhicule ?" },
      { key: 'offense_city', question: "Dans quelle ville ou lieu l'infraction a-t-elle été enregistrée ?" },
      { key: 'fine_amount', question: "Quel est le montant de l'amende ?" },
      { key: 'contest_reason', question: 'Pourquoi contestez-vous cette contravention ?', type: 'textarea' },
    ],
  },
  {
    key: 'lost_parcel',
    intent: 'complain',
    emoji: '📦',
    badge: 'complain',
    iconBg: 'bg-emerald-50',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    description: "Mon colis n'est pas arrivé et je demande un remboursement ou un réenvoi",
    fields: [
      ...SENDER_FIELDS,
      {
        key: 'company_name',
        question: 'Chez quel vendeur ou transporteur avez-vous commandé ?',
        companyOptionsByLocale: {
          fr: ['Amazon', 'Cdiscount', 'Vinted', 'Leboncoin', 'La Poste / Colissimo', 'Chronopost', 'DHL', 'UPS', 'DPD', 'GLS'],
          en: ['Amazon', 'eBay', 'ASOS', 'Royal Mail', 'Evri', 'DHL', 'DPD', 'UPS', 'FedEx', 'Yodel'],
          de: ['Amazon', 'Otto', 'Zalando', 'DHL', 'Hermes', 'DPD', 'UPS', 'FedEx', 'GLS'],
          es: ['Amazon', 'El Corte Inglés', 'Zara', 'Correos', 'DHL', 'SEUR', 'MRW', 'GLS'],
          it: ['Amazon', 'eBay', 'Vinted', 'Poste Italiane', 'DHL', 'BRT', 'GLS', 'SDA'],
        },
      },
      { key: 'complaint_description', question: 'Décrivez le problème : numéro de commande, date de livraison prévue, suivi du colis si disponible.', type: 'textarea' },
      { key: 'expected_resolution', question: 'Que souhaitez-vous : remboursement complet, réenvoi du colis, ou autre ?' },
    ],
  },
  {
    key: 'invoice_dispute',
    intent: 'contest',
    emoji: '💡',
    badge: 'contest',
    iconBg: 'bg-yellow-50',
    badgeColor: 'bg-yellow-100 text-yellow-700',
    description: "J'ai reçu une facture erronée ou anormalement élevée que je conteste",
    fields: [
      ...SENDER_FIELDS,
      { key: 'company_name', question: 'Quelle entreprise a émis la facture contestée ?' },
      { key: 'contest_reason', question: 'Pourquoi contestez-vous cette facture ? (montant incorrect, doublon, service non rendu…)', type: 'textarea' },
    ],
  },
  {
    key: 'insurance_home_cancel',
    intent: 'terminate',
    emoji: '🏠',
    badge: 'terminate',
    iconBg: 'bg-teal-50',
    badgeColor: 'bg-teal-100 text-teal-700',
    description: "Je veux résilier mon assurance habitation",
    fields: [
      ...SENDER_FIELDS,
      {
        key: 'company_name',
        question: "Quel est le nom de votre assureur ?",
        companyOptionsByLocale: {
          fr: ['AXA', 'MAIF', 'Groupama', 'Allianz', 'GMF', 'MAAF', 'Generali', 'Macif', 'April', 'Covéa'],
          en: ['Aviva', 'AXA', 'Direct Line', 'Admiral', 'LV=', 'Nationwide', 'Halifax', 'Allianz'],
          de: ['Allianz', 'AXA', 'Generali', 'HUK-COBURG', 'ERGO', 'Zurich', 'Gothaer', 'R+V'],
          es: ['Mapfre', 'AXA', 'Allianz', 'Generali', 'Zurich', 'Mutua Madrileña', 'Santalucía'],
          it: ['Generali', 'UnipolSai', 'Allianz', 'AXA', 'Zurich', 'Cattolica', 'Reale Mutua'],
        },
      },
      { key: 'contract_number', question: "Quel est votre numéro de contrat d'assurance ?" },
      { key: 'termination_date', question: "Quelle est la date d'échéance de votre contrat ?", type: 'date' },
    ],
  },

  // ── Extended (shown after "See more") ──────────────────────────────────────
  {
    key: 'parking_fine',
    intent: 'contest',
    emoji: '🅿️',
    badge: 'contest',
    iconBg: 'bg-amber-50',
    badgeColor: 'bg-amber-100 text-amber-700',
    description: "J'ai reçu un forfait post-stationnement que je veux contester",
    presetEntities: { fine_type: 'stationnement' },
    fields: [
      ...SENDER_FIELDS,
      { key: 'fine_reference', question: 'Quel est le numéro du forfait post-stationnement ?' },
      { key: 'offense_date', question: 'Quelle est la date du stationnement litigieux ?', type: 'date' },
      { key: 'vehicle_plate', question: "Quel est le numéro d'immatriculation du véhicule ?" },
      { key: 'offense_city', question: 'Dans quelle rue ou commune le FPS a-t-il été émis ?' },
      { key: 'fine_amount', question: 'Quel est le montant du forfait ?' },
      { key: 'contest_reason', question: 'Pourquoi contestez-vous ce forfait ?', type: 'textarea' },
    ],
  },
  {
    key: 'transport_complaint',
    intent: 'complain',
    emoji: '🚆',
    badge: 'complain',
    iconBg: 'bg-blue-50',
    badgeColor: 'bg-blue-100 text-blue-700',
    description: "J'ai subi un retard ou une annulation de transport et je veux une compensation",
    fields: [
      ...SENDER_FIELDS,
      {
        key: 'company_name',
        question: 'Quel est le transporteur (SNCF, Air France, compagnie de bus…) ?',
        companyOptionsByLocale: {
          fr: ['SNCF', 'Air France', 'Transavia', 'Vueling', 'EasyJet', 'Ryanair', 'RATP', 'Flixbus', 'BlaBlaCar'],
          en: ['National Rail', 'British Airways', 'EasyJet', 'Ryanair', 'Virgin Atlantic', 'Trainline', 'Flixbus', 'Eurostar'],
          de: ['Deutsche Bahn', 'Lufthansa', 'Eurowings', 'Ryanair', 'EasyJet', 'Flixbus', 'ÖPNV'],
          es: ['Renfe', 'Iberia', 'Vueling', 'Ryanair', 'EasyJet', 'Alsa', 'Avlo', 'Flixbus'],
          it: ['Trenitalia', 'Italo', 'ITA Airways', 'Ryanair', 'EasyJet', 'Vueling', 'Flixbus'],
        },
      },
      { key: 'complaint_description', question: "Décrivez le problème : n° de billet, trajet, date, durée du retard ou motif d'annulation.", type: 'textarea' },
      { key: 'expected_resolution', question: 'Que souhaitez-vous : remboursement du billet, avoir, ou indemnisation complémentaire ?' },
    ],
  },
  {
    key: 'box_cancel',
    intent: 'terminate',
    emoji: '📡',
    badge: 'terminate',
    iconBg: 'bg-blue-50',
    badgeColor: 'bg-blue-100 text-blue-700',
    description: 'Je veux résilier mon abonnement box internet ou TV',
    fields: [
      ...SENDER_FIELDS,
      {
        key: 'company_name',
        question: 'Quel est votre fournisseur (Orange, Free, SFR…) ?',
        companyOptionsByLocale: {
          fr: ['Orange', 'Free', 'SFR', 'Bouygues Telecom', 'RED by SFR', 'Sosh', 'B&You'],
          en: ['BT', 'Sky', 'Virgin Media', 'TalkTalk', 'Plusnet', 'EE Broadband', 'NOW TV'],
          de: ['Deutsche Telekom', 'Vodafone', '1&1', 'O2', 'Unitymedia', 'Freenet'],
          es: ['Movistar', 'Orange', 'Vodafone', 'Jazztel', 'MásMóvil', 'Digi'],
          it: ['TIM', 'Vodafone', 'Wind Tre', 'Fastweb', 'Iliad', 'Sky Italia'],
        },
      },
      { key: 'contract_number', question: 'Quel est votre numéro de client ?' },
    ],
  },
  {
    key: 'insurance_car_cancel',
    intent: 'terminate',
    emoji: '🚘',
    badge: 'terminate',
    iconBg: 'bg-slate-50',
    badgeColor: 'bg-slate-100 text-slate-700',
    description: "Je veux résilier mon assurance automobile",
    fields: [
      ...SENDER_FIELDS,
      {
        key: 'company_name',
        question: "Quel est le nom de votre assureur auto ?",
        companyOptionsByLocale: {
          fr: ['AXA', 'MAIF', 'Groupama', 'Allianz', 'GMF', 'MAAF', 'Generali', 'Macif', 'April', 'Direct Assurance'],
          en: ['Aviva', 'AXA', 'Direct Line', 'Admiral', 'LV=', 'Churchill', 'Hastings Direct', 'Allianz'],
          de: ['Allianz', 'AXA', 'HUK-COBURG', 'ADAC', 'ERGO', 'Zurich', 'Gothaer'],
          es: ['Mapfre', 'Mutua Madrileña', 'AXA', 'Allianz', 'Generali', 'Zurich', 'Direct Seguros'],
          it: ['Generali', 'UnipolSai', 'Allianz', 'AXA', 'Zurich', 'Cattolica', 'Reale Mutua'],
        },
      },
      { key: 'contract_number', question: "Quel est votre numéro de contrat ?" },
      { key: 'termination_date', question: "À quelle date souhaitez-vous résilier (ex: date d'anniversaire) ?", type: 'date' },
    ],
  },
  {
    key: 'streaming_cancel',
    intent: 'terminate',
    emoji: '🎬',
    badge: 'terminate',
    iconBg: 'bg-pink-50',
    badgeColor: 'bg-pink-100 text-pink-700',
    description: 'Je veux résilier mon abonnement à un service de streaming',
    fields: [
      ...SENDER_FIELDS,
      {
        key: 'company_name',
        question: 'Quel service souhaitez-vous résilier ?',
        companyOptionsByLocale: {
          fr: ['Netflix', 'Disney+', 'Amazon Prime Video', 'Canal+', 'Apple TV+', 'Spotify', 'Deezer', 'Paramount+', 'MAX', 'OCS'],
          en: ['Netflix', 'Disney+', 'Amazon Prime Video', 'Apple TV+', 'Spotify', 'NOW TV', 'BritBox', 'Paramount+', 'DAZN'],
          de: ['Netflix', 'Disney+', 'Amazon Prime Video', 'Apple TV+', 'Spotify', 'Joyn+', 'MagentaTV', 'DAZN'],
          es: ['Netflix', 'Disney+', 'Amazon Prime Video', 'Apple TV+', 'Spotify', 'Filmin', 'Movistar+', 'DAZN'],
          it: ['Netflix', 'Disney+', 'Amazon Prime Video', 'Apple TV+', 'Spotify', 'Paramount+', 'DAZN', 'Mediaset Infinity'],
        },
      },
      { key: 'contract_number', question: "Avez-vous un numéro d'abonné ou l'email du compte ?", required: false },
    ],
  },
  {
    key: 'health_cancel',
    intent: 'terminate',
    emoji: '🏥',
    badge: 'terminate',
    iconBg: 'bg-green-50',
    badgeColor: 'bg-green-100 text-green-700',
    description: 'Je veux résilier mon contrat de mutuelle santé',
    fields: [
      ...SENDER_FIELDS,
      {
        key: 'company_name',
        question: 'Quel est le nom de votre mutuelle ?',
        companyOptionsByLocale: {
          fr: ['Harmonie Mutuelle', 'Malakoff Humanis', 'Alan', 'MAIF Santé', 'April Santé', 'AXA Santé', 'Henner', 'Mutex'],
          en: ['BUPA', 'AXA Health', 'Vitality', 'Aviva', 'Cigna', 'Simply Health', 'WPA'],
          de: ['TK', 'AOK', 'Barmer', 'DAK', 'KKH', 'IKK', 'Allianz Gesundheit'],
          es: ['Sanitas', 'Adeslas', 'Asisa', 'Mapfre Salud', 'AXA Salud', 'DKV'],
          it: ['UniSalute', 'Generali', 'Blue Assistance', 'Previmedical', 'Filo Diretto'],
        },
      },
      { key: 'contract_number', question: "Quel est votre numéro d'adhérent ?" },
      { key: 'termination_date', question: "Quelle est la date d'échéance annuelle de votre contrat ?", type: 'date' },
    ],
  },
  {
    key: 'bank_dispute',
    intent: 'contest',
    emoji: '🏦',
    badge: 'contest',
    iconBg: 'bg-indigo-50',
    badgeColor: 'bg-indigo-100 text-indigo-700',
    description: "Je conteste des frais bancaires injustifiés prélevés sur mon compte",
    fields: [
      ...SENDER_FIELDS,
      {
        key: 'company_name',
        question: 'Quel est le nom de votre banque ?',
        companyOptionsByLocale: {
          fr: ['BNP Paribas', 'Société Générale', 'Crédit Agricole', 'LCL', "Caisse d'Épargne", 'Banque Populaire', 'La Banque Postale', 'Boursorama', 'N26', 'Revolut'],
          en: ['Barclays', 'HSBC', 'Lloyds', 'NatWest', 'Santander', 'Halifax', 'Monzo', 'Starling', 'Revolut', 'Nationwide'],
          de: ['Deutsche Bank', 'Commerzbank', 'Sparkasse', 'DKB', 'ING', 'Comdirect', 'N26', 'Revolut'],
          es: ['BBVA', 'Santander', 'CaixaBank', 'Bankinter', 'Sabadell', 'ING España', 'Openbank', 'N26'],
          it: ['Intesa Sanpaolo', 'UniCredit', 'Banco BPM', 'Mediolanum', 'Fineco', 'N26', 'Revolut'],
        },
      },
      { key: 'contest_reason', question: 'Quels frais contestez-vous et pour quel motif ? (ex: frais de virement, commission, débit non autorisé…)', type: 'textarea' },
    ],
  },
  {
    key: 'defective_product',
    intent: 'complain',
    emoji: '🔧',
    badge: 'complain',
    iconBg: 'bg-orange-50',
    badgeColor: 'bg-orange-100 text-orange-700',
    description: "J'ai reçu un produit défectueux et je souhaite un remplacement ou remboursement",
    fields: [
      ...SENDER_FIELDS,
      { key: 'company_name', question: 'Chez quel vendeur ou fabricant avez-vous acheté le produit ?' },
      { key: 'complaint_description', question: "Décrivez le défaut constaté, la date d'achat et le nom du produit.", type: 'textarea' },
      { key: 'expected_resolution', question: 'Souhaitez-vous un remplacement, une réparation ou un remboursement ?' },
    ],
  },
  {
    key: 'service_complaint',
    intent: 'complain',
    emoji: '😤',
    badge: 'complain',
    iconBg: 'bg-rose-50',
    badgeColor: 'bg-rose-100 text-rose-700',
    description: "Je suis insatisfait d'une prestation ou d'un service et je souhaite une compensation",
    fields: [
      ...SENDER_FIELDS,
      { key: 'company_name', question: 'Quelle entreprise ou prestataire est concerné ?' },
      { key: 'complaint_description', question: "Décrivez précisément le problème rencontré et quand il s'est produit.", type: 'textarea' },
    ],
  },
  {
    key: 'refund_request',
    intent: 'request',
    emoji: '💶',
    badge: 'request',
    iconBg: 'bg-blue-50',
    badgeColor: 'bg-blue-100 text-blue-700',
    description: "Je souhaite obtenir le remboursement d'une somme qui m'est due",
    fields: [
      ...SENDER_FIELDS,
      { key: 'company_name', question: 'À quelle entreprise ou organisme adressez-vous cette demande ?' },
      { key: 'request_details', question: 'Décrivez le remboursement demandé : montant, motif et référence si disponible.', type: 'textarea' },
    ],
  },
]

export const TEMPLATE_MAP = new Map(TEMPLATES.map((t) => [t.key, t]))

export function getTemplate(key: string | null | undefined): Template | null {
  if (!key) return null
  return TEMPLATE_MAP.get(key) ?? null
}

export const POPULAR_TEMPLATES = TEMPLATES.filter((t) =>
  POPULAR_TEMPLATE_KEYS.includes(t.key)
).sort((a, b) => POPULAR_TEMPLATE_KEYS.indexOf(a.key) - POPULAR_TEMPLATE_KEYS.indexOf(b.key))

export const EXTENDED_TEMPLATES = TEMPLATES.filter(
  (t) => !POPULAR_TEMPLATE_KEYS.includes(t.key)
)
