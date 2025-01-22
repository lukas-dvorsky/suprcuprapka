let questions = []; // Pole na otázky

fetch('./questions.json')
  .then(response => response.json())
  .then(data => {
    questions = data;
    console.log('Načtené otázky:', questions);
    loadQuestion(); // Funkce pro zobrazení otázky
  })
  .catch(error => console.error('Chyba při načítání JSON:', error));



let selectedQuestion = null;

// Funkce pro načtení otázky
function loadQuestion() {
  const question = document.getElementById('question');
  const checkboxContainer = document.getElementById('checkbox_container');

  // Ověření, zda jsou otázky dostupné
  if (questions.length === 0) {
    console.error('Žádné otázky k zobrazení.');
    question.textContent = 'Otázky nejsou k dispozici.';
    checkboxContainer.innerHTML = '';
    return;
  }

  // Vyčištění předchozího obsahu
  checkboxContainer.innerHTML = '';
  getRandomQuestion(question, checkboxContainer);
}



// Vybere náhodnou otázku a zobrazí ji
function getRandomQuestion(questionHeader, checkboxContainer) {
  if (questions.length === 0) {
    console.error('Pole questions je prázdné. Nelze zobrazit otázku.');
    return;
  }

  const randomIndex = Math.floor(Math.random() * questions.length); // Vždy vrátí validní index
  selectedQuestion = questions[randomIndex];

  console.log('Vybraná otázka:', selectedQuestion); // Debug
  questionHeader.textContent = selectedQuestion.otazka;

  const answers = selectedQuestion.odpovedi;
  answers.forEach(answer => {
    createAnswer(answer, checkboxContainer);
  });
}


// Vytvoří odpověď jako radiobutton
function createAnswer(answer, checkboxContainer) {
  const radio = document.createElement('input');
  radio.type = 'radio';
  radio.id = answer; // Použití textu odpovědi jako ID
  radio.name = 'answer';
  radio.value = answer;
  radio.classList.add('radio_answer');

  const label = document.createElement('label');
  label.htmlFor = answer;
  label.textContent = answer;

  checkboxContainer.appendChild(radio);
  checkboxContainer.appendChild(label);
  checkboxContainer.appendChild(document.createElement('br'));
}

// Ukladani odpovedi
function saveQuestions() {
  fetch('./questions.json', {
    method: 'PUT', // Nebo POST, pokud ukládáš novou verzi
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(questions)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    console.log('Otázky byly úspěšně aktualizovány na serveru.');
  })
  .catch(error => console.error('Chyba při ukládání otázek:', error));
}


// Funkce pro kontrolu odpovědi a přepnutí tlačítka
function checkAnswer() {
  const selectedOption = document.querySelector('input[name="answer"]:checked');
  const allOptions = document.querySelectorAll('input[name="answer"]');

  if (!selectedOption) {
    console.error('Žádná odpověď nebyla vybrána.');
    return;
  }

  const userAnswer = selectedOption.value;

  // Přidej třídy ke všem odpovědím
  allOptions.forEach(option => {
    const label = document.querySelector(`label[for="${option.id}"]`);
    if (option.value === selectedQuestion.spravna_odpoved) {
      label.classList.add('correct'); // Správná odpověď
    } else if (option.checked) {
      label.classList.add('wrong'); // Špatná odpověď uživatele
    }
    // Deaktivuj všechny odpovědi po kliknutí
    option.disabled = true;
  });

  if (userAnswer === selectedQuestion.spravna_odpoved) {
    selectedQuestion.spravne++; // Přičti k správným odpovědím
    console.log('Správná odpověď!');
  } else {
    selectedQuestion.spatne++; // Přičti k špatným odpovědím
    console.log('Špatná odpověď!');
  }

  console.log(`Správně: ${selectedQuestion.spravne}, Špatně: ${selectedQuestion.spatne}`);

  saveQuestionsLocally(); // Lokální ukládání

  // Změna textu tlačítka na "Další"
  const submitButton = document.getElementById('submit');
  submitButton.textContent = 'Další';

  // Nastav listener pro "Další" (na další otázku, ne na kontrolu odpovědi)
  submitButton.removeEventListener('click', checkAnswer);
  submitButton.addEventListener('click', loadNextQuestion);
}

// Funkce pro ukládání otázek do localStorage
function saveQuestionsLocally() {
  // Před uložením zkontroluj, zda je `questions` správně aktualizováno
  console.log('Ukládám otázky do localStorage:', questions);
  localStorage.setItem('questions', JSON.stringify(questions));
}

// Funkce pro načtení otázek z localStorage
function loadQuestionsLocally() {
  const savedQuestions = localStorage.getItem('questions');
  if (savedQuestions) {
    questions = JSON.parse(savedQuestions);
    console.log('Načtené otázky z Local Storage:', questions);
  } else {
    console.log('Žádné uložené otázky nebyly nalezeny.');
  }
}


// Funkce pro načtení další otázky
function loadNextQuestion() {
  loadQuestion(); // Načti novou otázku
  const submitButton = document.getElementById('submit');
  submitButton.textContent = 'Zkontrolovat'; // Vrať tlačítko na "Zkontrolovat"

  // Povolit opět všechny odpovědi
  const allOptions = document.querySelectorAll('input[name="answer"]');
  allOptions.forEach(option => {
    option.disabled = false;
  });

  // Přiřazení původní funkce k tlačítku (kontrola odpovědi)
  submitButton.removeEventListener('click', loadNextQuestion);
  submitButton.addEventListener('click', checkAnswer);
}

loadQuestionsLocally();

document.getElementById('submit').addEventListener('click', () => {
  checkAnswer();
});


//PROGRESS

function showProgress() {
  const modal = document.getElementById('progressModal');
  const tableBody = document.querySelector('#progressTable tbody');

  // Načteme data z localStorage
  const savedQuestions = localStorage.getItem('questions');
  if (!savedQuestions) {
    console.error('Žádná data o otázkách nebyla nalezena v localStorage.');
    return;
  }

  const questions = JSON.parse(savedQuestions);

  // Vyčistit tabulku před naplněním
  tableBody.innerHTML = '';

  // Projít všechny otázky a přidat je do tabulky
  questions.forEach(question => {
    const row = document.createElement('tr');

    // Vytvoření buňky pro otázku, která bude obsahovat i progresní bar
    const questionCell = document.createElement('td');
    const questionText = document.createElement('div');
    questionText.textContent = question.otazka;

    // Vytvoření progresního baru pod otázkou
    const progressBarContainer = document.createElement('div');
    progressBarContainer.classList.add('progress-bar-container');
    
    const progressBarGreen = document.createElement('div');
    progressBarGreen.classList.add('progress-bar-green');

    const progressBarRed = document.createElement('div');
    progressBarRed.classList.add('progress-bar-red');

    // Výpočet šířky zeleného a červeného baru
    const totalAnswers = question.spravne + question.spatne;
    const correctRate = totalAnswers > 0 ? (question.spravne / totalAnswers) * 100 : 0;
    const wrongRate = totalAnswers > 0 ? (question.spatne / totalAnswers) * 100 : 0;

    progressBarGreen.style.width = `${correctRate}%`; // Nastavení šířky zelené části
    progressBarRed.style.width = `${wrongRate}%`; // Nastavení šířky červené části

    progressBarContainer.appendChild(progressBarGreen);
    progressBarContainer.appendChild(progressBarRed);

    // Vložení textu otázky a progresního baru do buňky
    questionCell.appendChild(questionText);
    questionCell.appendChild(progressBarContainer);

    // Vytvoření buněk pro správné a špatné odpovědi
    const correctCell = document.createElement('td');
    correctCell.textContent = question.spravne / 2;

    const wrongCell = document.createElement('td');
    wrongCell.textContent = question.spatne / 2;

    // Výpočet procenta úspěšnosti
    const successRateCell = document.createElement('td');
    successRateCell.textContent = `${correctRate.toFixed(2)}%`;

    // Přidání buněk do řádku
    row.appendChild(questionCell);
    row.appendChild(correctCell);
    row.appendChild(wrongCell);
    row.appendChild(successRateCell);

    // Přidání řádku do těla tabulky
    tableBody.appendChild(row);
  });

  // Zobrazit modální okno
  modal.style.display = 'block';
}



// Funkce pro zavření tabulky
function closeProgress() {
  const modal = document.getElementById('progressModal');
  modal.style.display = 'none';
}

// Přidat event listener na tlačítko pro zobrazení pokroku
const progressBtn = document.getElementById('progressBtn');
if (progressBtn) {
  progressBtn.addEventListener('click', showProgress);
} else {
  console.error('Tlačítko pro zobrazení pokroku nebylo nalezeno.');
}

// Přidat event listener na tlačítko pro zavření tabulky
const closeProgressBtn = document.getElementById('closeProgressBtn');
if (closeProgressBtn) {
  closeProgressBtn.addEventListener('click', closeProgress);
} else {
  console.error('Tlačítko pro zavření tabulky nebylo nalezeno.');
}

