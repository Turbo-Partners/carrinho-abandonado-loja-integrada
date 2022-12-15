const userInfo = Array.from(document.querySelectorAll("ul.caixa-info li"));
const userInfoFormatted = {
    name: "",
    email: "",
    phone: "",
    //cpf
    // razaoSocial 
};
const userAddressFormatted = {
    address: "",
    zip: "",
    city: "",
    province: "",
    provinceCode: "",
};
let userCart = [];
const userId = Date.now();
let userNameArray = [];
let totalPrice = 0;
let subtotalPrice = 0;
let date = new Date();
let dateFormatted = `${date.getFullYear()}-${((date.getMonth()+1)<10?'0':'') + (date.getMonth()+1)}-${(date.getDate()<10?'0':'') + date.getDate()} ${date.getHours()}:${(date.getMinutes()<10?'0':'') + date.getMinutes()}`;

function convertProvince(val) {
	var dateFormatted;

	switch (val.toUpperCase()) {
		case "AC" :	data = "Acre";					break;
		case "AL" :	data = "Alagoas";				break;
		case "AM" :	data = "Amazonas";				break;
		case "AP" :	data = "Amapá";					break;
		case "BA" :	data = "Bahia";					break;
		case "CE" :	data = "Ceará";					break;
		case "DF" :	data = "Distrito Federal";		break;
		case "ES" :	data = "Espírito Santo";		break;
		case "GO" :	data = "Goiás";					break;
		case "MA" :	data = "Maranhão";				break;
		case "MG" :	data = "Minas Gerais";			break;
		case "MS" :	data = "Mato Grosso do Sul";	break;
		case "MT" :	data = "Mato Grosso";			break;
		case "PA" :	data = "Pará";					break;
		case "PB" :	data = "Paraíba";				break;
		case "PE" :	data = "Pernambuco";			break;
		case "PI" :	data = "Piauí";					break;
		case "PR" :	data = "Paraná";				break;
		case "RJ" :	data = "Rio de Janeiro";		break;
		case "RN" :	data = "Rio Grande do Norte";	break;
		case "RO" :	data = "Rondônia";				break;
		case "RR" :	data = "Roraima";				break;
		case "RS" :	data = "Rio Grande do Sul";		break;
		case "SC" :	data = "Santa Catarina";		break;
		case "SE" :	data = "Sergipe";				break;
		case "SP" :	data = "São Paulo";				break;
		case "TO" :	data = "Tocantíns";				break;
	}

	return data;
}

const cartProducts = document.querySelectorAll("tbody tr");

let socket;
    
if(!socket) {
    socket = new io('https://carrinho-abandonado-yic75.ondigitalocean.app/');
}

socket.on("connected", (arg) => {
  console.log(arg);
});

socket.on("infoSent", (arg) => {
  console.log(arg);
});

if(document.getElementById("idEnderecoPrincipal2")) {
    document.getElementById("idEnderecoPrincipal2").onclick = function() {
        socket.emit("setTimeOut", "");
    };
}

const checkoutButton = document.getElementById("finalizarCompra");

checkoutButton.addEventListener("click", function() {
    socket.emit("checkoutComplete");
});


function getInfoWhenNewUser() {
    let inputChanged = false;
    
    const userEmailInput = document.querySelector("input#id_email");
    if(userInfoFormatted.email !== userEmailInput.value) {
        userInfoFormatted.email = userEmailInput.value;
        inputChanged = true;
    }
    
    const userNameInput = document.querySelector("input#id_nome");
    if(userInfoFormatted.name !== userNameInput.value) {
        userInfoFormatted.name = userNameInput.value;
        inputChanged = true;
    }
    
    const userPhoneInput = document.querySelector("input#id_telefone_celular");
    if(userInfoFormatted.phone !== userPhoneInput.value) {
        userInfoFormatted.phone = `+55${userPhoneInput.value.replace(/\D/g,'')}`;
        inputChanged = true;
    }
    
    const userZipCodeInput = document.querySelector("input#id_cep");
    if(userAddressFormatted.zip !== userZipCodeInput.value) {
        userAddressFormatted.zip = userZipCodeInput.value;
        inputChanged = true;
    }
    
    if(userZipCodeInput.value === "") {
        userAddressFormatted.address = "";
        userAddressFormatted.City = "";
        userAddressFormatted.province = "";
        userAddressFormatted.provinceCode = "";
        
    } else {
    
        const userAddressInput = document.querySelector("input#id_endereco");
        const userAddressNumberInput = document.querySelector("input#id_numero");
        if(userAddressFormatted.address !== `${userAddressInput.value}, ${userAddressNumberInput.value}`) {
            console.log(userAddressFormatted.address, `${userAddressInput.value}, ${userAddressNumberInput.value}`);
            userAddressFormatted.address = `${userAddressInput.value}, ${userAddressNumberInput.value}`;
            inputChanged = true;
        }
        
        const userCityInput = document.querySelector("input#id_cidade");
        if(userAddressFormatted.City !== userCityInput.value) {
            console.log(userAddressFormatted.City, userCityInput.value);
            userAddressFormatted.City = userCityInput.value;
            inputChanged = true;
        }
            
        const userProvinceInput = document.querySelector("select#id_estado");
        if(userAddressFormatted.province !== userProvinceInput.options[userProvinceInput.selectedIndex].text) {
            console.log(userAddressFormatted.province, userProvinceInput.options[userProvinceInput.selectedIndex].text);
            userAddressFormatted.province = userProvinceInput.options[userProvinceInput.selectedIndex].text;
            inputChanged = true;
        }
        
        const userProvinceCodeInput = document.querySelector("select#id_estado").value;
        if(userAddressFormatted.provinceCode !== userProvinceCodeInput) {
            console.log(userAddressFormatted.provinceCode, userProvinceCodeInput);
            userAddressFormatted.provinceCode = userProvinceCodeInput;
            inputChanged = true;
        }
        
    }
    
    if(inputChanged === true) {
        if((userInfoFormatted.name !== '') && (userInfoFormatted.email !== '') && (userInfoFormatted.phone !== '')) {
            getUserInfoObject();
        } 
    }
}

function getUserInfoObject() {
    const userInfoObject = {
        reference_id: userId.toString(),
        reason_type: null,
        admin_url: "https://www.google.com.br/",
        number: userId.toString(),
        customer_name: userInfoFormatted.name,
        customer_email: userInfoFormatted.email,
        customer_phone: userInfoFormatted.phone,
        billing_address: {
            name: userInfoFormatted.name,
            first_name: userNameArray[0],
            last_name: userNameArray[userNameArray.length - 1],
            company: null,
            phone: userInfoFormatted.phone,
            address1: userAddressFormatted.address,
            address2: userAddressFormatted.address,
            city: userAddressFormatted.city,
            province: userAddressFormatted.province,
            province_code: userAddressFormatted.provinceCode,
            country: "Brazil",
            country_code: "BR",
            zip: userAddressFormatted.zip,
        },
        shipping_address: {
            name: userInfoFormatted.name,
            first_name: userNameArray[0],
            last_name: userNameArray[userNameArray.length - 1],
            company: null,
            phone: userInfoFormatted.phone,
            address1: userAddressFormatted.address,
            address2: userAddressFormatted.address,
            city: userAddressFormatted.city,
            province: userAddressFormatted.province,
            province_code: userAddressFormatted.provinceCode,
            country: "Brazil",
            country_code: "BR",
            zip: userAddressFormatted.zip,
            latitude: null,
            longitude: null
        },
        line_items: userCart,
        currency: "BRL",
        total_price: totalPrice,
        subtotal_price: subtotalPrice,
        referring_site: "https://www.google.com/",
        checkout_url: "https://www.google.com/",
        completed_at: dateFormatted,
        original_created_at: dateFormatted
    };   
        socket.emit("sendAbandonedCartInfo", userInfoObject);
}

function setCartProduct(cartProducts) {
    userCart = [];
    cartProducts.forEach(product => {
        if(!product.classList.contains('bg-dark')) {
            let listedProduct = {
                title: "",
                variant_title: "",
                quantity: 0,
                price: 0,
                path: "https://example.com/products/5678",
                image_url: "https://example.com/products/5678/image.jpg", 
                tracking_number: null
            };
            
            let productTitle = product.querySelector('div.produto-info');
            listedProduct.title = productTitle.textContent.split("\n                      ")[1];
            
            let productPrice = product.querySelector('div.preco-produto strong');
            listedProduct.price = parseFloat(productPrice.textContent.split("\n                        ")[1].split("\n                      ")[0].split(" ")[1]);
            
            let productSku = Array.from(product.querySelectorAll('div.produto-info ul li'));
            listedProduct.tracking_number = productSku[0].querySelector("strong").textContent.split("\n                              ")[1].split("\n                            ")[0];
            
            let productQuantity = product.querySelector("td.conteiner-qtd div");
            listedProduct.quantity = parseInt(productQuantity.textContent);
            
            userCart.push(listedProduct);
            
        } else {
            
            if (product.classList.contains('tr-checkout-total')) {
                totalPrice = parseFloat(product.querySelector('div.total').dataset.total);
                
            } else if (product.classList.contains('esconder-mobile')){
                if(!product.classList.contains('desconto-tr')) {
                    subtotalPrice = parseFloat(product.querySelector('div.subtotal').dataset.float);
                    
                }
            }
        }
    });
}

setCartProduct(cartProducts);

if(userInfo.length !== 0) {
    const userInfoNotFormatted = [];
    const userAddressNotFormatted = [];

    userInfo.forEach(info => {
        let myArray = info.textContent.split(": ");
        userInfoNotFormatted.push(myArray[1]);
    
    });
    
    userInfoFormatted.name = userInfoNotFormatted[0].split("\n")[0];
    userInfoFormatted.email = userInfoNotFormatted[1].split("\n")[0];
    userInfoFormatted.phone = userInfoNotFormatted[2].split("\n")[0];
    
    userNameArray = userInfoFormatted.name.split(" ");
    
    // let address;
        
    // for(let i = 3; i === 0; i--) {
    //     if(document.getElementById(`enderecoPrincipal${i}`)) {
    //         console.log(document.getElementById(`enderecoPrincipal${i}`));
    //         document.getElementById(`enderecoPrincipal${i}`).getElementsByClassName("accordion-inner")[0];
    //     }
    // }
    
    // document.getElementById("enderecoPrincipal1") ? address = document.getElementById("enderecoPrincipal1").getElementsByClassName("accordion-inner")[0] : address = document.getElementById("enderecoPrincipal2").getElementsByClassName("accordion-inner")[0];
    
    // console.log(address.textContent.split("<br>"));
    
    const address = document.getElementById("enderecoPrincipal2").getElementsByClassName("accordion-inner")[0];
    
    const myAddress = address.textContent.split("<br>");
    userAddressNotFormatted.push(myAddress[0]);
    
    let myAddressSplited = userAddressNotFormatted[0].split("\n                              ");
    myAddressSplited = myAddressSplited.filter(function (i) {
        return i;
    });
    
    userAddressFormatted.address =  myAddressSplited[0];
    
    const getProvinceInfo = myAddressSplited[1].split(", ");
    let getCity = getProvinceInfo[1].split(" / ");
    userAddressFormatted.city = getCity[0];
    userAddressFormatted.province = convertProvince(getCity[1]);
    userAddressFormatted.provinceCode = getCity[1];
    
    const getZipCode = myAddressSplited[2].split("\n            ");
    userAddressFormatted.zip = getZipCode[0];
    
    const phoneFormatted = userInfoFormatted.phone.replace(/\D/g,'');
    userInfoFormatted.phone = `+55${phoneFormatted}`;
    
    setCartProduct(cartProducts);
    getUserInfoObject();

} else {
    let inputsArray = [];
    
    inputsArray.push(document.querySelector('input#id_email'));
    inputsArray.push(document.querySelector('input#id_nome'));
    inputsArray.push(document.querySelector('input#id_telefone_celular'));
    inputsArray.push(document.querySelector('input#id_cep'));
    inputsArray.push(document.querySelector('input#id_numero'));
    
    inputsArray.forEach(function(elem) {
        elem.addEventListener("focusout", function() {
            setCartProduct(cartProducts);
            getInfoWhenNewUser();
        });
    });
}
