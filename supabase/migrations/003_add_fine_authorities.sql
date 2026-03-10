-- ============================================================
-- dealWithIt — Add French Fine Authorities to Recipients Directory
-- ============================================================

INSERT INTO recipients_directory (company_name, aliases, country, postal_address, email, website, category) VALUES

  -- ANTAI — Agence Nationale de Traitement Automatisé des Infractions
  -- For radar / speed camera fines and automated contraventions
  (
    'ANTAI',
    ARRAY['Agence Nationale de Traitement Automatisé des Infractions', 'Service radar national', 'Centre de traitement des contraventions'],
    'FR',
    'ANTAI — Service de traitement des avis de contravention' || chr(10) || 'CS 41101' || chr(10) || '78201 Mantes-la-Jolie Cedex',
    NULL,
    'antai.gouv.fr',
    'government'
  ),

  -- Officier du Ministère Public — for classic traffic contraventions
  -- Address varies by tribunal/city; user must complete with local tribunal address
  (
    'Officier du Ministère Public',
    ARRAY['OMP', 'Ministère Public', 'Tribunal de Police', 'Tribunal correctionnel'],
    'FR',
    'Monsieur l''Officier du Ministère Public' || chr(10) || 'Tribunal de Police' || chr(10) || '[Adresse du tribunal de la ville concernée — à compléter]',
    NULL,
    'justice.gouv.fr',
    'government'
  ),

  -- Service FPS — RAPO (Recours Administratif Préalable Obligatoire)
  -- Step 1: must be sent to the local municipality / parking manager within 1 month
  (
    'Service FPS — Mairie',
    ARRAY['Forfait Post-Stationnement', 'FPS', 'RAPO stationnement', 'Service stationnement', 'Gestionnaire de stationnement'],
    'FR',
    'Service Forfait Post-Stationnement (RAPO)' || chr(10) || 'Mairie de [ville de l''infraction]' || chr(10) || '[Adresse de la mairie ou du gestionnaire délégué — à compléter]',
    NULL,
    'service-public.fr/particuliers/vosdroits/F35130',
    'government'
  ),

  -- Tribunal du stationnement payant (TSP)
  -- Step 2: appeal here if the RAPO is refused or unanswered within 1 month
  -- Also direct route for majoré (increased) FPS due to late payment
  (
    'Tribunal du stationnement payant',
    ARRAY['TSP', 'Tribunal stationnement', 'Commission du contentieux du stationnement payant'],
    'FR',
    'Tribunal du stationnement payant' || chr(10) || '2 rue Edouard Michaud' || chr(10) || 'CS 25601' || chr(10) || '87056 LIMOGES CEDEX',
    NULL,
    'tribunal-stationnement-payant.fr',
    'government'
  ),

  -- Direction Générale des Finances Publiques — for fines sent to recovery
  (
    'Direction des Finances Publiques',
    ARRAY['DGFiP', 'Trésor Public', 'Service des impôts', 'Centre des finances publiques'],
    'FR',
    'Direction Régionale des Finances Publiques' || chr(10) || '[Adresse du centre local — à compléter]',
    NULL,
    'finances.gouv.fr',
    'government'
  );
