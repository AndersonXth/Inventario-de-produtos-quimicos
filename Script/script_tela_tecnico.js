let cards = [];
let relatorio = []

function loadCards(searchText = "") {
    const storedCards = localStorage.getItem("cards");
    if (storedCards) {
        cards = JSON.parse(storedCards);
        listaReagentes.innerHTML = ""; 

    const storedRelatorio = localStorage.getItem('relatorio')
    if(storedRelatorio){
        relatorio = JSON.parse(storedRelatorio)
    }

        cards.filter((card) => {
            
            const searchTerm = searchText.toLowerCase();
            const reagente = card.reagente.toLowerCase();
            const numero = card.numero;
            return reagente.includes(searchTerm) || numero.includes(searchTerm);
        }).forEach(createCardElement);
    }
}

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
                        <button class="waves-effect waves-light btn-small btn_consumo">Consumo</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    listaReagentes.appendChild(cardmat);

    cardmat.querySelector(".btn_consumo").addEventListener("click", () => {
        showEditForm(card,cardmat);
    });

}

function showEditForm(card, cardElement) {
    const cardContent = cardElement.querySelector(".card-content");

    const editForm = document.createElement("form");
    editForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const consumo = editForm.elements["consumo"].value;
        const data_uso = editForm.elements["data_uso"].value;
        const motivo = editForm.elements["motivo"].value;
        const id = editForm.elements["id"].value;

        const nova_quantidade = (card.quantidade - consumo)

        const dados = {
            consumo,
            data_uso,
            motivo,
            id,
        };

        relatorio.push(dados);

        cardContent.innerHTML = `
            <span class="card-title">${card.reagente}</span>
            <p>Numero: ${card.numero}</p>
            <p>Validade: ${card.validade}</p>
            <h5>Quantidade: ${nova_quantidade+card.unidade}</h5>
        `;
        cardContent.appendChild(editForm);

        saveCards();
        cardContent.removeChild(editForm);
    });

    editForm.innerHTML = `
        <input type="text" name="consumo" placeholder="Consumo" value="" required>
        <input type="text" name="data_uso" placeholder="Data_Uso" value="" required>
        <input type="text" name="motivo" placeholder="Motivo" value="" required>
        <input type="text" name="id" placeholder="ID" value="" required>
        <button type="submit" class="waves-effect waves-light btn-small">Salvar</button>
    `;

    cardContent.innerHTML = "";
    cardContent.appendChild(editForm);
}



function saveCards() {
    localStorage.setItem("cards", JSON.stringify(cards));
    localStorage.setItem("relatorio", JSON.stringify(relatorio));
}

document.addEventListener("DOMContentLoaded", () => {
    loadCards();

    const pesquisa = document.getElementById("pesquisa");
    pesquisa.addEventListener("input", (event) => {
        const searchText = event.target.value.trim().toLowerCase();
        loadCards(searchText); 
    });
});
