const getJsonData = async () => {
  return await fetch(
    "https://raw.githubusercontent.com/alexsimkovich/patronage/main/api/data.json"
  ).then((response) => response.json());
};

const toggleBasketEmptyInfo = (basketItems) => {
  const basketItemsFiltered = basketItems.filter((item) => item);
  if (basketItemsFiltered.length === 0) {
    document.querySelector(".basket-empty-info").classList.remove("hidden");
  } else {
    document.querySelector(".basket-empty-info").classList.add("hidden");
  }
};

const deleteProductFromBasket = (productId, basketItems) => {
  document.querySelector(".product[data-id='" + productId + "']").remove();
  const indexToRemove = basketItems.findIndex((item) => item?.id === productId);
  delete basketItems[indexToRemove];
  toggleBasketEmptyInfo(basketItems);
  updateSummary(basketItems);
};

const updateSummary = (basketItems) => {
  const sum = basketItems.reduce((previous, current) => {
    return previous + current.quantity * current.price;
  }, 0);

  document.querySelector(".total-sum").innerHTML = sum.toFixed(2);
};

const addProductToBasket = (product, basketItems) => {
  const basketProductsContainer = document.querySelector(".basket-products");
  basketItems.push({ ...product, quantity: 1 });

  basketProductsContainer.insertAdjacentHTML(
    "beforeend",
    `<div class="product" data-id="${product.id}">
    <div class="basket-product-image"><img src="${product.image}" /></div>
    <div class="price-title-wrapper">
      <div class="basket-product-title">${product.title}</div>
      <div class="basket-product-price">${product.price.toFixed(2) + "zł"}</div>
      <button id="basket-button${
        product.id
      }" class="basket-button">Usuń</button>
    </div>
    <input type="number" value="1" min="1" max="15" onKeyDown="return false"> </input>
  </div>
`
  );

  document
    .querySelector(`#basket-button${product.id}`)
    .addEventListener("click", () => {
      deleteProductFromBasket(product.id, basketItems);
    });
  updateSummary(basketItems);
};

const displayList = (list, basketItems) => {
  const listDOMElement = document.querySelector(".list");

  list.forEach((element) => {
    listDOMElement.insertAdjacentHTML(
      "beforeend",
      `<div class="pizza-div">
    <div class="image"><img src="${element.image}" /></div>
    <div class="pizza-info-wrapper">
    <div class="title">${element.title}</div>
    <div class="price">${element.price}</div>
    <div class="ingredients">${element.ingredients}</div>
      <button id="button${element.id}" class="button" data-id="${element.id}">Zamów</button>
    </div>
    </div>
    
  `
    );

    document
      .querySelector(`#button${element.id}`)
      .addEventListener("click", () => {
        const alreadyExistingItem = basketItems.find(
          (item) => item?.id === element?.id
        );
        if (alreadyExistingItem) {
          alreadyExistingItem.quantity++;
          const basketItemInput = document.querySelector(
            '.product[data-id="' + element.id + '"] input'
          );
          basketItemInput.value = alreadyExistingItem.quantity;
          updateSummary(basketItems);
        } else {
          addProductToBasket(element, basketItems);
        }
      });
  });
};

const app = async () => {
  const list = await getJsonData();
  const basketItems = [];

  displayList(list, basketItems);
};

app();
