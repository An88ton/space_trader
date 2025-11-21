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
exports.ShipyardController = void 0;
const common_1 = require("@nestjs/common");
const shipyard_service_1 = require("./shipyard.service");
const buy_ship_dto_1 = require("./dto/buy-ship.dto");
const sell_ship_dto_1 = require("./dto/sell-ship.dto");
let ShipyardController = class ShipyardController {
    shipyardService;
    constructor(shipyardService) {
        this.shipyardService = shipyardService;
    }
    async getAvailableShips() {
        return this.shipyardService.getAvailableShips();
    }
    async getUserShips(authHeader) {
        const token = this.extractToken(authHeader);
        return this.shipyardService.getUserShips(token);
    }
    async buyShip(authHeader, buyShipDto) {
        const token = this.extractToken(authHeader);
        return this.shipyardService.buyShip(token, buyShipDto);
    }
    async sellShip(authHeader, sellShipDto) {
        const token = this.extractToken(authHeader);
        return this.shipyardService.sellShip(token, sellShipDto);
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
exports.ShipyardController = ShipyardController;
__decorate([
    (0, common_1.Get)('ships'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ShipyardController.prototype, "getAvailableShips", null);
__decorate([
    (0, common_1.Get)('my-ships'),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ShipyardController.prototype, "getUserShips", null);
__decorate([
    (0, common_1.Post)('buy'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, buy_ship_dto_1.BuyShipDto]),
    __metadata("design:returntype", Promise)
], ShipyardController.prototype, "buyShip", null);
__decorate([
    (0, common_1.Post)('sell'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, sell_ship_dto_1.SellShipDto]),
    __metadata("design:returntype", Promise)
], ShipyardController.prototype, "sellShip", null);
exports.ShipyardController = ShipyardController = __decorate([
    (0, common_1.Controller)('shipyard'),
    __metadata("design:paramtypes", [shipyard_service_1.ShipyardService])
], ShipyardController);
//# sourceMappingURL=shipyard.controller.js.map