export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  usuario_id: number;
  nombre_usuario: string;
  correo_electronico: string;
  rol: 'admin' | 'operador';
}
