export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ai_prompt_versions: {
        Row: {
          change_notes: string | null
          content: string
          created_at: string
          created_by: string | null
          id: string
          model_settings: Json
          prompt_name: string
          published_at: string | null
          published_by: string | null
          status: Database["public"]["Enums"]["prompt_status"]
          version: number
        }
        Insert: {
          change_notes?: string | null
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          model_settings?: Json
          prompt_name: string
          published_at?: string | null
          published_by?: string | null
          status?: Database["public"]["Enums"]["prompt_status"]
          version: number
        }
        Update: {
          change_notes?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          model_settings?: Json
          prompt_name?: string
          published_at?: string | null
          published_by?: string | null
          status?: Database["public"]["Enums"]["prompt_status"]
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "ai_prompt_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_prompt_versions_published_by_fkey"
            columns: ["published_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      answer_evaluations: {
        Row: {
          answer_id: string
          created_at: string
          evaluator_confidence: number
          follow_up_question: string | null
          id: string
          ideal_answer: string | null
          improvement_advice: string | null
          incorrect_statements: Json
          missing_points: Json
          model_used: string | null
          prompt_version_id: string | null
          scores: Json
          strengths: Json
          weighted_score: number
        }
        Insert: {
          answer_id: string
          created_at?: string
          evaluator_confidence?: number
          follow_up_question?: string | null
          id?: string
          ideal_answer?: string | null
          improvement_advice?: string | null
          incorrect_statements?: Json
          missing_points?: Json
          model_used?: string | null
          prompt_version_id?: string | null
          scores?: Json
          strengths?: Json
          weighted_score: number
        }
        Update: {
          answer_id?: string
          created_at?: string
          evaluator_confidence?: number
          follow_up_question?: string | null
          id?: string
          ideal_answer?: string | null
          improvement_advice?: string | null
          incorrect_statements?: Json
          missing_points?: Json
          model_used?: string | null
          prompt_version_id?: string | null
          scores?: Json
          strengths?: Json
          weighted_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "answer_evaluations_answer_id_fkey"
            columns: ["answer_id"]
            isOneToOne: false
            referencedRelation: "candidate_answers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answer_evaluations_prompt_version_id_fkey"
            columns: ["prompt_version_id"]
            isOneToOne: false
            referencedRelation: "ai_prompt_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_candidates: {
        Row: {
          assessment_id: string
          candidate_email: string
          candidate_id: string | null
          completed_at: string | null
          created_at: string
          expires_at: string | null
          id: string
          integrity_flagged: boolean
          integrity_score: number | null
          integrity_summary: Json
          invite_token: string
          invited_at: string
          opened_at: string | null
          recruiter_notes: string | null
          score: number | null
          session_id: string | null
          status: Database["public"]["Enums"]["assessment_candidate_status"]
        }
        Insert: {
          assessment_id: string
          candidate_email: string
          candidate_id?: string | null
          completed_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          integrity_flagged?: boolean
          integrity_score?: number | null
          integrity_summary?: Json
          invite_token?: string
          invited_at?: string
          opened_at?: string | null
          recruiter_notes?: string | null
          score?: number | null
          session_id?: string | null
          status?: Database["public"]["Enums"]["assessment_candidate_status"]
        }
        Update: {
          assessment_id?: string
          candidate_email?: string
          candidate_id?: string | null
          completed_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          integrity_flagged?: boolean
          integrity_score?: number | null
          integrity_summary?: Json
          invite_token?: string
          invited_at?: string
          opened_at?: string | null
          recruiter_notes?: string | null
          score?: number | null
          session_id?: string | null
          status?: Database["public"]["Enums"]["assessment_candidate_status"]
        }
        Relationships: [
          {
            foreignKeyName: "assessment_candidates_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_candidates_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_candidates_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          anti_cheating_settings: Json
          branding: Json
          candidate_limit: number | null
          coding_challenge_ids: string[]
          created_at: string
          created_by: string | null
          deleted_at: string | null
          duration_minutes: number
          expires_at: string | null
          id: string
          interview_mode: string
          invitation_token: string
          job_role: string | null
          organization_id: string
          passing_score: number | null
          question_ids: string[]
          status: Database["public"]["Enums"]["content_status"]
          technology_ids: string[]
          title: string
          topic_ids: string[]
          updated_at: string
        }
        Insert: {
          anti_cheating_settings?: Json
          branding?: Json
          candidate_limit?: number | null
          coding_challenge_ids?: string[]
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          duration_minutes?: number
          expires_at?: string | null
          id?: string
          interview_mode?: string
          invitation_token?: string
          job_role?: string | null
          organization_id: string
          passing_score?: number | null
          question_ids?: string[]
          status?: Database["public"]["Enums"]["content_status"]
          technology_ids?: string[]
          title: string
          topic_ids?: string[]
          updated_at?: string
        }
        Update: {
          anti_cheating_settings?: Json
          branding?: Json
          candidate_limit?: number | null
          coding_challenge_ids?: string[]
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          duration_minutes?: number
          expires_at?: string | null
          id?: string
          interview_mode?: string
          invitation_token?: string
          job_role?: string | null
          organization_id?: string
          passing_score?: number | null
          question_ids?: string[]
          status?: Database["public"]["Enums"]["content_status"]
          technology_ids?: string[]
          title?: string
          topic_ids?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "recruiter_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          metadata: Json
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_answers: {
        Row: {
          answer_text: string
          created_at: string
          duration_seconds: number | null
          id: string
          is_retry: boolean
          question_id: string
          session_id: string
          submitted_at: string
          transcript: Json | null
        }
        Insert: {
          answer_text: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          is_retry?: boolean
          question_id: string
          session_id: string
          submitted_at?: string
          transcript?: Json | null
        }
        Update: {
          answer_text?: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          is_retry?: boolean
          question_id?: string
          session_id?: string
          submitted_at?: string
          transcript?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "interview_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      code_submissions: {
        Row: {
          candidate_id: string
          challenge_id: string
          created_at: string
          evaluation: Json
          execution_result: Json
          id: string
          language: string
          passed_test_count: number
          session_id: string | null
          source_code: string
          space_complexity_estimate: string | null
          status: string
          submitted_at: string
          time_complexity_estimate: string | null
          total_test_count: number
        }
        Insert: {
          candidate_id: string
          challenge_id: string
          created_at?: string
          evaluation?: Json
          execution_result?: Json
          id?: string
          language: string
          passed_test_count?: number
          session_id?: string | null
          source_code: string
          space_complexity_estimate?: string | null
          status?: string
          submitted_at?: string
          time_complexity_estimate?: string | null
          total_test_count?: number
        }
        Update: {
          candidate_id?: string
          challenge_id?: string
          created_at?: string
          evaluation?: Json
          execution_result?: Json
          id?: string
          language?: string
          passed_test_count?: number
          session_id?: string | null
          source_code?: string
          space_complexity_estimate?: string | null
          status?: string
          submitted_at?: string
          time_complexity_estimate?: string | null
          total_test_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "code_submissions_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "code_submissions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "coding_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "code_submissions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      coding_challenges: {
        Row: {
          constraints: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          examples: Json
          expected_space_complexity: string | null
          expected_time_complexity: string | null
          id: string
          memory_limit_mb: number
          problem_statement: string
          rubric: Json
          slug: string
          starter_code: Json
          status: Database["public"]["Enums"]["content_status"]
          supported_languages: string[]
          technology_id: string | null
          time_limit_ms: number
          title: string
          topic_id: string | null
          updated_at: string
        }
        Insert: {
          constraints?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          examples?: Json
          expected_space_complexity?: string | null
          expected_time_complexity?: string | null
          id?: string
          memory_limit_mb?: number
          problem_statement: string
          rubric?: Json
          slug: string
          starter_code?: Json
          status?: Database["public"]["Enums"]["content_status"]
          supported_languages?: string[]
          technology_id?: string | null
          time_limit_ms?: number
          title: string
          topic_id?: string | null
          updated_at?: string
        }
        Update: {
          constraints?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          examples?: Json
          expected_space_complexity?: string | null
          expected_time_complexity?: string | null
          id?: string
          memory_limit_mb?: number
          problem_statement?: string
          rubric?: Json
          slug?: string
          starter_code?: Json
          status?: Database["public"]["Enums"]["content_status"]
          supported_languages?: string[]
          technology_id?: string | null
          time_limit_ms?: number
          title?: string
          topic_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coding_challenges_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coding_challenges_technology_id_fkey"
            columns: ["technology_id"]
            isOneToOne: false
            referencedRelation: "technologies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coding_challenges_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      coding_test_cases: {
        Row: {
          challenge_id: string
          created_at: string
          expected_output: string
          id: string
          input: string
          is_hidden: boolean
          order_index: number
          weight: number
        }
        Insert: {
          challenge_id: string
          created_at?: string
          expected_output: string
          id?: string
          input: string
          is_hidden?: boolean
          order_index?: number
          weight?: number
        }
        Update: {
          challenge_id?: string
          created_at?: string
          expected_output?: string
          id?: string
          input?: string
          is_hidden?: boolean
          order_index?: number
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "coding_test_cases_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "coding_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_questions: {
        Row: {
          asked_at: string | null
          body: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          expected_concepts: Json
          experience_levels: Database["public"]["Enums"]["experience_level"][]
          generated_by: string
          id: string
          max_score: number
          order_index: number | null
          question_type: Database["public"]["Enums"]["question_type"]
          reference_answer: string | null
          rubric: Json
          session_id: string | null
          source_question_id: string | null
          status: Database["public"]["Enums"]["content_status"]
          suggested_follow_ups: Json
          technology_id: string
          title: string | null
          topic_id: string | null
          updated_at: string
        }
        Insert: {
          asked_at?: string | null
          body: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          expected_concepts?: Json
          experience_levels?: Database["public"]["Enums"]["experience_level"][]
          generated_by?: string
          id?: string
          max_score?: number
          order_index?: number | null
          question_type?: Database["public"]["Enums"]["question_type"]
          reference_answer?: string | null
          rubric?: Json
          session_id?: string | null
          source_question_id?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          suggested_follow_ups?: Json
          technology_id: string
          title?: string | null
          topic_id?: string | null
          updated_at?: string
        }
        Update: {
          asked_at?: string | null
          body?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          expected_concepts?: Json
          experience_levels?: Database["public"]["Enums"]["experience_level"][]
          generated_by?: string
          id?: string
          max_score?: number
          order_index?: number | null
          question_type?: Database["public"]["Enums"]["question_type"]
          reference_answer?: string | null
          rubric?: Json
          session_id?: string | null
          source_question_id?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          suggested_follow_ups?: Json
          technology_id?: string
          title?: string | null
          topic_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_questions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_questions_source_question_id_fkey"
            columns: ["source_question_id"]
            isOneToOne: false
            referencedRelation: "interview_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_questions_technology_id_fkey"
            columns: ["technology_id"]
            isOneToOne: false
            referencedRelation: "technologies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_reports: {
        Row: {
          coding_analysis: Json
          coding_score: number | null
          communication_score: number | null
          comparison_with_previous: Json
          confidence_score: number
          created_at: string
          critical_gaps: Json
          generated_at: string
          hire_recommendation: Database["public"]["Enums"]["hire_recommendation"]
          id: string
          model_used: string | null
          overall_score: number
          problem_solving_score: number | null
          question_feedback: Json
          questions_answered_poorly: Json
          questions_answered_well: Json
          recommendation_rationale: string
          recommended_next: Json
          recommended_topics: Json
          session_id: string
          seven_day_plan: Json
          strongest_areas: Json
          technical_score: number | null
          thirty_day_plan: Json
          topic_scores: Json
          weakest_areas: Json
        }
        Insert: {
          coding_analysis?: Json
          coding_score?: number | null
          communication_score?: number | null
          comparison_with_previous?: Json
          confidence_score?: number
          created_at?: string
          critical_gaps?: Json
          generated_at?: string
          hire_recommendation: Database["public"]["Enums"]["hire_recommendation"]
          id?: string
          model_used?: string | null
          overall_score: number
          problem_solving_score?: number | null
          question_feedback?: Json
          questions_answered_poorly?: Json
          questions_answered_well?: Json
          recommendation_rationale: string
          recommended_next?: Json
          recommended_topics?: Json
          session_id: string
          seven_day_plan?: Json
          strongest_areas?: Json
          technical_score?: number | null
          thirty_day_plan?: Json
          topic_scores?: Json
          weakest_areas?: Json
        }
        Update: {
          coding_analysis?: Json
          coding_score?: number | null
          communication_score?: number | null
          comparison_with_previous?: Json
          confidence_score?: number
          created_at?: string
          critical_gaps?: Json
          generated_at?: string
          hire_recommendation?: Database["public"]["Enums"]["hire_recommendation"]
          id?: string
          model_used?: string | null
          overall_score?: number
          problem_solving_score?: number | null
          question_feedback?: Json
          questions_answered_poorly?: Json
          questions_answered_well?: Json
          recommendation_rationale?: string
          recommended_next?: Json
          recommended_topics?: Json
          session_id?: string
          seven_day_plan?: Json
          strongest_areas?: Json
          technical_score?: number | null
          thirty_day_plan?: Json
          topic_scores?: Json
          weakest_areas?: Json
        }
        Relationships: [
          {
            foreignKeyName: "interview_reports_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_sessions: {
        Row: {
          candidate_id: string
          config: Json
          created_at: string
          current_question_index: number
          custom_instructions: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          duration_minutes: number
          ended_at: string | null
          experience_level: Database["public"]["Enums"]["experience_level"]
          id: string
          interview_type: Database["public"]["Enums"]["interview_type"]
          job_description_id: string | null
          mode: Database["public"]["Enums"]["interview_mode"]
          resume_id: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["session_status"]
          target_company: string | null
          technology_ids: string[]
          template_id: string | null
          topic_ids: string[]
          updated_at: string
        }
        Insert: {
          candidate_id: string
          config?: Json
          created_at?: string
          current_question_index?: number
          custom_instructions?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          duration_minutes: number
          ended_at?: string | null
          experience_level: Database["public"]["Enums"]["experience_level"]
          id?: string
          interview_type: Database["public"]["Enums"]["interview_type"]
          job_description_id?: string | null
          mode?: Database["public"]["Enums"]["interview_mode"]
          resume_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["session_status"]
          target_company?: string | null
          technology_ids?: string[]
          template_id?: string | null
          topic_ids?: string[]
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          config?: Json
          created_at?: string
          current_question_index?: number
          custom_instructions?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          duration_minutes?: number
          ended_at?: string | null
          experience_level?: Database["public"]["Enums"]["experience_level"]
          id?: string
          interview_type?: Database["public"]["Enums"]["interview_type"]
          job_description_id?: string | null
          mode?: Database["public"]["Enums"]["interview_mode"]
          resume_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["session_status"]
          target_company?: string | null
          technology_ids?: string[]
          template_id?: string | null
          topic_ids?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_sessions_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_sessions_job_description_id_fkey"
            columns: ["job_description_id"]
            isOneToOne: false
            referencedRelation: "job_descriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_sessions_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_sessions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "interview_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_templates: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          duration_minutes: number
          experience_level: Database["public"]["Enums"]["experience_level"]
          id: string
          interview_type: Database["public"]["Enums"]["interview_type"]
          is_public: boolean
          name: string
          status: Database["public"]["Enums"]["content_status"]
          technology_ids: string[]
          topic_ids: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          duration_minutes?: number
          experience_level: Database["public"]["Enums"]["experience_level"]
          id?: string
          interview_type: Database["public"]["Enums"]["interview_type"]
          is_public?: boolean
          name: string
          status?: Database["public"]["Enums"]["content_status"]
          technology_ids?: string[]
          topic_ids?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          duration_minutes?: number
          experience_level?: Database["public"]["Enums"]["experience_level"]
          id?: string
          interview_type?: Database["public"]["Enums"]["interview_type"]
          is_public?: boolean
          name?: string
          status?: Database["public"]["Enums"]["content_status"]
          technology_ids?: string[]
          topic_ids?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_descriptions: {
        Row: {
          candidate_id: string
          company: string | null
          content: string
          created_at: string
          deleted_at: string | null
          file_path: string | null
          id: string
          source: string
          title: string | null
          updated_at: string
        }
        Insert: {
          candidate_id: string
          company?: string | null
          content: string
          created_at?: string
          deleted_at?: string | null
          file_path?: string | null
          id?: string
          source?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          company?: string | null
          content?: string
          created_at?: string
          deleted_at?: string | null
          file_path?: string | null
          id?: string
          source?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_descriptions_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          id: string
          paid_at: string | null
          profile_id: string
          provider: string
          provider_payment_id: string | null
          status: string
          subscription_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          id?: string
          paid_at?: string | null
          profile_id: string
          provider?: string
          provider_payment_id?: string | null
          status?: string
          subscription_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          id?: string
          paid_at?: string | null
          profile_id?: string
          provider?: string
          provider_payment_id?: string | null
          status?: string
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      proctoring_events: {
        Row: {
          assessment_candidate_id: string | null
          created_at: string
          event_type: string
          id: string
          payload: Json
          session_id: string
          severity: string
        }
        Insert: {
          assessment_candidate_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          payload?: Json
          session_id: string
          severity?: string
        }
        Update: {
          assessment_candidate_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json
          session_id?: string
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "proctoring_events_assessment_candidate_id_fkey"
            columns: ["assessment_candidate_id"]
            isOneToOne: false
            referencedRelation: "assessment_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proctoring_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      proctoring_recordings: {
        Row: {
          assessment_candidate_id: string | null
          byte_size: number | null
          chunk_index: number
          created_at: string
          ended_at: string | null
          id: string
          kind: string
          mime_type: string | null
          session_id: string
          started_at: string
          storage_path: string
        }
        Insert: {
          assessment_candidate_id?: string | null
          byte_size?: number | null
          chunk_index?: number
          created_at?: string
          ended_at?: string | null
          id?: string
          kind: string
          mime_type?: string | null
          session_id: string
          started_at?: string
          storage_path: string
        }
        Update: {
          assessment_candidate_id?: string | null
          byte_size?: number | null
          chunk_index?: number
          created_at?: string
          ended_at?: string | null
          id?: string
          kind?: string
          mime_type?: string | null
          session_id?: string
          started_at?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "proctoring_recordings_assessment_candidate_id_fkey"
            columns: ["assessment_candidate_id"]
            isOneToOne: false
            referencedRelation: "assessment_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proctoring_recordings_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          current_job_role: string | null
          deleted_at: string | null
          full_name: string | null
          id: string
          interview_goal: string | null
          is_active: boolean
          main_skills: string[]
          onboarding_completed_at: string | null
          preferred_language: string
          preferred_technologies: string[]
          role_id: string
          target_job_role: string | null
          updated_at: string
          years_experience: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          current_job_role?: string | null
          deleted_at?: string | null
          full_name?: string | null
          id: string
          interview_goal?: string | null
          is_active?: boolean
          main_skills?: string[]
          onboarding_completed_at?: string | null
          preferred_language?: string
          preferred_technologies?: string[]
          role_id: string
          target_job_role?: string | null
          updated_at?: string
          years_experience?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          current_job_role?: string | null
          deleted_at?: string | null
          full_name?: string | null
          id?: string
          interview_goal?: string | null
          is_active?: boolean
          main_skills?: string[]
          onboarding_completed_at?: string | null
          preferred_language?: string
          preferred_technologies?: string[]
          role_id?: string
          target_job_role?: string | null
          updated_at?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      recruiter_members: {
        Row: {
          created_at: string
          id: string
          invited_at: string
          joined_at: string | null
          member_role: string
          organization_id: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_at?: string
          joined_at?: string | null
          member_role?: string
          organization_id: string
          profile_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_at?: string
          joined_at?: string | null
          member_role?: string
          organization_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recruiter_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "recruiter_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recruiter_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      recruiter_organizations: {
        Row: {
          branding: Json
          created_at: string
          deleted_at: string | null
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          slug: string
          updated_at: string
        }
        Insert: {
          branding?: Json
          created_at?: string
          deleted_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
          slug: string
          updated_at?: string
        }
        Update: {
          branding?: Json
          created_at?: string
          deleted_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recruiter_organizations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resumes: {
        Row: {
          candidate_id: string
          created_at: string
          deleted_at: string | null
          file_name: string
          file_path: string
          id: string
          is_primary: boolean
          mime_type: string
          parsed_text: string | null
          size_bytes: number
          updated_at: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          deleted_at?: string | null
          file_name: string
          file_path: string
          id?: string
          is_primary?: boolean
          mime_type: string
          parsed_text?: string | null
          size_bytes: number
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          deleted_at?: string | null
          file_name?: string
          file_path?: string
          id?: string
          is_primary?: boolean
          mime_type?: string
          parsed_text?: string | null
          size_bytes?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resumes_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: Database["public"]["Enums"]["role_name"]
          permissions: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: Database["public"]["Enums"]["role_name"]
          permissions?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: Database["public"]["Enums"]["role_name"]
          permissions?: Json
          updated_at?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          billing_interval: string
          created_at: string
          currency: string
          description: string | null
          features: Json
          id: string
          is_active: boolean
          limits: Json
          name: string
          price_cents: number
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          billing_interval?: string
          created_at?: string
          currency?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          limits?: Json
          name: string
          price_cents?: number
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          billing_interval?: string
          created_at?: string
          currency?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          limits?: Json
          name?: string
          price_cents?: number
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          organization_id: string | null
          plan_id: string
          profile_id: string
          provider: string
          provider_customer_id: string | null
          provider_subscription_id: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          organization_id?: string | null
          plan_id: string
          profile_id: string
          provider?: string
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          organization_id?: string | null
          plan_id?: string
          profile_id?: string
          provider?: string
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "recruiter_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      technologies: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "technologies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      technology_topics: {
        Row: {
          created_at: string
          technology_id: string
          topic_id: string
        }
        Insert: {
          created_at?: string
          technology_id: string
          topic_id: string
        }
        Update: {
          created_at?: string
          technology_id?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "technology_topics_technology_id_fkey"
            columns: ["technology_id"]
            isOneToOne: false
            referencedRelation: "technologies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technology_topics_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          technology_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          technology_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          technology_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topics_technology_id_fkey"
            columns: ["technology_id"]
            isOneToOne: false
            referencedRelation: "technologies"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_events: {
        Row: {
          created_at: string
          id: string
          payload: Json
          session_id: string
          stage: string
        }
        Insert: {
          created_at?: string
          id?: string
          payload?: Json
          session_id: string
          stage: string
        }
        Update: {
          created_at?: string
          id?: string
          payload?: Json
          session_id?: string
          stage?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_chunks: {
        Row: {
          candidate_id: string | null
          content: string
          created_at: string
          embedding: string | null
          id: string
          metadata: Json
          session_id: string | null
          source_id: string | null
          source_type: Database["public"]["Enums"]["knowledge_source_type"]
        }
        Insert: {
          candidate_id?: string | null
          content: string
          created_at?: string
          embedding?: string | null
          id?: string
          metadata?: Json
          session_id?: string | null
          source_id?: string | null
          source_type: Database["public"]["Enums"]["knowledge_source_type"]
        }
        Update: {
          candidate_id?: string | null
          content?: string
          created_at?: string
          embedding?: string | null
          id?: string
          metadata?: Json
          session_id?: string | null
          source_id?: string | null
          source_type?: Database["public"]["Enums"]["knowledge_source_type"]
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_chunks_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_chunks_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_records: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          metric: string
          period_end: string
          period_start: string
          profile_id: string
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          metric: string
          period_end: string
          period_start: string
          profile_id: string
          quantity?: number
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          metric?: string
          period_end?: string
          period_start?: string
          profile_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "usage_records_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_role_name: {
        Args: never
        Returns: Database["public"]["Enums"]["role_name"]
      }
      is_admin: { Args: never; Returns: boolean }
      is_interviewer_or_admin: { Args: never; Returns: boolean }
      is_org_member: { Args: { org_id: string }; Returns: boolean }
      match_knowledge_chunks: {
        Args: {
          query_embedding: number[]
          match_count?: number
          filter_candidate?: string | null
          filter_source?: Database["public"]["Enums"]["knowledge_source_type"] | null
        }
        Returns: {
          content: string
          id: string
          metadata: Json
          similarity: number
          source_id: string | null
          source_type: Database["public"]["Enums"]["knowledge_source_type"]
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      assessment_candidate_status:
        | "invited"
        | "in_progress"
        | "completed"
        | "expired"
      content_status: "draft" | "approved" | "rejected" | "archived"
      difficulty_level: "easy" | "medium" | "hard" | "adaptive"
      experience_level:
        | "fresher"
        | "junior"
        | "mid"
        | "senior"
        | "lead"
        | "architect"
      hire_recommendation:
        | "strong_hire"
        | "hire"
        | "borderline"
        | "not_ready_yet"
      interview_mode: "text" | "voice" | "coding"
      knowledge_source_type:
        | "resume"
        | "job_description"
        | "question_bank"
        | "topic_knowledge"
        | "session_summary"
      interview_type:
        | "technical"
        | "coding"
        | "mixed"
        | "behavioural"
        | "system_design"
        | "resume_based"
        | "job_description_based"
      prompt_status: "draft" | "published" | "archived"
      question_type:
        | "conceptual"
        | "scenario_based"
        | "debugging"
        | "output_prediction"
        | "code_review"
        | "coding_challenge"
        | "architecture"
        | "multiple_choice"
        | "behavioural"
        | "project_experience"
        | "system_design"
      role_name: "candidate" | "interviewer" | "admin"
      session_status: "draft" | "in_progress" | "completed" | "abandoned"
      subscription_status:
        | "trialing"
        | "active"
        | "past_due"
        | "canceled"
        | "incomplete"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      assessment_candidate_status: [
        "invited",
        "in_progress",
        "completed",
        "expired",
      ],
      content_status: ["draft", "approved", "rejected", "archived"],
      difficulty_level: ["easy", "medium", "hard", "adaptive"],
      experience_level: [
        "fresher",
        "junior",
        "mid",
        "senior",
        "lead",
        "architect",
      ],
      hire_recommendation: [
        "strong_hire",
        "hire",
        "borderline",
        "not_ready_yet",
      ],
      interview_mode: ["text", "voice", "coding"],
      knowledge_source_type: [
        "resume",
        "job_description",
        "question_bank",
        "topic_knowledge",
        "session_summary",
      ],
      interview_type: [
        "technical",
        "coding",
        "mixed",
        "behavioural",
        "system_design",
        "resume_based",
        "job_description_based",
      ],
      prompt_status: ["draft", "published", "archived"],
      question_type: [
        "conceptual",
        "scenario_based",
        "debugging",
        "output_prediction",
        "code_review",
        "coding_challenge",
        "architecture",
        "multiple_choice",
        "behavioural",
        "project_experience",
        "system_design",
      ],
      role_name: ["candidate", "interviewer", "admin"],
      session_status: ["draft", "in_progress", "completed", "abandoned"],
      subscription_status: [
        "trialing",
        "active",
        "past_due",
        "canceled",
        "incomplete",
      ],
    },
  },
} as const

