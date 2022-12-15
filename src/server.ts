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

let oneTimeout;

io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id}`)

  socket.on('sendAbandonedCartInfo', (data) => {
    let dataToSend = data

    async function sendCartInfo () {

      console.log(dataToSend)

      const base64 = btoa(`${process.env.CLIENT_ID}:${process.env.CLIENT_SERVER}`)
      axios.post('https://api.reportana.com/2022-05/abandoned-checkouts', dataToSend, {
        headers: {
          Authorization: `Basic ${base64}`,
          'Content-Type': 'application/json'
        }
      })
      .then(function (response) {
        socket.emit('infoSent', 'enviado')
      })
      .catch(function (error) {
        socket.emit('infoSent', error)
      });
    };

    oneTimeout = setTimeout(sendCartInfo, 10000)
    console.log('Envio timer iniciado')

    socket.on('setTimeOut', () => {
      clearTimeout(oneTimeout)

      oneTimeout = setTimeout(sendCartInfo, 10000)
      console.log('Envio adiado')

      socket.emit('infoSent', 'Envio adiado')
    })

    socket.on('checkoutComplete', () => {
      clearTimeout(oneTimeout)
      console.log('Compra feita')

    })

    socket.on('updateAbandonedCartInfo', (data) => {
      dataToSend = data
      console.log('Dados atualizados')

    })
  })

  socket.emit('connected', 'connected')
})

httpServer.listen(8080, () => console.log('Server-test is running!'))