document.addEventListener('DOMContentLoaded', function() {
    const app = {
        boardSize: { rows: 3, cols: 6 },
        heroCount: 37,
        boardState: new Array(18).fill(null),
        
        init: function() {
            this.setupBoardSlots();
            this.setupHeroesDragDrop();
            this.setupEventListeners();
            this.loadFromLocalStorage();
            this.updateSaveCode();
        },
        
        loadFromLocalStorage: function() {
            try {
                const savedState = localStorage.getItem('penguinTDState');
                if (savedState) {
                    const code = JSON.parse(savedState).code;
                    if (code) {
                        this.decodeCode(code);
                    }
                }
            } catch (error) {
                console.error("Error loading from local storage:", error);
            }
        },
        
        saveToLocalStorage: function() {
            try {
                const saveCodeInput = document.getElementById('save-code');
                const code = saveCodeInput.value;
                localStorage.setItem('penguinTDState', JSON.stringify({ code }));
            } catch (error) {
                console.error("Error saving to local storage:", error);
            }
        },
        
        setupBoardSlots: function() {
            const board = document.getElementById('board');
            // Check board
            if (board.children.length === 0) {
                for (let i = 0; i < this.boardSize.rows * this.boardSize.cols; i++) {
                    const slot = document.createElement('div');
                    slot.className = 'board-slot';
                    slot.dataset.index = i;
                    board.appendChild(slot);
                }
            }
            
            // event.list > all slots
            const slots = board.querySelectorAll('.board-slot');
            slots.forEach(slot => {
                slot.addEventListener('dragover', this.handleDragOver.bind(this));
                slot.addEventListener('drop', this.handleDrop.bind(this));
                slot.addEventListener('dragleave', this.handleDragLeave.bind(this));
                slot.addEventListener('click', this.handleSlotClick.bind(this));
            });
        },
        
        setupHeroesDragDrop: function() {
            const heroes = document.querySelectorAll('.heroes-grid .hero');
            heroes.forEach(hero => {
                hero.addEventListener('dragstart', this.handleDragStart.bind(this));
                hero.addEventListener('dragend', this.handleDragEnd.bind(this));
            });
        },
        handleDragStart: function(e) {
            e.dataTransfer.setData('text/plain', e.currentTarget.dataset.heroId);
            e.currentTarget.classList.add('dragging');
        },
        handleDragEnd: function(e) {
            e.currentTarget.classList.remove('dragging');
        },
        handleDragOver: function(e) {
            e.preventDefault();
            e.currentTarget.classList.add('drag-over');
        },
        handleDragLeave: function(e) {
            e.currentTarget.classList.remove('drag-over');
        },
        
        handleDrop: function(e) {
            e.preventDefault();
            e.currentTarget.classList.remove('drag-over');
            const heroId = parseInt(e.dataTransfer.getData('text/plain'));
            const targetSlotIndex = parseInt(e.currentTarget.dataset.index);
            const sourceSlotIndex = e.dataTransfer.getData('source-slot');
            if (sourceSlotIndex && sourceSlotIndex !== '') {
                const sourceIndex = parseInt(sourceSlotIndex);
                this.boardState[sourceIndex] = null;
                if (this.boardState[targetSlotIndex] !== null) {
                    const targetHeroId = this.boardState[targetSlotIndex];
                    this.boardState[sourceIndex] = targetHeroId;
                }
            }
            this.boardState[targetSlotIndex] = heroId;
            this.updateBoardDisplay();
            this.updateSaveCode();
        },
        
        handleSlotClick: function(e) {
            const slotIndex = parseInt(e.currentTarget.dataset.index);
            if (this.boardState[slotIndex] !== null) {
                this.removeHero(slotIndex);
            }
        },
        
        placeHero: function(slotIndex, heroId) {
            this.boardState[slotIndex] = heroId;
            this.updateBoardDisplay();
            this.updateSaveCode();
        },
        
        removeHero: function(slotIndex) {
            this.boardState[slotIndex] = null;
            this.updateBoardDisplay();
            this.updateSaveCode();
        },
        
        resetBoard: function() {
            this.boardState.fill(null);
            this.updateBoardDisplay();
            this.updateSaveCode();
        },
        
        updateBoardDisplay: function() {
            const slots = document.querySelectorAll('.board-slot');
            const self = this;
            
            slots.forEach((slot, index) => {
                const heroId = this.boardState[index];
                slot.innerHTML = '';
                slot.classList.remove('occupied');
                
                if (heroId !== null) {
                    const originalHero = document.querySelector(`.heroes-grid .hero[data-hero-id="${heroId}"]`);
                    if (originalHero) {
                        const heroClone = originalHero.cloneNode(true);
                        heroClone.style.width = '100%';
                        heroClone.style.height = '100%';
                        heroClone.style.borderRadius = '8px';
                        heroClone.draggable = true;
                        heroClone.dataset.boardHeroId = heroId;
                        heroClone.addEventListener('dragstart', function(e) {
                            e.dataTransfer.setData('text/plain', heroId);
                            e.dataTransfer.setData('source-slot', index);
                            e.currentTarget.classList.add('dragging');
                        });
                        
                        heroClone.addEventListener('dragend', function(e) {
                            e.currentTarget.classList.remove('dragging');
                        });
                        
                        slot.appendChild(heroClone);
                        slot.classList.add('occupied');
                    }
                }
            });
        },
        
        // Hex encode
        generateCode: function() {
            let code = '';
            for (let i = 0; i < this.boardState.length; i++) {
                const heroId = this.boardState[i];
                if (heroId === null) {
                    code += '00';
                } else {
                    code += heroId.toString(36).padStart(2, '0');
                }
            }
            return code;
        },
        
        decodeCode: function(code) {
            if (!code) return false;
            try {
                this.boardState.fill(null);
                if (!code || code.length !== this.boardState.length * 2) return false;
                for (let i = 0; i < this.boardState.length; i++) {
                    const pair = code.substring(i * 2, i * 2 + 2);
                    if (pair === '00') {
                        this.boardState[i] = null;
                    } else {
                        const heroId = parseInt(pair, 36);
                        if (heroId > 0 && heroId < this.heroCount) {
                            this.boardState[i] = heroId;
                        } else {
                            this.boardState[i] = null;
                        }
                    }
                }
                this.updateBoardDisplay();
                this.updateSaveCode();
                return true;
            } catch (error) {
                console.error("Error decoding:", error);
                return false;
            }
        },
        
        updateSaveCode: function() {
            try {
                const saveCodeInput = document.getElementById('save-code');
                const code = this.generateCode();
                saveCodeInput.value = code;
                saveCodeInput.placeholder = code ? code : 'Place hero to generate';
                // Cache
                if (code) {
                    localStorage.setItem('penguinTDState', JSON.stringify({ code }));
                }
            } catch (error) {
                console.error("Error updating save code:", error);
            }
        },
        
        setupEventListeners: function() {
            const copyBtn = document.getElementById('copy-btn');
            const loadBtn = document.getElementById('load-btn');
            const resetBtn = document.getElementById('reset-btn');
            const loadCodeInput = document.getElementById('load-code');
            copyBtn.addEventListener('click', () => {
                const saveCodeInput = document.getElementById('save-code');
                if (saveCodeInput.value) {
                    navigator.clipboard.writeText(saveCodeInput.value).then(() => {
                        copyBtn.textContent = '✓';
                        setTimeout(() => {
                            copyBtn.textContent = '📋';
                        }, 1500);
                    }).catch(() => {
                        saveCodeInput.select();
                        document.execCommand('copy');
                        copyBtn.textContent = '✓';
                        setTimeout(() => {
                            copyBtn.textContent = '📋';
                        }, 1500);
                    });
                }
            });
            
            loadBtn.addEventListener('click', () => {
                const code = loadCodeInput.value.trim();
                if (code && this.decodeCode(code)) {
                    loadCodeInput.value = '';
                    loadBtn.textContent = '✓';
                    setTimeout(() => {
                        loadBtn.textContent = 'Load';
                    }, 1500);
                } else {
                    loadBtn.textContent = 'Error';
                    loadBtn.style.background = '#f44336';
                    setTimeout(() => {
                        loadBtn.textContent = 'Load';
                        loadBtn.style.background = '#4CAF50';
                    }, 1500);
                }
            });
            resetBtn.addEventListener('click', () => {
                this.resetBoard();
                resetBtn.textContent = '✓';
                setTimeout(() => {
                    resetBtn.textContent = 'Reset Board';
                }, 1500);
            });
            loadCodeInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    loadBtn.click();
                }
            });
        }
    };

    app.init();
});
