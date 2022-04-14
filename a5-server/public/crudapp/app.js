/**
 * Front end for RESTful CRUD app.
 *
 * ASSUMPTIONS
 *   1.  The web server is available on localhost:8000
 *   2a. The URL pattern for a collection is http://localhost:8000/items
 *   2b. The URL pattern for a single item is http://localhost:8000/items/nnn
 *       where nnn is a number in the range [100,999]
 *   3.  All server responses have headers containing the content type (which
 *       should be "application/JSON") and a status code. The expected status
 *       codes are:
 *           200 for a successful GET, DELETE, or PUT
 *           201 for a successful POST
 *           404 for a rejected DELETE or PUT (item does not exist)
 *           409 for a rejected POST (item already exists)
 *           500 for a server-side error
 *   4.  The body of every server response must be in JSON format.
 *   4a. GET (collection only)
 *       When JSON.parse is called on the response to a GET request, an array
 *       of objects should be the result. Each object must contain five fields:
 *       id, category, description, price, vegetarian. The id and price fields
 *       are numbers; the category and description fields are text, and the
 *       vegetarian field is boolean.
 *           {
 *             id: ?,
 *             category: ?,
 *             description: ?,
 *             price: ?,
 *             vegetarian: ?
 *           }
 *   4b. DELETE, POST, PUT (single item only)
 *       For DELETE, POST, and PUT requests, the response is a JSON string
 *       parseable into an object of the form
 *           {
 *             ok: true/false,
 *             err: message
 *           }
 *       The "ok" field should be true if the operation succeeded or false if not.
 *       The "err" field should be null if the operation succeeded, or contain an
 *       error message if not.
 *
 * @author S.Monk
 * @version 12-Feb-2022
 */

const API_BASE = "http://localhost:8000/items";
let addOrUpdate;

window.onload = function () {
  addEventHandlers();
  hideUpdatePanel();
  getAllItems();
};

// make AJAX call to get JSON data
function getAllItems() {
  let url = API_BASE;
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        buildTable(xhr.responseText);
        clearSelections();
        resetUpdatePanel();
        hideUpdatePanel();
      } else {
        alert(xhr.status + " --> " + xhr.responseText);
      }
    }
  };
  xhr.open("GET", url, true);
  xhr.send();
}

function deleteItem() {
  let id = document
    .querySelector(".highlighted")
    .querySelector("td").innerHTML;
  let url = API_BASE + "/" + id;
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      console.log(xhr.responseText);
      let resp = JSON.parse(xhr.responseText);
      if (xhr.status === 200) {
        alert("Item " + id + " deleted.");
      } else {
        alert(xhr.status + " --> " + resp.err);
      }
      getAllItems();
    }
  };
  xhr.open("DELETE", url, true);
  xhr.send();
}

function addItem() {
  addOrUpdate = "add";
  showUpdatePanel();
}

function updateItem() {
  addOrUpdate = "update";
  populateUpdatePanelWithSelectedItem();
  showUpdatePanel();
}

function cancelAddUpdate() {
  resetUpdatePanel();
  hideUpdatePanel();
}

// When "Done" button is pressed for either Add or Update
function processForm() {
  let item = createItemFromInputs();
  if (item === null) {
    return;
  }
  let url = API_BASE + "/" + item.id;
  let method = addOrUpdate === "add" ? "POST" : "PUT";
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      console.log(xhr.responseText);
      let resp = JSON.parse(xhr.responseText);
      if (xhr.status === 200 || xhr.status === 201) {
        alert(
          "Item " +
          item.id +
          (method === "POST" ? " created." : " updated.")
        );
      } else {
        alert(xhr.status + " --> " + resp.err);
      }
      getAllItems();
    }
  };
  xhr.open(method, url, true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.send(JSON.stringify(item));
}

function createItemFromInputs() {
  let res = null;

  let idInput = document.querySelector("#itemIDInput");
  let categoryInput = document.querySelector("#categorySelect");
  let descriptionInput = document.querySelector("#descriptionInput");
  let priceInput = document.querySelector("#priceInput");
  let vegetarianInput = document.querySelector("#vegetarianInput");

  // note: category and vegetarian are always valid
  if (
    idInput.validity.valid &&
    descriptionInput.validity.valid &&
    priceInput.validity.valid
  ) {
    res = {
      id: +idInput.value,
      category: categoryInput.value,
      description: descriptionInput.value,
      price: +priceInput.value,
      vegetarian: vegetarianInput.checked,
    };
  }

  return res;
}

function showUpdatePanel() {
  document.getElementById("addUpdatePanel").classList.remove("hidden");
}

function hideUpdatePanel() {
  document.getElementById("addUpdatePanel").classList.add("hidden");
}

function resetUpdatePanel() {
  document.querySelector("#itemIDInput").value = "";
  document.querySelector("#itemIDInput").removeAttribute("disabled");
  document.querySelectorAll("option")[0].selected = true; // select first one
  document.querySelector("#descriptionInput").value = "";
  document.querySelector("#priceInput").value = 0;
  document.querySelector("#vegetarianInput").checked = false;
}

function populateUpdatePanelWithSelectedItem() {
  let tds = document.querySelector(".highlighted").querySelectorAll("td");
  document.querySelector("#itemIDInput").value = tds[0].innerHTML;
  document.querySelector("#itemIDInput").setAttribute("disabled", "disabled"); // assuming this is an update
  let options = document.querySelectorAll("option");
  for (let i = 0; i < options.length; i++) {
    options[i].selected = options[i].value === tds[1].innerHTML;
  }
  document.querySelector("#descriptionInput").value = tds[2].innerHTML;
  document.querySelector("#priceInput").value = +tds[3].innerHTML;
  document.querySelector("#vegetarianInput").checked =
    tds[4].innerHTML === "true";
}

function buildTable(text) {
  let data = JSON.parse(text);
  let html = "<table>";
  html +=
    "<tr><th>ID</th><th>Category</th><th>Description</th><th>Price</th><th>Veg</th></tr>";
  for (let i = 0; i < data.length; i++) {
    let temp = data[i];
    html += "<tr>";
    html += "<td>" + temp.id + "</td>";
    html += "<td>" + temp.category + "</td>";
    html += "<td>" + temp.description + "</td>";
    html += "<td>" + temp.price + "</td>";
    html += "<td>" + temp.vegetarian + "</td>";
    html += "</tr>";
  }
  html += "</table>";
  document.querySelector("#theItems").innerHTML = html;
}

function clearSelections() {
  let elem = document.querySelector(".highlighted");
  if (elem) {
    elem.classList.remove("highlighted");
  }
  setDeleteUpdateState(false); // disable Delete and Update buttons
}

function handleRowClick(e) {
  clearSelections();
  e.target.parentElement.classList.add("highlighted");
  setDeleteUpdateState(true); // enable Delete and Update buttons
}

function setDeleteUpdateState(state) {
  let buttons = [
    document.querySelector("#deleteButton"),
    document.querySelector("#updateButton"),
  ];
  buttons.forEach(function (b) {
    if (state) {
      b.removeAttribute("disabled");
    } else {
      b.setAttribute("disabled", "disabled");
    }
  });
}

function addEventHandlers() {
  // add event handlers for buttons - main functionality
  document.querySelector("#addButton").addEventListener("click", addItem);
  document
    .querySelector("#deleteButton")
    .addEventListener("click", deleteItem);
  document
    .querySelector("#updateButton")
    .addEventListener("click", updateItem);
  document
    .querySelector("#doneButton")
    .addEventListener("click", processForm);
  document
    .querySelector("#cancelButton")
    .addEventListener("click", cancelAddUpdate);

  // add event handler for selections on the table
  document
    .querySelector("#theItems")
    .addEventListener("click", handleRowClick);

  // prevent form submission
  document.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault();
  });
}
