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
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const typeorm_1 = require("typeorm");
const event_log_entity_1 = require("./event-log.entity");
const reputation_log_entity_1 = require("./reputation-log.entity");
const user_ship_entity_1 = require("./user-ship.entity");
let User = class User {
    id;
    email;
    passwordHash;
    username;
    reputation;
    rank;
    credits;
    sessionVersion;
    createdAt;
    updatedAt;
    userShips;
    eventLogs;
    reputationLogs;
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'password_hash', length: 255 }),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, unique: true }),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "reputation", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: 'Captain' }),
    __metadata("design:type", String)
], User.prototype, "rank", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1000 }),
    __metadata("design:type", Number)
], User.prototype, "credits", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'session_version', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "sessionVersion", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        name: 'created_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        name: 'updated_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_ship_entity_1.UserShip, (userShip) => userShip.user),
    __metadata("design:type", Array)
], User.prototype, "userShips", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => event_log_entity_1.EventLog, (eventLog) => eventLog.user),
    __metadata("design:type", Array)
], User.prototype, "eventLogs", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => reputation_log_entity_1.ReputationLog, (reputationLog) => reputationLog.user),
    __metadata("design:type", Array)
], User.prototype, "reputationLogs", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)({ name: 'users' })
], User);
//# sourceMappingURL=user.entity.js.map