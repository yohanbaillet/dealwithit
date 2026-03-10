-- ============================================================
-- dealWithIt — Seed Recipients Directory
-- ============================================================

insert into recipients_directory (company_name, aliases, country, postal_address, email, website, category) values
  -- France — Telecom
  ('Orange', array['France Telecom'], 'FR', 'Orange - Service Client, TSA 70007, 06901 Sophia Antipolis Cedex', 'serviceclient@orange.fr', 'orange.fr', 'telecom'),
  ('SFR', array['Numericable-SFR'], 'FR', 'SFR - Service Client, TSA 20102, 92895 Nanterre Cedex 9', NULL, 'sfr.fr', 'telecom'),
  ('Free', array['Iliad', 'Free Mobile'], 'FR', 'Free - Service Client, 75371 Paris Cedex 08', NULL, 'free.fr', 'telecom'),
  ('Bouygues Telecom', array['Bouygues'], 'FR', 'Bouygues Telecom - Service Client, TSA 59013, 60643 Chantilly Cedex', NULL, 'bouyguestelecom.fr', 'telecom'),

  -- France — Insurance
  ('AXA', array['AXA Assurances'], 'FR', 'AXA France - Service Client, 313 Terrasses de l''Arche, 92727 Nanterre Cedex', NULL, 'axa.fr', 'insurance'),
  ('MAIF', array['Mutuelle Assurance'], 'FR', 'MAIF - 79038 Niort Cedex 9', 'contact@maif.fr', 'maif.fr', 'insurance'),
  ('Allianz', array['Allianz France'], 'FR', 'Allianz - Service Résiliation, 1 cours Michelet, CS 30051, 92076 Paris La Défense', NULL, 'allianz.fr', 'insurance'),
  ('MACIF', array['Mutuelle Assurance Artisans'], 'FR', 'MACIF - 2-4 rue de Pied de Fond, 79000 Niort', NULL, 'macif.fr', 'insurance'),
  ('Groupama', NULL, 'FR', 'Groupama - 8-10 rue d''Astorg, 75008 Paris', NULL, 'groupama.fr', 'insurance'),

  -- France — Gym / Sport
  ('Basic-Fit', array['Basic Fit'], 'FR', 'Basic-Fit France - Service Résiliation, TSA 20001, 75634 Paris Cedex 13', 'service-client@basic-fit.com', 'basic-fit.fr', 'gym'),
  ('Fitness Park', NULL, 'FR', 'Fitness Park - Service Client, 80 rue Lecourbe, 75015 Paris', NULL, 'fitnesspark.fr', 'gym'),
  ('Neoness', NULL, 'FR', 'Neoness - Service Résiliation, 4 rue Roubo, 75011 Paris', 'contact@neoness.fr', 'neoness.fr', 'gym'),
  ('Keepcool', NULL, 'FR', 'Keepcool - Service Client, 26 rue du Helder, 75009 Paris', NULL, 'keepcool.fr', 'gym'),

  -- France — Energy
  ('EDF', array['EDF Électricité de France'], 'FR', 'EDF - Service Client, TSA 20016, 69811 Saint-Priest Cedex 9', NULL, 'edf.fr', 'utility'),
  ('Engie', array['GDF Suez', 'Gaz de France'], 'FR', 'Engie - Service Client, TSA 40000, 59898 Lille Cedex 9', NULL, 'engie.fr', 'utility'),
  ('TotalEnergies', array['Total Direct Energie'], 'FR', 'TotalEnergies - Service Client, BP 80139, 92143 Clamart Cedex', NULL, 'totalenergies.fr', 'utility'),

  -- France — Streaming / Subscriptions
  ('Netflix', NULL, 'FR', NULL, NULL, 'netflix.com', 'streaming'),
  ('Canal+', array['CanalPlus', 'Canal Plus'], 'FR', 'Canal+ - Service Client, TSA 50002, 92130 Issy-les-Moulineaux Cedex 9', NULL, 'canalplus.com', 'streaming'),

  -- France — Banking
  ('BNP Paribas', array['BNP'], 'FR', 'BNP Paribas - Service Client, TSA 41002, 92900 Paris La Défense Cedex', NULL, 'bnpparibas.fr', 'bank'),
  ('Crédit Agricole', array['CA', 'Credit Agricole'], 'FR', 'Crédit Agricole - 12 place des États-Unis, 92127 Montrouge Cedex', NULL, 'credit-agricole.fr', 'bank'),
  ('Société Générale', array['SG', 'Societe Generale'], 'FR', 'Société Générale - Service Client, TSA 20100, 75312 Paris Cedex 09', NULL, 'societegenerale.fr', 'bank'),
  ('Boursorama', array['Boursobank'], 'FR', 'Boursorama Banque - 44 rue Traversière, 92772 Boulogne-Billancourt Cedex', NULL, 'boursorama.com', 'bank'),

  -- Government France
  ('CPAM', array['Caisse Primaire Assurance Maladie', 'Sécurité Sociale'], 'FR', 'CPAM - adresse locale selon département', NULL, 'ameli.fr', 'government'),
  ('CAF', array['Caisse Allocations Familiales'], 'FR', 'CAF - adresse locale selon département', NULL, 'caf.fr', 'government'),
  ('Pôle Emploi', array['France Travail'], 'FR', 'France Travail - adresse locale', NULL, 'francetravail.fr', 'government'),
  ('URSSAF', NULL, 'FR', 'URSSAF - adresse régionale selon activité', NULL, 'urssaf.fr', 'government'),

  -- UK
  ('BT', array['British Telecom'], 'GB', 'BT Consumer, Providence Row, Durham, DH98 1BT', NULL, 'bt.com', 'telecom'),
  ('Virgin Media', NULL, 'GB', 'Virgin Media, Sunderland, SR43 4AA', NULL, 'virginmedia.com', 'telecom'),
  ('Sky', NULL, 'GB', 'Sky, PO Box 43, Livingston, EH54 7DD', NULL, 'sky.com', 'telecom'),
  ('PureGym', NULL, 'GB', 'PureGym Limited, Town Centre House, Merrion Centre, Leeds, LS2 8LY', 'help@puregym.com', 'puregym.com', 'gym'),

  -- Germany
  ('Deutsche Telekom', array['Telekom', 'T-Mobile'], 'DE', 'Deutsche Telekom AG, Kundendienst, 53714 Troisdorf', NULL, 'telekom.de', 'telecom'),
  ('Vodafone Germany', array['Vodafone DE'], 'DE', 'Vodafone GmbH, Kundenservice, 40875 Ratingen', NULL, 'vodafone.de', 'telecom'),
  ('McFit', NULL, 'DE', 'RSG Group GmbH, Revaler Str. 100, 10245 Berlin', NULL, 'mcfit.com', 'gym'),

  -- USA
  ('AT&T', NULL, 'US', 'AT&T Customer Service, PO Box 5014, Carol Stream, IL 60197-5014', NULL, 'att.com', 'telecom'),
  ('Verizon', NULL, 'US', 'Verizon Customer Service, PO Box 4833, Trenton, NJ 08650', NULL, 'verizon.com', 'telecom'),
  ('Planet Fitness', NULL, 'US', 'Planet Fitness - adresse locale selon club', NULL, 'planetfitness.com', 'gym'),
  ('LA Fitness', NULL, 'US', 'LA Fitness - adresse locale selon club', NULL, 'lafitness.com', 'gym'),

  -- Spain
  ('Movistar', array['Telefónica'], 'ES', 'Movistar - C/ Gran Vía, 28, 28013 Madrid', NULL, 'movistar.es', 'telecom'),
  ('Vodafone Spain', array['Vodafone ES'], 'ES', 'Vodafone España S.A.U., Avda. América, 115, 28042 Madrid', NULL, 'vodafone.es', 'telecom'),

  -- Italy
  ('TIM', array['Telecom Italia'], 'IT', 'TIM - Via Gaetano Negri, 1, 20123 Milano', NULL, 'tim.it', 'telecom'),
  ('Vodafone Italy', array['Vodafone IT'], 'IT', 'Vodafone Italia S.p.A., Via Jervis, 13, 10015 Ivrea (TO)', NULL, 'vodafone.it', 'telecom');
