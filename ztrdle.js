const DIFFICULTIES = ["easy", "normal", "hard", "expert"]
class Ztrdle {
    constructor (animalDataFileName, turnsContainer, optionsContainer, turns = 8) {
        this.turnsContainer = turnsContainer
        this.optionsContainer = optionsContainer
        this.turns = turns
        this.hintsUsed = 0
        this.boxIndex = 0
        this.difficulty = "easy"
        this.animalDataColumns = [
            {
                "Type": "Animal",
                "Guessed": false
            },
            {
                "Type": "Biome",
                "Guessed": false
            },
            {
                "Type": "Status",
                "Guessed": false
            },
            {
                "Type": "Star Rating",
                "Guessed": false
            },
            {
                "Type": "Cost",
                "Guessed": false
            },
            {
                "Type": "Location",
                "Guessed": false
            }
        ]
        this.intentContent = `Ztrdle ${new Date().toISOString().slice(0, 10)}%0a${window.location.hostname + window.location.pathname}%0a`

        fetch(animalDataFileName)
            .then(response => response.json())
            .then(data => {              
                const url = new URL(window.location.href)
                const params = new URLSearchParams(url.search)
                this.seed = params.get('seed')
                this.difficulty = params.get('diff')
                if (this.difficulty == undefined ||
                    (this.difficulty != "easy" &&
                    this.difficulty != "normal" &&
                    this.difficulty != "hard" &&
                    this.difficulty != "expert"
                )

                ) {
                    let difficultyRadioButtons = ``

                    DIFFICULTIES.forEach( dif => {
                        let isChecked = ``

                        difficultyRadioButtons += `
                            <input type="radio" name="difficulty" value="${dif}" ${isChecked} >
                            <label for="html">${dif}</label><br>
                        `
                    }
                    )

                    document.getElementById("container").innerHTML = `select difficulty: <div>${difficultyRadioButtons}</div>`

                    const radios = document.querySelectorAll('input[name="difficulty"]')
                    console.log(radios)
                    for (let i = 0; i < radios.length; i++) {
                        radios[i].addEventListener("change", () => {
                            window.location.replace(`https://${window.location.hostname + window.location.pathname}?diff=${document.querySelector('input[name="difficulty"]:checked').value}`)
                        })
                    }
                }

                this.intentContent += `difficulty: ${this.difficulty}%0a`

                if (this.seed != undefined) {
                    Math.seedrandom(this.seed)
                }
                else {
                    Math.seedrandom(Math.floor(new Date(new Date().toISOString().slice(0, 10)).getTime() / 1000)+this.difficulty)
                }
                
                const randomIndex = Math.floor(Math.random() * data.length)

                this.animal = data[randomIndex]
                this.animals = data

                this.turnsContainer.innerHTML = `
                    <div>Animal</div>
                    <div>Biome</div>
                    <div>Status</div>
                    <div>Stars</div>
                    <div>Cost</div>
                    <div>Location</div>
                `
                for (let i = 0; i < this.turns; i++) {
                    this.turnsContainer.innerHTML += `
                        <div class="box"></div>
                        <div class="box"></div>
                        <div class="box"></div>
                        <div class="box"></div>
                        <div class="box"></div>
                        <div class="box"></div>
                    `
                }
                this.boxes = document.getElementsByClassName("box")

                this.optionsContainer.innerHTML = `
                <div class="autocomplete">
                    <input id="myInput" type="text" placeholder="Enter animal name" autocomplete="off">
                </div>
                <button class="retrybutton" id="submit">Submit</button>
                <button class="retrybutton" id="hint">Hint (-1 turn)</button>
                `
                this.inputField = document.getElementById("myInput")
                this.submitButton = document.getElementById("submit")
                this.hintButton = document.getElementById("hint")

                if (this.difficulty == "expert")
                    this.hintButton.style.display = "none"

                this.submitButton.addEventListener("click", e => {
                    e.preventDefault()
                    this.submit(this.inputField.value)
                })

                this.hintButton.addEventListener("click", e => {
                    e.preventDefault()
                    this.hint(e)
                })

                autocomplete(this.inputField, this.animals.map(a => a.Animal))
            })
    }

    retry = () => {
        window.location.replace(`https://${window.location.hostname + window.location.pathname}?seed=${Math.floor(Math.random() * 9999999999999) + 1}&diff=${document.querySelector('input[name="difficulty"]:checked').value}`)
    }

    submit = (input) => {
        if (this.animals.find(a => a.Animal == input) == undefined || this.turns <= 0)
            return

        this.turns--
        this.inputField.value = null
        const guessedAnimal = this.animals.find(a => a.Animal == input)

        let theBox
        this.animalDataColumns.forEach(e => {
            theBox = this.boxes[this.boxIndex]
            if ((e.Type == "Star Rating" || e.Type == "Cost") && this.difficulty == "expert") {
                theBox.className = "disabledbox"
                this.intentContent += "%E2%AC%9B"
            }
            else if (guessedAnimal[e.Type] == this.animal[e.Type]) {
                theBox.className = "goodbox"

                if (e.Type != "Animal" && e.Type != "Star Rating" && e.Type != "Cost" && this.difficulty == "expert")
                    theBox.className = "expertgoodbox"

                this.intentContent += "%F0%9F%9F%A9"
                e.Guessed = true
            }
            else {
                theBox.className = "badbox"
                this.intentContent += "%F0%9F%9F%A5"
            }

            if (e.Type != "Star Rating" && e.Type != "Cost" && e.Guessed == true && guessedAnimal[e.Type] != this.animal[e.Type] && this.difficulty == "expert")
                this.turns = 0

            if (e.Type != "Animal" && this.difficulty == "expert")
                return;

            switch (e.Type) {
                case "Animal":
                    theBox.innerText = guessedAnimal[e.Type]
                    break
                case "Biome":
                    if (this.difficulty == "easy")
                        theBox.innerHTML = `<img class="icon" alt="biome ${guessedAnimal.Biome}" src="./assets/Icon_${guessedAnimal.Biome.replace(/\s/g, '').toLowerCase()}.webp"></img>`
                        break
                case "Status":
                    if (this.difficulty == "easy")
                        theBox.innerHTML = `<img class="statusicon" alt="status ${guessedAnimal.Status}" src="./assets/${guessedAnimal.Status.replace(/\s/g, '').toLowerCase()}.webp"></img>`
                        break
                case "Star Rating":
                    if (this.difficulty != "hard")
                        theBox.innerText = guessedAnimal[e.Type]
                    break
                case "Cost":
                    if (this.difficulty == "easy")
                        theBox.innerText = guessedAnimal[e.Type]
                    break
                case "Location":
                    if (this.difficulty != "hard")
                        theBox.innerText = guessedAnimal[e.Type]
                    break
                default:
                    theBox.innerText = guessedAnimal[e.Type]
                    break
            }
        });
        this.intentContent += "%0a"

        if (this.turns <= 1 && document.getElementById(this.hintButton.id) !== null) {
            document.getElementById(this.hintButton.id).parentNode.removeChild(document.getElementById(this.hintButton.id))
        }

        if (this.turns <= 0 || guessedAnimal.Animal == this.animal.Animal) {
            this.inputField.parentNode.removeChild(this.inputField)
            this.submitButton.parentNode.removeChild(this.submitButton)

            if (document.getElementById(this.hintButton.id) !== null)
            document.getElementById(this.hintButton.id).parentNode.removeChild(document.getElementById(this.hintButton.id))

            this.turns = 0
            const divvie = document.createElement("div")
            divvie.innerText = "The correct answer was: " + this.animal.Animal
            const parentContainer = this.turnsContainer.parentNode
            parentContainer.appendChild(divvie)

            if (this.seed == undefined) {
                parentContainer.innerHTML += `<a class="twitter-share-button" href="https://twitter.com/intent/tweet?text=${this.intentContent}" data-size="large"><i></i>Tweet</a>`
            }

            let difficultyRadioButtons = ``

            DIFFICULTIES.forEach( dif => {
                let isChecked = ``
                if (this.difficulty == dif)
                    isChecked = `checked="checked"`

                difficultyRadioButtons += `
                    <input type="radio" name="difficulty" value="${dif}" ${isChecked} >
                    <label for="html">${dif}</label><br>
                `
            }
            )

            parentContainer.innerHTML += `
            <button class="retrybutton" id="retry">Play another round</button>
            <div style="display:flex">
                ${difficultyRadioButtons}
            </div>
            `

            document.getElementById("retry").addEventListener("click", e => {
                e.preventDefault()
                this.retry()
            })
        }
    }

    hint = (e) => {
        this.hintsUsed++
        this.inputField.value = null

        if (
            (this.difficulty == "easy" && this.hintsUsed >= 3) ||
            (this.difficulty == "normal" && this.hintsUsed >= 2) ||
            (this.difficulty == "hard" && this.hintsUsed >= 1) ||
            (this.difficulty == "expert" && this.hintsUsed >= 1)
        )
            e.target.parentNode.removeChild(e.target)

        if (!this.animalDataColumns[5].Guessed && this.turns <= 6 && this.animals.filter( a => a.Location == this.animal.Location && a.Animal != this.animal.Animal).length > 0) {
            this.submit(this.animals.filter( a => a.Location == this.animal.Location && a.Animal != this.animal.Animal)[0].Animal)
        }
        else if (!this.animalDataColumns[1].Guessed && this.turns <= 6) {
            this.submit(this.animals.filter( a => a.Biome == this.animal.Biome && a.Animal != this.animal.Animal)[0].Animal)
        }
        else if (!this.animalDataColumns[4].Guessed) {
            this.submit(this.animals.filter( a => a.Cost == this.animal.Cost && a.Animal != this.animal.Animal)[0].Animal)
        }
        else if (!this.animalDataColumns[3].Guessed) {
            this.submit(this.animals.filter( a => a.Stars == this.animal.Stars && a.Animal != this.animal.Animal)[0].Animal)
        }
        else if (!this.animalDataColumns[2].Guessed) {
            this.submit(this.animals.filter( a => a.Status == this.animal.Status && a.Animal != this.animal.Animal)[0].Animal)
        }
        else if (!this.animalDataColumns[5].Guessed && this.animals.filter( a => a.Location == this.animal.Location && a.Animal != this.animal.Animal).length > 0) {
            this.submit(this.animals.filter( a => a.Location == this.animal.Location && a.Animal != this.animal.Animal)[0].Animal)
        }
        else {
            this.submit(this.animals.filter( a => a.Biome == this.animal.Biome && a.Animal != this.animal.Animal)[0].Animal)
        }
    }
}