const listaReagentes = document.getElementById("listaReagentes");
const formCar = document.getElementById("formReagentes");
const novoReagenteInput = document.getElementById("reagente");
const novaNumeroInput = document.getElementById("numero");
const novaValidadeInput = document.getElementById("validade");
const novaQuantidadeInput = document.getElementById("quantidade");
const exportar = document.getElementById('exportButton')


let cards = [];
let selectedUnit = '';
checkbox();
loadCards();

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
    limparCampos()
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
            <h5>Quantidade: ${novo_quantidade+card.unidade}</h5>
        `;
        cardContent.appendChild(editForm)

        saveCards();
        cardContent.removeChild(editForm); 
    });

    editForm.innerHTML = `
        <input type="text" name="novo_reagente" placeholder="Novo reagente" autocomplete="off" value="${card.reagente}" required>
        <input type="text" name="novo_numero" placeholder="Nova numero" autocomplete="off" value="${card.numero}" required>
        <input type="text" name="novo_validade" placeholder="Nova validade" autocomplete="off" value="${card.validade}" required>
        <input type="text" name="novo_quantidade" placeholder="Nova quantidade" autocomplete="off" value="${card.quantidade}" required>
        <button type="submit" class="waves-effect waves-light btn-small">Salvar</button>
    `;

    cardContent.innerHTML = "";
    cardContent.appendChild(editForm);
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
    

function loadCards(searchText = '') {
    fetch('/loadCards')
      .then(response => response.json())
      .then(data => {
        cards = data;
        listaReagentes.innerHTML = '';
        const filteredCards = cards.filter(card => {
          const searchTerm = searchText.toLowerCase();
          const reagente = card.reagente.toLowerCase();
          const numero = card.numero;
          return reagente.includes(searchTerm) || numero.includes(searchTerm);
        });
        filteredCards.forEach(createCardElement);
      })
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

function exportToCSV(data, fileName) {
    const csvContent = "data:text/csv;charset=utf-8," + data.map(row => Object.values(row).join(';')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

document.getElementById("exportButton").addEventListener("click", () => {
    fetch('/loadRelatorio')
      .then(response => response.json())
      .then(relatorioData => {
        if (relatorioData.length > 0) {
          exportToCSV(relatorioData, "Relatorio.csv");
        } else {
          alert("Sem dados no relatório.");
        }
      })
      .catch(error => console.error(error));
  });
  

document.getElementById("exportBackup").addEventListener("click", () => {
    if (cards.length > 0) {
        const dados = cards.map(card => {
            return {
                Reagente: card.reagente,
                Numero: card.numero,
                Validade: card.validade,
                Quantidade: card.quantidade + card.unidade
            };
        });
        exportToCSV(dados, "Backup.csv");
    } else {
        alert("Sem dados na base");
    }
});

function limparCampos() {
    novoReagenteInput.value = '';
    novaNumeroInput.value = '';
    novaValidadeInput.value = '';
    novaQuantidadeInput.value = '';
    selectedUnit = '';
    const checkboxes = document.querySelectorAll('.uncheckable');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
}

function loadRelatorio() {
    fetch('/loadRelatorio')
      .then(response => response.json())
      .then(data => {
      })
      .catch(error => console.error(error));
  }
  
function clearRelatorio() {
    fetch('/clearRelatorio', {
      method: 'POST',
    })
      .then(response => response.json())
      .then(data => {
      })
      .catch(error => console.error(error));
  }
  
document.getElementById('limparRelatorio').addEventListener('click',() =>{
    clearRelatorio()
    console.log('base limpada')
})