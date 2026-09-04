export type HoraireCours = {
  jour: string;
  horaire: string;
  categorie: string;
  discipline: string;
  lieu: string;
};

export const LIEU_COUBERTIN = 'Gymnase Pierre de Coubertin';
export const LIEU_VIOLETTES = 'Halles des Violettes';

/** Planning officiel saison 2026-2027. */
export const HORAIRES_COURS: HoraireCours[] = [
  {
    jour: 'LUNDI',
    horaire: '20h30 - 22h30',
    categorie: 'Adultes mixte',
    discipline: 'MMA',
    lieu: LIEU_COUBERTIN,
  },
  {
    jour: 'MARDI',
    horaire: '17h00 - 18h30',
    categorie: 'Enfants',
    discipline: 'MMA',
    lieu: LIEU_VIOLETTES,
  },
  {
    jour: 'MARDI',
    horaire: '18h30 - 20h00',
    categorie: 'Adolescents',
    discipline: 'MMA',
    lieu: LIEU_VIOLETTES,
  },
  {
    jour: 'JEUDI',
    horaire: '18h30 - 20h00',
    categorie: 'Adolescents',
    discipline: 'Grappling',
    lieu: LIEU_VIOLETTES,
  },
  {
    jour: 'JEUDI',
    horaire: '20h00 - 22h30',
    categorie: 'Adultes mixte',
    discipline: 'Grappling',
    lieu: LIEU_COUBERTIN,
  },
  {
    jour: 'SAMEDI',
    horaire: '15h00 - 16h00',
    categorie: 'Baby JJB (3-6 ans)',
    discipline: 'Jiu-Jitsu Brésilien',
    lieu: LIEU_COUBERTIN,
  },
  {
    jour: 'SAMEDI',
    horaire: '16h00 - 17h30',
    categorie: 'Enfants',
    discipline: 'MMA',
    lieu: LIEU_COUBERTIN,
  },
  {
    jour: 'SAMEDI',
    horaire: '17h30 - 18h30',
    categorie: 'Section femmes',
    discipline: 'MMA / Grappling',
    lieu: LIEU_COUBERTIN,
  },
  {
    jour: 'SAMEDI',
    horaire: '18h30 - 22h00',
    categorie: 'Adultes mixte',
    discipline: 'Sparring (pour tous)',
    lieu: LIEU_COUBERTIN,
  },
];

export const TARIFS_INDIVIDUELS = [
  {
    title: 'Baby JJB',
    price: '200€/an',
    category: '3-6 ans',
    details: ['Samedi 15h-16h', 'Gymnase Pierre de Coubertin'],
  },
  {
    title: 'Enfants',
    price: '250€/an',
    category: 'MMA',
    details: ['Mardi 17h-18h30 · Halles des Violettes', 'Samedi 16h-17h30 · Gymnase Pierre de Coubertin'],
  },
  {
    title: 'Adolescents',
    price: '250€/an',
    category: 'MMA / Grappling',
    details: ['Mardi 18h30-20h · MMA', 'Jeudi 18h30-20h · Grappling', 'Halles des Violettes'],
  },
  {
    title: 'Adultes mixte',
    price: '300€/an',
    category: 'Homme et femme',
    details: [
      'Accès à tous les cours adultes mixtes',
      'Lundi 20h30-22h30 · MMA',
      'Jeudi 20h-22h30 · Grappling',
      'Samedi 18h30-22h · Sparring',
    ],
    badge: 'POPULAIRE',
  },
  {
    title: 'Section femmes',
    price: '200€/an',
    category: 'Uniquement aux femmes',
    details: ['Un créneau : samedi 17h30-18h30', 'MMA / Grappling', 'Gymnase Pierre de Coubertin'],
  },
] as const;

export const COURS_ACCUEIL = [
  {
    title: 'Baby JJB (3-6 ans)',
    icon: '🥋',
    badge: 'Dès 3 ans',
    description: 'Initiation ludique au Jiu-Jitsu Brésilien',
    horaires: ['Samedi 15h-16h'],
    lieu: LIEU_COUBERTIN,
    prix: '200€/an',
  },
  {
    title: 'Enfants',
    icon: '🥊',
    description: 'MMA adapté aux enfants',
    horaires: ['Mardi 17h-18h30 (Halles des Violettes)', 'Samedi 16h-17h30 (Gymnase Pierre de Coubertin)'],
    prix: '250€/an',
  },
  {
    title: 'Adolescents',
    icon: '💪',
    description: 'MMA et grappling',
    horaires: ['Mardi 18h30-20h · MMA', 'Jeudi 18h30-20h · Grappling', 'Halles des Violettes'],
    prix: '250€/an',
  },
  {
    title: 'Adultes mixte',
    icon: '🔥',
    badge: 'Populaire',
    description: 'Homme et femme — accès à tous les cours adultes mixtes',
    horaires: [
      'Lundi 20h30-22h30 · MMA',
      'Jeudi 20h-22h30 · Grappling',
      'Samedi 18h30-22h · Sparring',
    ],
    lieu: LIEU_COUBERTIN,
    prix: '300€/an',
  },
  {
    title: 'Section femmes',
    icon: '🥊',
    badge: 'Nouveau',
    description: 'Créneau ouvert uniquement aux femmes',
    horaires: ['Samedi 17h30-18h30 · MMA / Grappling'],
    lieu: LIEU_COUBERTIN,
    prix: '200€/an',
  },
] as const;
