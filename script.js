const sizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];

let selected = null;
let cart = JSON.parse(localStorage.getItem('orvn_cart') || '[]');

const $ = (x) => document.getElementById(x);

const money = (n) => 'CHF ' + Number(n).toFixed(2);

// Größen anzeigen
$('sizes').innerHTML = sizes
  .map((s) => `<button data-size="${s}">${s}</button>`)
  .join('');

// Größe auswählen
document.querySelectorAll('#sizes button').forEach((button) => {
  button.onclick = () => {
    document
      .querySelectorAll('#sizes button')
      .forEach((item) => item.classList.remove('selected'));

    button.classList.add('selected');
    selected = button.dataset.size;
  };
});

// Produkt zum Warenkorb hinzufügen
$('add').onclick = () => {
  if (!selected) {
    alert('Bitte zuerst eine Größe auswählen.');
    return;
  }

  cart.push({
    name: 'BEYOND THE SURFACE TEE',
    size: selected,
    price: 49.90
  });

  save();
  openCart();
};

// Warenkorb speichern
function save() {
  localStorage.setItem('orvn_cart', JSON.stringify(cart));
  render();
}

// Warenkorb anzeigen
function render() {
  $('cartCount').textContent = cart.length;

  $('items').innerHTML = cart.length
    ? cart
        .map(
          (item, index) => `
            <div class="item">
              <div>
                ${item.name}
                <small>SIZE ${item.size}</small>
              </div>

              <div>
                ${money(item.price)}
                <br>
                <button class="remove" data-i="${index}">
                  REMOVE
                </button>
              </div>
            </div>
          `
        )
        .join('')
    : '<p class="micro">YOUR BAG IS EMPTY.</p>';

  document.querySelectorAll('.remove').forEach((button) => {
    button.onclick = () => {
      cart.splice(Number(button.dataset.i), 1);
      save();
    };
  });

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price),
    0
  );

  $('total').textContent = money(total);
}

// Warenkorb öffnen
function openCart() {
  $('cart').classList.add('open');
  $('overlay').classList.add('open');
}

// Warenkorb schließen
function closeCart() {
  $('cart').classList.remove('open');
  $('overlay').classList.remove('open');
}

// Warenkorb Buttons
$('cartOpen').onclick = openCart;
$('close').onclick = closeCart;
$('overlay').onclick = closeCart;

// STRIPE CHECKOUT
$('checkout').onclick = async () => {
  if (!cart.length) {
    alert('Dein Warenkorb ist leer.');
    return;
  }

  const button = $('checkout');

  button.disabled = true;
  button.textContent = 'LADEN...';

  try {
    const response = await fetch(
      '/.netlify/functions/create-checkout',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: cart.map((item) => ({
            name: item.name,
            size: item.size,
            quantity: 1
          }))
        })
      }
    );

    const data = await response.json();

    if (!response.ok || !data.url) {
      throw new Error(
        data.error || 'Checkout konnte nicht erstellt werden.'
      );
    }

    // Weiterleitung zu Stripe
    window.location.href = data.url;

  } catch (error) {
    console.error('Stripe Checkout Fehler:', error);

    alert(
      'Checkout konnte nicht gestartet werden. Bitte versuche es erneut.'
    );

    button.disabled = false;
    button.textContent = 'CHECKOUT';
  }
};

// Initial laden
render();
