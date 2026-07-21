export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          nom: string | null;
          prenom: string | null;
          telephone: string | null;
          date_naissance: string | null; // date
          adresse: string | null;
          ville: string | null;
          code_postal: string | null;
          niveau: Database['public']['Enums']['niveau_type'] | null;
          date_inscription: string | null; // timestamptz
          statut_abonnement: Database['public']['Enums']['statut_abonnement_type'] | null;
          type_abonnement: Database['public']['Enums']['type_abonnement_type'] | null;
          date_fin_abonnement: string | null; // date
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          email?: string | null;
          nom?: string | null;
          prenom?: string | null;
          telephone?: string | null;
          date_naissance?: string | null;
          adresse?: string | null;
          ville?: string | null;
          code_postal?: string | null;
          niveau?: Database['public']['Enums']['niveau_type'] | null;
          date_inscription?: string | null;
          statut_abonnement?: Database['public']['Enums']['statut_abonnement_type'] | null;
          type_abonnement?: Database['public']['Enums']['type_abonnement_type'] | null;
          date_fin_abonnement?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          titre: string;
          slug: string;
          contenu: string;
          resume: string | null;
          image_url: string | null;
          /** URLs publiques galerie (compétitions, etc.) */
          galerie_urls: string[];
          categorie: Database['public']['Enums']['categorie_type'];
          auteur_id: string | null;
          publie: boolean;
          date_publication: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          titre: string;
          slug: string;
          contenu: string;
          resume?: string | null;
          image_url?: string | null;
          galerie_urls?: string[];
          categorie: Database['public']['Enums']['categorie_type'];
          auteur_id?: string | null;
          publie?: boolean;
          date_publication?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['posts']['Insert']>;
        Relationships: [];
      };
      contact_messages: {
        Row: {
          id: string;
          nom: string;
          email: string;
          sujet: string;
          message: string;
          traite: boolean;
          date_traitement: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          nom: string;
          email: string;
          sujet: string;
          message: string;
          traite?: boolean;
          date_traitement?: string | null;
          created_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['contact_messages']['Insert']>;
        Relationships: [];
      };
      coaches: {
        Row: {
          id: string;
          nom: string;
          prenom: string;
          bio: string | null;
          photo_url: string | null;
          specialites: string[] | null;
          diplomes: string[] | null;
          ordre_affichage: number | null;
          actif: boolean;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          nom: string;
          prenom: string;
          bio?: string | null;
          photo_url?: string | null;
          specialites?: string[] | null;
          diplomes?: string[] | null;
          ordre_affichage?: number | null;
          actif?: boolean;
          created_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['coaches']['Insert']>;
        Relationships: [];
      };
      documents: {
        Row: {
          id: string;
          titre: string;
          description: string | null;
          type: Database['public']['Enums']['document_type'];
          fichier_url: string;
          version: string | null;
          obligatoire: boolean;
          pour_enfants: boolean;
          pour_adultes: boolean;
          actif: boolean;
          ordre_affichage: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          titre: string;
          description?: string | null;
          type: Database['public']['Enums']['document_type'];
          fichier_url: string;
          version?: string | null;
          obligatoire?: boolean;
          pour_enfants?: boolean;
          pour_adultes?: boolean;
          actif?: boolean;
          ordre_affichage?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['documents']['Insert']>;
        Relationships: [];
      };
      member_documents: {
        Row: {
          id: string;
          member_id: string;
          document_id: string;
          consulte: boolean;
          date_consultation: string | null;
          signe: boolean;
          date_signature: string | null;
          signature_data: string | null;
          ip_signature: string | null;
          fichier_signe_url: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          member_id: string;
          document_id: string;
          consulte?: boolean;
          date_consultation?: string | null;
          signe?: boolean;
          date_signature?: string | null;
          signature_data?: string | null;
          ip_signature?: string | null;
          fichier_signe_url?: string | null;
          created_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['member_documents']['Insert']>;
        Relationships: [];
      };
      schedules: {
        Row: {
          id: string;
          jour_semaine: Database['public']['Enums']['jour_semaine_type'];
          heure_debut: string; // time
          heure_fin: string; // time
          niveau: string | null;
          type_cours: string | null;
          salle: string | null;
          professeur_id: string | null;
          actif: boolean;
        };
        Insert: {
          id?: string;
          jour_semaine: Database['public']['Enums']['jour_semaine_type'];
          heure_debut: string;
          heure_fin: string;
          niveau?: string | null;
          type_cours?: string | null;
          salle?: string | null;
          professeur_id?: string | null;
          actif?: boolean;
        };
        Update: Partial<Database['public']['Tables']['schedules']['Insert']>;
        Relationships: [];
      };
      inscriptions: {
        Row: {
          id: string;
          status: Database['public']['Enums']['inscription_status_type'];
          /** Année scolaire d’adhésion, ex. 2026/2027 */
          annee_scolaire: string;
          nom: string;
          prenom: string;
          email: string;
          telephone: string;
          date_naissance: string | null;
          adresse: string;
          numero_voie: string | null;
          rue: string | null;
          code_postal: string;
          ville: string;
          responsable_legal: Json | null;
          cours_selectionne: string;
          inscription_familiale: boolean;
          membre_2: Json | null;
          type_tarif: string;
          montant_total: number;
          certificat_medical_url: string | null;
          autorisation_parentale_url: string | null;
          accepte_reglement: boolean;
          atteste_certificat: boolean;
          certificat_engagement_3_semaines: boolean;
          autorisation_engagement_3_semaines: boolean;
          photo_url: string | null;
          photo_engagement_3_semaines: boolean;
          accepte_charte: boolean;
          autorise_photos: boolean | null;
          autorise_sortie_seul: boolean | null;
          autorise_voiture_privee: boolean | null;
          informe_assurance_individuelle: boolean;
          informe_droit_acces: boolean;
          helloasso_payment_id: string | null;
          helloasso_payment_url: string | null;
          date_paiement: string | null;
          /** Phase 1 — null tant que non renseigné côté admin */
          mode_paiement: Database['public']['Enums']['mode_paiement_type'] | null;
          /** Phase 1 — 1, 2 ou 3 échéances */
          nombre_echeances: number | null;
          /** Phase 1 — montant déjà encaissé (suivi soldes) */
          montant_paye: number | null;
          taille_cm: number | null;
          poids_kg: number | null;
          /** Taille tenue club : XS–XXXL */
          taille_tenue: string | null;
          sexe: Database['public']['Enums']['sexe_type'] | null;
          type_profil: Database['public']['Enums']['type_profil_type'] | null;
          dossier_status: Database['public']['Enums']['dossier_status_type'];
          attestation_questionnaire_sante: boolean;
          autorisation_pratique_mineur: boolean | null;
          autorisation_soins_urgence: boolean | null;
          accepte_rgpd: boolean;
          created_at: string | null;
          updated_at: string | null;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          status?: Database['public']['Enums']['inscription_status_type'];
          annee_scolaire?: string;
          nom: string;
          prenom: string;
          email: string;
          telephone: string;
          date_naissance?: string | null;
          adresse: string;
          numero_voie?: string | null;
          rue?: string | null;
          code_postal: string;
          ville: string;
          responsable_legal?: Json | null;
          cours_selectionne: string;
          inscription_familiale?: boolean;
          membre_2?: Json | null;
          type_tarif?: string;
          montant_total: number;
          certificat_medical_url?: string | null;
          autorisation_parentale_url?: string | null;
          accepte_reglement?: boolean;
          atteste_certificat?: boolean;
          certificat_engagement_3_semaines?: boolean;
          autorisation_engagement_3_semaines?: boolean;
          photo_url?: string | null;
          photo_engagement_3_semaines?: boolean;
          accepte_charte?: boolean;
          autorise_photos?: boolean | null;
          autorise_sortie_seul?: boolean | null;
          autorise_voiture_privee?: boolean | null;
          informe_assurance_individuelle?: boolean;
          informe_droit_acces?: boolean;
          helloasso_payment_id?: string | null;
          helloasso_payment_url?: string | null;
          date_paiement?: string | null;
          mode_paiement?: Database['public']['Enums']['mode_paiement_type'] | null;
          nombre_echeances?: number | null;
          montant_paye?: number | null;
          taille_cm?: number | null;
          poids_kg?: number | null;
          taille_tenue?: string | null;
          sexe?: Database['public']['Enums']['sexe_type'] | null;
          type_profil?: Database['public']['Enums']['type_profil_type'] | null;
          dossier_status?: Database['public']['Enums']['dossier_status_type'];
          attestation_questionnaire_sante?: boolean;
          autorisation_pratique_mineur?: boolean | null;
          autorisation_soins_urgence?: boolean | null;
          accepte_rgpd?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
          expires_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['inscriptions']['Insert']>;
        Relationships: [];
      };
      inscription_paiements: {
        Row: {
          id: string;
          inscription_id: string;
          montant: number;
          mode_paiement: Database['public']['Enums']['mode_paiement_type'];
          date_reception: string;
          numero_echeance: number | null;
          preuve_url: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          inscription_id: string;
          montant: number;
          mode_paiement: Database['public']['Enums']['mode_paiement_type'];
          date_reception: string;
          numero_echeance?: number | null;
          preuve_url?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['inscription_paiements']['Insert']>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      niveau_type:
        | 'enfant_debutant'
        | 'enfant_confirme'
        | 'adulte_debutant'
        | 'adulte_confirme';
      statut_abonnement_type: 'actif' | 'expire' | 'en_attente';
      type_abonnement_type: 'mensuel' | 'trimestriel' | 'annuel';
      categorie_type: 'evenement' | 'competition' | 'vie_du_club' | 'conseils';
      document_type:
        | 'charte'
        | 'formulaire_adhesion'
        | 'reglement_interieur'
        | 'decharge_responsabilite'
        | 'informatif';
      jour_semaine_type:
        | 'lundi'
        | 'mardi'
        | 'mercredi'
        | 'jeudi'
        | 'vendredi'
        | 'samedi'
        | 'dimanche';
      inscription_status_type:
        | 'pending_payment'
        | 'paid'
        | 'validated'
        | 'finalized'
        | 'cancelled';
      mode_paiement_type: 'cash' | 'cheque' | 'virement';
      sexe_type: 'homme' | 'femme';
      type_profil_type: 'adulte' | 'mineur';
      dossier_status_type: 'pre_inscrit' | 'incomplet' | 'complet';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Post = Database['public']['Tables']['posts']['Row'];
export type ContactMessage = Database['public']['Tables']['contact_messages']['Row'];
export type Coach = Database['public']['Tables']['coaches']['Row'];
export type Document = Database['public']['Tables']['documents']['Row'];
export type MemberDocument = Database['public']['Tables']['member_documents']['Row'];
export type Schedule = Database['public']['Tables']['schedules']['Row'];
export type Inscription = Database['public']['Tables']['inscriptions']['Row'];
export type InscriptionPaiement = Database['public']['Tables']['inscription_paiements']['Row'];
