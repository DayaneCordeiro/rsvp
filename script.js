// =========================================================
// 1. DADOS DE CONFIGURAÇÃO (PERSONALIZAR)
// =========================================================

// ATENÇÃO: SUBSTITUA esta URL pela URL do seu Aplicativo da Web do Google Apps Script
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx33YDCd-xjqyXeLDQ1k7kNwZrlUzk5oh4LGDX7l6xDo3bjTT5si200OYKRN8vPPSYI0A/exec';

// ATENÇÃO: COLOQUE AQUI A SUA LISTA EXATA DE CONVIDADOS.
// O nome digitado/selecionado DEVE ser exatamente igual a um destes itens.
const LISTA_CONVIDADOS = [
    "Dayane Cordeiro",
    "Tamiris Oliveira",
    "Ana Soares"
    // ... Adicione aqui todos os 60 nomes EXATOS da sua lista ...
];

// =========================================================
// 2. LÓGICA DO AUTOCOMPLETAR CUSTOMIZADO
// =========================================================
function autocomplete(input, arr) {
    const resultsContainer = document.getElementById('autocomplete-results');

    input.addEventListener("input", function(e) {
        let val = this.value;
        resultsContainer.innerHTML = ""; // Limpa resultados anteriores
        
        if (!val || val.length < 2) { 
            return false;
        }

        let count = 0;
        const maxSuggestions = 8; 

        for (let i = 0; i < arr.length; i++) {
            if (arr[i].toUpperCase().startsWith(val.toUpperCase()) && count < maxSuggestions) {
                
                const resultItem = document.createElement("DIV");
                resultItem.setAttribute('data-value', arr[i]);
                
                resultItem.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                resultItem.innerHTML += arr[i].substr(val.length);
                
                resultItem.addEventListener("click", function(e) {
                    input.value = this.getAttribute('data-value');
                    resultsContainer.innerHTML = "";
                    input.focus();
                });
                
                resultsContainer.appendChild(resultItem);
                count++;
            }
        }
    });

    document.addEventListener("click", function (e) {
        if (e.target != input && e.target.closest('#autocomplete-results') === null) {
            resultsContainer.innerHTML = "";
        }
    });
}

// =========================================================
// 3. LÓGICA DE SUBMISSÃO DO FORMULÁRIO (RSVP)
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    const inputNome = document.getElementById('nome_completo');
    const loadingOverlay = document.getElementById('loading-overlay'); // NOVO: Elemento do loader
    
    autocomplete(inputNome, LISTA_CONVIDADOS);

    document.getElementById('form-rsvp').addEventListener('submit', function(event) {
        event.preventDefault(); 
    
        const form = this;
        const nomeErro = document.getElementById('nome-erro');
        const submitBtn = document.getElementById('submit-btn');
        const statusMessage = document.getElementById('message-status');
        
        // --- VALIDAÇÃO DA LISTA FECHADA ---
        const nomeSelecionado = inputNome.value.trim();
        
        if (!LISTA_CONVIDADOS.includes(nomeSelecionado)) {
            nomeErro.textContent = "Por favor, selecione seu nome EXATO da lista para continuar.";
            nomeErro.style.display = 'block';
            inputNome.focus();
            return; 
        } else {
            nomeErro.style.display = 'none';
        }
        
        // --- ENVIO DOS DADOS ---
        
        // 1. MOSTRA O LOAD NA TELA
        loadingOverlay.classList.remove('hidden');
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
        statusMessage.style.display = 'none';
    
        const formData = new FormData(form);
        const params = new URLSearchParams(formData);
    
        fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            body: params,
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            return response.json(); 
        })
        .then(data => {
            // 2. ESCONDE O LOAD
            loadingOverlay.classList.add('hidden');
            
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar Confirmação';
            statusMessage.style.display = 'block';
    
            if (data.result === 'success') {
                statusMessage.textContent = 'Confirmação enviada com sucesso! Mal podemos esperar!';
                statusMessage.className = 'success';
                form.reset(); 
            } else {
                statusMessage.textContent = 'ERRO: Houve um problema no servidor. Tente novamente.';
                statusMessage.className = 'error';
                console.error('Erro no servidor do Apps Script:', data.message);
            }
        })
        .catch(error => {
            // 3. ESCONDE O LOAD (mesmo em caso de erro de rede)
            loadingOverlay.classList.add('hidden');
            
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar Confirmação';
            statusMessage.style.display = 'block';
            statusMessage.textContent = 'ERRO: Não foi possível enviar. Verifique sua conexão.';
            statusMessage.className = 'error';
            console.error('Erro de rede/fetch:', error);
        });
    });
});