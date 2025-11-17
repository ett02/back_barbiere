export interface User {
  id?: number;
  nome: string;
  cognome: string;
  email: string;
  ruolo: 'CLIENTE' | 'ADMIN';
  password?: string;
}
