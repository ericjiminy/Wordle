// document elements
const body = document.getElementsByTagName("body")[0];
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
const browserData = window.localStorage;
let avgScore = 0, gamesPlayed = 0, winPercent = 0, losses = 0, currStreak = 0, maxStreak = 0;
let guessScores = [0, 0, 0, 0, 0, 0, 0];

let word = "";
let answers = [];
let allowedGuesses = [];

let guessArr = [];  // curr guess
let guessNum = 1;   // 6 max

let gameOver;

lettersContent1 = ["Q","W","E","R","T","Y","U","I","O","P"];
lettersContent2 = ["A","S","D","F","G","H","J","K","L"];
lettersContent3 = ["ENTER","Z","X","C","V","B","N","M"];

winPopups = ["Genius", "Excellent", "Wow", "Sheesh", "Amazing", "Sick", "Great", "Brilliant", "Outstanding", "Awesome", "Incredible", "Stunning", "Wonderful", "Marvelous", "Zoo-Wee Mama"];



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




// load browser data
const gs = browserData.getItem("guessScores");
if (gs != null) guessScores = gs.split(",").map(Number);
const avg = browserData.getItem("avgScore");
if (avg != null) avgScore = avg;
const gp = browserData.getItem("gamesPlayed");
if (gp != null) gamesPlayed = gp;
const wp = browserData.getItem("winPercent");
if (wp != null) winPercent = wp;
const ls = browserData.getItem("losses");
if (ls != null) losses = ls;
const cs = browserData.getItem("currStreak");
if (cs != null) currStreak = cs;
const ms = browserData.getItem("maxStreak");
if (ms != null) maxStreak = ms;




// change css for mobile
const isMobile = ('ontouchstart' in document.documentElement && navigator.userAgent.match(/Mobi/));
if (isMobile) {
    for (let ele of [mainWrapper, headerWrapper, title]) {
        ele.classList.add("mobile");
    }
    for (let button of [githubButton, settingsButton, statsButton, newWordButton]) {
        button.classList.add("header-button-mobile");
    }
}




// darken the screen
function darkenScreen() {
    const ds = document.createElement("div");
    ds.id = "dark-screen";
    ds.addEventListener("mousedown", () => {ds.remove()});
    if (isMobile) ds.className = "mobile";
    body.append(ds);
}

// open settings
function openSettings() {
    darkenScreen();

    const settingsWrapper = document.createElement("div");
    settingsWrapper.id = "settings-wrapper";
    if (isMobile) settingsWrapper.className = "mobile";
    settingsWrapper.textContent = "settings";

    settingsWrapper.addEventListener("mousedown", () => {
        document.getElementById("dark-screen").remove();
        settingsWrapper.remove();
    });    

    document.getElementById("dark-screen").append(settingsWrapper);
}
settingsButton.addEventListener("mousedown", openSettings);

// open stats
function openStats() {
    darkenScreen();

    const statsWrapper = document.createElement("div");
    statsWrapper.id = "stats-wrapper";
    if (isMobile) statsWrapper.className = "mobile";
    buildStats(statsWrapper);

    statsWrapper.addEventListener("mousedown", () => {
        document.getElementById("dark-screen").remove();
        statsWrapper.remove();
    });

    document.getElementById("dark-screen").append(statsWrapper);
}
statsButton.addEventListener("mousedown", openStats);

// build stats
function buildStats(statsWrapper) {
    const statsBox = document.createElement("div"); statsBox.id = "stats-box";
    const statsHeader = document.createElement("p"); statsHeader.id = "stats-header"; statsHeader.textContent = "STATISTICS";
    const statsTable = document.createElement("table"); statsTable.id = "stats-table";
    buildStatsTable(statsTable);
    
    const distrBox = document.createElement("div"); distrBox.id = "distr-box";
    const distrHeader = document.createElement("p"); distrHeader.id = "distr-header"; distrHeader.textContent = "GUESS DISTRIBUTION";
    const distrTable = document.createElement("table"); distrTable.id = "distr-table";
    buildDistrTable(distrTable);

    for (let elem of [statsBox, statsHeader, statsTable, distrBox, distrHeader, distrTable]) {
        if (isMobile) elem.className = "mobile";
    }

    statsBox.append(statsHeader, statsTable);
    distrBox.append(distrHeader, distrTable);
    statsWrapper.append(statsBox, distrBox);
}

// build stats table
function buildStatsTable(statsTable) {
    const values = document.createElement("tr"); values.id = "stats-values";
    const labels = document.createElement("tr"); labels.id = "stats-labels";
    if (isMobile) {values.className = "mobile"; labels.className = "mobile"};

    for (let stat of [avgScore, gamesPlayed, winPercent, currStreak, maxStreak]) {
        const val = document.createElement("td");
        val.textContent = stat;
        values.append(val);
    }

    const asl = document.createElement("td"); asl.textContent = "Avg Score";
    const gpl = document.createElement("td"); gpl.textContent = "Played";
    const wpl = document.createElement("td"); wpl.textContent = "Win %";
    const csl = document.createElement("td"); csl.textContent = "Current Streak";
    const msl = document.createElement("td"); msl.textContent = "Max Streak";
    labels.append(asl, gpl, wpl, csl, msl);

    statsTable.append(values, labels);
}

// build distr table
function buildDistrTable(distrTable) {
    const values = document.createElement("tr"); values.id = "distr-values";
    const spacer = document.createElement("tr"); spacer.id = "distr-spacer";
    const labels = document.createElement("tr"); labels.id = "distr-labels";
    if (isMobile) {values.className = "mobile"; labels.className = "mobile"; }

    const totalHeight = 150;
    let largestHeight = 0;
    for (const x of guessScores) {if (x > largestHeight) largestHeight = x;}
    const unit = totalHeight / largestHeight;

    for (let i = 0; i < 7; i++) {
        const val = document.createElement("td");
        const bar = document.createElement("div"); bar.className = "distr-bar";
        const lab = document.createElement("td");

        bar.textContent = guessScores[i];
        bar.style.height = unit * guessScores[i] + "px";

        if (i == 6) lab.textContent = "Loss";
        else lab.textContent = (i + 1);

        val.append(bar);
        values.append(val);
        labels.append(lab);
    }

    distrTable.append(values, spacer, labels);
}




// start new game
function newGame() {
    console.log("...starting new game...")
    gameOver = false;

    word = newAnswer(); // new word
    console.log(word);

    for (let boardCell of document.getElementsByClassName("board-cell")) {boardCell.textContent = "";}  // clear letters    

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
    const index = getRandom(0, answers.length);
    return answers[index].toUpperCase();
}

// get random number
function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}




// fit board to big desktop screens
function fitBoard() {
    if (isMobile) return;

    if (boardLine1.offsetHeight > 60) {
        for (let bl of document.getElementsByClassName("board-line")) {bl.style.height = "60px";}
        for (let bc of document.getElementsByClassName("board-cell")) {bc.style.width = "60px";}
    }

    else if (boardLine1.offsetHeight > 56) {
        for (let bl of document.getElementsByClassName("board-line")) {bl.style.height = "8vh";}
        for (let bc of document.getElementsByClassName("board-cell")) {bc.style.width = "8vh";}
    }
}
fitBoard();
window.addEventListener("resize", fitBoard);

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
    if (document.getElementById("dark-screen") || gameOver) return; // settings, stats, gameOver

    if (e.key.match(/^([a-z]|[A-Z]){1}$/igm)) { // add letter
        if (guessArr.length < 5) guessArr.push(e.key.toUpperCase());
    }
    else if (e.key == "Backspace") {  // backspace
        guessArr.splice(guessArr.length-1);
    }
    else if (e.key == "Enter") {   // enter
        submitGuess();
    }

    if (!gameOver) writeGuess(); // update board
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

    if (guess == word) {
        console.log("...correct...");

        endGame("win");
    } else {
        console.log("...wrong...");

        guessArr = [];
        guessNum++;
        if (guessNum > 6) endGame("lose");
    }
}

// popup + stats when game ends
function endGame(winOrLose) {
    console.log("...game over...");
    gameOver = true;

    avgScore = (((avgScore * gamesPlayed) + guessNum) / (++gamesPlayed)).toFixed(1);
    browserData.setItem("avgScore", avgScore);
    browserData.setItem("gamesPlayed", gamesPlayed);

    if (winOrLose == "lose") losses++;
    winPercent = (((gamesPlayed - (losses)) / gamesPlayed) * 100);
    if (winPercent < 100) winPercent = winPercent.toFixed(1);
    browserData.setItem("winPercent", winPercent);

    if (winOrLose == "win") {
        currStreak++;
        if (currStreak > maxStreak) maxStreak = currStreak;
    } else currStreak = 0;
    browserData.setItem("currStreak", currStreak);
    browserData.setItem("maxStreak", maxStreak);

    guessScores[guessNum - 1]++;
    browserData.setItem("guessScores", guessScores);

    delay(600).then(() => popup(winOrLose));
    delay(2200).then(() => openStats());
}

// make popup text on win/lose
function popup(winOrLose) {
    let text, index;

    if (winOrLose == "win") {
        index = getRandom(0, winPopups.length);
        text = winPopups[index];
    } else {
        text = word;
    }

    const popWrapper = document.createElement("div");
    popWrapper.id = "popup-wrapper";

    const popBox = document.createElement("span");
    popBox.id = "popup-box";
    popBox.textContent = text;

    popWrapper.append(popBox);
    body.append(popWrapper);

    if (winOrLose == "win") delay(800).then(() => {
        popBox.style.opacity = 0;
        delay(1000).then(() => popWrapper.remove());
    });
    else popWrapper.addEventListener("click", () => {popWrapper.remove()});
}

// delay a function call
function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
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