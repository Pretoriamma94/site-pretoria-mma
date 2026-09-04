/** Rappel des obligations — formulaires papier MMA (mixte, enfants/ados) et Baby JJB. */

export type ObligationAdherent = {
  n: number;
  text: string;
  items?: readonly string[];
};

export const OBLIGATIONS_ADHERENT: readonly ObligationAdherent[] = [
  {
    n: 1,
    text: 'L’adhésion au Club implique l’approbation des Statuts du Club et de son Règlement Intérieur, consultables au Siège.',
  },
  {
    n: 2,
    text: 'L’adhésion n’est effective qu’après :',
    items: [
      'Présentation d’un certificat médical ou du questionnaire santé, en fonction de la procédure du Ministère des Sports, et/ou de la Fédération concernée',
      'Du règlement de la cotisation annuelle, non remboursable.',
    ],
  },
  {
    n: 3,
    text: 'Aucun enfant mineur ne sera inscrit sans autorisation parentale.',
  },
  {
    n: 4,
    text: 'La responsabilité du Club n’est engagée que lorsque les parents ou le représentant légal ont confié l’enfant à l’animateur responsable du cours, sur le lieu d’entraînement ou de convocation pour une compétition.',
  },
  {
    n: 5,
    text: 'L’absence d’un animateur entraînant l’annulation des cours sera annoncée par tous les moyens à disposition de l’Association, tenant compte des informations transmises par l’adhérent ou ses parents.',
  },
  {
    n: 6,
    text: 'Aucun enfant mineur ne peut quitter, seul, le lieu d’entraînement ou de compétition si les parents ou le représentant légal n’ont pas signé d’autorisation.',
  },
  {
    n: 7,
    text: 'Respect du Règlement Général des Équipements Sportifs de la municipalité.',
  },
  {
    n: 8,
    text: 'Une bonne tenue, le respect des personnes et du matériel sont de règle au sein de l’association. Tout membre se faisant remarquer par une mauvaise conduite ou des propos incorrects, lors des entraînements ou des déplacements, pourra être exclu temporairement ou définitivement, après avoir été entendu par un comité directeur exceptionnel.',
  },
  {
    n: 9,
    text: 'En cas de problème de santé ou d’accident, lors d’entraînements, manifestations ou compétitions organisés par l’association. Il sera fait appel aux services d’urgences qui avisera de la meilleure conduite à tenir.',
  },
  {
    n: 10,
    text: 'Les adhérents après un fait grave de santé ou après un arrêt maladie supérieur à 3 semaines, doivent obligatoirement fournir à l’association un certificat médical les autorisant à reprendre le sport.',
  },
  {
    n: 11,
    text: 'Tout adhérent, représentant de par son adhésion Pretoria MMA, devra se comporter dans tous les actes de sa vie en appliquant les valeurs sportives et citoyennes sous peine de radiation.',
  },
];
