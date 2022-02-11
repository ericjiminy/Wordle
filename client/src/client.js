// document elements
const mainWrapper = document.getElementById("main-wrapper");

const headerWrapper = document.getElementById("header-wrapper");
const titleWrapper = document.getElementById("title-wrapper");
const title = document.getElementById("title");
const buttonsLeftWrapper = document.getElementById("buttons-left-wrapper");
const githubButton = document.getElementById("github");
const settingsButton = document.getElementById("settings");
const buttonsRightWrapper = document.getElementById("buttons-right-wrapper");
const statsButton = document.getElementById("stats");
const newWordButton = document.getElementById("new-word");

const boardWrapper = document.getElementById("board-wrapper");
const boardTable = document.getElementById("board-table");
const boardLine1 = document.getElementById("board-line-1");

const lettersWrapper = document.getElementById("letters-wrapper");
const lettersRow1 = document.getElementById("letters-row-1");
const lettersRow2 = document.getElementById("letters-row-2");
const lettersRow3 = document.getElementById("letters-row-3");



// variables
let word = "";
let answers = [];
let allowedGuesses = [];

let guessArr = [];   // user's current guess
let guessNum = 1;   // which guess the user is on

lettersContent1 = ["Q","W","E","R","T","Y","U","I","O","P"];
lettersContent2 = ["A","S","D","F","G","H","J","K","L"];
lettersContent3 = ["ENTER","Z","X","C","V","B","N","M"];



// change css for mobile
const isMobile = ('ontouchstart' in document.documentElement && navigator.userAgent.match(/Mobi/));
if (isMobile) {
    mainWrapper.style.minHeight = "-webkit-fill-available"; // fit to screen

    headerWrapper.style.height = "7vh"; // bigger header
    title.style.fontSize = "4.6vh";
    for (let button of [githubButton, settingsButton, statsButton, newWordButton]) {
        button.style.fontSize = "2.8vh";
    }
    githubButton.style.marginRight = "1.6vh";
    statsButton.style.marginRight = "1.6vh";
}


// open settings
function settings() {
    console.log("settings");
}
settingsButton.addEventListener("mousedown", settings);



// receive server data
function receiveData(data) {
    if (answers.length == 0) {
        answers = data;
        word = newAnswer();
        console.log(word);
    }
    else allowedGuesses = data;
}
const sock = io();
sock.on("message", receiveData);

// request server data
sock.emit("message", "answers.txt");
sock.emit("message", "allowedGuesses.txt");



// start new game
function newGame() {
    console.log("starting new game...");

    word = newAnswer(); // new word
    console.log(word);

    for (let boardCell of document.getElementsByClassName("board-cell")) {  // clear letters
        boardCell.textContent = "";
    }

    for (let colored of document.querySelectorAll(".no-spot")) {colored.classList.remove("no-spot");}   // reset color hints
    for (let colored of document.querySelectorAll(".wrong-spot")) {colored.classList.remove("wrong-spot");}
    for (let colored of document.querySelectorAll(".correct-spot")) {colored.classList.remove("correct-spot");}

    guessArr = [];  // reset guess
    guessNum = 1;
    writeGuess();
}
newWordButton.addEventListener("mousedown", newGame);

// choose new answer randomly
function newAnswer() {
    min = 0;
    max = answers.length;
    const index = Math.floor(Math.random() * (max - min + 1)) + min;
    return answers[index].toUpperCase();
}



// fill board
const boardSpacer = document.createElement("td");   // cell spacers
boardSpacer.className = "board-spacer";

for (let i = 2; i < 7; i++) {   // clone boardLine1 + spacers
    const lineClone = boardLine1.cloneNode(true);
    const id = "board-line-" + i;
    lineClone.id = id;

    const boardSpacerClone = boardSpacer.cloneNode();
    boardTable.append(boardSpacerClone);

    boardTable.append(lineClone);
}

if (isMobile) {
    for (let line of document.getElementsByClassName("board-line")) {line.style.height = "50px"};
    for (let cell of document.getElementsByClassName("board-cell")) {cell.style.width = "50px"};
}

// fill letters
function fillLettersRow(lettersRow, content) {
    for (let i = 0; i < content.length; i++) {
        const button = document.createElement("button");
        button.id = content[i];
        button.textContent = content[i];
        button.className = "letters-button";
        button.addEventListener("click", (e) => {
            if (guessArr.length < 5 && e.target.id != "ENTER") guessArr.push(e.target.id);
            writeGuess();
        });
        if (isMobile) {
            button.style.width = "8vw";
            button.style.padding = "0px";
        }
        lettersRow.append(button);
    }
}

fillLettersRow(lettersRow1, lettersContent1);
fillLettersRow(lettersRow2, lettersContent2);
fillLettersRow(lettersRow3, lettersContent3);

// enter button
const enter = document.getElementById("ENTER");
enter.addEventListener("mousedown", submitGuess);
if (isMobile) enter.style.width = "14vw";

// delete button
const delButton = document.createElement("button");
delButton.id = "DELETE";
delButton.className = "letters-button";
delButton.innerHTML = "<i class='fa-solid fa-delete-left'></i>";
delButton.style.fontSize = "16px";
delButton.addEventListener("mousedown", (e) => {
    guessArr.splice(guessArr.length - 1);
    writeGuess();
});
if (isMobile) delButton.style.width = "14vw";
lettersRow3.append(delButton);



// add inputs to guessArr
document.addEventListener("keyup", (e) => {
    if (e.key.match(/^([a-z]|[A-Z]){1}$/igm)) { // add letter
        if (guessArr.length < 5) guessArr.push(e.key.toUpperCase());
    }
    
    else if (e.key == "Backspace") {  // backspace
        guessArr.splice(guessArr.length-1);
    }

    else if (e.key == "Enter") {   // enter
        submitGuess();
    }

    writeGuess();   // update board
});

// write guessArr to board
function writeGuess() {
    const currBoardLine = document.getElementById("board-line-" + guessNum);
    const cells = currBoardLine.querySelectorAll(".board-cell");
    
    for (let i = 0; i < 5; i++) {
        if (guessArr.length >= i) cells[i].textContent = guessArr[i];
        else cells[i].textContent = "";
    }
}

// submit guessArr
function submitGuess() {
    if (guessArr.length < 5) return;

    const guess = guessArr.toString().replaceAll(",", "").toUpperCase();

    if (!(allowedGuesses.includes(guess.toLowerCase()) || answers.includes(guess.toLowerCase()))) {  // check if guess is allowed
        alert("Not in word list");
        return;
    }
    
    colorHints();

    if (guess == word) {    // check if guess is correct
        console.log("correct");


    }
    else {
        console.log("wrong");

        guessArr = [];
        guessNum++;
    }

}

// color hints
function colorHints() {
    const currBoardLine = document.getElementById("board-line-" + guessNum);
    const cells = currBoardLine.querySelectorAll(".board-cell");
    
    for (let i = 0; i < 5; i++) {
        const letter = document.getElementById(guessArr[i]);

        if (guessArr[i] == word.charAt(i)) {
            cells[i].classList.add("correct-spot"); // correct spot
            letter.classList.add("correct-spot");
        } 

        else if (word.indexOf(guessArr[i]) != -1) {
            cells[i].classList.add("wrong-spot");   // wrong spot
            letter.classList.add("wrong-spot");
        } 
        
        else {
            cells[i].classList.add("no-spot");  // not in word
            letter.classList.add("no-spot");
        }
    }
}