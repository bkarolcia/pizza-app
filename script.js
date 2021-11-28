getJsonData = async () => {
  return await fetch(
    "https://raw.githubusercontent.com/alexsimkovich/patronage/main/api/data.json"
  ).then((response) => response.json());
};

toggleBasketEmptyInfo = (basketItems) => {
  if (basketItems.length === 0) {
    document.querySelector(".basket-empty-info").style.display = "initial";
  } else {
    document.querySelector(".basket-empty-info").style.display = "none";
  }
};

deleteProductFromBasket = (productId, basketItems) => {
  document.querySelector(".product[data-id='" + productId + "']").remove();
  const indexToRemove = basketItems.findIndex((item) => item?.id === productId);
  delete basketItems[indexToRemove];
  toggleBasketEmptyInfo(basketItems);
  updateSummary(basketItems);
};

updateSummary = (basketItems) => {
  const sum = basketItems.reduce((previous, current) => {
    return previous + current.quantity * current.price;
  }, 0);

  document.querySelector(".total-sum").innerHTML = sum.toFixed(2);
};

addProductToBasket = (product, basketItems) => {
  const basketProductsContainer = document.querySelector(".basket-products");

  const productDiv = document.createElement("div");
  productDiv.setAttribute("data-id", product.id);
  productDiv.className = "product";

  const priceTitleWrapper = document.createElement("div");
  priceTitleWrapper.className = "price-title-wrapper";

  const basketProductTitleNode = document.createElement("div");
  const basketProductTitleText = document.createTextNode(product.title);
  basketProductTitleNode.className = "basket-product-title";
  basketProductTitleNode.append(basketProductTitleText);
  priceTitleWrapper.append(basketProductTitleNode);

  const basketProductPriceNode = document.createElement("div");
  const basketProductPriceText = document.createTextNode(
    product.price.toFixed(2) + "zł"
  );
  basketProductPriceNode.className = "basket-product-price";
  basketProductPriceNode.append(basketProductPriceText);
  priceTitleWrapper.append(basketProductPriceNode);

  const basketProductImageNode = document.createElement("div");
  basketProductImageNode.className = "basket-product-image";
  const basketProductImage = new Image();
  basketProductImage.src = product.image;
  basketProductImageNode.appendChild(basketProductImage);

  const button = document.createElement("button");
  const basketButtonText = document.createTextNode("Usuń");
  button.append(basketButtonText);
  button.addEventListener("click", () => {
    deleteProductFromBasket(product.id, basketItems);
    console.log(deleteProductFromBasket);
  });
  priceTitleWrapper.append(button);

  const basketProductWraper = document.createElement("div");
  basketProductWraper.className = "basket-product-wraper";

  const input = document.createElement("input");
  input.setAttribute("type", "number");
  input.setAttribute("value", "1");
  input.setAttribute("min", "1");
  input.setAttribute("max", "15");
  input.setAttribute("onKeyDown", "return false");

  input.addEventListener("input", function () {
    const index = basketItems.findIndex((item) => item?.id === product.id);
    basketItems[index].quantity = parseInt(this.value);
    updateSummary(basketItems);
  });

  productDiv.append(basketProductImageNode);
  productDiv.append(priceTitleWrapper);
  productDiv.append(input);

  basketProductsContainer.append(productDiv);
  basketItems.push({ ...product, quantity: 1 });
  toggleBasketEmptyInfo(basketItems);
  updateSummary(basketItems);
};

displayList = (list) => {
  list.forEach((element) => {
    const pizzaDiv = document.createElement("div");
    pizzaDiv.className = "pizza-div";

    const titleNode = document.createElement("div");
    const titleText = document.createTextNode(element.title);
    titleNode.className = "title";
    titleNode.append(titleText);

    const priceNode = document.createElement("div");
    const priceText = document.createTextNode(element.price.toFixed(2) + "zł");
    priceNode.className = "price";
    priceNode.append(priceText);

    pizzaDiv.append(titleNode);
    pizzaDiv.append(priceNode);

    const imageNode = document.createElement("div");
    const image = new Image();
    imageNode.className = "image";
    image.src = element.image;
    imageNode.append(image);

    const ingredientsNode = document.createElement("div");
    const ingredientsText = document.createTextNode(element.ingredients);
    ingredientsNode.className = "ingredients";
    ingredientsNode.append(ingredientsText);

    const pizzaInfoWraper = document.createElement("div");
    pizzaInfoWraper.className = "pizza-info-wraper";

    const buttonNode = document.createElement("button");
    const buttonText = document.createTextNode("Zamów");
    buttonNode.setAttribute("data-id", element.id);
    buttonNode.className = "button";

    buttonNode.append(buttonText);

    pizzaInfoWraper.append(titleNode);
    pizzaInfoWraper.append(ingredientsNode);
    pizzaInfoWraper.append(priceNode);
    pizzaInfoWraper.append(buttonNode);
    pizzaDiv.append(imageNode);
    pizzaDiv.append(pizzaInfoWraper);

    document.querySelector(".list").append(pizzaDiv);
  });
};

app = async () => {
  const list = await getJsonData();
  const basketItems = [];

  displayList(list);

  const orderButtons = document.querySelectorAll(".button");

  for (var i = 0; i < orderButtons.length; i++) {
    orderButtons[i].addEventListener("click", function () {
      const buttonId = parseInt(this.getAttribute("data-id"));
      const product = list.find((pizza) => pizza.id === buttonId);

      const alreadyExistingItem = basketItems.find(
        (item) => item?.id === buttonId
      );
      if (alreadyExistingItem) {
        alreadyExistingItem.quantity++;
        const basketItemInput = document.querySelector(
          '.product[data-id="' + buttonId + '"] input'
        );
        basketItemInput.value = alreadyExistingItem.quantity;
        updateSummary(basketItems);
      } else {
        addProductToBasket(product, basketItems);
      }
    });
  }
};

app();
