class Card {
    constructor(value, color) {
        this.value = value;
        this.color = color;
    }

    getImageName() {

        
        let valueName;
        switch (this.value) {
            case 1: valueName = 'ace'; break;
            case 11: valueName = 'jack'; break;
            case 12: valueName = 'queen'; break;
            case 13: valueName = 'king'; break;
            case 0: return 'joker.png'; // Special case for Joker
            default: valueName = this.value;
        }
        
        let colorName;
        switch (this.color) {
            case 'COEUR': colorName = 'hearts'; break;
            case 'CARREAUX': colorName = 'diamonds'; break;
            case 'TREFLE': colorName = 'clubs'; break;
            case 'PIQUE': colorName = 'spades'; break;
            case 'JOCKER': colorName = 'joker'; break; // Handle Joker separately
        }

        return `${valueName}_of_${colorName}.png`;
    }
}

class Deck {
    constructor(includeJokers = true) {
        this.deck = [];
        this.colors = ['COEUR', 'CARREAUX', 'TREFLE', 'PIQUE'];
        for (let i = 0; i < 4; i++) {
            for (let j = 1; j <= 13; j++) {
                this.deck.push(new Card(j, this.colors[i]));
            }
        }
        if (includeJokers) {
            this.deck.push(new Card(0, 'JOCKER'));
            this.deck.push(new Card(0, 'JOCKER'));
        }
        this.shuffle();
    }

    shuffle() {
        this.deck.sort(() => Math.random() - 0.5);
    }

    draw() {
        return this.deck.pop();
    }
}

class Player {
    constructor(name) {
        this.name = name;
        this.score = 0;
        this.immunityTurns = 0;
    }

    addPoints(points) {
        this.score += points;
    }

    setImmunity(turns) {
        this.immunityTurns = turns;
    }

    isImmune() {
        if (this.immunityTurns > 0) {
            this.immunityTurns--;
            return true;
        }
        return false;
    }
}

class BonnePioche {
    constructor(playerNames) {
        this.players = playerNames.map(name => new Player(name));
        this.currentIndex = 0;
        this.deck = new Deck();
        this.reverse = false;
        this.updatePlayerSelect();
        this.updateCurrentPlayerDisplay();
        this.showGameControls(); // Show controls at the start
    }

    currentPlayer() {
        return this.players[this.currentIndex];
    }

    nextPlayer() {
        this.currentIndex = (this.currentIndex + (this.reverse ? -1 : 1) + this.players.length) % this.players.length;
        this.updatePlayerSelect();
        this.updateCurrentPlayerDisplay();
        this.showGameControls(); // Show controls when moving to the next player
        this.clearGameLog(); // Clear the game log when moving to the next player
    }

    play(value) {
        const card = this.deck.draw();
        const currentPlayer = this.currentPlayer();
        const nextPlayer = this.players[(this.currentIndex + (this.reverse ? -1 : 1) + this.players.length) % this.players.length];

        let message = `Carte tirée : ${card.value} ${card.color}`;
        if (card.value === 1) {
            message += " (As : Choisissez un autre joueur pour boire à la place)";
            this.showPlayerSelect();
        } else if (card.value === 11) {
            this.reverse = !this.reverse;
            message += " (Valet : Changement de sens)";
        } else if (card.value === 12) {
            message += ` (Dame : Passe ton tour, ${nextPlayer.name} n'a pas besoin de boire)`;
        } else if (card.value === 13) {
            nextPlayer.setImmunity(2);
            message += ` (Roi : Immunité 2 tours pour ${nextPlayer.name})`;
        } else if (card.value === 0) {
            nextPlayer.addPoints(5);
            message += ` (Joker : ${nextPlayer.name} doit finir son verre)`;
        } else if (card.value !== value) {
            nextPlayer.addPoints(1);
            message += ` (Valeur incorrecte : ${nextPlayer.name} doit boire une gorgée)`;
        } else {
            message += ` (Valeur correcte : ${nextPlayer.name} n'a pas besoin de boire)`;
        }

        message += ` <p>Valeur donnée : ${value}</p>`

        document.getElementById('game-log').innerHTML = `<img src="img/${card.getImageName()}" alt="Carte tirée"><br>${message}`;
        
        this.hideGameControls(); // Hide controls after playing
    }

    updatePlayerSelect() {
        const select = document.getElementById('playerSelect');
        select.innerHTML = '<option value="">-- Sélectionnez un joueur --</option>';
        this.players.forEach(player => {
            if (player !== this.currentPlayer()) {
                const option = document.createElement('option');
                option.value = player.name;
                option.textContent = player.name;
                select.appendChild(option);
            }
        });
    }

    showPlayerSelect() {
        document.getElementById('player-select').style.display = 'block';
    }

    hidePlayerSelect() {
        document.getElementById('player-select').style.display = 'none';
    }

    showGameControls() {
        document.getElementById('valueInput').style.display = 'inline';
        document.querySelector('button[onclick="playTurn()"]').style.display = 'inline';
    }

    hideGameControls() {
        document.getElementById('valueInput').style.display = 'none';
        document.querySelector('button[onclick="playTurn()"]').style.display = 'none';
    }

    choosePlayerToDrink(selectedPlayer) {
        const player = this.players.find(p => p.name === selectedPlayer);
        if (player) {
            player.addPoints(1);
            document.getElementById('game-log').innerHTML = `${player.name} doit boire 1<br><img src="img/${this.deck.draw().getImageName()}" alt="Carte tirée">`;
        }
        this.hidePlayerSelect();
        this.nextPlayer();
    }

    updateCurrentPlayerDisplay() {
        document.getElementById('currentPlayer').textContent = `C'est au tour de ${this.currentPlayer().name}`;
    }

    clearGameLog() {
        document.getElementById('game-log').innerHTML = ''; // Clear the game log
    }
}

let game = null;

function setupPlayers() {
    const playerCount = parseInt(document.getElementById('playerCount').value);
    if (isNaN(playerCount) || playerCount < 2) {
        alert('Veuillez entrer un nombre valide de joueurs (minimum 2).');
        return;
    }

    const nameInputsContainer = document.getElementById('nameInputs');
    nameInputsContainer.innerHTML = '';

    for (let i = 0; i < playerCount; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Nom du joueur ${i + 1}`;
        input.id = `playerName${i}`;
        nameInputsContainer.appendChild(input);
    }

    document.getElementById('player-names').style.display = 'block';
}

function startGame() {
    const playerCount = parseInt(document.getElementById('playerCount').value);
    const playerNames = [];

    for (let i = 0; i < playerCount; i++) {
        const name = document.getElementById(`playerName${i}`).value.trim();
        if (!name) {
            document.getElementById('nameError').textContent = 'Tous les joueurs doivent avoir un nom.';
            return;
        }
        if (playerNames.includes(name)) {
            document.getElementById('nameError').textContent = 'Les noms des joueurs doivent être uniques.';
            return;
        }
        playerNames.push(name);
    }

    game = new BonnePioche(playerNames);
    document.getElementById('player-input').style.display = 'none';
    document.getElementById('game-area').style.display = 'block';
}

function playTurn() {
    const valueInput = document.getElementById('valueInput');
    const value = parseInt(valueInput.value);
    if (isNaN(value) || value < 1 || value > 10) {
        alert('Veuillez entrer une valeur valide (1 à 10).');
        return;
    }

    game.play(value);
}

function nextPlayer() {
    document.getElementById('valueInput').value = '';
    game.nextPlayer();
}

function choosePlayer() {
    const selectedPlayer = document.getElementById('playerSelect').value;
    if (selectedPlayer) {
        game.choosePlayerToDrink(selectedPlayer);
    }
}
