export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      dispositivo: {
        Row: {
          created_at: string
          id: string
          nombre: string
          tipo: Database["public"]["Enums"]["dispositivo_tipo"]
        }
        Insert: {
          created_at?: string
          id?: string
          nombre: string
          tipo: Database["public"]["Enums"]["dispositivo_tipo"]
        }
        Update: {
          created_at?: string
          id?: string
          nombre?: string
          tipo?: Database["public"]["Enums"]["dispositivo_tipo"]
        }
        Relationships: []
      }
      ficha_dia: {
        Row: {
          consumo_activo: boolean
          consumo_contexto: string | null
          consumo_sustancias: string | null
          limitacion_permanente: boolean
          nivel_educativo: string | null
          observaciones: string | null
          situacion_habitacional: string | null
          tiene_cud: boolean
          updated_at: string
          updated_by: string | null
          vinculo_id: string
          violencia_familiar: boolean
          violencia_observaciones: string | null
          violencia_tipo: string | null
        }
        Insert: {
          consumo_activo?: boolean
          consumo_contexto?: string | null
          consumo_sustancias?: string | null
          limitacion_permanente?: boolean
          nivel_educativo?: string | null
          observaciones?: string | null
          situacion_habitacional?: string | null
          tiene_cud?: boolean
          updated_at?: string
          updated_by?: string | null
          vinculo_id: string
          violencia_familiar?: boolean
          violencia_observaciones?: string | null
          violencia_tipo?: string | null
        }
        Update: {
          consumo_activo?: boolean
          consumo_contexto?: string | null
          consumo_sustancias?: string | null
          limitacion_permanente?: boolean
          nivel_educativo?: string | null
          observaciones?: string | null
          situacion_habitacional?: string | null
          tiene_cud?: boolean
          updated_at?: string
          updated_by?: string | null
          vinculo_id?: string
          violencia_familiar?: boolean
          violencia_observaciones?: string | null
          violencia_tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ficha_dia_vinculo_id_fkey"
            columns: ["vinculo_id"]
            isOneToOne: true
            referencedRelation: "vinculo"
            referencedColumns: ["id"]
          },
        ]
      }
      ficha_ninez: {
        Row: {
          anio_escolar: string | null
          consumo_activo: boolean
          consumo_contexto: string | null
          consumo_sustancias: string | null
          discapacidad: boolean
          escolarizado: boolean
          observaciones: string | null
          referenciado_salud: boolean
          updated_at: string
          updated_by: string | null
          vinculo_id: string
          violencia_familiar: boolean
          violencia_observaciones: string | null
          violencia_tipo: string | null
        }
        Insert: {
          anio_escolar?: string | null
          consumo_activo?: boolean
          consumo_contexto?: string | null
          consumo_sustancias?: string | null
          discapacidad?: boolean
          escolarizado?: boolean
          observaciones?: string | null
          referenciado_salud?: boolean
          updated_at?: string
          updated_by?: string | null
          vinculo_id: string
          violencia_familiar?: boolean
          violencia_observaciones?: string | null
          violencia_tipo?: string | null
        }
        Update: {
          anio_escolar?: string | null
          consumo_activo?: boolean
          consumo_contexto?: string | null
          consumo_sustancias?: string | null
          discapacidad?: boolean
          escolarizado?: boolean
          observaciones?: string | null
          referenciado_salud?: boolean
          updated_at?: string
          updated_by?: string | null
          vinculo_id?: string
          violencia_familiar?: boolean
          violencia_observaciones?: string | null
          violencia_tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ficha_ninez_vinculo_id_fkey"
            columns: ["vinculo_id"]
            isOneToOne: true
            referencedRelation: "vinculo"
            referencedColumns: ["id"]
          },
        ]
      }
      historial_cambio: {
        Row: {
          created_at: string
          datos_anteriores: Json | null
          datos_nuevos: Json | null
          id: string
          operacion: string
          registro_id: string
          tabla: string
          user_id: string | null
          vinculo_id: string | null
        }
        Insert: {
          created_at?: string
          datos_anteriores?: Json | null
          datos_nuevos?: Json | null
          id?: string
          operacion: string
          registro_id: string
          tabla: string
          user_id?: string | null
          vinculo_id?: string | null
        }
        Update: {
          created_at?: string
          datos_anteriores?: Json | null
          datos_nuevos?: Json | null
          id?: string
          operacion?: string
          registro_id?: string
          tabla?: string
          user_id?: string | null
          vinculo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historial_cambio_vinculo_id_fkey"
            columns: ["vinculo_id"]
            isOneToOne: false
            referencedRelation: "vinculo"
            referencedColumns: ["id"]
          },
        ]
      }
      persona: {
        Row: {
          apellido: string
          barrio: string
          created_at: string
          dni: string
          fecha_nacimiento: string
          nombre: string
          nombre_completo: string | null
          sexo: Database["public"]["Enums"]["sexo_tipo"]
          updated_at: string
        }
        Insert: {
          apellido: string
          barrio: string
          created_at?: string
          dni: string
          fecha_nacimiento: string
          nombre: string
          nombre_completo?: string | null
          sexo: Database["public"]["Enums"]["sexo_tipo"]
          updated_at?: string
        }
        Update: {
          apellido?: string
          barrio?: string
          created_at?: string
          dni?: string
          fecha_nacimiento?: string
          nombre?: string
          nombre_completo?: string | null
          sexo?: Database["public"]["Enums"]["sexo_tipo"]
          updated_at?: string
        }
        Relationships: []
      }
      user_dispositivo: {
        Row: {
          created_at: string
          dispositivo_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dispositivo_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          dispositivo_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_dispositivo_dispositivo_id_fkey"
            columns: ["dispositivo_id"]
            isOneToOne: false
            referencedRelation: "dispositivo"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vinculo: {
        Row: {
          created_at: string
          created_by: string | null
          dispositivo_id: string
          dni: string
          estado: Database["public"]["Enums"]["vinculo_estado"]
          fecha_alta: string
          fecha_baja: string | null
          id: string
          motivo_egreso: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          dispositivo_id: string
          dni: string
          estado?: Database["public"]["Enums"]["vinculo_estado"]
          fecha_alta?: string
          fecha_baja?: string | null
          id?: string
          motivo_egreso?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          dispositivo_id?: string
          dni?: string
          estado?: Database["public"]["Enums"]["vinculo_estado"]
          fecha_alta?: string
          fecha_baja?: string | null
          id?: string
          motivo_egreso?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vinculo_dispositivo_id_fkey"
            columns: ["dispositivo_id"]
            isOneToOne: false
            referencedRelation: "dispositivo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vinculo_dni_fkey"
            columns: ["dni"]
            isOneToOne: false
            referencedRelation: "persona"
            referencedColumns: ["dni"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      buscar_persona_por_dni: {
        Args: { _dni: string }
        Returns: {
          dni: string
          existe: boolean
          nombre_completo: string
        }[]
      }
      can_access_vinculo: { Args: { _vinculo_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      user_dispositivo_id: { Args: { _user_id: string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "operador"
      dispositivo_tipo: "ninez" | "dia"
      sexo_tipo: "F" | "M" | "X"
      vinculo_estado: "activo" | "egresado" | "inasistencia_prolongada"
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
  public: {
    Enums: {
      app_role: ["admin", "operador"],
      dispositivo_tipo: ["ninez", "dia"],
      sexo_tipo: ["F", "M", "X"],
      vinculo_estado: ["activo", "egresado", "inasistencia_prolongada"],
    },
  },
} as const
