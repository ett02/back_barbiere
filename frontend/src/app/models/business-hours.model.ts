export interface BusinessHours {
  id?: number;
  giorno: number;
  aperto: boolean;
  apertura: string | null;
  chiusura: string | null;
}
