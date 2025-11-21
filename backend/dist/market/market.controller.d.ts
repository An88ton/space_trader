import { MarketService } from './market.service';
import { BuyGoodsDto } from './dto/buy-goods.dto';
import { SellGoodsDto } from './dto/sell-goods.dto';
export declare class MarketController {
    private readonly marketService;
    constructor(marketService: MarketService);
    buyGoods(authHeader: string | undefined, buyGoodsDto: BuyGoodsDto): Promise<import("../auth/dto/logged-in-user.dto").LoggedInUserDto>;
    sellGoods(authHeader: string | undefined, sellGoodsDto: SellGoodsDto): Promise<import("../auth/dto/logged-in-user.dto").LoggedInUserDto>;
    getInventory(authHeader: string | undefined): Promise<{
        inventory: Array<{
            good: {
                id: number;
                name: string;
                type: string;
                basePrice: number;
            };
            quantity: number;
        }>;
        cargoUsage: number;
        cargoCapacity: number;
        availableCargo: number;
    }>;
    private extractToken;
}
