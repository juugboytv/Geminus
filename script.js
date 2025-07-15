// MOBA Battle Scene Game Logic
class MOBAGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.minimap = document.getElementById('minimap-canvas');
        this.minimapCtx = this.minimap.getContext('2d');
        
        // Game state
        this.gameTime = 23 * 60 + 45; // 23:45 in seconds
        this.dragonTimer = 2 * 60 + 15; // 2:15 in seconds
        
        // Game objects
        this.champions = [];
        this.minions = [];
        this.towers = [];
        this.projectiles = [];
        this.effects = [];
        
        // Player champion
        this.player = null;
        this.selectedTarget = null;
        
        // Ability cooldowns
        this.abilities = {
            Q: { cooldown: 0, maxCooldown: 8 },
            W: { cooldown: 0, maxCooldown: 12 },
            E: { cooldown: 0, maxCooldown: 16 },
            R: { cooldown: 0, maxCooldown: 45 }
        };
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.createGameObjects();
        this.bindEvents();
        this.startGameLoop();
        this.updateTimers();
    }
    
    setupCanvas() {
        // Set canvas size to match CSS
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }
    
    createGameObjects() {
        // Create player champion
        this.player = new Champion(600, 400, 'blue', true);
        this.champions.push(this.player);
        
        // Create enemy champions
        this.champions.push(new Champion(300, 200, 'red'));
        this.champions.push(new Champion(800, 600, 'red'));
        this.champions.push(new Champion(400, 700, 'blue'));
        this.champions.push(new Champion(900, 300, 'blue'));
        
        // Create towers
        this.towers.push(new Tower(150, 150, 'blue'));
        this.towers.push(new Tower(1050, 650, 'red'));
        this.towers.push(new Tower(300, 100, 'blue'));
        this.towers.push(new Tower(900, 700, 'red'));
        
        // Create minion waves
        this.createMinionWave('blue', 200, 200);
        this.createMinionWave('red', 1000, 600);
    }
    
    createMinionWave(team, startX, startY) {
        for (let i = 0; i < 6; i++) {
            this.minions.push(new Minion(
                startX + i * 30,
                startY + Math.random() * 40 - 20,
                team
            ));
        }
    }
    
    bindEvents() {
        // Canvas click events
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // Ability key bindings
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Ability slot clicks
        document.querySelectorAll('.ability-slot').forEach(slot => {
            slot.addEventListener('click', (e) => {
                const ability = slot.dataset.ability;
                this.castAbility(ability);
            });
        });
    }
    
    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check if clicking on an enemy
        let target = null;
        for (let champion of this.champions) {
            if (champion.team !== this.player.team && 
                this.isPointInCircle(x, y, champion.x, champion.y, 25)) {
                target = champion;
                break;
            }
        }
        
        if (target) {
            this.selectedTarget = target;
            this.player.target = target;
            this.addChatMessage('ally', 'Attacking enemy champion!');
        } else {
            // Move command
            this.player.moveTo(x, y);
            this.selectedTarget = null;
        }
    }
    
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
    }
    
    handleKeyPress(e) {
        const key = e.key.toUpperCase();
        if (['Q', 'W', 'E', 'R'].includes(key)) {
            this.castAbility(key);
            e.preventDefault();
        }
    }
    
    castAbility(ability) {
        if (this.abilities[ability].cooldown > 0) {
            return; // Ability on cooldown
        }
        
        // Start cooldown
        this.abilities[ability].cooldown = this.abilities[ability].maxCooldown;
        this.updateAbilityCooldown(ability);
        
        // Cast ability effects
        switch(ability) {
            case 'Q':
                this.castFireball();
                break;
            case 'W':
                this.castShield();
                break;
            case 'E':
                this.castDash();
                break;
            case 'R':
                this.castUltimate();
                break;
        }
        
        this.addChatMessage('ally', `Cast ${ability} ability!`);
    }
    
    castFireball() {
        if (this.selectedTarget) {
            this.projectiles.push(new Projectile(
                this.player.x, this.player.y,
                this.selectedTarget.x, this.selectedTarget.y,
                'fireball'
            ));
        }
    }
    
    castShield() {
        this.effects.push(new Effect(this.player.x, this.player.y, 'shield', 3000));
        this.player.health = Math.min(this.player.maxHealth, this.player.health + 200);
    }
    
    castDash() {
        if (this.mouseX && this.mouseY) {
            const dx = this.mouseX - this.player.x;
            const dy = this.mouseY - this.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const dashDistance = Math.min(distance, 150);
            
            this.player.x += (dx / distance) * dashDistance;
            this.player.y += (dy / distance) * dashDistance;
            this.effects.push(new Effect(this.player.x, this.player.y, 'dash', 500));
        }
    }
    
    castUltimate() {
        // Area of effect ultimate
        this.effects.push(new Effect(this.player.x, this.player.y, 'ultimate', 2000));
        for (let champion of this.champions) {
            if (champion.team !== this.player.team) {
                const distance = this.getDistance(this.player, champion);
                if (distance < 200) {
                    champion.takeDamage(400);
                }
            }
        }
    }
    
    updateAbilityCooldown(ability) {
        const slot = document.querySelector(`[data-ability="${ability}"]`);
        const overlay = slot.querySelector('.cooldown-overlay');
        overlay.style.opacity = '1';
        
        const interval = setInterval(() => {
            const progress = 1 - (this.abilities[ability].cooldown / this.abilities[ability].maxCooldown);
            overlay.style.background = `conic-gradient(transparent ${progress * 360}deg, rgba(0,0,0,0.7) 0deg)`;
            
            if (this.abilities[ability].cooldown <= 0) {
                overlay.style.opacity = '0';
                slot.classList.add('ready');
                setTimeout(() => slot.classList.remove('ready'), 1000);
                clearInterval(interval);
            }
        }, 100);
    }
    
    update() {
        // Update game objects
        this.champions.forEach(champion => champion.update());
        this.minions.forEach(minion => minion.update());
        this.projectiles.forEach(projectile => projectile.update());
        this.effects = this.effects.filter(effect => effect.update());
        
        // Update ability cooldowns
        for (let ability in this.abilities) {
            if (this.abilities[ability].cooldown > 0) {
                this.abilities[ability].cooldown -= 1/60; // 60 FPS
            }
        }
        
        // Remove dead projectiles
        this.projectiles = this.projectiles.filter(p => !p.shouldRemove);
        
        // AI for enemy champions
        this.updateAI();
    }
    
    updateAI() {
        this.champions.forEach(champion => {
            if (!champion.isPlayer && Math.random() < 0.02) { // 2% chance per frame
                // Simple AI: move towards enemy champions
                const enemies = this.champions.filter(c => c.team !== champion.team);
                if (enemies.length > 0) {
                    const target = enemies[Math.floor(Math.random() * enemies.length)];
                    champion.moveTo(target.x + Math.random() * 100 - 50, target.y + Math.random() * 100 - 50);
                }
            }
        });
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#1a252f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw map elements
        this.drawMap();
        
        // Draw game objects
        this.towers.forEach(tower => tower.render(this.ctx));
        this.minions.forEach(minion => minion.render(this.ctx));
        this.champions.forEach(champion => champion.render(this.ctx));
        this.projectiles.forEach(projectile => projectile.render(this.ctx));
        this.effects.forEach(effect => effect.render(this.ctx));
        
        // Draw UI elements
        this.drawTargetIndicator();
        this.drawMinimap();
    }
    
    drawMap() {
        // Draw lanes
        this.ctx.strokeStyle = '#3498db';
        this.ctx.lineWidth = 20;
        this.ctx.setLineDash([20, 10]);
        
        // Top lane
        this.ctx.beginPath();
        this.ctx.moveTo(0, 100);
        this.ctx.lineTo(this.canvas.width, 100);
        this.ctx.stroke();
        
        // Middle lane
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height / 2);
        this.ctx.lineTo(this.canvas.width, this.canvas.height / 2);
        this.ctx.stroke();
        
        // Bottom lane
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height - 100);
        this.ctx.lineTo(this.canvas.width, this.canvas.height - 100);
        this.ctx.stroke();
        
        this.ctx.setLineDash([]);
        
        // Draw jungle areas
        this.ctx.fillStyle = 'rgba(46, 204, 113, 0.1)';
        this.ctx.fillRect(200, 200, 300, 200);
        this.ctx.fillRect(700, 400, 300, 200);
        
        // Draw river
        this.ctx.fillStyle = 'rgba(52, 152, 219, 0.3)';
        this.ctx.fillRect(0, this.canvas.height / 2 - 50, this.canvas.width, 100);
    }
    
    drawTargetIndicator() {
        if (this.selectedTarget && !this.selectedTarget.isDead) {
            this.ctx.strokeStyle = '#e74c3c';
            this.ctx.lineWidth = 3;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.arc(this.selectedTarget.x, this.selectedTarget.y, 35, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }
    }
    
    drawMinimap() {
        // Clear minimap
        this.minimapCtx.fillStyle = '#2c3e50';
        this.minimapCtx.fillRect(0, 0, this.minimap.width, this.minimap.height);
        
        // Scale factors
        const scaleX = this.minimap.width / this.canvas.width;
        const scaleY = this.minimap.height / this.canvas.height;
        
        // Draw champions on minimap
        this.champions.forEach(champion => {
            if (!champion.isDead) {
                this.minimapCtx.fillStyle = champion.team === 'blue' ? '#3498db' : '#e74c3c';
                this.minimapCtx.beginPath();
                this.minimapCtx.arc(
                    champion.x * scaleX,
                    champion.y * scaleY,
                    3, 0, Math.PI * 2
                );
                this.minimapCtx.fill();
            }
        });
        
        // Draw towers on minimap
        this.towers.forEach(tower => {
            if (!tower.isDead) {
                this.minimapCtx.fillStyle = tower.team === 'blue' ? '#3498db' : '#e74c3c';
                this.minimapCtx.fillRect(
                    tower.x * scaleX - 2,
                    tower.y * scaleY - 2,
                    4, 4
                );
            }
        });
    }
    
    updateTimers() {
        setInterval(() => {
            // Update game timer
            this.gameTime++;
            const minutes = Math.floor(this.gameTime / 60);
            const seconds = this.gameTime % 60;
            document.getElementById('timer').textContent = 
                `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            // Update dragon timer
            if (this.dragonTimer > 0) {
                this.dragonTimer--;
                const dMinutes = Math.floor(this.dragonTimer / 60);
                const dSeconds = this.dragonTimer % 60;
                document.getElementById('dragon-timer').textContent = 
                    `${dMinutes}:${dSeconds.toString().padStart(2, '0')}`;
            } else {
                document.getElementById('dragon-timer').textContent = 'SPAWNED';
            }
        }, 1000);
    }
    
    addChatMessage(type, message) {
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}`;
        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Remove old messages to prevent overflow
        if (chatMessages.children.length > 10) {
            chatMessages.removeChild(chatMessages.firstChild);
        }
    }
    
    startGameLoop() {
        const gameLoop = () => {
            this.update();
            this.render();
            requestAnimationFrame(gameLoop);
        };
        gameLoop();
    }
    
    // Utility functions
    getDistance(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    isPointInCircle(px, py, cx, cy, radius) {
        const dx = px - cx;
        const dy = py - cy;
        return (dx * dx + dy * dy) <= (radius * radius);
    }
}

// Game object classes
class Champion {
    constructor(x, y, team, isPlayer = false) {
        this.x = x;
        this.y = y;
        this.team = team;
        this.isPlayer = isPlayer;
        this.health = 1875;
        this.maxHealth = 2500;
        this.mana = 420;
        this.maxMana = 700;
        this.targetX = x;
        this.targetY = y;
        this.speed = 2;
        this.size = 20;
        this.isDead = false;
        this.target = null;
    }
    
    update() {
        if (this.isDead) return;
        
        // Move towards target position
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
        
        // Update health/mana for player
        if (this.isPlayer) {
            const healthPercent = (this.health / this.maxHealth) * 100;
            const manaPercent = (this.mana / this.maxMana) * 100;
            
            document.querySelector('.health-fill').style.width = `${healthPercent}%`;
            document.querySelector('.mana-fill').style.width = `${manaPercent}%`;
            document.querySelector('.health-text').textContent = `${this.health}/${this.maxHealth}`;
            document.querySelector('.mana-text').textContent = `${this.mana}/${this.maxMana}`;
        }
    }
    
    moveTo(x, y) {
        this.targetX = x;
        this.targetY = y;
    }
    
    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.isDead = true;
        }
    }
    
    render(ctx) {
        if (this.isDead) return;
        
        // Draw champion
        ctx.fillStyle = this.team === 'blue' ? '#3498db' : '#e74c3c';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw health bar
        const barWidth = 40;
        const barHeight = 6;
        const healthPercent = this.health / this.maxHealth;
        
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(this.x - barWidth/2, this.y - this.size - 15, barWidth, barHeight);
        
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(this.x - barWidth/2, this.y - this.size - 15, barWidth * healthPercent, barHeight);
        
        // Draw selection indicator for player
        if (this.isPlayer) {
            ctx.strokeStyle = '#f39c12';
            ctx.lineWidth = 2;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size + 5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }
}

class Minion {
    constructor(x, y, team) {
        this.x = x;
        this.y = y;
        this.team = team;
        this.health = 100;
        this.maxHealth = 100;
        this.speed = 1;
        this.size = 8;
        this.isDead = false;
        this.targetX = team === 'blue' ? x + 400 : x - 400;
        this.targetY = y;
    }
    
    update() {
        if (this.isDead) return;
        
        // Move towards target
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
    }
    
    render(ctx) {
        if (this.isDead) return;
        
        ctx.fillStyle = this.team === 'blue' ? '#85c1e9' : '#f1948a';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Tower {
    constructor(x, y, team) {
        this.x = x;
        this.y = y;
        this.team = team;
        this.health = 2000;
        this.maxHealth = 2000;
        this.size = 25;
        this.isDead = false;
    }
    
    render(ctx) {
        if (this.isDead) return;
        
        // Draw tower base
        ctx.fillStyle = this.team === 'blue' ? '#2980b9' : '#c0392b';
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        
        // Draw tower top
        ctx.fillStyle = this.team === 'blue' ? '#3498db' : '#e74c3c';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.size);
        ctx.lineTo(this.x - this.size/3, this.y - this.size/2);
        ctx.lineTo(this.x + this.size/3, this.y - this.size/2);
        ctx.closePath();
        ctx.fill();
        
        // Draw health bar
        const barWidth = 50;
        const barHeight = 8;
        const healthPercent = this.health / this.maxHealth;
        
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(this.x - barWidth/2, this.y - this.size - 20, barWidth, barHeight);
        
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(this.x - barWidth/2, this.y - this.size - 20, barWidth * healthPercent, barHeight);
    }
}

class Projectile {
    constructor(startX, startY, targetX, targetY, type) {
        this.x = startX;
        this.y = startY;
        this.targetX = targetX;
        this.targetY = targetY;
        this.type = type;
        this.speed = 8;
        this.shouldRemove = false;
        
        // Calculate direction
        const dx = targetX - startX;
        const dy = targetY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        this.vx = (dx / distance) * this.speed;
        this.vy = (dy / distance) * this.speed;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // Check if reached target
        const distance = Math.sqrt((this.targetX - this.x) ** 2 + (this.targetY - this.y) ** 2);
        if (distance < 20) {
            this.shouldRemove = true;
        }
    }
    
    render(ctx) {
        ctx.fillStyle = this.type === 'fireball' ? '#e67e22' : '#3498db';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = ctx.fillStyle;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

class Effect {
    constructor(x, y, type, duration) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.duration = duration;
        this.age = 0;
        this.size = 0;
    }
    
    update() {
        this.age += 16; // Assuming 60 FPS
        this.size = (this.age / this.duration) * 100;
        
        return this.age < this.duration;
    }
    
    render(ctx) {
        const alpha = 1 - (this.age / this.duration);
        
        switch(this.type) {
            case 'shield':
                ctx.strokeStyle = `rgba(52, 152, 219, ${alpha})`;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(this.x, this.y, 30, 0, Math.PI * 2);
                ctx.stroke();
                break;
                
            case 'dash':
                ctx.fillStyle = `rgba(241, 196, 15, ${alpha})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'ultimate':
                ctx.strokeStyle = `rgba(155, 89, 182, ${alpha})`;
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.stroke();
                break;
        }
    }
}

// Initialize the game
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new MOBAGame();
    
    // Add some periodic events
    setInterval(() => {
        game.addChatMessage('system', 'A minion wave has spawned!');
        game.createMinionWave('blue', 200, 200);
        game.createMinionWave('red', 1000, 600);
    }, 30000); // Every 30 seconds
    
    // Simulate random events
    setInterval(() => {
        const events = [
            'Enemy champion spotted in jungle!',
            'Dragon fight starting!',
            'Baron attempt by enemy team!',
            'Tower under attack!',
            'Allied champion needs assistance!'
        ];
        
        if (Math.random() < 0.3) {
            const randomEvent = events[Math.floor(Math.random() * events.length)];
            game.addChatMessage('system', randomEvent);
        }
    }, 15000); // Every 15 seconds
});