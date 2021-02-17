const Modal = {
    open(){
        //Abrir modal
        //Adicionar a class active
        document
            .querySelector('.modal-overlay')
            .classList
            .add('active')

    },
    close(){
        //fechar o modal
        //remover a class active do
        document
            .querySelector('.modal-overlay')
            .classList
            .remove('active')
    }
}

//Salva as transactions no Local Storage(Navegador)
const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

//Somar Entrada e somar saída para se ter a diferença e chegar ao valor total.
const Transaction = {
    //São as transactions que vão ser adicionadas na aplicação
    all: Storage.get(),

    add(transaction){
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index){
        Transaction.all.splice(index,1)

        App.reload()
    },

    incomes() {
        let income = 0;
        // pegar todas as transações. Para cada transação,
        Transaction.all.forEach(transaction => {
            //se ela for maior que 0
            if(transaction.amount > 0) {
                //somar a uma variável e retornar a variável
                income = income + transaction.amount;
            }
        })
        return income;
    },

    expenses() {
        let expense = 0;
        // pegar todas as transações. Para cada transação,
        Transaction.all.forEach(transaction => {
            //se ela for menor que 0
            if(transaction.amount < 0) {
                //somar a uma variável e retornar a variável
                expense += transaction.amount;
            }
        })
        return expense;
    },

    total() {
        return Transaction.incomes() + Transaction.expenses();
    }
}

//Fazer a substituição das transações do HTML para JS
const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },
    //Transaction.all.amount
    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrent(transaction.amount)

        const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onclick = "Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transação">
        </td>
        `

        return html
    },

    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrent(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrent(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrent(Transaction.total())

    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
} 

//Formatação do valor na tabela para ficar em real
const Utils = {
    formatAmount(value) {
        value = value * 100

        return Math.round(value)
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrent(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    }
}

//Formulário
const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields() {
        const { description, amount, date } = Form.getValues()

        if( description.trim() === "" || amount.trim() === "" || date.trim() === ""){
            throw new Error("Por favor, preencha todos os campos.")
        }
    },

    formatValues() {
        let { description, amount, date } = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },
    
    clearFields() {
        Form.description.value = "" 
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()

        try {
            // Verificar se todas as informações foram preenchidas
            Form.validateFields()
            // Formatar os dados para salvar
            const transaction = Form.formatValues()
            // Salvar
            Transaction.add(transaction)
            // Apagar os dados do formulário
            Form.clearFields()
            // Modal feche
            Modal.close()

        } catch (error) {
            alert(error.message)
        }

    }

}

//Inicia como iniciar o programa
const App = {
    init() {

        Transaction.all.forEach(DOM.addTransaction)
        
        DOM.updateBalance()

        Storage.set(Transaction.all)

    },

    reload() {
        DOM.clearTransactions()
        App.init()
    },
}

//Inicia o programa pelo init
App.init()
