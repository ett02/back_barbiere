import { User } from './user.model';
import { Barber } from './barber.model';
import { Service } from './service.model';

export interface Appointment {
  id: number;
  customer?: User;
  barber?: Barber;
  service?: Service;
  data: string | Date;
  orarioInizio: string;
  stato: 'CONFERMATO' | 'PENDING' | 'ANNULLATO';
}
