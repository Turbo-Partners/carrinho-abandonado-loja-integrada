import 'dotenv/config'
import axios from 'axios'
import express from 'express'
import socketio from 'socket.io'
import http from 'http'
import https from 'https'
import cors from 'cors'

const app = express()
app.use(express.json())
app.use(cors())

const httpServer = http.createServer(app)
const io = new socketio.Server(httpServer, {
  cors: {
    origin: "https://www.lojadabruna.com/",
    methods: ['GET', 'POST']
  }
})

io.on('connection', (socket) => {
  let sendCartTimeout;

  let dataToSend;

  console.log(`New connection: ${socket.id}`)

  socket.on('sendAbandonedCartInfo', (data) => {
    dataToSend = data;

    async function sendCartInfo () {

      const base64 = btoa(`${process.env.CLIENT_ID}:${process.env.CLIENT_SERVER}`)
      axios.post('https://api.reportana.com/2022-05/abandoned-checkouts', dataToSend, {
        headers: {
          Authorization: `Basic ${base64}`,
          'Content-Type': 'application/json'
        }
      })
      .then(function () {
        console.log(`${socket.id} ${dataToSend.reference_id} - enviado`);
      })
      .catch(function (error) {
        console.log(`${socket.id} ${dataToSend.reference_id} - ${error}`);
      });
    };

    sendCartTimeout = setTimeout(sendCartInfo, 900000);
    console.log(`${socket.id} ${dataToSend.reference_id} - Timer de envio iniciado`);

  })

  socket.on('updateAbandonedCartInfo', (data) => {
    dataToSend = data;
    console.log(`${socket.id} ${dataToSend.reference_id} - Dados atualizados`);

  })

  socket.on('checkoutComplete', () => {
    console.log(socket.connected)
    if(socket.connected === false) {
      console.log("teste de finalização")
      clearTimeout(sendCartTimeout);
      console.log(`${socket.id} ${dataToSend.reference_id} - Compra feita`);
    } 
  })

  socket.emit('connected', 'connected');
})

httpServer.listen(8080, () => console.log('Server is running!'));