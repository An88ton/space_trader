"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketController = void 0;
const common_1 = require("@nestjs/common");
const market_service_1 = require("./market.service");
const buy_goods_dto_1 = require("./dto/buy-goods.dto");
const sell_goods_dto_1 = require("./dto/sell-goods.dto");
let MarketController = class MarketController {
    marketService;
    constructor(marketService) {
        this.marketService = marketService;
    }
    async buyGoods(authHeader, buyGoodsDto) {
        const token = this.extractToken(authHeader);
        return this.marketService.buyGoods(token, buyGoodsDto);
    }
    async sellGoods(authHeader, sellGoodsDto) {
        const token = this.extractToken(authHeader);
        return this.marketService.sellGoods(token, sellGoodsDto);
    }
    async getInventory(authHeader) {
        const token = this.extractToken(authHeader);
        return this.marketService.getInventory(token);
    }
    extractToken(authHeader) {
        if (!authHeader) {
            throw new common_1.BadRequestException('Authorization header is required');
        }
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            throw new common_1.BadRequestException('Authorization header must be in format: Bearer <token>');
        }
        return parts[1];
    }
};
exports.MarketController = MarketController;
__decorate([
    (0, common_1.Post)('buy'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, buy_goods_dto_1.BuyGoodsDto]),
    __metadata("design:returntype", Promise)
], MarketController.prototype, "buyGoods", null);
__decorate([
    (0, common_1.Post)('sell'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, sell_goods_dto_1.SellGoodsDto]),
    __metadata("design:returntype", Promise)
], MarketController.prototype, "sellGoods", null);
__decorate([
    (0, common_1.Get)('inventory'),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MarketController.prototype, "getInventory", null);
exports.MarketController = MarketController = __decorate([
    (0, common_1.Controller)('market'),
    __metadata("design:paramtypes", [market_service_1.MarketService])
], MarketController);
//# sourceMappingURL=market.controller.js.map