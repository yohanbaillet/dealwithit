-- ============================================================
-- 009_seed_company_contacts.sql
-- Postal addresses / emails for company_contacts.
-- Sources: official websites, public carrier portals, regulatory
-- filings. Addresses reflect known state as of early 2025.
-- Always recommend users verify on the company's official site
-- before sending. Registered-mail / recorded-delivery advised.
-- ============================================================

-- ═══════════════════════════════════════════════════════════
-- FRANCE
-- ═══════════════════════════════════════════════════════════

-- ── FR · TELECOM MOBILE + INTERNET ──────────────────────────

-- Orange (mobile + box)
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'Service Résiliation Orange\nTSA 70107\n62978 Arras Cedex 9',
  null, 'Service Résiliation',
  E'Lettre recommandée avec AR conseillée. Préavis de 10 jours à compter de la réception.',
  'https://assistance.orange.fr/mobiles-tablettes-et-appareils/abonnements-et-contrats/resilier-un-abonnement',
  '2025-01-01'::timestamptz
from companies c
where c.name in ('Orange') and c.country_code = 'fr'
  and c.category in ('telecom_mobile', 'telecom_internet');

-- SFR (mobile + box)
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'SFR – Service Résiliation\nTSA 23051\n92060 La Défense Cedex',
  null, 'Service Résiliation',
  E'Lettre recommandée avec AR. Préavis contractuel à respecter (10 jours minimum).',
  'https://www.sfr.fr/assistance/rubrique/resilier-mon-contrat',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'SFR' and c.country_code = 'fr'
  and c.category in ('telecom_mobile', 'telecom_internet');

-- RED by SFR
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'RED by SFR – Service Résiliation\nTSA 23051\n92060 La Défense Cedex',
  null, 'Service Résiliation',
  E'Même adresse postale que SFR. Résiliation possible en ligne ou par courrier.',
  'https://www.red-by-sfr.fr/assistance/resilier',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'RED by SFR' and c.country_code = 'fr';

-- Bouygues Telecom (mobile + box)
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'Bouygues Telecom – Service Résiliation\nTSA 71047\n60643 Chantilly Cedex',
  null, 'Service Résiliation',
  E'Lettre recommandée avec AR. Préavis de 10 jours pour mobile, 10 jours pour box.',
  'https://www.bouyguestelecom.fr/assistance/resilier-son-abonnement',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Bouygues Telecom' and c.country_code = 'fr'
  and c.category in ('telecom_mobile', 'telecom_internet');

-- B&You (Bouygues virtual brand)
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'B&You – Service Résiliation\nTSA 71047\n60643 Chantilly Cedex',
  null, 'Service Résiliation',
  E'Même adresse que Bouygues Telecom.',
  'https://www.bouyguestelecom.fr/offres-mobiles/b-and-you',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'B&You' and c.country_code = 'fr';

-- Free Mobile
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'Free Mobile – Service Résiliation\nCS 20030\n75860 Paris Cedex 18',
  null, 'Service Résiliation',
  E'Lettre recommandée avec AR. Sans engagement : résiliation possible à tout moment.',
  'https://mobile.free.fr/assistance/resilier',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Free Mobile' and c.country_code = 'fr';

-- Free (box internet)
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'Free – Service Résiliation\nIliad – Free\nCS 20030\n75860 Paris Cedex 18',
  null, 'Service Résiliation',
  E'Lettre recommandée avec AR. Préavis de 15 jours pour la Freebox.',
  'https://www.free.fr/freebox/resilier-ma-freebox/',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Free' and c.country_code = 'fr' and c.category = 'telecom_internet';

-- Sosh (Orange virtual brand)
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'Sosh – Service Résiliation\nTSA 70107\n62978 Arras Cedex 9',
  null, 'Service Résiliation',
  E'Même adresse que Orange. Résiliation possible en ligne ou par courrier.',
  'https://www.sosh.fr/assistance/resilier',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Sosh' and c.country_code = 'fr';

-- ── FR · STREAMING ───────────────────────────────────────────

-- Canal+
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'Canal+\nService Abonnés – Résiliation\nTSA 50002\n95905 Cergy Pontoise Cedex 9',
  null, 'Service Abonnés',
  E'Lettre recommandée avec AR. Respecter la date d''échéance contractuelle.',
  'https://www.canalplus.com/assistance/',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Canal+' and c.country_code = 'fr';

-- Netflix (online-only – generic note)
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, null,
  null,
  null, 'Service Client',
  E'Netflix ne dispose pas d''adresse postale pour les résiliations. La résiliation s''effectue uniquement en ligne sur netflix.com/cancel ou via le chat/e-mail du service client.',
  'https://help.netflix.com/fr/node/407',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Netflix' and c.country_code = 'fr';

-- Spotify (online-only)
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, null,
  null,
  null, 'Service Client',
  E'Spotify ne dispose pas d''adresse postale pour les résiliations. La résiliation s''effectue via spotify.com/account ou le support en ligne.',
  'https://support.spotify.com',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Spotify' and c.country_code = 'fr';

-- Deezer
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, null,
  E'Deezer\nService Client\n24 rue de Calais\n75009 Paris',
  'support@deezer.com', 'Service Client',
  E'Résiliation possible en ligne ou par e-mail. Conserver la confirmation écrite.',
  'https://support.deezer.com',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Deezer' and c.country_code = 'fr';

-- ── FR · INSURANCE (home + car) ──────────────────────────────

-- AXA France (home + car + health)
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'AXA France\nService Résiliation\n313 Terrasses de l''Arche\n92727 Nanterre Cedex',
  null, 'Service Résiliation',
  E'Lettre recommandée avec AR à l''échéance ou en loi Hamon (1 an après souscription). Votre conseiller AXA local peut aussi traiter la demande.',
  'https://www.axa.fr/assistance/resilier-un-contrat.html',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'AXA' and c.country_code = 'fr'
  and c.category in ('insurance_home', 'insurance_car');

-- AXA Santé
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'AXA France Vie\nService Résiliation Santé\n313 Terrasses de l''Arche\n92727 Nanterre Cedex',
  null, 'Service Résiliation Santé',
  E'Résiliation possible à l''échéance annuelle ou après 1 an (loi Hamon). Lettre recommandée avec AR.',
  'https://www.axa.fr',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'AXA Santé' and c.country_code = 'fr';

-- MAIF
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'MAIF\nService Résiliation\nBP 2\n79038 Niort Cedex 9',
  null, 'Service Résiliation',
  E'Lettre recommandée avec AR. Résiliation à l''échéance annuelle ou loi Hamon (mutuelle auto/habitation après 1 an).',
  'https://www.maif.fr/aide-assistance/resilier-contrat.html',
  '2025-01-01'::timestamptz
from companies c
where c.name in ('MAIF', 'MAIF Santé') and c.country_code = 'fr';

-- MAAF
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'MAAF Assurances\nService Résiliation\nBP 1\n79180 Chauray',
  null, 'Service Résiliation',
  E'Lettre recommandée avec AR. Résiliation à l''échéance ou en loi Hamon après 1 an.',
  'https://www.maaf.fr/fr/assistance-sinistres/resilier-un-contrat.html',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'MAAF' and c.country_code = 'fr';

-- Macif
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'Macif\nGestion des Contrats\nBP 1\n79036 Niort Cedex 9',
  null, 'Gestion des Contrats',
  E'Lettre recommandée avec AR à l''échéance ou sous loi Hamon. Délai de préavis de 2 mois avant l''échéance.',
  'https://www.macif.fr',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Macif' and c.country_code = 'fr';

-- GMF
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'GMF\nService Résiliation\nCS 20220\n79022 Niort Cedex 9',
  null, 'Service Résiliation',
  E'Lettre recommandée avec AR. Résiliation à l''échéance annuelle ou après 1 an (loi Hamon).',
  'https://www.gmf.fr',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'GMF' and c.country_code = 'fr';

-- Groupama
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'Groupama\nService Résiliation\n8-10 rue d''Astorg\n75383 Paris Cedex 08',
  null, 'Service Résiliation',
  E'Adresser la résiliation à votre caisse régionale Groupama ou au siège. Lettre recommandée avec AR conseillée.',
  'https://www.groupama.fr',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Groupama' and c.country_code = 'fr';

-- Allianz France
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'Allianz France\nService Résiliation\n1 cours Michelet – CS 30051\n92096 La Défense Cedex',
  null, 'Service Résiliation',
  E'Lettre recommandée avec AR. Votre agent local Allianz peut aussi traiter la demande.',
  'https://www.allianz.fr',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Allianz' and c.country_code = 'fr';

-- Generali France
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'Generali France\nService Résiliation\n7-9 boulevard Haussmann\n75458 Paris Cedex 09',
  null, 'Service Résiliation',
  E'Lettre recommandée avec AR à l''échéance ou après 1 an (loi Hamon). Contacter aussi votre courtier ou agent.',
  'https://www.generali.fr',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Generali' and c.country_code = 'fr';

-- Harmonie Mutuelle
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'Harmonie Mutuelle\nService Résiliation\n143 rue Blomet\n75015 Paris',
  null, 'Service Résiliation',
  E'Résiliation par lettre recommandée avec AR ou via espace adhérent. Préavis de 2 mois avant l''échéance.',
  'https://www.harmonie-mutuelle.fr',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Harmonie Mutuelle' and c.country_code = 'fr';

-- Malakoff Humanis
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'Malakoff Humanis\nService Résiliation\n21 rue Laffitte\n75317 Paris Cedex 09',
  null, 'Service Résiliation',
  E'Résiliation par lettre recommandée avec AR ou via espace client.',
  'https://www.malakoffhumanis.com',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Malakoff Humanis' and c.country_code = 'fr';

-- ── FR · BANK ────────────────────────────────────────────────

-- BNP Paribas
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, null,
  E'BNP Paribas\nService Clientèle\n37 place du Marché Saint-Honoré\n75031 Paris Cedex 01',
  null, 'Service Clientèle',
  E'Pour les réclamations formelles : contacter votre conseiller ou écrire au siège. En cas de litige non résolu, saisir le Médiateur BNP Paribas.',
  'https://mabanque.bnpparibas/fr/besoin-aide',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'BNP Paribas' and c.country_code = 'fr';

-- Société Générale
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, null,
  E'Société Générale\nService Clients Réclamations\n17 cours Valmy\n92987 Paris La Défense Cedex',
  null, 'Service Réclamations',
  E'Réclamation à adresser à votre agence ou par courrier au siège. Délai de réponse légal : 2 mois.',
  'https://www.societegenerale.fr/nous-contacter',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Société Générale' and c.country_code = 'fr';

-- Crédit Agricole
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, null,
  E'Crédit Agricole S.A.\nService Réclamations\n12 place des États-Unis\n92127 Montrouge Cedex',
  null, 'Service Réclamations',
  E'Adresser la réclamation à votre Caisse Régionale ou au siège national.',
  'https://www.credit-agricole.fr/particulier/espace-bancaire/contact.html',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Crédit Agricole' and c.country_code = 'fr';

-- La Banque Postale
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, null,
  E'La Banque Postale\nService Réclamations\n115 rue de Sèvres\n75275 Paris Cedex 06',
  null, 'Service Réclamations',
  E'Réclamation possible en agence La Poste, par courrier ou via l''espace client.',
  'https://www.labanquepostale.fr/assistance/reclamations.html',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'La Banque Postale' and c.country_code = 'fr';

-- Boursorama
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, null,
  E'Boursorama Banque\nTSA 50162\n92842 Rueil-Malmaison Cedex',
  null, 'Service Client',
  E'Banque en ligne : réclamations via messagerie sécurisée de l''espace client. Le courrier postal est aussi accepté.',
  'https://www.boursorama.com/aide/',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Boursorama' and c.country_code = 'fr';

-- ── FR · GYM ─────────────────────────────────────────────────

-- Basic-Fit France
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'Basic-Fit France\nService Résiliation\n27 avenue Trudaine\n75009 Paris',
  null, 'Service Résiliation',
  E'Résiliation par lettre recommandée avec AR au club ou au siège. Préavis contractuel à respecter (délai variable selon engagement).',
  'https://www.basic-fit.com/fr-fr/aide/annuler-abonnement',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Basic-Fit' and c.country_code = 'fr';

-- Fitness Park
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'Fitness Park\nService Résiliation\nZAC de la Queue-en-Brie\n94510 La Queue-en-Brie',
  null, 'Service Résiliation',
  E'Lettre recommandée avec AR au club ou au siège social. Préavis de 30 jours en général.',
  'https://www.fitness-park.fr',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Fitness Park' and c.country_code = 'fr';

-- Keep Cool
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'Keep Cool Fitness\nService Résiliation\n125 bis route de Revel\n31400 Toulouse',
  null, 'Service Résiliation',
  E'Résiliation par lettre recommandée avec AR. Adresser au club ou au siège.',
  'https://www.keepcool.fr',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Keep Cool' and c.country_code = 'fr';

-- ── FR · TRANSPORT ───────────────────────────────────────────

-- SNCF
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'complain',
  E'SNCF Connect\nService Clients – Réclamations\nBP 2\n93633 La Plaine Saint-Denis Cedex',
  null, 'Service Réclamations',
  E'Réclamation en ligne sur sncf-connect.com ou par courrier. En cas de litige : Médiation SNCF, BP 80158, 62001 Arras Cedex.',
  'https://www.sncf-connect.com/aide/contact',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'SNCF' and c.country_code = 'fr';

-- Air France
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'complain',
  E'Air France – Service Clients\nDirection de l''Expérience Client\n45 rue de Paris\n95747 Roissy CDG Cedex',
  null, 'Service Clients',
  E'Réclamation en ligne sur airfrance.fr ou par courrier. Délai de réponse : 30 jours. En cas de litige non résolu : saisir la DGAC ou le médiateur.',
  'https://www.airfrance.fr/fr/contact',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Air France' and c.country_code = 'fr';

-- RATP
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'complain',
  E'RATP\nService Clients\n54 quai de la Rapée\n75599 Paris Cedex 12',
  null, 'Service Clients',
  E'Réclamation en ligne sur ratp.fr ou par courrier. En cas de litige : Médiateur de la RATP.',
  'https://www.ratp.fr/nous-contacter',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'RATP' and c.country_code = 'fr';

-- ── FR · LOGISTICS ───────────────────────────────────────────

-- La Poste / Colissimo
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'complain',
  E'La Poste – Direction Colis\nService Réclamations\n99999 La Poste',
  null, 'Service Réclamations Colis',
  E'Réclamation en ligne sur laposte.fr/litiges ou par courrier. Délai de réponse : 21 jours. En cas de litige : Médiateur La Poste.',
  'https://www.laposte.fr/aide/contacter-service-colis',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'La Poste / Colissimo' and c.country_code = 'fr';

-- Chronopost
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'complain',
  E'Chronopost\nService Clients – Réclamations\n33 avenue du Président Wilson\n93210 La Plaine Saint-Denis',
  null, 'Service Réclamations',
  E'Réclamation dans les 21 jours suivant la date prévue de livraison. En ligne ou par courrier.',
  'https://www.chronopost.fr/fr/service-client',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Chronopost' and c.country_code = 'fr';

-- DHL France
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'complain',
  E'DHL Express France\nService Clients\nZone Industrielle Paris Nord II\n22 avenue des Nations\n95949 Roissy CDG Cedex',
  null, 'Service Clients',
  E'Réclamation par téléphone ou en ligne. Délai légal pour colis perdus : 30 jours après expédition.',
  'https://www.dhl.fr/fr/express/service_clients.html',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'DHL' and c.country_code = 'fr';

-- Amazon France
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'complain',
  E'Amazon EU SARL\nService Clients\n38 avenue John F. Kennedy\nL-1855 Luxembourg',
  null, 'Service Clients',
  E'Réclamation prioritairement via l''espace client Amazon (commandes > problème). Courrier postal possible mais délais plus longs. En cas de litige : Médiateur e-commerce.',
  'https://www.amazon.fr/gp/help/customer/display.html',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Amazon' and c.country_code = 'fr';

-- ═══════════════════════════════════════════════════════════
-- UNITED KINGDOM (en)
-- ═══════════════════════════════════════════════════════════

-- EE
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'EE Limited\nPO Box 723\nSouthampton\nSO15 4DJ',
  null, 'Customer Service',
  E'Written notice by recorded delivery recommended. 30-day notice period typically required.',
  'https://ee.co.uk/help/account/cancellations',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'EE' and c.country_code = 'en'
  and c.category in ('telecom_mobile', 'telecom_internet');

-- O2 UK
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'Telefónica UK Ltd\nCustomer Relations\nPO Box 694\nWinchester\nSO23 5AP',
  null, 'Customer Relations',
  E'30-day written notice required. Recorded delivery advised.',
  'https://www.o2.co.uk/help/cancellations',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'O2' and c.country_code = 'en';

-- Vodafone UK
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'Vodafone Limited\nThe Connection\nNewbury\nBerkshire\nRG14 2FN',
  null, 'Customer Service',
  E'30-day notice period. Written cancellation by recorded post recommended.',
  'https://www.vodafone.co.uk/help/account/cancel',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Vodafone' and c.country_code = 'en';

-- Three UK
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'Hutchison 3G UK Ltd\nCustomer Cancellations\nPO Box 333\nGlasgow\nG2 9AG',
  null, 'Cancellations',
  E'30-day notice in writing. Recorded delivery recommended.',
  'https://www.three.co.uk/support/account-and-billing/cancel',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Three' and c.country_code = 'en';

-- BT
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'BT Consumer\nPO Box 10058\nNottingham\nNG80 1NH',
  null, 'Customer Service',
  E'30-day notice period for broadband/phone. Recorded delivery recommended for formal cancellation.',
  'https://www.bt.com/help/home/cancellation',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'BT' and c.country_code = 'en';

-- Sky UK
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'Sky\nPO Box 43\nLivingston\nWest Lothian\nEH54 7DD',
  null, 'Customer Service',
  E'31-day notice required. Written cancellation by recorded post recommended. Sky ID may be needed.',
  'https://www.sky.com/help/articles/how-to-cancel-sky',
  '2025-01-01'::timestamptz
from companies c
where c.name in ('Sky', 'Sky Mobile') and c.country_code = 'en';

-- Virgin Media
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'Virgin Media\nPO Box 2881\nChester\nCH99 9XX',
  null, 'Customer Service',
  E'30-day written notice required. Recorded delivery advised.',
  'https://www.virginmedia.com/help/cancellations',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Virgin Media' and c.country_code = 'en';

-- Aviva UK (home + car + health)
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, null,
  E'Aviva\nPO Box 7684\nPeterborough\nPE3 8FN',
  null, 'Customer Service',
  E'Cancellations and complaints in writing by recorded post. 14-day cooling-off period for new policies.',
  'https://www.aviva.co.uk/help-and-support/',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Aviva' and c.country_code = 'en';

-- AXA UK
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, null,
  E'AXA UK plc\n5 Old Broad Street\nLondon\nEC2N 1AD',
  null, 'Customer Service',
  E'Insurance cancellations and claims by recorded post.',
  'https://www.axa.co.uk/help-and-support/',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'AXA' and c.country_code = 'en';

-- Direct Line UK
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, null,
  E'Direct Line Insurance plc\nCharlton Place\nAndover\nHampshire\nSP10 1RE',
  null, 'Customer Service',
  E'Cancellations and complaints by recorded post.',
  'https://www.directline.com/help',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Direct Line' and c.country_code = 'en';

-- Admiral UK
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, null,
  E'Admiral Group plc\nTŷ Admiral\nDavid Street\nCardiff\nCF10 2EH',
  null, 'Customer Service',
  E'Complaints and cancellations by recorded post or online portal.',
  'https://www.admiral.com/contact-us',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Admiral' and c.country_code = 'en';

-- Barclays UK
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, null,
  E'Barclays Bank plc\n1 Churchill Place\nLondon\nE14 5HP',
  null, 'Customer Service',
  E'Formal complaints in writing by recorded post. In-branch visits also accepted. Unresolved: Financial Ombudsman Service.',
  'https://www.barclays.co.uk/help',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Barclays' and c.country_code = 'en';

-- HSBC UK
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, null,
  E'HSBC UK Bank plc\n8 Canada Square\nLondon\nE14 5HQ',
  null, 'Customer Service',
  E'Formal complaints by recorded post or via secure online banking message.',
  'https://www.hsbc.co.uk/help',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'HSBC' and c.country_code = 'en';

-- NatWest UK
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, null,
  E'NatWest\n250 Bishopsgate\nLondon\nEC2M 4AA',
  null, 'Customer Service',
  E'Formal complaints by recorded post or in-branch. Unresolved: Financial Ombudsman Service.',
  'https://www.natwest.com/help.html',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'NatWest' and c.country_code = 'en';

-- Royal Mail
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'complain',
  E'Royal Mail Group Ltd\nCustomer Experience\nPO Box 740\nPlymouth\nPL9 9PX',
  null, 'Customer Experience',
  E'Lost/damaged parcel claims within 80 days of posting. Claim online or by post. Unresolved: POSTRS (postal redress scheme).',
  'https://www.royalmail.com/help',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Royal Mail' and c.country_code = 'en';

-- Evri UK (formerly Hermes)
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'complain',
  E'Evri\nCapitol House\n1 Capitol Close\nMorley\nLeeds\nLS27 0WH',
  null, 'Customer Service',
  E'Report lost/delayed parcels online first. Compensation claims up to £25 (standard) within 28 days.',
  'https://www.evri.com/help',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Evri' and c.country_code = 'en';

-- British Airways
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'complain',
  E'British Airways\nCustomer Relations\nPO Box 5619\nSudbury\nCO10 2PG',
  null, 'Customer Relations',
  E'EU/UK261 compensation claims within 6 years. Online form preferred. Unresolved: CEDR Aviation ADR.',
  'https://www.britishairways.com/en-gb/customer-feedback',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'British Airways' and c.country_code = 'en';

-- PureGym UK
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'PureGym Ltd\nTown Centre House\nMerrion Centre\nLeeds\nLS2 8LY',
  null, 'Member Services',
  E'Cancellation online via member app or in-gym. 1 month notice required.',
  'https://www.puregym.com/membership',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'PureGym' and c.country_code = 'en';

-- ═══════════════════════════════════════════════════════════
-- GERMANY (de)
-- ═══════════════════════════════════════════════════════════

-- Deutsche Telekom
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'Telekom Deutschland GmbH\nKündigung\n53172 Bonn',
  null, 'Kündigung',
  E'Einschreiben mit Rückschein empfohlen. Kündigungsfristen laut Vertrag (meist 3 Monate zum Vertragsende).',
  'https://www.telekom.de/hilfe/vertraege-tarife/kuendigung',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Deutsche Telekom' and c.country_code = 'de';

-- Vodafone DE
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'Vodafone GmbH\nKundenservice\nD-40547 Düsseldorf',
  null, 'Kundenservice Kündigung',
  E'Einschreiben empfohlen. Fax oder Online-Kündigung ebenfalls möglich. Mindestlaufzeit und Kündigungsfristen beachten.',
  'https://www.vodafone.de/hilfe/kündigung.html',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Vodafone' and c.country_code = 'de';

-- O2 DE (Telefónica Germany)
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'Telefónica Germany GmbH & Co. OHG\nKündigungsservice\n90345 Nürnberg',
  null, 'Kündigungsservice',
  E'Einschreiben empfohlen. Online-Kündigung ebenfalls möglich. Kündigungsfristen laut Vertrag.',
  'https://www.o2online.de/service/vertrag-tarife/kuendigung/',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'O2' and c.country_code = 'de';

-- 1&1
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'1&1 Telecommunications SE\nElgendorfer Str. 57\n56410 Montabaur',
  null, 'Kündigung',
  E'Einschreiben mit Rückschein. Online-Kündigung im Kundenportal möglich.',
  'https://hilfe-center.1und1.de',
  '2025-01-01'::timestamptz
from companies c
where c.name = '1&1' and c.country_code = 'de';

-- Allianz DE
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'Allianz Deutschland AG\nKöniginstraße 28\n80802 München',
  null, 'Kündigung / Kundenservice',
  E'Kündigung an die zuständige Allianz-Geschäftsstelle oder per Einschreiben an die Hauptverwaltung.',
  'https://www.allianz.de/service/kontakt/',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Allianz' and c.country_code = 'de';

-- AXA DE
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'AXA Konzern AG\nColonia-Allee 10-20\n51067 Köln',
  null, 'Kündigung / Kundenservice',
  E'Kündigung per Einschreiben oder über Ihren AXA-Berater. Kündigungsfristen laut Vertrag beachten.',
  'https://www.axa.de/service/kontakt',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'AXA' and c.country_code = 'de';

-- HUK-COBURG
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'HUK-COBURG Versicherungsgruppe\nBahnhofsplatz\n96444 Coburg',
  null, 'Kündigung',
  E'Kündigung per Einschreiben bis spätestens 1 Monat vor Ablauf der Versicherungsperiode.',
  'https://www.huk.de/service/kontakt.html',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'HUK-COBURG' and c.country_code = 'de';

-- ERGO DE
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'ERGO Group AG\nVictoriaplatz 2\n40198 Düsseldorf',
  null, 'Kündigung',
  E'Kündigung per Einschreiben. ERGO-Berater kann ebenfalls die Kündigung aufnehmen.',
  'https://www.ergo.de/service/kontakt',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'ERGO' and c.country_code = 'de';

-- Deutsche Bank
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, null,
  E'Deutsche Bank AG\nKundenservice\nTaunusanlage 12\n60325 Frankfurt am Main',
  null, 'Kundenservice',
  E'Beschwerden in Schriftform per Einschreiben. Nicht gelöst: Ombudsmann der privaten Banken.',
  'https://www.deutschebank.de/kontakt',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Deutsche Bank' and c.country_code = 'de';

-- ING DE
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, null,
  E'ING-DiBa AG\nTheo-Heuss-Allee 2\n60486 Frankfurt am Main',
  null, 'Kundenservice',
  E'Direktbank: Beschwerden per Brief oder über Kundenportal. Nicht gelöst: Ombudsmann der privaten Banken.',
  'https://www.ing.de/service/kontakt/',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'ING' and c.country_code = 'de';

-- Deutsche Bahn
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'complain',
  E'DB Fernverkehr AG\nServicecenter Fahrgastrechte\n60647 Frankfurt am Main',
  null, 'Servicecenter Fahrgastrechte',
  E'EU-Fahrgastrechte: Entschädigungsantrag innerhalb von 1 Jahr. Online oder per Brief. Nicht gelöst: söp Schlichtungsstelle.',
  'https://www.bahn.de/service/buchung-zahlung/fahrgastrechte',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Deutsche Bahn' and c.country_code = 'de';

-- Lufthansa
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'complain',
  E'Deutsche Lufthansa AG\nCustomer Relations\nLufthansa Aviation Center\nAirportring\n60546 Frankfurt am Main',
  null, 'Customer Relations',
  E'EU261 flight compensation within 3 years. Online form preferred. Unresolved: söp or national aviation authority.',
  'https://www.lufthansa.com/de/en/complaint-form',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Lufthansa' and c.country_code = 'de';

-- McFit DE
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'RSG Group GmbH\nSachsendamm 93-103\n10829 Berlin',
  null, 'Mitglieder-Service',
  E'Kündigung per Einschreiben an den Club oder an die Zentrale. Kündigungsfristen laut Vertrag beachten.',
  'https://www.mcfit.com/de/service/kuendigung/',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'McFit' and c.country_code = 'de';

-- DHL DE
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'complain',
  E'DHL Paket GmbH\nSträßchensweg 10\n53113 Bonn',
  null, 'Kundenservice',
  E'Verlust- oder Beschädigungsreklamation innerhalb von 6 Wochen. Online oder per Brief.',
  'https://www.dhl.de/de/privatkunden/hilfe/hilfe-paket.html',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'DHL' and c.country_code = 'de';

-- ═══════════════════════════════════════════════════════════
-- SPAIN (es)
-- ═══════════════════════════════════════════════════════════

-- Movistar ES
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'Telefónica de España SAU\nAtención al Cliente – Bajas\nAvenida de Europa 5\n28108 Alcobendas, Madrid',
  null, 'Servicio de Bajas',
  E'Carta certificada con acuse de recibo recomendada. Plazo de preaviso según contrato (mín. 30 días).',
  'https://www.movistar.es/atencion-al-cliente',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Movistar' and c.country_code = 'es';

-- Orange ES
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'Orange España SAU\nServicio de Bajas\nAvenida de América 13\n28028 Madrid',
  null, 'Servicio de Bajas',
  E'Carta certificada con acuse de recibo recomendada. Plazo según contrato.',
  'https://www.orange.es/atencion-al-cliente',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Orange' and c.country_code = 'es';

-- Vodafone ES
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'Vodafone España SAU\nServicio de Bajas\nAvda. de América 115\n28042 Madrid',
  null, 'Servicio de Bajas',
  E'Carta certificada con acuse de recibo. Se puede solicitar la portabilidad simultáneamente.',
  'https://www.vodafone.es/c/ayuda/',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Vodafone' and c.country_code = 'es';

-- Mapfre ES
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'MAPFRE España Compañía de Seguros\nServicio al Asegurado\nCarretera de Pozuelo 52\n28222 Majadahonda, Madrid',
  null, 'Servicio al Asegurado',
  E'Carta certificada con acuse de recibo antes del vencimiento. Preaviso mínimo de 1 mes.',
  'https://www.mapfre.es/atencion-al-cliente/',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Mapfre' and c.country_code = 'es';

-- AXA ES
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'AXA Seguros e Inversiones SA\nServicio de Atención al Cliente\nCalle de Cristóbal Bordiú 53\n28003 Madrid',
  null, 'Atención al Cliente',
  E'Cancelación por carta certificada o a través del mediador/agente AXA.',
  'https://www.axa.es/contacto',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'AXA' and c.country_code = 'es';

-- BBVA
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, null,
  E'Banco Bilbao Vizcaya Argentaria SA\nServicio de Atención al Cliente\nCalle de Azul 4\n28050 Madrid',
  'atencioncliente@bbva.com', 'Atención al Cliente',
  E'Reclamaciones por escrito por carta o correo electrónico. Sin respuesta: Banco de España.',
  'https://www.bbva.es/personas/ayuda.html',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'BBVA' and c.country_code = 'es';

-- Santander ES
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, null,
  E'Banco Santander SA\nServicio de Atención al Cliente\nCiudad Grupo Santander\nAv. de Cantabria s/n\n28660 Boadilla del Monte, Madrid',
  null, 'Atención al Cliente',
  E'Reclamaciones formales por escrito. Plazo de respuesta: 1 mes. No resuelto: Banco de España.',
  'https://www.bancosantander.es/atencion-al-cliente',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Santander' and c.country_code = 'es';

-- Renfe
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'complain',
  E'Renfe-Operadora\nAtención al Cliente\nAvenida de la Ciudad de Barcelona 8\n28007 Madrid',
  null, 'Atención al Cliente',
  E'Reclamación por retraso/cancelación dentro de los 3 meses. En línea o por correo. No resuelto: Ministerio de Transportes.',
  'https://www.renfe.com/es/es/grupo-renfe/atencion-al-cliente',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Renfe' and c.country_code = 'es';

-- ═══════════════════════════════════════════════════════════
-- ITALY (it)
-- ═══════════════════════════════════════════════════════════

-- TIM
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'Telecom Italia SpA\nUfficio Disdette\nCasella Postale 111\n00100 Roma',
  null, 'Ufficio Disdette',
  E'Raccomandata A/R consigliata. Il recesso può essere inviato anche via PEC: servizio.clienti@pec.tim.it',
  'https://www.tim.it/assistenza/fisso-e-internet/disdetta',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'TIM' and c.country_code = 'it';

-- Vodafone IT
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'Vodafone Italia SpA\nUfficio Recesso\nVia Jervis 13\n10015 Ivrea (TO)',
  null, 'Ufficio Recesso',
  E'Raccomandata A/R o PEC: servizioclienti@vodafone.pec.it. Preavviso di 30 giorni.',
  'https://www.vodafone.it/portal/Privati/Assistenza',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Vodafone' and c.country_code = 'it';

-- Wind Tre
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'Wind Tre SpA\nUfficio Disdette\nVia Cesare Giulio Viola 48\n00148 Roma',
  null, 'Ufficio Disdette',
  E'Raccomandata A/R o PEC: windtre@pec.windtre.it. Preavviso contrattuale da rispettare.',
  'https://www.windtre.it/assistenza',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Wind Tre' and c.country_code = 'it';

-- Fastweb IT
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'Fastweb SpA\nUfficio Recesso\nVia Caracciolo 51\n20155 Milano',
  null, 'Ufficio Recesso',
  E'Raccomandata A/R o tramite area clienti online.',
  'https://www.fastweb.it/assistenza/',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Fastweb' and c.country_code = 'it';

-- Generali IT (insurance)
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'Assicurazioni Generali SpA\nUfficio Clienti\nPiazza Duca degli Abruzzi 2\n34132 Trieste',
  null, 'Ufficio Clienti',
  E'Disdetta per raccomandata A/R entro 30 giorni prima della scadenza o tramite agente Generali.',
  'https://www.generali.it/contatti',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Generali' and c.country_code = 'it'
  and c.category in ('insurance_home', 'insurance_car');

-- UnipolSai
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'UnipolSai Assicurazioni SpA\nUfficio Clienti\nVia Stalingrado 45\n40128 Bologna',
  null, 'Ufficio Clienti',
  E'Disdetta per raccomandata A/R entro 30 giorni prima della scadenza o tramite agente.',
  'https://www.unipolsai.it/contatti',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'UnipolSai' and c.country_code = 'it';

-- Allianz IT
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'terminate',
  E'Allianz SpA\nUfficio Clienti\nCorso Italia 23\n20122 Milano',
  null, 'Ufficio Clienti',
  E'Disdetta per raccomandata A/R tramite agente o al servizio clienti.',
  'https://www.allianz.it/contatti.html',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Allianz' and c.country_code = 'it';

-- Intesa Sanpaolo
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, null,
  E'Intesa Sanpaolo SpA\nServizio Clienti\nPiazza San Carlo 156\n10121 Torino',
  null, 'Servizio Clienti',
  E'Reclami in forma scritta tramite filiale, posta raccomandata o PEC. Non risolto: Arbitro Bancario Finanziario (ABF).',
  'https://www.intesasanpaolo.com/it/persona/contatti.html',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Intesa Sanpaolo' and c.country_code = 'it';

-- UniCredit IT
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, null,
  E'UniCredit SpA\nServizio Clienti\nPiazza Gae Aulenti 3 – Tower A\n20154 Milano',
  null, 'Servizio Clienti',
  E'Reclami in forma scritta. Non risolto: ABF (Arbitro Bancario Finanziario).',
  'https://www.unicredit.it/it/contatti.html',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'UniCredit' and c.country_code = 'it';

-- Trenitalia
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'complain',
  E'Trenitalia SpA\nUfficio Relazioni con la Clientela\nPiazza della Croce Rossa 1\n00161 Roma',
  null, 'Relazioni con la Clientela',
  E'Reclamo entro 3 mesi. In linea o per raccomandata A/R. Non risolto: Organismo di Risoluzione Controversie Trasporto.',
  'https://www.trenitalia.com/it/informazioni/contatti.html',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Trenitalia' and c.country_code = 'it';

-- Poste Italiane
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'complain',
  E'Poste Italiane SpA\nUfficio Reclami\nViale Europa 190\n00144 Roma',
  null, 'Ufficio Reclami',
  E'Reclamo entro 30 giorni per raccomandata non recapitata. In linea, ufficio postale o per posta.',
  'https://www.poste.it/contatta-poste-italiane.html',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Poste Italiane' and c.country_code = 'it';

-- ═══════════════════════════════════════════════════════════
-- CROSS-COUNTRY: digital-only services
-- These have no postal address; note guides users to online flow
-- ═══════════════════════════════════════════════════════════

-- Netflix (all countries except FR already handled)
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, null,
  null,
  null, 'Customer Service',
  E'Netflix cancellations are online only — no postal address. Visit netflix.com/cancel or contact support chat.',
  'https://help.netflix.com/node/407',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Netflix' and c.country_code != 'fr';

-- Spotify (all countries except FR)
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, null,
  null,
  null, 'Customer Service',
  E'Spotify cancellations are online only. Visit spotify.com/account to cancel your Premium subscription.',
  'https://support.spotify.com',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Spotify' and c.country_code != 'fr';

-- Disney+
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, null,
  null,
  null, 'Customer Service',
  E'Disney+ cancellations are online only — no postal address. Visit disneyplus.com/account to cancel.',
  'https://help.disneyplus.com/csp',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Disney+';

-- Amazon Prime Video
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, null,
  null,
  null, 'Customer Service',
  E'Amazon Prime Video / Prime membership cancellation is online only via primevideo.com/manage-prime-membership.',
  'https://www.primevideo.com/help/ref=atv_hp_nd_cnt',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Amazon Prime Video';

-- Apple TV+
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, null,
  null,
  null, 'Customer Service',
  E'Apple TV+ cancellation via Apple ID settings (appleid.apple.com) or iPhone/iPad Settings > [Name] > Subscriptions.',
  'https://support.apple.com/en-gb/HT202039',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Apple TV+';

-- Revolut (all countries)
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, null,
  null,
  'support@revolut.com', 'Customer Support',
  E'Revolut is digital-only. Use in-app chat or support@revolut.com for complaints. No walk-in branches.',
  'https://help.revolut.com',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Revolut';

-- N26 (all countries)
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, null,
  null,
  'support@n26.com', 'Customer Support',
  E'N26 is a digital bank — no branches. Contact via in-app chat or support@n26.com for account closures and complaints.',
  'https://support.n26.com',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'N26';

-- Ryanair (all countries)
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'complain',
  E'Ryanair Ltd\nCustomer Service Department\nCorporate Head Office\nDublin Airport\nSwords, Co. Dublin\nIreland',
  null, 'Customer Service',
  E'EU261 claims: submit online first at ryanair.com. Written complaints to Dublin HQ for unresolved cases. ADR: AviationADR.',
  'https://www.ryanair.com/en/us/useful-info/help-centre',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Ryanair';

-- EasyJet (all countries)
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'complain',
  E'easyJet plc\nCustomer Service\nHangar 89\nLondon Luton Airport\nLuton, Bedfordshire\nLU2 9PF',
  null, 'Customer Service',
  E'EU261 claims online at easyjet.com. Written complaints to Luton HQ for unresolved cases.',
  'https://www.easyjet.com/en/help/contact',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'EasyJet';

-- Flixbus (all countries)
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'complain',
  E'FlixMobility GmbH\nKundendienst\nFriedenheimer Brücke 16\n80639 München\nGermany',
  null, 'Customer Service',
  E'Claims and complaints via flixbus.com help centre or by post to Munich HQ.',
  'https://www.flixbus.com/service/contact',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Flixbus';

-- DHL UK + IT (generic; FR and DE have dedicated entries above, ES below)
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'complain',
  null,
  null, 'Customer Service',
  E'DHL claims for lost/damaged parcels must be filed within 21 days. Use the local DHL country website claim form or contact country-specific customer service.',
  'https://www.dhl.com/global-en/home/customer-service.html',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'DHL' and c.country_code in ('en', 'it');

-- DHL ES
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'complain',
  E'DHL Express Spain SL\nAtención al Cliente\nAvda. de Barajas 22\n28042 Madrid',
  null, 'Atención al Cliente',
  E'Reclamación por pérdida o daño en los 21 días siguientes a la entrega prevista.',
  'https://www.dhl.es/es/express/servicio-al-cliente.html',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'DHL' and c.country_code = 'es';

-- Amazon (all remaining countries)
insert into company_contacts (company_id, intent_type, postal_address, email, department, notes, source_url, last_verified_at)
select c.id, 'complain',
  E'Amazon EU SARL\n38 avenue John F. Kennedy\nL-1855 Luxembourg',
  null, 'Customer Service',
  E'Use the Amazon online help centre first (Orders > Problem with order). For formal complaints, a written letter to the Luxembourg address is accepted.',
  'https://www.amazon.com/help/customer/display.html',
  '2025-01-01'::timestamptz
from companies c
where c.name = 'Amazon' and c.country_code in ('en', 'de', 'es', 'it');
