import { IAddress, ILineItems, IPurchaseResponse, ISituacao } from "../interface";
import { Purchase } from "../purchase";
import dayjs from 'dayjs'
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

export async  function convertProvince(rovinceCode: string): Promise<string> {
  let provinceName: string;
  switch (rovinceCode.toUpperCase()) {
    case "AC" :	provinceName = "Acre";					break;
    case "AL" :	provinceName = "Alagoas";				break;
    case "AM" :	provinceName = "Amazonas";				break;
    case "AP" :	provinceName = "Amapá";					break;
    case "BA" :	provinceName = "Bahia";					break;
    case "CE" :	provinceName = "Ceará";					break;
    case "DF" :	provinceName = "Distrito Federal";		break;
    case "ES" :	provinceName = "Espírito Santo";		break;
    case "GO" :	provinceName = "Goiás";					break;
    case "MA" :	provinceName = "Maranhão";				break;
    case "MG" :	provinceName = "Minas Gerais";			break;
    case "MS" :	provinceName = "Mato Grosso do Sul";	break;
    case "MT" :	provinceName = "Mato Grosso";			break;
    case "PA" :	provinceName = "Pará";					break;
    case "PB" :	provinceName = "Paraíba";				break;
    case "PE" :	provinceName = "Pernambuco";			break;
    case "PI" :	provinceName = "Piauí";					break;
    case "PR" :	provinceName = "Paraná";				break;
    case "RJ" :	provinceName = "Rio de Janeiro";		break;
    case "RN" :	provinceName = "Rio Grande do Norte";	break;
    case "RO" :	provinceName = "Rondônia";				break;
    case "RR" :	provinceName = "Roraima";				break;
    case "RS" :	provinceName = "Rio Grande do Sul";		break;
    case "SC" :	provinceName = "Santa Catarina";		break;
    case "SE" :	provinceName = "Sergipe";				break;
    case "SP" :	provinceName = "São Paulo";				break;
    case "TO" :	provinceName = "Tocantíns";				break;
  }

  return provinceName;
}

export async function convertPurchasePaymentStatus(purchaseStatus: ISituacao): Promise<string> {    
  if (purchaseStatus.aprovado === true && purchaseStatus.cancelado === false) {
    return 'PAID';
  } else if (purchaseStatus.aprovado === false && purchaseStatus.cancelado === true) {
    return 'NOT_PAID';
  } else if (purchaseStatus.aprovado === false && purchaseStatus.cancelado === false) {
    return 'PENDING';
  }
}

export async function convertPurchasePaymentType(codigo: string) {
  if (codigo === "psredirect") {
    return 'CREDIT_CARD';
  } else if (codigo === "paghiper" || codigo === "pagali-pix") {
    return 'PIX';
  } else {
    return 'OTHER';
  }
}

export async function formatDate(delay: number): Promise<string> {
  const dateNow = dayjs();
  const dateDelay = dateNow.subtract(delay, 'minute').subtract(3, 'hour');
  const dateToUtc =  dayjs(dateDelay).utc().local().format();
  const dateFormatted = dayjs(dateToUtc).format('YYYY-MM-DDTHH:mm:ss');

  return dateFormatted;
}

export async function createObjectToSend(dataToSend: IPurchaseResponse): Promise<Purchase> {
  const purchaseDataToSend = new Purchase();

  purchaseDataToSend.reference_id = dataToSend.numero.toString();
  purchaseDataToSend.number = dataToSend.numero.toString();
  purchaseDataToSend.admin_url = 'https://example.com/admin/orders/123456789';
  purchaseDataToSend.customer_name = dataToSend.cliente.nome;
  purchaseDataToSend.customer_email = dataToSend.cliente.email;
  purchaseDataToSend.customer_phone = `+55${dataToSend.cliente.telefone_celular}`;

  const address: IAddress = {
    name: dataToSend.cliente.nome,
    first_name: dataToSend.cliente.nome.split(' ')[0],
    last_name: dataToSend.cliente.nome.split(' ')[dataToSend.cliente.nome.split(' ').length - 1],
    company: dataToSend.cliente.razao_social,
    phone: `+55${dataToSend.cliente.telefone_celular}`,
    address1: `${dataToSend.endereco_entrega.endereco}, ${dataToSend.endereco_entrega.numero}`,
    address2: `${dataToSend.endereco_entrega.endereco}, ${dataToSend.endereco_entrega.numero}`,
    city: dataToSend.endereco_entrega.cidade,
    province: await convertProvince(dataToSend.endereco_entrega.estado),
    province_code: dataToSend.endereco_entrega.estado,
    country: dataToSend.endereco_entrega.pais,
    country_code: 'BR',
    zip: dataToSend.endereco_entrega.cep,
    latitude: null,
    longitude: null,
  }
  purchaseDataToSend.billing_address = address;
  purchaseDataToSend.shipping_address = address;

  const itemArray: ILineItems[] = [];
  dataToSend.itens.forEach(item => {
    const itemObj: ILineItems = {
      title: item.nome,
      variant_title: item.nome,
      quantity: parseInt(item.quantidade),
      price: parseFloat(item.preco_cheio),
      path: item.produto,
      image_url: "", 
      tracking_number: ""
    }
    
    itemArray.push(itemObj)
  })

  purchaseDataToSend.line_items = itemArray;
  purchaseDataToSend.currency = 'BRL';
  purchaseDataToSend.total_price = parseFloat(dataToSend.valor_total);
  purchaseDataToSend.subtotal_price = parseFloat(dataToSend.valor_subtotal);
  purchaseDataToSend.payment_status = await convertPurchasePaymentStatus(dataToSend.situacao)
  purchaseDataToSend.payment_method = await convertPurchasePaymentType(dataToSend.pagamentos[0].forma_pagamento.codigo),
  purchaseDataToSend.tracking_numbers = dataToSend.envios[0].objeto
  purchaseDataToSend.referring_site = 'https://www.lojadabruna.com/',
  purchaseDataToSend.status_url = `https://www.lojadabruna.com/conta/pedido/${dataToSend.numero}/listar_reduzido`,
  purchaseDataToSend.billet_url = '',
  purchaseDataToSend.billet_line = '',
  purchaseDataToSend.billet_expired_at = dataToSend.data_expiracao,
  purchaseDataToSend.original_created_at = dataToSend.data_criacao

  return purchaseDataToSend
}