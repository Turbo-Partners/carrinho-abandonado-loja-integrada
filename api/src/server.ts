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

  let checkoutCompleted = false;

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
        console.log(`${socket.id} - enviado`);
      })
      .catch(function (error) {
        console.log(`${socket.id} - ${error}`);
      });
    };

    sendCartTimeout = setTimeout(sendCartInfo, 900000);
    console.log(`${socket.id} - Timer de envio iniciado`);

    // socket.on('setTimeOut', () => {
    //   clearTimeout(oneTimeout)

    //   oneTimeout = setTimeout(sendCartInfo, 20000)
    //   console.log('Envio adiado')

    //   socket.emit('infoSent', 'Envio adiado')
    // })

  })

  socket.on('updateAbandonedCartInfo', (data) => {
    dataToSend = data;
    console.log(`${socket.id} - Dados atualizados`);

  })

  socket.on('checkoutComplete', () => {
    setTimeout(() => {
      console.log(socket.connected)
      if(socket.connected === false) {
        clearTimeout(sendCartTimeout);
        console.log(`${socket.id} - Compra feita`);
      } else {
        console.log(`${socket.id} - erro na finalização`)
      }
    }, 1000);
    
  })

  socket.emit('connected', 'connected');
})

httpServer.listen(8080, () => console.log('Server is running!'));