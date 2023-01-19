# API de integração Loja integrada - Reportana #

- [API de integração Loja integrada - Reportana](#API-de-integração-Loja-integrada---Reportana)
  - [Introdução](#Introdução)
  - [Inicialização do projeto](#Inicialização-do-projeto)
- [Scripts](#Scripts)
  - [Eventos do Socket](#Eventos-do-Socket)
- [API](#API)
  - [Rotas da API](#Rotas-da-API)
  - [Configurações](#Configurações)
  - [Variáveis de ambiente](#Variáveis-de-ambiente)


## Introdução ##

Integração feita com intuito de coletar dados de carrinhos abandonados e compras realizadas na [Loja integrada](https://lojaintegrada.com.br/) e adicioná-los a plataforma [Reportana](https://reportana.com/).

A integração e constituída de duas partes, os scripts e a API.

## Inicialização do projeto ##

- Os scripts devems ser adicionados ao front-end de uma loja da **Loja integrada**, expecificamente dentro do checkout.
- Para inicilizar a API:

```
- Primeiro instalamos o yarn
  $ npm install --global yarn

- Depois entramos no diretório da api
  # change directory
  $ cd api

- Instalamos as dependência
  # install dependencies
  $ yarn

- Iniciamos o servidor
  # start script
  $ yarn dev
```

## Scripts ##

Os scripts foram adicionados na Loja integrada para a colata passiva de dados. Quando um usuário chegar na fase de checkout, se ele estiver logado ou já tiver preenchido os três campos básicos do formulário (nome, e-mail e telefone), o script ativa o evento **sendAbandonedCartInfo** que enviada os dados que já foram coletados para a API e inicia um temporizador de envio. Ao final do tempo de envio, será criado um carrinho abandonado na Reportana. Caso a compra seja finalizada dentro do tempo de envio, o evento **checkoutComplete** será emitido e o temporizador é finalizado.
Qualquer atualização feita dentro do período de envio será envida para a API e substituirá os dados enviados anteriormente.

- [carrinho-abandonado](https://github.com/Turbo-Partners/carrinho-abandonado-loja-integrada/blob/main/script/carrinho-abandonado.js) script para a coleta das informações do usuário durante a fase de checkout das lojas. As informações coletadas são enviadas para a API por sockets usando o [Socket.io](https://socket.io/).
- [enviar-compra](https://github.com/Turbo-Partners/carrinho-abandonado-loja-integrada/blob/main/script/enviar-compra.js) script para a coleta do id da compra fornecido após a fase checkout e envia por uma requisição POST para a rota **/finalizacao/:id** usando o [Axios](https://axios-http.com/docs/intro).

### Eventos do Socket ###

- **sendAbandonedCartInfo** este evento envia para a API um objeto com os dados coletados do usuario e inicia um o temporizador de envio.

- **updateAbandonedCartInfo** este evento envia para a API o mesmo objeto do evento de **sendAbandonedCartInfo**, mas com a função de atualizar os dados que foram enviados anteriormente.

- **checkoutComplete** este evento sinaliza uma compra efetuada, finalizando o temporizador de envio, impedindo que um carrinho abandonado seja criado na Reportana. 

**Objeto enviado:**
```  
    {
        reference_id: string,
        reason_type: null,
        admin_url: string,
        number: string,
        customer_name: string,
        customer_email: string,
        customer_phone: string,
        billing_address: {
            name: string,
            first_name: string,
            last_name: string,
            company: null,
            phone: string,
            address1: string,
            address2: string,
            city: string,
            province: string,
            province_code: string,
            country: string,
            country_code: string,
            zip: string,
        },
        shipping_address: {
            name: string,
            first_name: string,
            last_name: string,
            company: null,
            phone: string,
            address1: string,
            address2: string,
            city: string,
            province: string,
            province_code: string,
            country: string,
            country_code: string,
            zip: string,
            latitude: null,
            longitude: null
        },
        line_items: [
            {
                title: string,
                variant_title: string,
                quantity: number,
                price: number,
                path: string,
                image_url: string, 
                tracking_number: null
            }
        ]   
        currency: string,
        total_price: number,
        subtotal_price: number,
        referring_site: string,
        checkout_url: string,
        completed_at: string,
        original_created_at: string
    };
```

## API ##

A API está encarregada de transitar os dados entre as plataformas. Através do [Socket.io](https://socket.io/), a API receberá os dados coletados do usuário. Os dados serão tratados e, após o termino de um temporizador, enviados para a Reportana por requisições usando o [Axios](https://axios-http.com/docs/intro).

### Rotas da API ###

- **/finalizacao/:id** está é uma rota POST que recebe um **ID** pelos parâmetros de rota. O id será usado para buscar uma compra feita dentro da loja integrada para que a mesma seja cadastrada na Reportana.

  ```
  post /finalizacao/:id
  
  id: string
  ```
  
### Configurações ###
  
  - A API, em períodos predeterminados, estará buscando alterações e novas compras feitas dentro da **Loja integrada**, a função ``getPurchasesList``, responsável por esta busca, estará sendo executada por um ``setInterval(getPurchasesList, milissegundo);`` onde o segundo parâmetro será o tempo em milissegundos para a função ser executada.
  - Dentro da função ``getPurchasesList`` podemos encontrar uma função ``formatDate(minutos)`` que podemos passar por ela um **number** como parâmetro representando o tempo em minutos que estará sendo feita a busca por novas compras na Loja integrada. Um ``formatDate(5)`` esta buscando qualquer nova compra feita nos últimos 5 minutos.
  - Dentro do evento socket **sendAbandonedCartInfo** tem uma variável chamada de **sendCartTimeout** dentro dela tem um **setTimeout(sendCartInfo, milissegundo)** onde o segundo parâmetro será o tempo em milissegundos para que os dados coletados pelo script sejam enviados para a Rerportana.
  
### Variáveis de ambiente ###

  **Chaves de API da Reportana**
  
    - CLIENT_ID
    - CLIENT_SERVER

  **Chaves de API da Loja integrada**
  
    - CHAVE_API
    - CHAVE_APLICACAO
