import { TravelService } from './travel.service';
import { TravelRequestDto } from './dto/travel-request.dto';
import { TravelResponseDto } from './dto/travel-response.dto';
export declare class TravelController {
    private readonly travelService;
    constructor(travelService: TravelService);
    travel(authorization: string | undefined, travelRequest: TravelRequestDto): Promise<TravelResponseDto>;
    private extractToken;
}
