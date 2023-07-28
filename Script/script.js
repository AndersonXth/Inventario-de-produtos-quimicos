const listaReagentes = document.getElementById("listaReagentes");
const formCar = document.getElementById("formReagentes");
const novoReagenteInput = document.getElementById("reagente");
const novaNumeroInput = document.getElementById("numero");
const novaValidadeInput = document.getElementById("validade");
const novaQuantidadeInput = document.getElementById("quantidade");

let cards = [];
let selectedUnit = '';
checkbox();

formCar.addEventListener("submit", (event) => {
    event.preventDefault();

    const reagente = novoReagenteInput.value;
    const numero = novaNumeroInput.value;
    const validade = novaValidadeInput.value;
    const quantidade = novaQuantidadeInput.value;

    if (!reagente || !numero || !validade || !quantidade) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    if (!isValidNumber(numero) || !isValidNumber(quantidade)) {
        alert("Por favor, insira valores numéricos inteiros para 'numero' e 'quantidade'.");
        return;
    }

    if (!selectedUnit) {
        alert("Por favor, selecione uma unidade (gramas ou mililitros).");
        return;
    }

    const card = {
        reagente,
        numero,
        validade,
        quantidade,
        unidade: selectedUnit,
    };

    cards.push(card);
    saveCards();
    createCardElement(card);
    selectedUnit = '';
});

function createCardElement(card) {
    const cardmat = document.createElement("div");
    cardmat.classList.add("cardmat");
    cardmat.innerHTML = `
    <div class="row">
        <div class="col s12 m-2">
            <div class="card blue-grey darken-1" >
                <div class="card-content white-text">
                    <span class="card-title">${card.reagente}</span>
                    <p>Numero: ${card.numero}</p>
                    <p>Validade: ${card.validade}</p>
                    <h5>Quantidade: ${card.quantidade+card.unidade}</h5>
                </div>
                <div class="card-action">
                    <button class="waves-effect waves-light btn-small btn_del">Deletar</button>
                    <button class="waves-effect waves-light btn-small btn_edit">Editar</button>
                </div>
            </div>
        </div>
    </div>
    `;

    listaReagentes.appendChild(cardmat);

    cardmat.querySelector(".btn_del").addEventListener("click", () => {
        cardmat.remove();
        cards = cards.filter((c) => c !== card);
        saveCards();
    });

    cardmat.querySelector(".btn_edit").addEventListener("click", () => {
        showEditForm(card, cardmat);
    });
}

function showEditForm(card, cardElement) {
    const cardContent = cardElement.querySelector(".card-content");

    const editForm = document.createElement("form");
    editForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const novo_reagente = editForm.elements["novo_reagente"].value;
        const novo_numero = editForm.elements["novo_numero"].value;
        const novo_validade = editForm.elements["novo_validade"].value;
        const novo_quantidade = editForm.elements["novo_quantidade"].value;

        card.reagente = novo_reagente;
        card.numero = novo_numero;
        card.validade = novo_validade;
        card.quantidade = novo_quantidade;

        cardContent.innerHTML = `
            <span class="card-title">${novo_reagente}</span>
            <p>Numero: ${novo_numero}</p>
            <p>Validade: ${novo_validade}</p>
            <h5>Quantidade: ${novo_quantidade}</h5>
        `;
        cardContent.appendChild(editForm)

        saveCards();
        cardContent.removeChild(editForm); 
    });

    editForm.innerHTML = `
        <input type="text" name="novo_reagente" placeholder="Novo reagente" value="${card.reagente}" required>
        <input type="text" name="novo_numero" placeholder="Nova numero" value="${card.numero}" required>
        <input type="text" name="novo_validade" placeholder="Nova validade" value="${card.validade}" required>
        <input type="text" name="novo_quantidade" placeholder="Nova quantidade" value="${card.quantidade}" required>
        <button type="submit" class="waves-effect waves-light btn-small">Salvar</button>
    `;

    cardContent.innerHTML = "";
    cardContent.appendChild(editForm);
}

function saveCards() {
    localStorage.setItem("cards", JSON.stringify(cards));
}

function loadCards(searchText = "") {
    const storedCards = localStorage.getItem("cards");
    if (storedCards) {
        cards = JSON.parse(storedCards);
        listaReagentes.innerHTML = ""; 

        cards.filter((card) => {
            
            const searchTerm = searchText.toLowerCase();
            const reagente = card.reagente.toLowerCase();
            const numero = card.numero;
            return reagente.includes(searchTerm) || numero.includes(searchTerm);
        }).forEach(createCardElement);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadCards();

    const pesquisa = document.getElementById("pesquisa");
    pesquisa.addEventListener("input", (event) => {
        const searchText = event.target.value.trim().toLowerCase();
        loadCards(searchText); 
    });
});

function isValidNumber(value) {
    return +value === parseInt(value) && isFinite(value);
}

function checkbox() {
    const checkboxes = document.querySelectorAll('.uncheckable');
    let isChecked = false;

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                checkboxes.forEach(otherCheckbox => {
                    if (otherCheckbox !== checkbox) {
                        otherCheckbox.checked = false;
                    }
                });
                selectedUnit = checkbox.value;
                isChecked = true;
            }
            if (!isChecked) {
                alert("Por favor, selecione uma unidade (gramas ou mililitros).");
            }
        });
    });
}


