("use strict");

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

const filterList = (list, basketItems) => {
  const searchedText = document.querySelector(".searching-input").value;
  const filteredList = [];
  const searchedTextArray = searchedText.split(",");
  list.forEach((item) => {
    item.ingredients.forEach((ingredient) => {
      searchedTextArray.forEach((word) => {
        if (
          ingredient.match(word) &&
          !filteredList.find((element) => element.id === item.id)
        ) {
          filteredList.push(item);
        }
      });
    });
  });

  const select = document.querySelector(".select").value;
  switch (select) {
    case "name-asc":
      list.sort((item1, item2) => (item1.title > item2.title ? 1 : -1));
      filteredList.sort((item1, item2) => (item2.title > item1.title ? 1 : -1));
      break;
    case "name-desc":
      list.sort((item1, item2) => (item1.title < item2.title ? 1 : -1));
      filteredList.sort((item1, item2) => (item2.title < item1.title ? 1 : -1));
      break;
    case "price-asc":
      list.sort((item1, item2) => (item1.price < item2.price ? 1 : -1));
      filteredList.sort((item1, item2) => (item1.price < item2.price ? 1 : -1));
      break;
    case "price-desc":
      list.sort((item1, item2) => (item1.price > item2.price ? 1 : -1));
      filteredList.sort((item1, item2) => (item1.price > item2.price ? 1 : -1));
      break;
  }

  if (searchedText !== "") {
    document.querySelector(".list").innerHTML = "";
    displayList(filteredList, basketItems);
  } else {
    displayList(list, basketItems);
  }
};

const deleteAllItems = (basketItems) => {
  basketItems.length = 0;
  document.querySelector(".basket-products").innerHTML = "";
  handleBasketChange(basketItems);
};

const handleBasketChange = (basketItems) => {
  toggleBasketEmptyInfo(basketItems);
  updateSummary(basketItems);
  saveInLocalStorage(basketItems);
};

const deleteProductFromBasket = (productId, basketItems) => {
  document.querySelector(".product[data-id='" + productId + "']");
  basketItems.forEach((item, key) => {
    if (item.id === productId) {
      if (item.quantity > 1) {
        basketItems[key].quantity--;
        document.querySelector(
          '.product[data-id="' + item.id + '"] input'
        ).value = item.quantity;
      } else {
        delete basketItems[key];
        document.querySelector('.product[data-id="' + item.id + '"]').remove();
      }
    }
  });

  handleBasketChange(basketItems);
};

const saveInLocalStorage = (basketItems) => {
  window.localStorage.setItem("basketItems", JSON.stringify(basketItems));
};

const getBasketItemsFromLocalStorage = () => {
  const basketItemsFromStorage = window.localStorage.getItem("basketItems");
  if (basketItemsFromStorage === null) {
    return [];
  } else {
    return JSON.parse(basketItemsFromStorage).filter((item) => item);
  }
};

const updateSummary = (basketItems) => {
  const sum = basketItems.reduce((previous, current) => {
    return previous + current.quantity * current.price;
  }, 0);

  document.querySelector(".total-sum").innerHTML = sum.toFixed(2);
};

const addProductToBasket = (product, basketItems) => {
  const alreadyExistingItem = basketItems.find(
    (item) => item?.id === product?.id
  );
  const basketItem = document.querySelector(
    '.product[data-id="' + product.id + '"] input'
  );

  if (basketItem) {
    alreadyExistingItem.quantity++;

    basketItem.value = alreadyExistingItem.quantity;
    updateSummary(basketItems);
  } else {
    const basketProductsContainer = document.querySelector(".basket-products");
    basketItems.push({ ...product, quantity: product.quantity ?? 1 });

    basketProductsContainer.insertAdjacentHTML(
      "beforeend",
      `<div class="product" data-id="${product.id}">
      <div class="basket-product-image"><img src="${product.image}" /></div>
      <div class="price-title-wrapper">
        <div class="basket-product-title">${product.title}</div>
        <div class="basket-product-price">${
          product.price.toFixed(2) + "zł"
        }</div>
        <button id="basket-button${
          product.id
        }" class="basket-button">Usuń</button>
      </div>
      <input type="number" value="${
        product.quantity ?? 1
      }" min="1"  onKeyDown="return false"> </input>
    </div>
`
    );
    document
      .querySelector(`#basket-button${product.id}`)
      .addEventListener("click", () => {
        deleteProductFromBasket(product.id, basketItems);
      });
  }
  handleBasketChange(basketItems);
};

const displayList = (list, basketItems) => {
  const listDOMElement = document.querySelector(".list");

  list.forEach((element) => {
    listDOMElement.insertAdjacentHTML(
      "beforeend",
      `<div class="pizza-div">
    <img src="${element.image}" />
    <div class="pizza-info-wrapper">
    <div class="title">${element.title}</div>
    <div class="price">${element.price.toFixed(2) + "zł"}</div>
    <div class="ingredients">${element.ingredients}</div>
      <button id="button${element.id}" class="button" data-id="${
        element.id
      }">Zamów</button>
    </div>
    </div>
    
  `
    );

    document
      .querySelector(`#button${element.id}`)
      .addEventListener("click", () => {
        addProductToBasket(element, basketItems);
      });
  });
};

const app = async () => {
  const list = await getJsonData();
  const basketItems = [];
  const basketItemsInLocalStorage = getBasketItemsFromLocalStorage().filter(
    (item) => item
  );

  list.sort((item1, item2) => (item1.title > item2.title ? 1 : -1));

  document
    .querySelector(".clearing-button")
    .addEventListener("click", () => deleteAllItems(basketItems));

  document
    .querySelector(".searching-input")
    .addEventListener("input", (e) => filterList(list, basketItems));

  document.querySelector(".select").addEventListener("change", () => {
    filterList(list, basketItems);
  });

  if (basketItemsInLocalStorage.length > 0) {
    basketItemsInLocalStorage.forEach((item) => {
      addProductToBasket(item, basketItems);
    });
  }

  displayList(list, basketItems);
};

app();
