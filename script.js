const sizes=['XS','S','M','L','XL','2XL','3XL','4XL','5XL'];
let selected=null,cart=JSON.parse(localStorage.getItem('orvn_cart')||'[]');
const $=x=>document.getElementById(x), money=n=>'CHF '+n.toFixed(2);
$('sizes').innerHTML=sizes.map(s=>`<button data-size="${s}">${s}</button>`).join('');
document.querySelectorAll('#sizes button').forEach(b=>b.onclick=()=>{document.querySelectorAll('#sizes button').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');selected=b.dataset.size});
$('add').onclick=()=>{if(!selected)return alert('Bitte zuerst eine Größe auswählen.');cart.push({name:'BEYOND THE SURFACE TEE',size:selected,price:49.90});save();openCart()};
function save(){localStorage.setItem('orvn_cart',JSON.stringify(cart));render()}
function render(){$('cartCount').textContent=cart.length;$('items').innerHTML=cart.length?cart.map((x,i)=>`<div class="item"><div>${x.name}<small>SIZE ${x.size}</small></div><div>${money(x.price)}<br><button class="remove" data-i="${i}">REMOVE</button></div></div>`).join(''):'<p class="micro">YOUR BAG IS EMPTY.</p>';document.querySelectorAll('.remove').forEach(b=>b.onclick=()=>{cart.splice(+b.dataset.i,1);save()});$('total').textContent=money(cart.reduce((a,x)=>a+x.price,0))}
function openCart(){$('cart').classList.add('open');$('overlay').classList.add('open')}
function closeCart(){$('cart').classList.remove('open');$('overlay').classList.remove('open')}
$('cartOpen').onclick=openCart;$('close').onclick=closeCart;$('overlay').onclick=closeCart;
$('checkout').onclick=()=>{if(!cart.length)alert('Dein Warenkorb ist leer.');else alert('Checkout kommt als nächster Schritt: Stripe + Printify.')};
render();
