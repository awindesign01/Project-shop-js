import { ProductsData } from "./products.js";
const section_cart = document.querySelector(".section_cart");
// const cart for show InCart or Add in buttons
let cart = [];

const cart_total = document.querySelector(".cart_total");
const cart_items = document.querySelector(".cart_items");
const modulee = document.querySelector(".module");
const clear_cart = document.querySelector(".clear_cart");

// productsdata
class Products {
	// get data from database
	getProducts() {
		return ProductsData;
	}
}
let buttonsDOM = [];
// UI products
class UI {
	// show products in app
	displayProducts(products) {
		let result = "";
		products.forEach((item) => {
			result += `<section class="sect_cart">
				<nav class="cart">
					<nav>
						<img src="${item.imageUrl}" class="img_product"/>
					</nav>
					<nav class="text_cart">
						<nav>
							<p>$ ${item.price}</p>
							<p>${item.title}</p>
						</nav>
						<nav>
							<button data-id=${item.id} class="btn add_cart">Add</button>
						</nav>
					</nav>
				</nav>
			</section>`;
			section_cart.innerHTML = result;
		});
	}
	// did the opatetion show InCart or Add in buttons
	getAddToCartBtns() {
		// clone from buttons
		const add_cart = [...document.querySelectorAll(".add_cart")];
		buttonsDOM = add_cart;
		// did the opatetion find id on buttons
		add_cart.forEach((btn) => {
			const id = btn.dataset.id;
			const isInCart = cart.find((p) => p.id === id);
			if (isInCart) {
				btn.innerText = "In Cart";
				btn.disabled = true;
			}
			btn.addEventListener("click", (event) => {
				event.target.innerText = "In Cart";
				event.target.disabled = true;
				// find id
				const addedProducts = { ...Storage.getProducts(id), quantity: 1 };
				// update basket shop
				cart = [...cart, addedProducts];
				// pass to localstorage
				Storage.saveCart(cart);
				// update cart value
				this.setCartValue(cart);
				// add to cart item
				this.addCartItems(addedProducts);
				// save cart in localstorage
			});
		});
	}
	// total price carts
	setCartValue(cart) {
		let tempcartItems = 0;
		const totalPrice = cart.reduce((acc, curr) => {
			tempcartItems += curr.quantity;
			return acc + curr.quantity * curr.price;
		}, 0);
		cart_total.innerText = `${totalPrice.toFixed(2)} $`;
		cart_items.innerText = tempcartItems;
	}
	// added for buy cart
	addCartItems(cartItem) {
		const createDiv = document.createElement("div");
		createDiv.classList.add("inside_module");
		createDiv.innerHTML = `
					<nav class="nav_img_module">
						<img
							src="${cartItem.imageUrl}"
							class="image_module"
						/>
					</nav>
					<nav class="nav_text_module">
						<h3>${cartItem.title}</h3>
						<h4>$ ${cartItem.price}</h4>
					</nav>
					<nav class="nav_buttons_module">
						<i class="fa fa-caret-up" data-id=${cartItem.id}></i>
						<p class="counter">${cartItem.quantity}</p>
						<i class="fa fa-caret-down" data-id=${cartItem.id}></i>
					</nav>
					<nav class="nav_trash_module">
						<i class="fa fa-trash" data-id=${cartItem.id}></i>
					</nav>
		`;
		modulee.appendChild(createDiv);
	}
	setupApp() {
		// get cart for storage
		const cart = Storage.getCart() || [];
		// add buy cart
		cart.forEach((cart) => {
			this.addCartItems(cart);
		});
		// setValue : price + items;
		this.setCartValue(cart);
	}
	// for clear buy cart
	cartLogic() {
		// clear cart
		clear_cart.addEventListener("click", () => {
			this.clearCart();
		});
		// cart functionality
		modulee.addEventListener("click", (event) => {
			// console.log(event.target);
			if (event.target.classList.contains("fa-caret-up")) {
				// console.log(event.target.dataset.id);
				const addQuantity = event.target;
				// find item from cart
				const addedItem = cart.find(
					(cItem) => cItem.id == addQuantity.dataset.id
				);
				addedItem.quantity++;
				// update
				this.setCartValue(cart);
				// save
				Storage.saveCart(cart);
				// update total in ui
				addQuantity.nextElementSibling.innerText = addedItem.quantity;
			} else if (event.target.classList.contains("fa-caret-down")) {
				// console.log(event.target.dataset.id);
				const IncrementQuantity = event.target;
				// find item from cart
				const IncrementItem = cart.find(
					(cItem) => cItem.id == IncrementQuantity.dataset.id
				);
				if (IncrementQuantity.quantity === 1) {
					this.removeItem(IncrementQuantity.id)
					modulee.removeChild(IncrementQuantity.parentElement.parentElement);
					return;
				}
				IncrementItem.quantity--;
				// update
				this.setCartValue(cart);
				// save
				Storage.saveCart(cart);
				// update total in ui
				IncrementQuantity.previousElementSibling.innerText = IncrementItem.quantity;
			} else if (event.target.classList.contains("fa-trash")) {
				const removeItem = event.target;
				const _removedItem = cart.find((c) => c.id == removeItem.dataset.id);

				this.removeItems(_removedItem);
				Storage.saveCart(cart);
				modulee.removeChild(removeItem.parentElement);
			}
		});
	}
	clearCart() {
		// remove cart
		cart.forEach((cItem) => {
			this.removeItems(cItem.id);
		});
		while (modulee.children.length) {
			modulee.removeChild(modulee.children[0]);
		}
		// console.log(modulee.children);
		closeModulee();
	}
	// remove items
	removeItems(id) {
		// updata cart
		cart = cart.filter((cItem) => cItem.id !== id);
		// total price ans cart item
		this.setCartValue(cart);
		// updata storage
		Storage.saveCart(cart);
		// get add to cart btns => updata text and disable
		this.getSinglebuttons(id);
	}
	getSinglebuttons(id) {
		const buttons = buttonsDOM.find(
			(btn) => parseInt(btn.dataset.id) == parseInt(id)
		);
		buttons.innerText = "Add";
		buttons.disabled = false;
	}
}

// localstorage products
class Storage {
	// save data in localstorage
	static saveProducts(products) {
		localStorage.setItem("products", JSON.stringify(products)); // setItem(key, value)
	}
	// get one products
	static getProducts(id) {
		const _products = JSON.parse(localStorage.getItem("products"));
		return _products.find((p) => p.id === parseInt(id));
	}
	// save cart in localstorage
	static saveCart(cart) {
		localStorage.setItem("cart", JSON.stringify(cart));
	}
	static getCart() {
		return JSON.parse(localStorage.getItem("cart"))
			? JSON.parse(localStorage.getItem("cart"))
			: [];
	}
}

// وقتی دام لود شد بیا عملیات پایین رو انجام بده
document.addEventListener("DOMContentLoaded", () => {
	// call class with (new)
	const products = new Products();
	// get productsData from call function
	const ProductsData = products.getProducts();
	// call class with (new)
	const ui = new UI();
	// pour productsData to class ui with called function
	ui.displayProducts(ProductsData);
	// called getAddToCartBtns
	ui.getAddToCartBtns();
	// save productsData in storage
	ui.setupApp();
	// ui.removeItems(cart);
	ui.cartLogic();
	ui.removeItems();
	//
	Storage.saveProducts(ProductsData);
});

const nav_icon_shop = document.querySelector(".nav_icon_shop");
nav_icon_shop.addEventListener("click", () => {
	const close = document.querySelector(".close");
	close.addEventListener("click", closeModulee);
	openModulee();
});
const cart_shop = document.querySelector(".cart_shop");

function openModulee() {
	cart_shop.style.transition = "all 0.5s ease";
	cart_shop.style.bottom = "0";
}
function closeModulee() {
	cart_shop.style.transition = "all 0.5s ease";
	cart_shop.style.bottom = "110vh";
}
