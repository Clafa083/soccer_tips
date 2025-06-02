"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.devDb = exports.DevelopmentDatabaseAdapter = void 0;
// filepath: c:\kod\soccer_tips\soccer_tips\backend\src\db\DevelopmentDatabaseAdapter.ts
var database_1 = require("./database");
var mockDatabase_1 = require("./mockDatabase");
var dotenv = require("dotenv");
// Load environment variables
dotenv.config();
var DevelopmentDatabaseAdapter = /** @class */ (function () {
    function DevelopmentDatabaseAdapter() {
        this.useMockData = process.env.DEV_MODE === 'mock';
        console.log('Environment check:');
        console.log('DEV_MODE:', process.env.DEV_MODE);
        console.log('NODE_ENV:', process.env.NODE_ENV);
        if (this.useMockData) {
            console.log('🎭 Using mock database for development');
        }
        else {
            console.log('🗄️ Using real MySQL database');
        }
    }
    DevelopmentDatabaseAdapter.prototype.query = function (sql, params) {
        return __awaiter(this, void 0, void 0, function () {
            var connection, result, header, newId, mockTeam;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.useMockData) return [3 /*break*/, 5];
                        return [4 /*yield*/, database_1.pool.getConnection()];
                    case 1:
                        connection = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 4, 5]);
                        return [4 /*yield*/, connection.execute(sql, params || [])];
                    case 3:
                        result = (_a.sent())[0];
                        if (Array.isArray(result)) {
                            // SELECT query
                            return [2 /*return*/, { rows: result }];
                        }
                        else {
                            header = result;
                            return [2 /*return*/, {
                                    rows: [],
                                    metadata: {
                                        insertId: header.insertId,
                                        affectedRows: header.affectedRows
                                    }
                                }];
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        connection.release();
                        return [7 /*endfinally*/];
                    case 5:
                        // Mock implementation for common queries
                        console.log("\uD83C\uDFAD Mock query: ".concat(sql));
                        if (sql.includes('SELECT * FROM teams')) {
                            return [2 /*return*/, { rows: mockDatabase_1.mockTeams }];
                        }
                        if (sql.includes('SELECT * FROM matches')) {
                            return [2 /*return*/, { rows: mockDatabase_1.mockMatches }];
                        }
                        if (sql.includes('SELECT * FROM users')) {
                            return [2 /*return*/, { rows: mockDatabase_1.mockUsers }];
                        }
                        if (sql.includes('INSERT INTO teams')) {
                            newId = Math.max.apply(Math, mockDatabase_1.mockTeams.map(function (t) { return t.id; })) + 1;
                            mockTeam = {
                                id: newId,
                                name: 'New Team',
                                group: 'A',
                                flag: '🏳️',
                                createdAt: new Date(),
                                updatedAt: new Date()
                            };
                            mockDatabase_1.mockTeams.push(mockTeam);
                            return [2 /*return*/, { rows: [mockTeam] }];
                        }
                        if (sql.includes('UPDATE teams')) {
                            // Mock team update
                            return [2 /*return*/, { rows: [{ affectedRows: 1 }] }];
                        }
                        if (sql.includes('DELETE FROM teams')) {
                            // Mock team deletion
                            return [2 /*return*/, { rows: [{ affectedRows: 1 }] }];
                        }
                        // Default mock response
                        return [2 /*return*/, { rows: [] }];
                }
            });
        });
    };
    DevelopmentDatabaseAdapter.prototype.switchToRealDatabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.useMockData = false;
                console.log('🗄️ Switched to real MySQL database');
                return [2 /*return*/];
            });
        });
    };
    DevelopmentDatabaseAdapter.prototype.switchToMockDatabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.useMockData = true;
                console.log('🎭 Switched to mock database');
                return [2 /*return*/];
            });
        });
    };
    DevelopmentDatabaseAdapter.prototype.isUsingMockData = function () {
        return this.useMockData;
    };
    return DevelopmentDatabaseAdapter;
}());
exports.DevelopmentDatabaseAdapter = DevelopmentDatabaseAdapter;
// Export singleton instance
exports.devDb = new DevelopmentDatabaseAdapter();
