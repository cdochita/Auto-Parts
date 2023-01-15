const API = {
  CREATE: {
    URL: "http://localhost:3000/parts/create",
    METHOD: "POST",
  },
  READ: {
    URL: "http://localhost:3000/parts",
    METHOD: "GET",
  },
  UPDATE: {
    URL: "http://localhost:3000/parts/update",
    METHOD: "PUT",
  },
  DELETE: {
    URL: "http://localhost:3000/parts/delete",
    METHOD: "DELETE",
  },
};
const isDemo = true || location.host === "barariubeniamin.github.io";
const inlineChanges = isDemo;

if (isDemo) {
  API.READ.URL = "data/parts.json";
  API.DELETE.URL = "data/delete.json";
  API.CREATE.URL = "data/create.json";
  API.UPDATE.URL = "data/update.json";

  API.DELETE.METHOD = "GET";
  API.CREATE.METHOD = "GET";
  API.UPDATE.METHOD = "GET";
}
let deleteBtn;
let allParts = [];
function $(selector) {
  return document.querySelector(selector);
}
function displayParts(parts) {
  let partsHTML = "";
  parts.forEach(function (part) {
    partsHTML += `<tr>
          <td>${part.make}</td>
          <td>${part.model}</td>
          <td>${part.part}</td>
          <td>
           <a href = '#' data-id='${part.id}' class = 'delete-btn'>❌</a>
            </td>
        </tr>
    `;
  });
  document.querySelector("table tbody").innerHTML = partsHTML;
}
function loadParts() {
  fetch(API.READ.URL)
    .then(function (r) {
      return r.json();
    })
    .then(function (parts) {
      allParts = parts;
      displayParts(parts);
    });
}

function getFormValues() {
  const make = $("[name=make]").value;
  const model = $("[name=model]").value;
  const part = $("[name=part]").value;
  const newPart = {
    id: `${allParts.length + 1}`,
    make: make,
    model: model,
    part: part,
  };
  return newPart;
}

function deletePartRequest(id) {
  const method = API.DELETE.METHOD;
  return fetch(API.DELETE.URL, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: method === "GET" ? null : JSON.stringify({}),
  })
    .then((r) => r.json())
    .then((r) => {
      if (r.success) {
        if (inlineChanges) {
          allParts = allParts.filter((part) => part.id !== id);

          displayParts(allParts);
        } else {
          loadParts();
        }
      }
    });
}

function createPartRequest() {
  const method = API.CREATE.METHOD;
  return fetch(API.CREATE.URL, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: method === "GET" ? null : JSON.stringify(newPart),
  }).then((r) => r.json());
}

function submitForm(e) {
  e.preventDefault();
  const newPart = getFormValues();
  createPartRequest(newPart).then((status) => {
    if (status.success) {
      allParts = [...allParts, { ...newPart }];
      displayParts(allParts);
      $("#edit").reset();
      addModal();
    }
  });
}

function filterCars() {
  const makesLinks = [...document.querySelectorAll(".sidebar ul a.selected")];
  const makes = makesLinks.map((a) => a.getAttribute("data-page"));
  const search = $("#search [name=q]").value.toLowerCase();

  const parts = allParts.filter((part) => {
    return (
      (makes.length ? makes.includes(part.make) : true) &&
      part.part.toLowerCase().includes(search)
    );
  });

  displayParts(parts);
}

function initEvents() {
  const form = $("#edit");
  form.addEventListener("submit", submitForm);

  $("#search").addEventListener("input", (e) => {
    filterCars();
  });
  $("#side").addEventListener("click", (e) => {
    if (e.target.matches("a")) {
      e.target.classList.toggle("selected");
      filterCars();
    }
  });
  document.querySelector("tbody").addEventListener("click", (e) => {
    if (e.target.matches("a.delete-btn")) {
      var id = e.target.getAttribute("data-id");

      deletePartRequest(id);
    }
  });
}

const addBtn = document.querySelector(".addBtn");
const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const closeBtn = document.querySelector(".close-modal");
const saveBtn = document.querySelector(".save-part");

function addModal() {
  modal.classList.toggle("hidden");
  overlay.classList.toggle("hidden");
}

addBtn.addEventListener("click", addModal);
closeBtn.addEventListener("click", addModal);
document.addEventListener("keydown", function (e) {
  e.key === "Escape" && !modal.classList.contains("hidden") ? addModal() : null;
});

loadParts();
initEvents();
