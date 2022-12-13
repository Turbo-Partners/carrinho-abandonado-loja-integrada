"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const socket_io_1 = __importDefault(require("socket.io"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
// app.use(express.json());
app.use((0, cors_1.default)());
const httpServer = http_1.default.createServer(app);
const io = new socket_io_1.default.Server(httpServer, {
    cors: {
        methods: ["GET", "POST"]
    }
});
let oneTimeout;
io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);
    socket.on("sendAbandonedCartInfo", (data) => {
        function sendCartInfo() {
            console.log(data);
            socket.emit("infoSent", "enviado");
        }
        ;
        oneTimeout = setTimeout(sendCartInfo, 5000);
        console.log("Envio timer iniciado");
        socket.on("setTimeOut", () => {
            clearTimeout(oneTimeout);
            oneTimeout = setTimeout(sendCartInfo, 5000);
            console.log("Envio adiado");
        });
        socket.on("checkoutComplete", () => {
            clearTimeout(oneTimeout);
            console.log("Compra feita");
        });
    });
    socket.emit("connected", "oi");
});
httpServer.listen(3000, () => console.log("Server-test is running!"));
