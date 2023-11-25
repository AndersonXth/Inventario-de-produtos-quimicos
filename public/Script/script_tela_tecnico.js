let cards = [];
let relatorio = []

function loadCards(searchText = '') {
    fetch('/loadCards')
      .then(response => response.json())
      .then(data => {
        cards = data;
        listaReagentes.innerHTML = '';
        const filteredCards = cards.filter(card => {
          const reagente = card.reagente.toLowerCase();
          const numero = card.numero;
          return reagente.includes(searchText) || numero.includes(searchText);
        });
        filteredCards.forEach((card) => createCardElement(card));
      })
      .catch(error => console.error(error));
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
                        <h5>Quantidade: ${card.quantidade + card.unidade}</h5>
                    </div>
                    <div class="card-action">
                        <button class="waves-effect waves-light btn-small btn_consumo">Consumo</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    listaReagentes.appendChild(cardmat);

    cardmat.addEventListener('submit', (event) => {
        function apagarCardmat() {
            if (card.quantidade == 0) {
                cardmat.remove()
                cards = cards.filter((c) => c !== card);
                saveCards()
            } else {
                return
            }
        }
        apagarCardmat()
    })

    cardmat.querySelector(".btn_consumo").addEventListener("click", () => {
        showEditForm(card, cardmat);
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

        if(!isValidNumber(consumo)){
            alert('Por favor insira somente a quantidade do que foi consumido, não é necessário colocar a unidade')
            return
        }

        const dados = {
            reagente: card.reagente,
            consumo,
            unidade: card.unidade,
            data_uso,
            motivo,
            id,
        };

        const texto = `
            Seu consumo é o seguinte: 
            CONSUMO = ${dados.consumo+card.unidade}
            DATA = ${dados.data_uso}
            MOTIVO = ${dados.motivo}
            ID = ${dados.id} 

            Tem certeza que as informações acima estão corretas ??
        `;

        if(confirm(texto) == true){
            const nova_quantidade = (card.quantidade - consumo)
            card.quantidade = nova_quantidade
            relatorio.push(dados);
            saveRelatorio();
        }else{
            const nova_quantidade = card.quantidade
            card.quantidade = nova_quantidade
            alert('Preenchimento do Consumo Cancelado')
        }

        
        cardContent.appendChild(editForm);
        saveCards();
        cardContent.removeChild(editForm);

        cardContent.innerHTML = `
            <span class="card-title">${card.reagente}</span>
            <p>Numero: ${card.numero}</p>
            <p>Validade: ${card.validade}</p>
            <h5>Quantidade: ${card.quantidade+card.unidade}</h5>
        `;

    });

    

    editForm.innerHTML = `
        <input type="text" name="consumo" autocomplete="off" placeholder="Consumo em g, ml ou kits" value="" required>
        <input type="text" name="data_uso" autocomplete="off" placeholder="Data_Uso" value="" required>
        <input type="text" name="motivo" autocomplete="off" placeholder="Motivo" value="" required>
        <input type="text" name="id" autocomplete="off" placeholder="ID" value="" required>
        <button type="submit" class="waves-effect waves-light btn-small" id='salvarConsumo'>Salvar</button>
        <button class="waves-effect waves-light btn-small" id='closeConsumo'>Cancelar</button>
    `;

    cardContent.innerHTML = "";
    cardContent.appendChild(editForm);

    const cancelButton = editForm.querySelector('#closeConsumo')
    cancelButton.addEventListener('click',() => {
        cardContent.innerHTML = `
            <span class="card-title">${card.reagente}</span>
            <p>Numero: ${card.numero}</p>
            <p>Validade: ${card.validade}</p>
            <h5>Quantidade: ${card.quantidade + card.unidade}</h5>`
    })

}

function saveCards() {
    fetch('/saveCards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cards }),
    })
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error(error));
  }

function saveRelatorio() {
    fetch('/saveRelatorio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ relatorio }),
    })
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error(error));
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
    return +value === parseFloat(value) && isFinite(value);
}
