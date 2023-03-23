import 'dotenv/config'
import axios from 'axios'
import express, { Request, Response } from 'express'
import socketio from 'socket.io'
import http from 'http'
import cors from 'cors'
import { IAbandonedCartData, IPurchaseResponse } from './interface'
import { createObjectToSend, formatDate } from './utils/Utils'

const app = express();
app.use(express.json());
app.use(cors());

const httpServer = http.createServer(app);
const base64 = btoa(`${process.env.CLIENT_ID}:${process.env.CLIENT_SERVER}`);
const io = new socketio.Server(httpServer, {
  cors: {
    origin: "https://www.lojadabruna.com/",
    methods: ['GET', 'POST']
  }
});

let compras = 0;
let comprasAlteradas = 0;
let carrinhosIniciados = 0;
let carrinhosAtualizados = 0;
let carrinhosEnviados = 0; 

async function getPurchasesList () {
  const dateFormatted = await formatDate(5);

  await axios.get(`https://api.awsli.com.br/v1/pedido/search/?limit=50&since_atualizado=${dateFormatted}&chave_api=${process.env.CHAVE_API}&chave_aplicacao=${process.env.CHAVE_APLICACAO}`,{
    headers: {
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip,deflate,compress'
    }
  })
  .then(function (response) {
    let purchasesListData = response.data;

    console.log(`Updated purchases: ${purchasesListData.objects.length}`)

    purchasesListData.objects.forEach(async (purchase) => {
      comprasAlteradas ++

      console.log("Compras alteradas = ", comprasAlteradas);

      /*
      let purchaseData: IPurchaseResponse;

      await axios.get(`https://api.awsli.com.br/v1/pedido/${purchase.numero}?chave_api=${process.env.CHAVE_API}&chave_aplicacao=${process.env.CHAVE_APLICACAO}`,{
        headers: {
          'Content-Type': 'application/json',
          'Accept-Encoding': 'gzip,deflate,compress'
        }
      })
      .then(function (response) {
        purchaseData = response.data;
      })
      .catch(function (error) {
        console.error(error);
      });

      if(purchaseData) {
        const purchaseDataFormatted = await createObjectToSend(purchaseData);
    
        await axios.post('https://api.reportana.com/2022-05/orders', purchaseDataFormatted,{
          headers: {
            Authorization: `Basic ${base64}`,
            'Content-Type': 'application/json',
            'Accept-Encoding': 'gzip,deflate,compress'
          }
        })
        .then(function (response) {
          console.log(`Compra atualizada: ${purchaseDataFormatted.number}`);
        })
        .catch(function (error) {
          if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
          }
        });
      }*/


    })
  })
  .catch(function (error) {
    console.error(error);
  });
};

function showData() {
  console.log("compras = ", compras);
  console.log("Compras alteradas = ", comprasAlteradas);

  console.log("Carrinhos iniciados = ", carrinhosIniciados);
  console.log("Carrinhos atualizados = ", carrinhosAtualizados);
  console.log("Carrinhos enviados = ", carrinhosEnviados);
}

setInterval(showData, 600000);
setInterval(getPurchasesList, 300000);

app.post("/finalizacao/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  compras ++

  console.log("compras = ", compras);

  return res.status(200).send();

  /*let purchaseData: IPurchaseResponse;
  
  await axios.get(`https://api.awsli.com.br/v1/pedido/${id}?chave_api=${process.env.CHAVE_API}&chave_aplicacao=${process.env.CHAVE_APLICACAO}`,{
    headers: {
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip,deflate,compress'
    }
  })
  .then(function (response) {
    purchaseData = response.data;
  })
  .catch(function (error) {
    console.error(error);
  });

  if(purchaseData) {
    const purchaseDataFormatted = await createObjectToSend(purchaseData);

    await axios.post('https://api.reportana.com/2022-05/orders', purchaseDataFormatted,{
      headers: {
        'Authorization': `Basic ${base64}`,
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip,deflate,compress'
      }
    })
    .then(function (response) {
      console.log(`Compra concluída: ${purchaseDataFormatted.number}`);
      return res.status(201).send();
    })
    .catch(function (error) {
      if (error.response) {
        console.log(error.response.data);
        return res.status(error.response.status).send();
      }
    });
  }*/
});

io.on('connection', (socket) => {
  let sendCartTimeout;

  let dataToSend: IAbandonedCartData;

  console.log(`New connection: ${socket.id}`)

  carrinhosIniciados ++
  console.log('Carrinhos iniciados = ', carrinhosIniciados)

  socket.on('sendAbandonedCartInfo', (data) => {
    dataToSend = data;

    if(typeof dataToSend.reference_id === "undefined") {
      console.log("Error 'reference_id' undefined");
      dataToSend.reference_id = Date.now().toString();
    }

    async function sendCartInfo () {

      carrinhosEnviados ++
      console.log("Carrinhos enviados = ", carrinhosEnviados);

     /* axios.post('https://api.reportana.com/2022-05/abandoned-checkouts', dataToSend, {
        headers: {
          'Authorization': `Basic ${base64}`,
          'Content-Type': 'application/json',
          'Accept-Encoding': 'gzip,deflate,compress'
        }
      })
      .then(function () {
        console.log(`${socket.id} ${dataToSend.reference_id} - enviado`);
      })
      .catch(function (error) {
        if (error.response) {
          console.log(`${socket.id} ${dataToSend.reference_id} - ${error.response.data}`);
        }
      });*/
    };

    sendCartTimeout = setTimeout(sendCartInfo, 900000);
    console.log(`${socket.id} ${dataToSend.reference_id} - Timer de envio iniciado`);
  })

  socket.on('updateAbandonedCartInfo', (data: IAbandonedCartData) => {
    dataToSend = data;
    console.log(`${socket.id} ${dataToSend.reference_id} - Dados atualizados`);

    carrinhosAtualizados ++
    console.log("Carrinhos atualizados = ", carrinhosAtualizados);

  })

  socket.on('checkoutComplete', () => {
    setTimeout(() => {
      if(socket.connected === false) {
        clearTimeout(sendCartTimeout);
        console.log(`${socket.id} - Compra feita`);
      } 
    }, 3000); 
  })

  socket.emit('connected', 'connected');
})

httpServer.listen(8080, () => console.log('Server is running!'));