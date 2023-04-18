//ge data products ==> products.js
import { productsData } from "./products.js";

//Selectors
const shopCartIcon = document.querySelector(".shop-carts");
const cartPopupCart = document.querySelector(".cart");
const backDrop = document.querySelector(".backdrop");
const clearCartBtn = document.querySelector(".clear-cart");
const confirmCartBtn = document.querySelector(".cart-item-confirm");
const productsDOM = document.querySelector(".product-container");
const cartTotal = document.querySelector(".cart-total");
const cartItemsBadge = document.querySelector(".cart-items-badge");
const cartContent = document.querySelector(".cart-content");

//cart shop variable array ... use let to update []
let cart = [];
let buttonsDOM = [];

// event Listener
shopCartIcon.addEventListener("click", showPopupCart);
// clearCartBtn.addEventListener("click", closePopupCart);
// confirmCartBtn.addEventListener("click", closePopupCart);
backDrop.addEventListener("click", backDropFunction);

//Loaded page event Listener
document.addEventListener("DOMContentLoaded", () => {
  //class products
  const products = new Products();
  const productsData = products.getProducts();

  //class UI
  const ui = new UI();
  //set up : get cart and setup app :
  ui.setupApp();
  ui.displayProducts(productsData);

  //when click on btn
  ui.getAddToCartsBtn();
  ui.cartLogic();

  //class Storage
  Storage.saveProducts(productsData);
});

//functions
function showPopupCart() {
  cartPopupCart.style.opacity = "1";
  cartPopupCart.style.top = "20%";
  backDrop.style.display = "block";
}

// function closePopupCart() {
//   cartPopupCart.style.top = "-1000%";
//   backDrop.style.display = "none";
// }

function backDropFunction() {
  backDrop.style.display = "none";
  cartPopupCart.style.top = "-1000%";
}

//Get products
class Products {
  getProducts() {
    return productsData;
  }
}

//Display products
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach((item) => {
      //result = result + ``
      result += `
      <div class="products">
       <div class="product ${item.className}">
          <img src=${item.imageUrl} alt="" class="img-product">
          <div class="product-desc">
              <div class="product-price">$${item.price}</div>
              <div class="product-title">${item.title}</div>
          </div>
          <button class="btn add-to-cart" data-id=${item.id} >
              add to cart
          </button>
       </div>
      </div>`;
      productsDOM.innerHTML = result;
    });
  }
  //btn add to cart
  getAddToCartsBtn() {
    const addToCartsBtn = [...document.querySelectorAll(".add-to-cart")];
    buttonsDOM = addToCartsBtn;

    addToCartsBtn.forEach((btn) => {
      //dataset ==> get data id
      const id = btn.dataset.id;
      //check if this product id is in cart or not
      const isInCart = cart.find((p) => p.id === parseInt(id));
      if (isInCart) {
        btn.innerText = "In Cart";
        btn.disabled = true;
      }
      //when click on btn ====> in cart shop
      btn.addEventListener("click", (event) => {
        event.target.innerText = "In Cart";
        event.target.disabled = true;
        //get product from products
        const addedProduct = { ...Storage.getProduct(id), quantity: 1 };
        //add to cart (...) ==>spirit oprator for clone cart to array
        //quantity to know this product use in shop cart
        cart = [...cart, addedProduct];
        //save cart to local storage
        Storage.saveCart(cart);
        //update cart value
        //this reference to class ui and get setcartvalue
        this.setCartValue(cart);
        //add to cart item
        this.addCartItem(addedProduct);
      });
    });
  }
  //set badge and totalprice
  setCartValue(cart) {
    //1.cartItems :
    //2.cartTotalPrice :
    let tempCartItems = 0;
    const totalPriceCart = cart.reduce((acc, curr) => {
      //example 3$(price) * 3(number product) = 9$
      tempCartItems += curr.quantity; //2 + 1 => 3
      return curr.quantity * curr.price + acc;
    }, 0);
    //invoke 2number aeshar==> tofixed(2)
    cartTotal.innerText = `total price : ${totalPriceCart.toFixed(2)}$`;
    cartItemsBadge.innerText = tempCartItems;
  }
  //add cart popup item
  addCartItem(cartItem) {
    const div = document.createElement("div");
    div.classList.add("cart-Item");
    div.innerHTML = `
    <img src=${cartItem.imageUrl} alt="" class="cart-image">
    <div class="cart-desc">
        <h4>${cartItem.title}</h4>
        <h5>$ ${cartItem.price}</h5>
    </div>
    <div class="counter-cart">
        <i class="bi bi-chevron-up"   data-id=${cartItem.id}></i>
        <p>${cartItem.quantity}</p>
        <i class="bi bi-chevron-down" data-id=${cartItem.id}></i>
    </div>
    <div class="remove-cart">
        <span><i class="bi bi-trash3-fill" data-id=${cartItem.id}></i></span>
    </div>`;
    cartContent.appendChild(div);
  }

  setupApp() {
    //get cart from storage
    cart = Storage.getCart();
    //addCartItem
    cart.forEach((cartItem) => this.addCartItem(cartItem));
    //setValues : price + items
    this.setCartValue(cart);
  }

  cartLogic() {
    //clear cart :
    clearCartBtn.addEventListener("click", () => this.clearCart());

    //cart functionality
    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("bi-chevron-up")) {
        const addQuantity = event.target;
        //1.get item from cart
        const addedItem = cart.find(
          (cItem) => cItem.id == addQuantity.dataset.id
        );
        addedItem.quantity++;
        //2.update cart value
        this.setCartValue(cart);
        //3.save cart
        Storage.saveCart(cart);
        //4.update cart item in ui
        addQuantity.nextElementSibling.innerText = addedItem.quantity;
      } else if (event.target.classList.contains("bi-trash3-fill")) {
        const removeItem = event.target;
        const removedItem = cart.find((c) => c.id == removeItem.dataset.id);
        this.removeItems(removedItem.id);
        Storage.saveCart(cart);
        cartContent.removeChild(
          removeItem.parentElement.parentElement.parentElement
        );
        //remove from cartItem
        //remove
      } else if (event.target.classList.contains("bi-chevron-down")) {
        const subQuantity = event.target;
        const subStractedItem = cart.find(
          (c) => c.id == subQuantity.dataset.id
        );
        if (subStractedItem.quantity === 1) {
          this.removeItems(subStractedItem.id);
          cartContent.removeChild(subQuantity.parentElement.parentElement);
          return;
        }
        subStractedItem.quantity--;
        this.setCartValue(cart);
        Storage.saveCart(cart);
        console.log(subQuantity.previousElementSibling);
        subQuantity.previousElementSibling.innerText = subStractedItem.quantity;
      }
    });
  }

  clearCart() {
    //remove : (DRY)
    cart.forEach((cItem) => this.removeItems(cItem.id));
    //remove cart content children
    while (cartContent.children.length) {
      cartContent.removeChild(cartContent.children[0]);
    }
    backDropFunction();
  }

  removeItems(id) {
    //update cart
    cart = cart.filter((cItem) => cItem.id !== id);
    //total price and cart items
    this.setCartValue(cart);
    //update storage :
    Storage.saveCart(cart);

    this.getSingleButtons(id);
  }

  getSingleButtons(id) {
    //get add to cart btns => update text and disable
    const button = buttonsDOM.find(
      (btn) => parseInt(btn.dataset.id) === parseInt(id)
    );
    button.innerText = "add to cart";
    button.disabled = false;
  }
}

//storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  //get product from products
  static getProduct(id) {
    //when click on btn get id and save on locala storage
    const _products = JSON.parse(localStorage.getItem("products"));
    //convert string to number with parseInt
    return _products.find((p) => p.id === parseInt(id));
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    return JSON.parse(localStorage.getItem("cart"))
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}
