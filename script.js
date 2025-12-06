// =========================================================
// 1. DADOS DE CONFIGURAÇÃO (PERSONALIZAR)
// =========================================================

// ATENÇÃO: SUBSTITUA esta URL pela URL do seu Aplicativo da Web do Google Apps Script
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx33YDCd-xjqyXeLDQ1k7kNwZrlUzk5oh4LGDX7l6xDo3bjTT5si200OYKRN8vPPSYI0A/exec';

// ATENÇÃO: COLOQUE AQUI A SUA LISTA EXATA DE CONVIDADOS.
const LISTA_CONVIDADOS = [
    "Dayane Cordeiro",
    "Tamiris Oliveira",
    "Ana Soares",
    "Aparecida Carla",
    "Aparecida Maria"
    // ... Adicione aqui todos os 60 nomes EXATOS da sua lista ...
];

// =========================================================
// 2. LÓGICA DO AUTOCOMPLETAR CUSTOMIZADO
// =========================================================
function autocomplete(input, arr) {
    const resultsContainer = document.getElementById('autocomplete-results');

    input.addEventListener("input", function(e) {
        let val = this.value;
        resultsContainer.innerHTML = ""; 
        
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
    const loadingOverlay = document.getElementById('loading-overlay'); 
    
    // Elementos do Modal
    const modal = document.getElementById('success-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const closeSpan = document.querySelector('.close-button');

    // Funções para fechar o modal
    const closeModal = () => {
        modal.classList.remove('visible');
        modal.style.display = 'none';
    };

    closeSpan.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            closeModal();
        }
    });

    autocomplete(inputNome, LISTA_CONVIDADOS);

    document.getElementById('form-rsvp').addEventListener('submit', function(event) {
        event.preventDefault(); 
    
        const form = this;
        const nomeErro = document.getElementById('nome-erro');
        const submitBtn = document.getElementById('submit-btn');
        const statusMessage = document.getElementById('message-status'); 
        
        let respostaSelecionada = null;
        
        const radios = document.querySelectorAll('input[name="status_rsvp"]');

        radios.forEach(radio => {
            if (radio.checked) {
                respostaSelecionada = radio.value; 
            }
        });
        
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
            loadingOverlay.classList.add('hidden');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar Confirmação';
            
            // Ícones do Google Material Symbols dentro de um container para quebra de linha
            const happyIconContainer = '<span class="icon-container"><span class="material-symbols-outlined modal-icon">sentiment_very_satisfied</span></span>';
            const sadIconContainer = '<span class="icon-container"><span class="material-symbols-outlined modal-icon">sentiment_dissatisfied</span></span>';
            
            const titleText = "Resposta enviada!";
    
            if (data.result === 'success') {
                
                // Limpa o H3 para inserção
                modalTitle.innerHTML = '';
                
                if (respostaSelecionada === "Recusou") {
                    modalTitle.innerHTML = titleText + sadIconContainer; 
                    modalMessage.textContent = 'Que pena, obrigada por avisar!';
                } else {
                    modalTitle.innerHTML = titleText + happyIconContainer; 
                    modalMessage.innerHTML = 'Confirmação enviada com sucesso! <br> Mal podemos esperar!';
                }
                
                // Exibe o Modal
                modal.classList.add('visible');
                modal.style.display = 'flex';

                form.reset(); 
            } else {
                // Em caso de erro do Apps Script, usa a div de status
                statusMessage.textContent = 'ERRO: Houve um problema no servidor. Tente novamente.';
                statusMessage.className = 'error';
                statusMessage.style.display = 'block';
                console.error('Erro no servidor do Apps Script:', data.message);
            }
        })
        .catch(error => {
            loadingOverlay.classList.add('hidden');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar Confirmação';
            // Em caso de erro de rede, usa a div de status
            statusMessage.textContent = 'ERRO DE CONEXÃO: Não foi possível enviar. Verifique sua conexão.';
            statusMessage.className = 'error';
            statusMessage.style.display = 'block';
            console.error('Erro de rede/fetch:', error);
        });
    });
});

// TO DO:
/** 
 * ver se tem como o nome não ficar hardcoded
 * responsividade
 * melhorar fontes
 * validar a cor
 * modal na resposta do site "Enviado com sucesso" + texto
 * design do texto de quando o nome não está na lista
 * */ 