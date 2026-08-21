/**
 * Types de la base — écrits à la main d'après `supabase/migrations/`.
 *
 * ⚠️ **PIÈGE À NE PAS REDÉCOUVRIR** (leçon mosquee-fitia) : `postgrest-js` exige une clé
 * **`Relationships: []` sur CHAQUE table**. Sans elle, le schéma cesse de satisfaire
 * `GenericSchema`, le client retombe silencieusement sur `never`, et TOUTES les requêtes
 * échouent au typage avec des messages absurdes (« not assignable to parameter of type
 * 'never' »). Idem pour `Views`/`CompositeTypes` : les laisser vides mais présents,
 * avec `{ [_ in never]: never }`.
 *
 * ➜ À régénérer dès que la base bouge :
 *    supabase gen types typescript --local > packages/supabase/src/database.types.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AppRole =
  | "super_admin"
  | "tresorier"
  | "commissaire"
  | "direction"
  | "administratif"
  | "resp_programme"
  | "donateur";

export type ProgramSlugDb = "social" | "environnement" | "education" | "sante-sport";

export type PaymentMethodDb =
  | "orange-money"
  | "mtn-momo"
  | "moov-money"
  | "wave"
  | "especes"
  | "virement";

export type DonationStatus = "en_attente" | "valide" | "rejete";
/** Choix du donateur : son montant et son message s'affichent-ils sur la page de campagne ? */
export type DonationVisibility = "public" | "prive";
export type BeneficiaryStatus = "actif" | "suivi_termine" | "suspendu";
export type ActivityStatus = "planifie" | "en_cours" | "termine" | "annule";
export type PublicationStatus = "brouillon" | "publie" | "archive";
export type SubmissionStatus = "nouveau" | "en_cours" | "traite" | "archive";

export type DocumentKind =
  | "statuts"
  | "pv_ca"
  | "rapport_activite"
  | "rapport_financier"
  | "justificatif"
  | "autre";

type Timestamps = { created_at: string };

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Timestamps & {
          id: string;
          full_name: string;
          role: AppRole;
          program: ProgramSlugDb | null;
          phone: string | null;
          email: string | null;
          is_active: boolean;
        };
        Insert: {
          id: string;
          full_name: string;
          role?: AppRole;
          program?: ProgramSlugDb | null;
          phone?: string | null;
          email?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<{
          full_name: string;
          role: AppRole;
          program: ProgramSlugDb | null;
          phone: string | null;
          email: string | null;
          is_active: boolean;
        }>;
        Relationships: [];
      };

      beneficiaries: {
        Row: Timestamps & {
          id: string;
          full_name: string;
          program: ProgramSlugDb;
          category: string;
          status: BeneficiaryStatus;
          birth_year: number | null;
          phone: string | null;
          address: string | null;
          details: Json;
          notes: string | null;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          full_name: string;
          program: ProgramSlugDb;
          category: string;
          status?: BeneficiaryStatus;
          birth_year?: number | null;
          phone?: string | null;
          address?: string | null;
          details?: Json;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<{
          full_name: string;
          program: ProgramSlugDb;
          category: string;
          status: BeneficiaryStatus;
          birth_year: number | null;
          phone: string | null;
          address: string | null;
          details: Json;
          notes: string | null;
        }>;
        Relationships: [];
      };

      assistance_records: {
        Row: Timestamps & {
          id: string;
          beneficiary_id: string;
          occurred_on: string;
          kind: string;
          amount_fcfa: number | null;
          description: string | null;
          recorded_by: string | null;
        };
        Insert: {
          id?: string;
          beneficiary_id: string;
          occurred_on?: string;
          kind: string;
          amount_fcfa?: number | null;
          description?: string | null;
          recorded_by?: string | null;
          created_at?: string;
        };
        Update: Partial<{
          occurred_on: string;
          kind: string;
          amount_fcfa: number | null;
          description: string | null;
        }>;
        Relationships: [];
      };

      campaigns: {
        Row: Timestamps & {
          id: string;
          title_fr: string;
          title_ar: string | null;
          program: ProgramSlugDb | null;
          goal_fcfa: number;
          starts_on: string;
          ends_on: string | null;
          status: PublicationStatus;
          description_fr: string | null;
          description_ar: string | null;
          image_url: string | null;
        };
        Insert: {
          id?: string;
          title_fr: string;
          title_ar?: string | null;
          description_fr?: string | null;
          description_ar?: string | null;
          image_url?: string | null;
          program?: ProgramSlugDb | null;
          goal_fcfa: number;
          starts_on?: string;
          ends_on?: string | null;
          status?: PublicationStatus;
          created_at?: string;
        };
        Update: Partial<{
          title_fr: string;
          title_ar: string | null;
          program: ProgramSlugDb | null;
          goal_fcfa: number;
          starts_on: string;
          ends_on: string | null;
          status: PublicationStatus;
          description_fr: string | null;
          description_ar: string | null;
          image_url: string | null;
        }>;
        Relationships: [];
      };

      donations: {
        Row: Timestamps & {
          id: string;
          reference: string;
          amount_fcfa: number;
          program: ProgramSlugDb | null;
          campaign_id: string | null;
          method: PaymentMethodDb;
          status: DonationStatus;
          frequency: string;
          donor_name: string;
          donor_phone: string;
          donor_email: string | null;
          anonymous: boolean;
          message: string | null;
          transaction_ref: string | null;
          validated_by: string | null;
          validated_at: string | null;
          rejection_reason: string | null;
          donor_id: string | null;
          visibility: DonationVisibility;
        };
        Insert: {
          id?: string;
          /** Laisser vide : un trigger pose `DON-AAAA-NNNN` côté base. */
          reference?: string;
          amount_fcfa: number;
          program?: ProgramSlugDb | null;
          campaign_id?: string | null;
          method: PaymentMethodDb;
          status?: DonationStatus;
          frequency?: string;
          donor_name: string;
          donor_phone: string;
          donor_email?: string | null;
          anonymous?: boolean;
          message?: string | null;
          transaction_ref?: string | null;
          donor_id?: string | null;
          visibility?: DonationVisibility;
          created_at?: string;
          /**
           * Renseignés uniquement lors d'une SAISIE AU GUICHET : le Trésorier a l'argent
           * en main, le don naît déjà validé. Un don venu du site public n'a jamais le
           * droit de les remplir — la policy `donations_public_insert` l'interdit.
           */
          validated_by?: string | null;
          validated_at?: string | null;
        };
        Update: Partial<{
          status: DonationStatus;
          program: ProgramSlugDb | null;
          campaign_id: string | null;
          transaction_ref: string | null;
          validated_by: string | null;
          validated_at: string | null;
          rejection_reason: string | null;
        }>;
        Relationships: [];
      };

      expenses: {
        Row: Timestamps & {
          id: string;
          label: string;
          amount_fcfa: number;
          program: ProgramSlugDb | null;
          activity_id: string | null;
          spent_on: string;
          method: PaymentMethodDb;
          proof_path: string | null;
          recorded_by: string | null;
        };
        Insert: {
          id?: string;
          label: string;
          amount_fcfa: number;
          program?: ProgramSlugDb | null;
          activity_id?: string | null;
          spent_on?: string;
          method?: PaymentMethodDb;
          proof_path?: string | null;
          recorded_by?: string | null;
          created_at?: string;
        };
        Update: Partial<{
          label: string;
          amount_fcfa: number;
          program: ProgramSlugDb | null;
          activity_id: string | null;
          spent_on: string;
          method: PaymentMethodDb;
          proof_path: string | null;
        }>;
        Relationships: [];
      };

      activities: {
        Row: Timestamps & {
          id: string;
          title_fr: string;
          title_ar: string | null;
          description_fr: string | null;
          description_ar: string | null;
          program: ProgramSlugDb;
          status: ActivityStatus;
          starts_at: string;
          ends_at: string | null;
          place: string | null;
          city: string | null;
          budget_fcfa: number | null;
          is_public: boolean;
          registration_required: boolean;
          report: string | null;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          title_fr: string;
          title_ar?: string | null;
          description_fr?: string | null;
          description_ar?: string | null;
          program: ProgramSlugDb;
          status?: ActivityStatus;
          starts_at: string;
          ends_at?: string | null;
          place?: string | null;
          city?: string | null;
          budget_fcfa?: number | null;
          is_public?: boolean;
          registration_required?: boolean;
          report?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<{
          title_fr: string;
          title_ar: string | null;
          description_fr: string | null;
          description_ar: string | null;
          status: ActivityStatus;
          starts_at: string;
          ends_at: string | null;
          place: string | null;
          city: string | null;
          budget_fcfa: number | null;
          is_public: boolean;
          registration_required: boolean;
          report: string | null;
        }>;
        Relationships: [];
      };

      news: {
        Row: Timestamps & {
          id: string;
          slug: string;
          program: ProgramSlugDb;
          title_fr: string;
          title_ar: string | null;
          excerpt_fr: string;
          excerpt_ar: string | null;
          body_fr: string;
          body_ar: string | null;
          author: string;
          reading_minutes: number;
          status: PublicationStatus;
          published_at: string | null;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          program: ProgramSlugDb;
          title_fr: string;
          title_ar?: string | null;
          excerpt_fr: string;
          excerpt_ar?: string | null;
          body_fr: string;
          body_ar?: string | null;
          author: string;
          reading_minutes?: number;
          status?: PublicationStatus;
          published_at?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<{
          slug: string;
          program: ProgramSlugDb;
          title_fr: string;
          title_ar: string | null;
          excerpt_fr: string;
          excerpt_ar: string | null;
          body_fr: string;
          body_ar: string | null;
          author: string;
          reading_minutes: number;
          status: PublicationStatus;
          published_at: string | null;
        }>;
        Relationships: [];
      };

      contact_messages: {
        Row: Timestamps & {
          id: string;
          reference: string;
          name: string;
          email: string;
          phone: string | null;
          subject: string;
          message: string;
          status: SubmissionStatus;
          handled_by: string | null;
        };
        Insert: {
          id?: string;
          /** Laisser vide : un trigger pose `MSG-AAAA-NNNN` côté base. */
          reference?: string;
          name: string;
          email: string;
          phone?: string | null;
          subject: string;
          message: string;
          status?: SubmissionStatus;
          created_at?: string;
        };
        Update: Partial<{ status: SubmissionStatus; handled_by: string | null }>;
        Relationships: [];
      };

      volunteer_applications: {
        Row: Timestamps & {
          id: string;
          reference: string;
          full_name: string;
          phone: string;
          email: string | null;
          city: string;
          birth_year: number | null;
          programs: ProgramSlugDb[];
          availability: string[];
          skills: string | null;
          motivation: string;
          wants_membership: boolean;
          status: SubmissionStatus;
          handled_by: string | null;
        };
        Insert: {
          id?: string;
          /** Laisser vide : un trigger pose `BEN-AAAA-NNNN` côté base. */
          reference?: string;
          full_name: string;
          phone: string;
          email?: string | null;
          city: string;
          birth_year?: number | null;
          programs?: ProgramSlugDb[];
          availability?: string[];
          skills?: string | null;
          motivation: string;
          wants_membership?: boolean;
          status?: SubmissionStatus;
          created_at?: string;
        };
        Update: Partial<{ status: SubmissionStatus; handled_by: string | null }>;
        Relationships: [];
      };

      documents: {
        Row: Timestamps & {
          id: string;
          title_fr: string;
          title_ar: string | null;
          kind: DocumentKind;
          year: number | null;
          description: string | null;
          storage_path: string;
          file_name: string;
          file_size: number | null;
          mime_type: string | null;
          is_public: boolean;
          expense_id: string | null;
          uploaded_by: string | null;
        };
        Insert: {
          id?: string;
          title_fr: string;
          title_ar?: string | null;
          kind?: DocumentKind;
          year?: number | null;
          description?: string | null;
          storage_path: string;
          file_name: string;
          file_size?: number | null;
          mime_type?: string | null;
          is_public?: boolean;
          expense_id?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: Partial<{
          title_fr: string;
          title_ar: string | null;
          kind: DocumentKind;
          year: number | null;
          description: string | null;
          is_public: boolean;
          expense_id: string | null;
        }>;
        Relationships: [];
      };

      activity_log: {
        Row: {
          id: number;
          actor_id: string | null;
          action: string;
          entity: string;
          entity_id: string | null;
          details: Json;
          created_at: string;
        };
        Insert: {
          actor_id?: string | null;
          action: string;
          entity: string;
          entity_id?: string | null;
          details?: Json;
          created_at?: string;
        };
        Update: Partial<{ details: Json }>;
        Relationships: [];
      };

      /**
       * Jetons de notification Expo — un appareil, une ligne.
       *
       * ⚠️ Aucune écriture directe depuis un client : l'enregistrement passe par les
       * fonctions `register_push_token` / `unregister_push_token`. Un client ne doit
       * pas pouvoir choisir l'`owner_id` qu'il déclare.
       */
      push_tokens: {
        Row: {
          token: string;
          locale: string;
          platform: string;
          owner_id: string | null;
          created_at: string;
          last_seen_at: string;
        };
        Insert: {
          token: string;
          locale?: string;
          platform?: string;
          owner_id?: string | null;
        };
        Update: Partial<{ locale: string; platform: string; last_seen_at: string }>;
        Relationships: [];
      };
    };

    Views: { [_ in never]: never };

    Functions: {
      dashboard_stats: { Args: Record<string, never>; Returns: Json };
      campaign_progress: { Args: { campaign: string }; Returns: Json };

      /**
       * Dépôts publics — `security definer`, appelées par le site.
       * Elles ÉCRIVENT et ne renvoient que la référence : un visiteur anonyme n'a aucun
       * droit de relecture sur ces tables, et un `insert().select()` échouerait donc à
       * la relecture, pas à l'écriture (message trompeur « violates RLS policy »).
       */
      submit_public_donation: {
        Args: {
          p_amount: number;
          p_program: ProgramSlugDb | null;
          p_method: PaymentMethodDb;
          p_frequency: string;
          p_donor_name: string;
          p_donor_phone: string;
          p_donor_email: string | null;
          p_anonymous: boolean;
          p_message: string | null;
        };
        Returns: string;
      };
      submit_contact_message: {
        Args: {
          p_name: string;
          p_email: string;
          p_subject: string;
          p_message: string;
          p_phone: string | null;
        };
        Returns: string;
      };
      /** Métadonnées des documents publiés — lisible par un visiteur anonyme. */
      public_documents: {
        Args: Record<string, never>;
        Returns: {
          id: string;
          title_fr: string;
          title_ar: string | null;
          kind: DocumentKind;
          year: number | null;
          description: string | null;
          file_name: string;
          file_size: number | null;
          created_at: string;
        }[];
      };
      submit_volunteer_application: {
        Args: {
          p_full_name: string;
          p_phone: string;
          p_city: string;
          p_motivation: string;
          p_programs: ProgramSlugDb[];
          p_availability: string[];
          p_birth_year: number | null;
          p_email: string | null;
          p_skills: string | null;
          p_wants_membership: boolean;
        };
        Returns: string;
      };

      /**
       * Suivi d'un don par son porteur, SANS authentification.
       *
       * ⚠️ Exige la référence ET le numéro saisi lors du don : la référence seule est
       * séquentielle, donc devinable. Ne renvoie que de quoi se repérer et éditer un
       * reçu — ni nom, ni message, ni téléphone.
       */
      donation_status: {
        Args: { p_reference: string; p_phone: string };
        Returns: {
          reference: string;
          amount_fcfa: number;
          program: ProgramSlugDb | null;
          method: PaymentMethodDb;
          status: DonationStatus;
          created_at: string;
          validated_at: string | null;
        }[];
      };

      /**
       * Collectes publiées d'un programme, progression comprise.
       * ⚠️ Une seule requête pour toute la page : appeler `campaign_progress()`
       * campagne par campagne ferait autant d'allers-retours que de collectes.
       */
      public_campaigns: {
        Args: { p_program?: ProgramSlugDb | null };
        Returns: {
          id: string;
          title_fr: string;
          title_ar: string | null;
          description_fr: string | null;
          description_ar: string | null;
          image_url: string | null;
          program: ProgramSlugDb | null;
          goal_fcfa: number;
          collected_fcfa: number;
          donors_count: number;
          starts_on: string;
          ends_on: string | null;
          closed: boolean;
        }[];
      };

      /**
       * Liste publique des dons d'une collecte.
       * ⚠️ SEUL chemin par lequel un visiteur anonyme voit quoi que ce soit de
       * `donations`. Ne renvoie jamais téléphone, email ni identifiant, masque le nom
       * selon `anonymous` et le montant selon `visibility`, et ignore les dons non
       * validés.
       */
      campaign_donors: {
        Args: { p_campaign: string; p_sort?: string; p_limit?: number };
        Returns: {
          display_name: string | null;
          amount_fcfa: number | null;
          message: string | null;
          created_at: string;
        }[];
      };

      /** Enregistre ou rafraîchit le jeton de notification de cet appareil. */
      register_push_token: {
        Args: { p_token: string; p_locale?: string; p_platform?: string };
        Returns: void;
      };

      /** Efface le jeton — désactiver, c'est retirer la trace, pas cesser d'émettre. */
      unregister_push_token: {
        Args: { p_token: string };
        Returns: void;
      };
    };

    Enums: {
      app_role: AppRole;
      program_slug: ProgramSlugDb;
      payment_method: PaymentMethodDb;
      donation_status: DonationStatus;
      beneficiary_status: BeneficiaryStatus;
      activity_status: ActivityStatus;
      publication_status: PublicationStatus;
      submission_status: SubmissionStatus;
      document_kind: DocumentKind;
    };

    CompositeTypes: { [_ in never]: never };
  };
};

/** Raccourcis de lecture — évite `Database["public"]["Tables"]["x"]["Row"]` partout. */
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Inserts<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type Updates<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
