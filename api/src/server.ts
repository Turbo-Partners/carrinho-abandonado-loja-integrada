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
    origin: "https://turbo-partners-teste.lojaintegrada.com.br/",
    methods: ['GET', 'POST']
  }
})

let sendCartTimeout;

let checkoutCompleted = false;

let dataToSend;

io.on('connection', (socket) => {
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
      .then(function (response) {
        socket.emit('infoSent', response);
        console.log("enviado");
      })
      .catch(function (error) {
        socket.emit('infoSent', error);
        console.log(error);
      });
    };

    sendCartTimeout = setTimeout(sendCartInfo, 20000);
    console.log('Timer de envio iniciado');

    // socket.on('setTimeOut', () => {
    //   clearTimeout(oneTimeout)

    //   oneTimeout = setTimeout(sendCartInfo, 20000)
    //   console.log('Envio adiado')

    //   socket.emit('infoSent', 'Envio adiado')
    // })

  })

  socket.on('updateAbandonedCartInfo', (data) => {
    dataToSend = data;
    console.log('Dados atualizados');

  })

  socket.on('checkoutComplete', () => {
    clearTimeout(sendCartTimeout);

    checkoutCompleted = true;

    console.log('Compra feita');
  })

  socket.emit('connected', 'connected');
})

httpServer.listen(8080, () => console.log('Server-test is running!'));