import { User } from '../users/user.entity';
import { Class } from './class.entity';
export declare class Student {
    id: number;
    roll_no: string;
    user: User;
    class: Class;
}
