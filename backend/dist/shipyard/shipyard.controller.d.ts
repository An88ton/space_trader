import { ShipyardService } from './shipyard.service';
import { BuyShipDto } from './dto/buy-ship.dto';
import { SellShipDto } from './dto/sell-ship.dto';
export declare class ShipyardController {
    private readonly shipyardService;
    constructor(shipyardService: ShipyardService);
    getAvailableShips(): Promise<import("./dto/shipyard-ship.dto").ShipyardShipDto[]>;
    getUserShips(authHeader: string | undefined): Promise<import("./dto/user-ship.dto").UserShipDto[]>;
    buyShip(authHeader: string | undefined, buyShipDto: BuyShipDto): Promise<import("../auth/dto/logged-in-user.dto").LoggedInUserDto>;
    sellShip(authHeader: string | undefined, sellShipDto: SellShipDto): Promise<import("../auth/dto/logged-in-user.dto").LoggedInUserDto>;
    private extractToken;
}
