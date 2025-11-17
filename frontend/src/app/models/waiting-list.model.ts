import { User } from './user.model';
import { Barber } from './barber.model';
import { Service } from './service.model';

export interface WaitingList {
    id: number;
    customer: User;
    barber: Barber;
    service: Service;
    dataRichiesta: Date;
    dataIscrizione: Date;
    stato: 'IN_ATTESA' | 'NOTIFICATO' | 'CONFERMATO' | 'SCADUTO' | 'ANNULLATO';
}
