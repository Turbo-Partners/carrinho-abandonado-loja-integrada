!(function(){
    window.onload = () => {
        const purchaseNumber = document.querySelector("h2.cor-principal.numero-pedido").outerText;
    
        axios.post(`https://carrinho-abandonado-yic75.ondigitalocean.app/finalizacao/${purchaseNumber}`)
          .then(function (response) {
            console.log(response.status);
          })
          .catch(function (error) {
            console.error(error.response.status);
          });
    };
})();    