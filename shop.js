const PRODUCTS = {
  apple: { name: "Apple", emoji: "🍏" },
  banana: { name: "Banana", emoji: "🍌" },
  lemon: { name: "Lemon", emoji: "🍋" },
};

const MAX_BASKET_ITEMS = 10;

function getBasket() {
  const basket = localStorage.getItem("basket");
  return basket ? JSON.parse(basket) : [];
}

function showErrorMessage(message) {
  // Remove any existing error message
  const existingError = document.querySelector(".basket-error-message");
  if (existingError) {
    existingError.remove();
  }

  // Create and show new error message
  const errorDiv = document.createElement("div");
  errorDiv.className = "basket-error-message";
  errorDiv.textContent = message;
  errorDiv.setAttribute("role", "alert");
  errorDiv.setAttribute("aria-live", "polite");

  // Find the best place to insert the error message
  const addToBasketBtn = document.getElementById("addToBasket");
  if (addToBasketBtn && addToBasketBtn.parentNode) {
    addToBasketBtn.parentNode.insertBefore(
      errorDiv,
      addToBasketBtn.nextSibling
    );
  } else {
    // Fallback: add to the main content area
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      const contentBox = mainContent.querySelector(".content-box");
      if (contentBox) {
        contentBox.appendChild(errorDiv);
      } else {
        mainContent.appendChild(errorDiv);
      }
    }
  }

  // Auto-remove error message after 5 seconds
  setTimeout(() => {
    if (errorDiv && errorDiv.parentNode) {
      errorDiv.remove();
    }
  }, 5000);
}

function addToBasket(product) {
  const basket = getBasket();

  // Check if basket is at maximum capacity
  if (basket.length >= MAX_BASKET_ITEMS) {
    showErrorMessage("Your basket is full. You cannot add more than 10 items.");
    return false; // Return false to indicate failure
  }

  basket.push(product);
  localStorage.setItem("basket", JSON.stringify(basket));
  return true; // Return true to indicate success
}

function clearBasket() {
  localStorage.removeItem("basket");
}

function renderBasket() {
  const basket = getBasket();
  const basketList = document.getElementById("basketList");
  const cartButtonsRow = document.querySelector(".cart-buttons-row");
  if (!basketList) return;
  basketList.innerHTML = "";
  if (basket.length === 0) {
    basketList.innerHTML = "<li>No products in basket.</li>";
    if (cartButtonsRow) cartButtonsRow.style.display = "none";
    return;
  }
  basket.forEach((product) => {
    const item = PRODUCTS[product];
    if (item) {
      const li = document.createElement("li");
      li.innerHTML = `<span class='basket-emoji'>${item.emoji}</span> <span>${item.name}</span>`;
      basketList.appendChild(li);
    }
  });
  if (cartButtonsRow) cartButtonsRow.style.display = "flex";
}

function renderBasketIndicator() {
  const basket = getBasket();
  let indicator = document.querySelector(".basket-indicator");
  if (!indicator) {
    const basketLink = document.querySelector(".basket-link");
    if (!basketLink) return;
    indicator = document.createElement("span");
    indicator.className = "basket-indicator";
    basketLink.appendChild(indicator);
  }
  if (basket.length > 0) {
    indicator.textContent = basket.length;
    indicator.style.display = "flex";
  } else {
    indicator.style.display = "none";
  }
}

function updateAddToBasketButton() {
  const basket = getBasket();
  const addToBasketBtn = document.getElementById("addToBasket");

  if (addToBasketBtn) {
    if (basket.length >= MAX_BASKET_ITEMS) {
      addToBasketBtn.disabled = true;
      addToBasketBtn.textContent = "Basket Full";
      addToBasketBtn.classList.add("disabled");
      addToBasketBtn.setAttribute(
        "aria-label",
        "Cannot add to basket - basket is full"
      );
    } else {
      addToBasketBtn.disabled = false;
      addToBasketBtn.textContent = "Add to Basket";
      addToBasketBtn.classList.remove("disabled");
      addToBasketBtn.setAttribute(
        "aria-label",
        `Add ${addToBasketBtn.getAttribute("data-product") || "item"} to basket`
      );
    }
  }
}

// Call this on page load and after basket changes
if (document.readyState !== "loading") {
  renderBasketIndicator();
  updateAddToBasketButton();
} else {
  document.addEventListener("DOMContentLoaded", function () {
    renderBasketIndicator();
    updateAddToBasketButton();
  });
}

// Patch basket functions to update indicator and button state
const origAddToBasket = window.addToBasket;
window.addToBasket = function (product) {
  const success = origAddToBasket(product);
  renderBasketIndicator();
  updateAddToBasketButton();
  return success;
};
const origClearBasket = window.clearBasket;
window.clearBasket = function () {
  origClearBasket();
  renderBasketIndicator();
  updateAddToBasketButton();
};
