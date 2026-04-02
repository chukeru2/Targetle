async function loadCSV(url) {
    try {
        const response = await fetch(url);
        const text = await response.text();

        // 1. 改行コード(CRLF/LF)で分割し、行ごとの配列にする
        // 2. 各行をカンマで分割して、2次元配列にする
        const data = text.trim().split(/\r?\n/).map(line => {
            return line.split(',');
        });

        //console.log(data); // [[row1_col1, row1_col2], [row2_col1, ...]]
        return data;
    } catch (error) {
        console.error("CSVの読み込みに失敗しました:", error);
    }
}


const keys = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACK"]
];
const alphabets = []

{
    let x = 0
    for(let i = 0;i < 3;i++)
    {
        for(let j = 0; j < keys[i].length; j++)
        {
            alphabets[x] = keys[i][j]
            x++
        }
    }
}


const keyElement = document.getElementById("keyboad")
let keystatus =[]

let settingLetters = document.getElementById("letters")
let lettersLabel = document.getElementById("lettersLabel")
settingLetters.addEventListener('input',(e) => {
    lettersLabel.textContent = e.target.value + " letters"
})

let restartButton = document.getElementById("restart")
let boxes = document.getElementById("inputBoxes")
restartButton.addEventListener("click",() => {
    if(!clear)
    {
        let res = window.confirm("本当に再スタートしますか？")
        if(res)
        {
            restart()
        }
    }else{
        restart()
    }
})

let answerDisp = document.getElementById("answer")
let meaning = document.getElementById("meaning")

let inputLock = false
let clear = false

let guesses
let row = 6
let column = 5
settingLetters.value = column
let currentrow
let currentcolumn
let currentword
let wordsletter = []
let words

initialize()


async function initialize()
{
    let keynum = 0
    for (let i = 0;i < keys.length;i++)
    {
        let keyrow = document.createElement("div")
        
        
        for(let j = 0;j < keys[i].length;j++)
        {
            let buttons = document.createElement("input")
                buttons.value = keys[i][j]
                buttons.type = "button"
                
            if(keys[i][j] == "ENTER" ||keys[i][j] == "BACK")
            {
                buttons.classList.add("bigkeys")
            }else{
                buttons.classList.add("keys")
            }
            buttons.classList.add(keys[i][j])
            buttons.classList.add("k" + keynum)
            buttons.onclick = () => {
                handleKeyPress(keys[i][j]); 
            };
            keyrow.appendChild(buttons)
            keynum++
        }
        keyElement.appendChild(keyrow)
    }



    words = await loadCSV('words.csv');
    
    for(let i = 0;i < words.length;i++)
    {
        const len = words[i][1].length; // 単語の長さ
        
        // --- 修正ポイント: 配列がなければ空の配列を作る ---
        if (!wordsletter[len]) {
            wordsletter[len] = [];
        }
        
        wordsletter[len].push(i);
    }
    console.log(wordsletter)
    restart()
    
}
function restart()
{
    inputLock = false
    clear = false

    for(let i = 0;i < 28;i++)
    {
        keystatus[i] ="null"
    }

    row = 6
    column = settingLetters.value
    currentcolumn = 0
    currentrow = 0
    while(boxes.lastElementChild)
    {
        boxes.removeChild(boxes.lastElementChild)
    }
    guesses = []
    for (let i = 0;i < row;i++)
    {
        let h1 = document.createElement("div")
        let spans = "";
        guesses[i] = []
        for(let x = 0;x < column;x++)
        {
            spans += "<span class='box' id=" + i + x + ">\u00A0</span>"
            guesses[i][x] = ""
        }
        h1.innerHTML = spans
        boxes.appendChild(h1)
    }
    currentword = wordsletter[column][getRandomInt(wordsletter[column].length)]
    console.log(currentword,words[currentword][1])

    for(let i = 0;i < 28;i++)
    {
        let colorchangekey = document.getElementsByClassName("k" + i)[0]
        colorchangekey.style.backgroundColor = ""
        colorchangekey.style.color = ""
    }

    answerDisp.textContent = "The answer is..."
    meaning.textContent = "意味は..."
}

document.addEventListener("keydown",(e) => {
    
    const key = e.key;

    if (key === 'Enter') {
        handleSubmit(); // 判定処理へ
    } else if (key === 'Backspace') {
        handleDelete(); // 1文字削除
    } else if (/^[a-zA-Z]$/.test(key)) {
        handleInput(key.toUpperCase()); // アルファベットなら入力処理へ
    }
})
function handleKeyPress(key) {
    if (key === "ENTER") {
        // 単語の判定処理へ
        handleSubmit();
    } else if (key === "BACK") {
        // 1文字消す処理
        handleDelete();
    } else {
        // 文字を入力枠に追加する処理
        handleInput(key);
    }
}


function handleInput(key)
{
    if(currentcolumn < column && !inputLock)
    {
        guesses[currentrow][currentcolumn] = key
        let changeLetter = currentrow.toString() + currentcolumn.toString()
        document.getElementById(changeLetter).textContent = key
        currentcolumn++
    }
}
function handleDelete()
{
    if(currentcolumn > 0)
    {
        currentcolumn--
        guesses[currentrow][currentcolumn] = ""
        let changeLetter = currentrow.toString() + currentcolumn.toString()
        document.getElementById(changeLetter).textContent = "\u00A0"
        
    }
}
function handleSubmit()
{
    if(currentcolumn < column)
    {
        
    }else{
        let correctNumber = 0
        for(let i = 0;i < column;i++)
        {
            if(guesses[currentrow][i] == words[currentword][1][i].toUpperCase())
            {
                let changeLetter = currentrow.toString() + i.toString()
                document.getElementById(changeLetter).style.color = "green"
                correctNumber++
                keystatus[alphabets.indexOf(guesses[currentrow][i]) ] = "green"
                console.log(alphabets.indexOf(guesses[currentrow][i]))
                
            }else{
                if(words[currentword][1].toUpperCase().includes(guesses[currentrow][i]))
                {
                    let changeLetter = currentrow.toString() + i.toString()
                    document.getElementById(changeLetter).style.color = "yellow"
                    if(keystatus[alphabets.indexOf(guesses[currentrow][i])] != "green")
                    {
                        keystatus[alphabets.indexOf(guesses[currentrow][i])] = "yellow"
                    }
                }else{
                    keystatus[alphabets.indexOf(guesses[currentrow][i])] = "black"
                }
                
            }
        }
        if(correctNumber == column)
        {
            answerDisp.textContent = "The answer is " + words[currentword][1].toUpperCase()
            meaning.textContent = "意味は..."+ words[currentword][2]
            inputLock = true
            clear = true
        }
        currentrow++
        currentcolumn=0
    }
    for(let i = 0;i < 28;i++)
    {
        let colorchangekey = document.getElementsByClassName("k" + i)[0]
        if(keystatus[i] == "green")
        {
            colorchangekey.style.backgroundColor = "green"
        }else{
            if(keystatus[i] == "yellow")
            {
                colorchangekey.style.backgroundColor = "yellow"
            }else{
                if(keystatus[i] == "black")
                {
                    colorchangekey.style.backgroundColor = "black"
                    colorchangekey.style.color = "white"
                }
            }
        }
    }
    if(currentrow >= row)
    {
        answerDisp.textContent = "The answer is " + words[currentword][1].toUpperCase()
        meaning.textContent = "意味は..."+ words[currentword][2]
        clear = true
    }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
