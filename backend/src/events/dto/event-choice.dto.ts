export interface EventChoiceDto {
  id: number;
  label: string;
  description: string | null;
}

export interface EventChoiceRequestDto {
  eventId: number;
  choiceId: number;
  travelLogId?: number;
}

import { LoggedInUserDto } from '../../auth/dto/logged-in-user.dto';

export interface EventChoiceResponseDto {
  success: boolean;
  message: string;
  eventResult: {
    fuelModifier: number;
    cargoLost: number;
    creditsLost: number;
    reputationChange: number;
    description: string;
  };
  user?: LoggedInUserDto;
}
