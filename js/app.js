const Modal = {
  toggle() {
    document.querySelector(".modal-overlay").classList.toggle("active");
  },
};

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("devfinance:transactinos")) || [];
  },

  set(transactions) {
    localStorage.setItem("devfinance:transactions", JSON.stringify(transactions));
  },
};

const Transaction = {
  all: Storage.get(),

  add(transaction) {
    Transaction.all.push(transaction);

    App.reload();
  },

  remove(index) {
    Transaction.all.splice(index, 1);

    App.reload();
  },

  income() {
    let income = 0;

    Transaction.all.forEach((transaction) => {
      if (transaction.amount > 0) {
        income = income + transaction.amount;
      }
    });

    return income;
  },

  expense() {
    let expense = 0;

    Transaction.all.forEach((transaction) => {
      if (transaction.amount < 0) {
        expense = expense + transaction.amount;
      }
    });

    return expense;
  },

  total() {
    return Transaction.income() + Transaction.expense();
  },
};

const Utils = {
  formatAmount(value) {
    value = Number(value) * 100;
    return value;
  },

  formatDate(date) {
    const splittedDate = date.split("-");

    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";

    value = String(value).replace(/\D/g, "");

    value = Number(value) / 100;

    value = value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });

    return signal + value;
  },
};

const DOM = {
  transactionsContainer: document.querySelector("#data-table tbody"),

  addTransaction(transaction, index) {
    const tr = document.createElement("tr");
    tr.innerHTML = DOM.innerHtmlTransaction(transaction);
    DOM.transactionsContainer.appendChild(tr);
  },

  innerHtmlTransaction(transaction, index) {
    const css = transaction.amount > 0 ? "income" : "expense";

    const amount = Utils.formatCurrency(transaction.amount);

    const html = `
      <td class="description">${transaction.description}</td>
      <td class="${css}">${amount}</td>
      <td class="date">${transaction.date}</td>
      <th>
        <img onclick="Transaction.remove(${index})" src="../assets/minus.svg" alt="remove transaction icon" />
      </th>
    `;

    return html;
  },

  updateBalance() {
    document.getElementById("incomeDisplay").innerHTML = Utils.formatCurrency(Transaction.income());
    document.getElementById("expenseDisplay").innerHTML = Utils.formatCurrency(Transaction.expense());
    document.getElementById("totalDisplay").innerHTML = Utils.formatCurrency(Transaction.total());
  },

  clearTransactions() {
    DOM.transactionsContainer.innerHTML = "";
  },
};

const Form = {
  description: document.getElementById("input-description"),
  amount: document.getElementById("input-amount"),
  date: document.getElementById("input-date"),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
    };
  },

  validateFields() {
    const { description, amount, date } = Form.getValues();

    if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
      throw new Error("please, complete all the fields");
    }
  },

  formatFields() {
    let { description, amount, date } = Form.getValues();

    amount = Utils.formatAmount(amount);

    date = Utils.formatDate(date);

    return {
      description: description,
      amount: amount,
      date: date,
    };

    console.log(date);
  },

  clearFields() {
    Form.description.value = "";
    Form.amount.value = "";
    Form.date.value = "";
  },

  saveTransaction(transaction) {
    Transaction.add(transaction);
  },

  submit(event) {
    event.preventDefault();

    try {
      const transaction = Form.formatFields();
      Form.validateFields();
      Form.saveTransaction(transaction);
      Form.clearFields();
      Modal.toggle();
    } catch (error) {
      alert("please, complete all the fields");
    }
  },
};

const App = {
  init() {
    Transaction.all.forEach((transaction) => {
      DOM.addTransaction(transaction);
    });

    DOM.updateBalance();

    Storage.set(Transaction.all);
  },

  reload() {
    DOM.clearTransactions();
    App.init();
  },
};

App.init();
