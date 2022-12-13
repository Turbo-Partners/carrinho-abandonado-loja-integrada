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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const axios_1 = __importDefault(require("axios"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const objectSent = req.body;
    const objectSentJSON = JSON.stringify(objectSent);
    console.log(objectSentJSON);
    let base64 = btoa(`${process.env.CLIENT_ID}:${process.env.CLIENT_SERVER}`);
    const response = yield axios_1.default.post('https://api.reportana.com/2022-05/abandoned-checkouts', objectSentJSON, {
        headers: {
            'Authorization': `Basic ${base64}`,
            'Content-Type': 'application/json'
        }
    });
    console.log(response.status, response.data);
    res.status(response.status).json(response.data);
}));
app.listen(3000, () => console.log("Server is running!"));
