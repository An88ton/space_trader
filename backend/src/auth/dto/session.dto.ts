import { LoggedInUserDto } from './logged-in-user.dto';

export class SessionDto {
  accessToken: string;
  user: LoggedInUserDto;
}
