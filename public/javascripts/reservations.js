// Init a timeout variable to be used below
let timeout1 = null;
let timeout2 = null;
let timeout3 = null;
let timeout4 = null;

// from ejs: availableTables, reservedTables

// on document ready, id date is null, set the date value to moment().format('yyyy-MM-dd')
document.addEventListener("DOMContentLoaded", function () {
  if (document.querySelector('input[name="date"]').value == "") {
    document.querySelector('input[name="date"]').value =
      moment().format("YYYY-MM-DD");
  }
});

function onSubmitReservationForm(event) {
  event.preventDefault();
  // alert("submitting");
  const dialogContent = document.querySelector(".dialog .content");
  dialogContent.innerHTML = "";
  const form = event.target;
  const elements = form.elements;
  const warning = document.createAttribute("class");
  warning.value = "warning";
  // const tables = document.querySelector('input[name="tables[]"]').value;
  // const countTables = tables.length;
  let checkedTables = 0;
  for (let input of elements) {
    // if (input.value != '') {
    let child = "";
    if (
      input.name == "date" ||
      input.name == "time" ||
      input.name == "seats" ||
      input.name == "name" ||
      input.name == "phone"
    ) {
      child = document.createElement("div");
      if (input.value == "") {
        child.setAttributeNode(warning.cloneNode(true));
      }
      child.innerText = `${input.name}`;
      dialogContent.appendChild(child);
      child = document.createElement("div");
      if (input.value == "") {
        child.setAttributeNode(warning.cloneNode(true));
      }
      child.innerText = `${input.value}`;
      dialogContent.appendChild(child);
    } else if (input.name == "adjust" && !!parseInt(input.value)) {
      // disegna solo se è impostato
      child = document.createElement("div");
      child.setAttributeNode(warning.cloneNode(true));
      child.innerText = "adjusted time";
      dialogContent.appendChild(child);
      child = document.createElement("div");
      child.setAttributeNode(warning.cloneNode(true));
      child.innerText = `${moment(elements["time"].value, "HH:mm").add(input.value, "minutes").format("HH:mm")}`;
      dialogContent.appendChild(child);
    } else if (input.name == "tables[]") {
      // conta solamente i tavoli selezionati
      if (input.checked) {
        checkedTables++;
      }
    }
    // }
  }
  // tables
  child = document.createElement("div");
  if (checkedTables == 0) {
    child.setAttributeNode(warning.cloneNode(true));
  }
  child.innerText = `tables`;
  dialogContent.appendChild(child);
  child = document.createElement("div");
  if (checkedTables == 0) {
    child.setAttributeNode(warning.cloneNode(true));
  }
  child.innerText = `${checkedTables}`;
  dialogContent.appendChild(child);
  // seats
  child = document.createElement("div");
  child.innerText = `seats`;
  dialogContent.appendChild(child);
  child = document.createElement("div");
  child.innerText = document.querySelector("#total-seats").innerText;
  dialogContent.appendChild(child);

  if (!checkedTables) {
    document.querySelector("#total-seats").innerText =
      "Select at least one table";
  }

  if (form.checkValidity() && checkedTables > 0) {
    document.querySelector(".dialog-wrapper").style.display = "block";
  }
}
function closeDialog() {
  document.querySelector(".dialog-wrapper").style.display = "none";
}

function submitReservationForm() {
  const form = document.querySelector("#new-reservation");
  const formData = new FormData(form);
  // if adjusted is not empty, update form.time !!parseInt(input.value)
  if (parseInt(document.querySelector('input[name="adjust"]').value)) {
    // formData.set('time', document.querySelector('#adjusted-time').innerText);
    formData.set(
      "time",
      moment(formData.get("time"), "HH:mm")
        .add(formData.get("adjust"), "minutes")
        .format("HH:mm"),
    );
  }
  // Trigger validation
  // if (form.checkValidity() && checkedTables() > 0) {
  // }
  form.submit();

  // fetch(form.action, {
  //   method: form.method,
  //   body: formData,
  //   // headers: {
  //   //   Accept: "application/json",
  //   // },
  // })
  //   .then((response) => {
  //     if (response.status == 200) {
  //       // form.reset();
  //       console.log("OK");
  //     } else {
  //       console.log(response.status);
  //     }
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //   })
  //   .finally(() => {
  //     closeDialog();
  //   });
}

function renderAvailableTables() {
  clearTimeout(timeout1);
  // document.querySelector('.available-tables').innerHTML = '';
  // document.querySelector('#total-seats').innerHTML = 0;
  // if(!seats) return;
  timeout1 = setTimeout(function () {
    document.querySelector(".available-tables").innerHTML = "";
    document.querySelector("#total-seats").innerHTML = 0;
    const seats = document.querySelector('input[name="seats"]').value;
    if (!seats) return;
    let content = "";
    availableTables
      .filter((item) => item.seats >= seats)
      .forEach((item) => {
        // let isReserved = reservedTables
        //   ? reservedTables.includes(item._id)
        //   : false; // item._id
        content += `
        <div class="available-table">
          <input class="table-checkbox" type="checkbox" name="tables[]" value="${item._id}" data-seats="${item.seats}" onchange="setTotalSeats(this.checked, this.dataset.seats)">
          <div class="table-name">${item.name}</div>
          <div class="table-seats">${item.seats}</div>
        </div>
      `;
      });
    // // add the already reserved tables as checked, despite the seats
    reservedTables?.forEach((item) => {
      content += `
        <div class="available-table">
          <input class="table-checkbox" checked type="checkbox" name="tables[]" value="${item._id}" data-seats="${item.seats}" onchange="setTotalSeats(this.checked, this.dataset.seats)">
          <div class="table-name">${item.name}</div>
          <div class="table-seats">${item.seats}</div>
        </div>
      `;
      // add total seats
      setTotalSeats(true, item.seats);
    });
    document.querySelector(".available-tables").innerHTML = content;
  }, 1000);
}

function renderAdjustedTime() {
  clearTimeout(timeout2);
  // document.querySelector('.available-tables').innerHTML = '';
  // document.querySelector('#total-seats').innerHTML = 0;
  // if(!seats) return;
  timeout2 = setTimeout(function () {
    // document.querySelector('#adjusted-time').innerHTML = 0;
    const time = document.querySelector('input[name="time"]').value;
    const adjust = parseInt(
      document.querySelector('input[name="adjust"]').value,
    );
    if (!adjust && !time) return;
    console.log(time, adjust);
    document.querySelector("#adjusted-time").innerHTML = moment(time, "HH:mm")
      .add(adjust, "minutes")
      .format("HH:mm");
  }, 1000);
}

function fetchAvailableTables() {
  const date = document.querySelector('input[name="date"]').value;
  const time = document.querySelector('input[name="time"]').value;
  const adjust = document.querySelector('input[name="adjust"]').value;
  // // const facility = document.querySelector('input[name="facility"]').value;
  if (time == "" || date == "") return [];
  clearTimeout(timeout3);
  // document.querySelector('.available-tables').innerHTML = '';
  // document.querySelector('#total-seats').innerHTML = 0;
  // if(!seats) return;
  timeout3 = setTimeout(async function () {
    // fetch
    const url = `http://localhost:3000/reservations/tables?date=${date}&time=${time}&adjust=${adjust}`;
    console.log(url);
    try {
      const response = await fetch(url, {
        method: "GET",
      });
      if (!response.ok) {
        // throw new Error(`Response status: ${response.status}`);
        document.querySelector("#adjusted-time").innerHTML =
          `Response status: ${response.status}`;
      }

      const json = await response.json();
      console.log(json);
      // set the list of available tables
      availableTables = json.data;
      // draw the available tables
      renderAvailableTables();
    } catch (error) {
      console.error(error.message);
    }
  }, 1000);
}
function setTotalSeats(checked, seats) {
  if (isNaN(parseInt(document.querySelector("#total-seats").innerHTML))) {
    document.querySelector("#total-seats").innerHTML = 0;
  }
  if (checked) {
    document.querySelector("#total-seats").innerHTML =
      parseInt(document.querySelector("#total-seats").innerHTML) +
      parseInt(seats);
  } else {
    document.querySelector("#total-seats").innerHTML =
      parseInt(document.querySelector("#total-seats").innerHTML) -
      parseInt(seats);
  }
}
