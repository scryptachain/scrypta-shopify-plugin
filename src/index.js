/*{% if {{checkout.transactions[0].gateway}} == "Paga con Lyra" %}
<br><br>
<div id="root" style="text-align:center; padding:15px;"></div>
<script> --> NEEDED IN SHOPIFY */

const axios = require('axios')
for (var prop in window.CryptoAddresses) {
    window.coinselected = prop;
    window.paytoaddress = window.CryptoAddresses[prop]
    break;
}
const app = document.getElementById('root');
const container = document.createElement('div');
app.setAttribute('class', 'content-box');
app.appendChild(container);
const container2 = document.createElement('div');
container2.setAttribute('class', 'content-box__row');
app.appendChild(container2);
var request = new XMLHttpRequest();
var amountstring = "{{checkout.total_price | money}}";
var checkoutID = "{{checkout.id}}"
//var amountstring = "€1,00"; // --> EMULATING ROW ABOVE
//var checkoutID = "1111222223";
var amountstring = amountstring.replace(',','.');
var currencysymbol = amountstring.substring(0,1);
var amount = parseFloat(amountstring.substring(1));
var currency = "eur";

function calculateCryptoAmount(){
    if(document.getElementById('cryptoqrcode')){
        document.getElementById('cryptoqrcode').remove();
    }
    const container3 = document.createElement('div');
    container3.setAttribute('class', 'content-box__row');
    container3.setAttribute('id', 'cryptoqrcode');
    app.appendChild(container3);
    var pricerequest = new XMLHttpRequest();
    pricerequest.open('GET', 'https://api.coingecko.com/api/v3/coins/scrypta', true);
    pricerequest.onload = async function () {
        var data = JSON.parse(this.response);
        var price = data.market_data.current_price[currency];
        if (pricerequest.status >= 200 && pricerequest.status < 400) {
            var amountneeded = parseFloat(parseFloat(amount) / price).toFixed(8);
            amountneeded = amountneeded.toString();
            let addressResponse = await axios.post('https://gateway.scryptachain.org/gateway/request', { "asset": "LYRA", "amount": amountneeded.replace(',','.'), "notes": "Shopify order #" + checkoutID})
            let PaymentAddress = addressResponse.data.address
            const p = document.createElement('h3');
            p.textContent = `Invia esattamente`;
            container3.appendChild(p);
            const pamount = document.createElement('h2');
            pamount.textContent = amountneeded +' '+data.symbol.toUpperCase()
            container3.appendChild(pamount);
            const br = document.createElement('br');
            container3.appendChild(br);
            container3.appendChild(br);
            const qr= document.createElement('img');
            //qr.src = `https://chart.googleapis.com/chart?cht=qr&chl=${data.symbol}:` + window.paytoaddress + `%26amount=${amountneeded}&chs=300x300&chld=L|0`;
            qr.src = addressResponse.data.qrcode
            qr.width = "300"
            container3.appendChild(qr);
            container3.appendChild(br);
            container3.appendChild(br);
            const paddr = document.createElement('p');
            paddr.textContent = PaymentAddress;
            container3.appendChild(paddr);
            const waitaddr = document.createElement('p');
            container3.appendChild(br);
            container3.appendChild(br);
            waitaddr.textContent = 'Attendi qualche minuto per la conferma.';
            container3.appendChild(waitaddr);
            var isChecking = true
            setInterval(async function (){
                if(isChecking === true){
                    let check = await axios.post('https://gateway.scryptachain.org/gateway/check', { "asset": "LYRA", "address": PaymentAddress })
                    if(check.data.success === true){
                        alert('Pagamento ricevuto correttamente, puoi chiudere questa pagina!')
                        isChecking = false
                    }
                }
            }, 5000)
        } else {
            const errorMessage = document.createElement('p');
            errorMessage.textContent = `Scusa, qualcosa non sta funzionanedo`;
            app.appendChild(errorMessage);
        }
    }
    pricerequest.send();
}

calculateCryptoAmount();
//</script> --> NEEDED IN SHOPIFY

//{% endif %} --> NEEDED IN SHOPIFY