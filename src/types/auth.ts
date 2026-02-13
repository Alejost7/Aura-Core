export interface UserPublic {
    id: number;
    username: string;
    rol: string;
    activo: number;
    last_login?: string | null;
}
