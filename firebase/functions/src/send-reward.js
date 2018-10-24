"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
var _this = this;
exports.__esModule = true;
var functions = require("firebase-functions");
var admin = require("firebase-admin");
exports._sendReward = functions.https.onRequest(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var stripe, userId, eventId, token, amount, fee, address, event_1, query, salesQuery, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                stripe = require('stripe')(req.body.test ? functions.config().stripe.sk_test : functions.config().stripe.sk_live);
                userId = req.body.userId;
                eventId = req.body.eventId;
                token = req.body.token;
                amount = Number(req.body.amount) || 0;
                fee = Number(req.body.fee) || 0;
                address = req.body.address;
                if (!userId || !eventId || !token || !amount || !fee || !address) {
                    throw Error("INVALID_PARAMETERS");
                }
                return [4 /*yield*/, admin.firestore().collection("users").doc(userId).collection("events").doc(eventId).get()];
            case 1:
                event_1 = _a.sent();
                if (!event_1.exists) {
                    throw Error("INVALID_ID");
                }
                query = {
                    amount: amount + fee,
                    currency: 'jpy',
                    card: token
                };
                return [4 /*yield*/, stripe.charges.create(query)];
            case 2:
                _a.sent();
                return [4 /*yield*/, event_1.ref.collection("sales").where("ticket", "==", address).get()];
            case 3:
                salesQuery = _a.sent();
                if (salesQuery.empty) {
                    throw Error("INVALID_TICKET");
                }
                return [4 /*yield*/, salesQuery.docs[0].ref["delete"]()];
            case 4:
                _a.sent();
                res.status(200).send();
                return [3 /*break*/, 6];
            case 5:
                e_1 = _a.sent();
                res.status(400).send(e_1.message);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
