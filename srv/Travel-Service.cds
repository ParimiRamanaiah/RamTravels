using myapp from '../db/schema';

service UserService {
    entity Users as projection on myapp.User;
}
