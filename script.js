// 游戏状态对象
let gameState = {
    playerCount: 8,
    theme: {
        name: "默认主题",
        undercoverWord: "",
        civilianWord: "",
        isCustom: false
    },
    players: [],
    currentPhase: "setup", // setup, dealing, voting, voteResult, reVoting, reVoteResult, result
    currentPlayerIndex: 0,
    selectedTheme: null,
    votes: [],
    reVotes: [], // 二次投票记录
    eliminatedPlayers: [],
    currentVotingPlayerIndex: 0, // 当前投票玩家索引
    hasVoted: [], // 记录哪些玩家已经投票
    hasReVoted: [], // 记录哪些玩家已经进行二次投票
    tiedPlayers: [], // 平票玩家列表
    isRevoting: false // 是否正在进行二次投票
};

// 内置主题词库
const builtInThemes = [
    { name: "电影主题", civilianWord: "盗梦空间", undercoverWord: "星际穿越" },
    { name: "食物主题", civilianWord: "汉堡", undercoverWord: "三明治" },
    { name: "动物主题", civilianWord: "猫", undercoverWord: "狗" },
    { name: "水果主题", civilianWord: "苹果", undercoverWord: "梨" },
    { name: "科技主题", civilianWord: "手机", undercoverWord: "电脑" },
    { name: "运动主题", civilianWord: "篮球", undercoverWord: "足球" },
    { name: "颜色主题", civilianWord: "红色", undercoverWord: "橙色" },
    { name: "职业主题", civilianWord: "医生", undercoverWord: "护士" },
    { name: "交通工具", civilianWord: "汽车", undercoverWord: "火车" },
    { name: "季节主题", civilianWord: "春天", undercoverWord: "秋天" },
    { name: "饮料主题", civilianWord: "可乐", undercoverWord: "雪碧" },
    { name: "游戏主题", civilianWord: "英雄联盟", undercoverWord: "王者荣耀" },
    { name: "乐器主题", civilianWord: "钢琴", undercoverWord: "吉他" },
    { name: "天气主题", civilianWord: "晴天", undercoverWord: "阴天" },
    { name: "节日主题", civilianWord: "春节", undercoverWord: "中秋节" }
];

// DOM元素
const elements = {
    // 首页元素
    playerSlider: document.getElementById('player-slider'),
    playerNumberDisplay: document.getElementById('player-number-display'),
    decreaseBtn: document.getElementById('decrease-btn'),
    increaseBtn: document.getElementById('increase-btn'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    themeContents: document.querySelectorAll('.theme-content'),
    startGameBtn: document.getElementById('start-game-btn'),
    // 游戏规则元素
    gameRulesBtn: document.getElementById('game-rules-btn'),
    gameRulesModal: document.getElementById('game-rules-modal'),
    closeRulesBtn: document.getElementById('close-rules-btn'),
    // 自定义主题元素
    civilianWordInput: document.getElementById('civilian-word'),
    undercoverWordInput: document.getElementById('undercover-word'),
    saveCustomBtn: document.getElementById('save-custom-btn'),
    // 随机主题元素
    randomThemeBtn: document.getElementById('random-theme-btn'),
    randomThemePreview: document.getElementById('random-theme-preview'),
    // 发牌页面元素
    card: document.getElementById('card'),
    currentPlayerNumber: document.getElementById('current-player-number'),
    cardPlayerNumber: document.getElementById('card-player-number'),
    playerRole: document.getElementById('player-role'),
    playerWord: document.getElementById('player-word'),
    roleIcon: document.getElementById('role-icon'),
    nextPlayerBtn: document.getElementById('next-player-btn'),
    finishDealingBtn: document.getElementById('finish-dealing-btn'),
    dealingControls: document.getElementById('dealing-controls'),
    // 投票页面元素
    votingPlayersGrid: document.getElementById('voting-players-grid'),
    confirmVoteBtn: document.getElementById('confirm-vote-btn'),
    // 投票结果页面元素
    voteResults: document.getElementById('vote-results'),
    continueGameBtn: document.getElementById('continue-game-btn'),
    // 结果页面元素
    finalResult: document.getElementById('final-result'),
    allPlayersResult: document.getElementById('all-players-result'),
    restartGameBtn: document.getElementById('restart-game-btn'),
    backToHomeBtn: document.getElementById('back-to-home-btn'),
    // 通知元素
    notification: document.getElementById('notification'),
    notificationMessage: document.getElementById('notification-message'),
    notificationClose: document.getElementById('notification-close')
};

// 显示通知
function showNotification(message) {
    elements.notificationMessage.textContent = message;
    elements.notification.classList.add('show');
}

// 隐藏通知
function hideNotification() {
    elements.notification.classList.remove('show');
}

// 初始化游戏
function initGame() {
    renderBuiltInThemes();
    setupEventListeners();
    updatePlayerCountDisplay();
}

// 渲染内置主题卡片
function renderBuiltInThemes() {
    const themeGrid = document.querySelector('.theme-grid');
    themeGrid.innerHTML = '';
    
    builtInThemes.forEach((theme, index) => {
        const themeCard = document.createElement('div');
        themeCard.className = 'theme-card';
        themeCard.innerHTML = `
            <h3>${theme.name}</h3>
            <p class="word-pair">${theme.civilianWord} vs ${theme.undercoverWord}</p>
            <button class="btn btn-primary">选择</button>
        `;
        
        // 为选择按钮添加事件监听
        themeCard.querySelector('button').addEventListener('click', () => {
            selectTheme(theme);
            // 更新主题卡片选中状态
            document.querySelectorAll('.theme-card').forEach(card => card.classList.remove('selected'));
            themeCard.classList.add('selected');
        });
        
        themeGrid.appendChild(themeCard);
    });
}

// 设置事件监听器
function setupEventListeners() {
    // 玩家人数控制
    elements.playerSlider.addEventListener('input', (e) => {
        gameState.playerCount = parseInt(e.target.value);
        updatePlayerCountDisplay();
        
        // 更新滑块视觉效果
        const min = parseInt(e.target.min);
        const max = parseInt(e.target.max);
        const value = parseInt(e.target.value);
        const percentage = ((value - min) / (max - min)) * 100;
        e.target.style.setProperty('--slider-value', `${percentage}%`);
    });
    
    // 初始化滑块视觉效果
    const initialValue = parseInt(elements.playerSlider.value);
    const initialMin = parseInt(elements.playerSlider.min);
    const initialMax = parseInt(elements.playerSlider.max);
    const initialPercentage = ((initialValue - initialMin) / (initialMax - initialMin)) * 100;
    elements.playerSlider.style.setProperty('--slider-value', `${initialPercentage}%`);
    
    elements.decreaseBtn.addEventListener('click', () => {
        if (gameState.playerCount > 4) {
            gameState.playerCount--;
            updatePlayerCountDisplay();
            elements.playerSlider.value = gameState.playerCount;
            
            // 更新滑块视觉效果
            const min = parseInt(elements.playerSlider.min);
            const max = parseInt(elements.playerSlider.max);
            const percentage = ((gameState.playerCount - min) / (max - min)) * 100;
            elements.playerSlider.style.setProperty('--slider-value', `${percentage}%`);
        }
    });
    
    elements.increaseBtn.addEventListener('click', () => {
        if (gameState.playerCount < 20) {
            gameState.playerCount++;
            updatePlayerCountDisplay();
            elements.playerSlider.value = gameState.playerCount;
            
            // 更新滑块视觉效果
            const min = parseInt(elements.playerSlider.min);
            const max = parseInt(elements.playerSlider.max);
            const percentage = ((gameState.playerCount - min) / (max - min)) * 100;
            elements.playerSlider.style.setProperty('--slider-value', `${percentage}%`);
        }
    });
    
    // 主题标签页切换
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            // 更新按钮状态
            elements.tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // 更新内容显示
            elements.themeContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });
    
    // 开始游戏按钮
    elements.startGameBtn.addEventListener('click', startGame);
    
    // 保存自定义主题
    elements.saveCustomBtn.addEventListener('click', saveCustomTheme);
    
    // 生成随机主题
    elements.randomThemeBtn.addEventListener('click', generateRandomTheme);
    
    // 卡牌翻转
    elements.card.addEventListener('click', flipCard);
    
    // 下一位玩家
    elements.nextPlayerBtn.addEventListener('click', nextPlayer);
    
    // 完成发牌
    elements.finishDealingBtn.addEventListener('click', finishDealing);
    
    // 确认投票
    elements.confirmVoteBtn.addEventListener('click', confirmVote);
    
    // 继续游戏
    elements.continueGameBtn.addEventListener('click', continueGame);
    
    // 重新开始
    elements.restartGameBtn.addEventListener('click', restartGame);
    
    // 返回首页
    elements.backToHomeBtn.addEventListener('click', backToHome);
    
    // 通知关闭按钮
    elements.notificationClose.addEventListener('click', hideNotification);
    
    // 点击通知背景关闭
    elements.notification.addEventListener('click', (e) => {
        if (e.target === elements.notification) {
            hideNotification();
        }
    });
    
    // 游戏规则按钮
    elements.gameRulesBtn.addEventListener('click', () => {
        elements.gameRulesModal.classList.add('show');
    });
    
    // 关闭游戏规则按钮
    elements.closeRulesBtn.addEventListener('click', () => {
        elements.gameRulesModal.classList.remove('show');
    });
    
    // 点击游戏规则模态框背景关闭
    elements.gameRulesModal.addEventListener('click', (e) => {
        if (e.target === elements.gameRulesModal) {
            elements.gameRulesModal.classList.remove('show');
        }
    });
}

// 更新玩家人数显示
function updatePlayerCountDisplay() {
    elements.playerNumberDisplay.textContent = gameState.playerCount;
}

// 选择主题
function selectTheme(theme) {
    gameState.selectedTheme = theme;
    gameState.theme = {
        name: theme.name,
        civilianWord: theme.civilianWord,
        undercoverWord: theme.undercoverWord,
        isCustom: false
    };
}

// 保存自定义主题
function saveCustomTheme() {
    const civilianWord = elements.civilianWordInput.value.trim();
    const undercoverWord = elements.undercoverWordInput.value.trim();
    
    if (civilianWord && undercoverWord) {
        const customTheme = {
            name: "自定义主题",
            civilianWord: civilianWord,
            undercoverWord: undercoverWord,
            isCustom: true
        };
        
        gameState.selectedTheme = customTheme;
        gameState.theme = customTheme;
        
        showNotification('自定义主题已保存！');
    } else {
        showNotification('请输入完整的平民词和卧底词！');
    }
}

// 生成随机主题
function generateRandomTheme() {
    const randomIndex = Math.floor(Math.random() * builtInThemes.length);
    const randomTheme = builtInThemes[randomIndex];
    
    elements.randomThemePreview.innerHTML = `
        <h3>${randomTheme.name}</h3>
        <p class="word-pair">平民词：${randomTheme.civilianWord}</p>
        <p class="word-pair">卧底词：${randomTheme.undercoverWord}</p>
    `;
    elements.randomThemePreview.classList.add('show');
    
    gameState.selectedTheme = randomTheme;
    gameState.theme = {
        name: randomTheme.name,
        civilianWord: randomTheme.civilianWord,
        undercoverWord: randomTheme.undercoverWord,
        isCustom: false
    };
}

// 开始游戏
function startGame() {
    // 验证主题是否已选择
    if (!gameState.selectedTheme) {
        showNotification('请先选择或创建一个主题！');
        return;
    }
    
    // 分配身份
    assignRoles();
    
    // 更新游戏阶段
    gameState.currentPhase = "dealing";
    gameState.currentPlayerIndex = 0;
    gameState.currentVotingPlayerIndex = 0;
    gameState.hasVoted = [];
    gameState.hasReVoted = [];
    gameState.isRevoting = false;
    gameState.tiedPlayers = [];
    gameState.votes = [];
    gameState.reVotes = [];
    
    // 切换到发牌页面
    switchPage('dealing-page');
    
    // 初始化发牌界面
    initDealingPage();
}

// 身份分配算法
function assignRoles() {
    const playerCount = gameState.playerCount;
    const players = [];
    
    // 根据人数确定卧底数量
    let undercoverCount = 1;
    if (playerCount >= 8 && playerCount <= 11) {
        undercoverCount = 2;
    } else if (playerCount >= 12) {
        undercoverCount = 3;
    }
    
    // 创建玩家列表
    for (let i = 0; i < playerCount; i++) {
        players.push({
            id: i + 1,
            role: "civilian",
            word: gameState.theme.civilianWord,
            isAlive: true,
            votesReceived: 0
        });
    }
    
    // 随机分配卧底
    let assignedUndercovers = 0;
    while (assignedUndercovers < undercoverCount) {
        const randomIndex = Math.floor(Math.random() * players.length);
        if (players[randomIndex].role === "civilian") {
            players[randomIndex].role = "undercover";
            players[randomIndex].word = gameState.theme.undercoverWord;
            assignedUndercovers++;
        }
    }
    
    gameState.players = players;
    gameState.votes = [];
    gameState.eliminatedPlayers = [];
}

// 切换页面
function switchPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

// 初始化发牌页面
function initDealingPage() {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    elements.currentPlayerNumber.textContent = currentPlayer.id;
    
    // 先翻回正面
    elements.card.classList.remove('flipped');
    
    // 隐藏按钮
    elements.dealingControls.style.display = 'none';
    
    // 等待翻转动画完成后再更新内容（0.3秒是CSS中定义的transition-duration）
    setTimeout(() => {
        // 更新卡牌背面内容 - 只显示词语，不显示角色
        elements.playerRole.textContent = "";
        elements.roleIcon.textContent = "";
        elements.playerWord.textContent = currentPlayer.word;
        elements.cardPlayerNumber.textContent = currentPlayer.id;
    }, 300);
    
    // 更新按钮显示逻辑
    updateDealingButtons();
}

// 翻转卡牌
function flipCard() {
    elements.card.classList.toggle('flipped');
    
    // 如果卡片被翻转，显示按钮
    if (elements.card.classList.contains('flipped')) {
        elements.dealingControls.style.display = 'flex';
    } else {
        elements.dealingControls.style.display = 'none';
    }
}

// 更新发牌按钮显示
function updateDealingButtons() {
    const totalPlayers = gameState.players.length;
    const currentIndex = gameState.currentPlayerIndex;
    
    // 最后一个玩家，只显示"完成发牌"按钮
    if (currentIndex === totalPlayers - 1) {
        elements.nextPlayerBtn.style.display = 'none';
        elements.finishDealingBtn.style.display = 'block';
        elements.finishDealingBtn.textContent = '完成发牌';
    } 
    // 前面的玩家，只显示"下一位玩家"按钮
    else {
        elements.nextPlayerBtn.style.display = 'block';
        elements.finishDealingBtn.style.display = 'none';
        elements.nextPlayerBtn.textContent = '下一位玩家';
    }
}

// 下一位玩家
function nextPlayer() {
    gameState.currentPlayerIndex++;
    
    if (gameState.currentPlayerIndex < gameState.players.length) {
        initDealingPage();
    } else {
        // 所有玩家已查看，询问是否继续
        showNotification('所有玩家已查看身份，是否开始游戏？');
        
        // 替换confirm为自定义确认
        const notification = document.getElementById('notification');
        const notificationContent = notification.querySelector('.notification-content');
        
        // 移除现有按钮
        const existingButtons = notificationContent.querySelectorAll('button');
        existingButtons.forEach(btn => btn.remove());
        
        // 添加确认和取消按钮
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'btn btn-primary';
        confirmBtn.textContent = '开始游戏';
        confirmBtn.addEventListener('click', () => {
            hideNotification();
            finishDealing();
        });
        
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-secondary';
        cancelBtn.textContent = '重新开始';
        cancelBtn.addEventListener('click', () => {
            hideNotification();
            gameState.currentPlayerIndex = 0;
            initDealingPage();
        });
        
        notificationContent.appendChild(confirmBtn);
        notificationContent.appendChild(cancelBtn);
    }
}

// 完成发牌
function finishDealing() {
    // 隐藏按钮
    elements.dealingControls.style.display = 'none';
    
    gameState.currentPhase = "voting";
    gameState.currentVotingPlayerIndex = 0;
    gameState.hasVoted = [];
    gameState.hasReVoted = [];
    gameState.isRevoting = false;
    gameState.tiedPlayers = [];
    gameState.votes = [];
    gameState.reVotes = [];
    // 重置所有玩家票数
    gameState.players.forEach(player => {
        player.votesReceived = 0;
    });
    switchPage('voting-page');
    renderVotingPlayers();
}

// 渲染投票玩家列表
function renderVotingPlayers() {
    const votingPage = document.getElementById('voting-page');
    
    // 获取存活玩家列表
    const alivePlayers = gameState.players.filter(player => player.isAlive);
    
    // 确保当前投票玩家索引不超过存活玩家数量
    if (gameState.currentVotingPlayerIndex >= alivePlayers.length) {
        gameState.currentVotingPlayerIndex = 0;
    }
    
    // 添加当前投票玩家指示
    const votingPlayerInfo = votingPage.querySelector('.subtitle');
    if (votingPlayerInfo) {
        if (alivePlayers.length > 0) {
            const currentVotingPlayer = alivePlayers[gameState.currentVotingPlayerIndex];
            if (gameState.isRevoting) {
                votingPlayerInfo.textContent = `二次投票：玩家 ${currentVotingPlayer.id}，请从平票玩家中选择`;
            } else {
                votingPlayerInfo.textContent = `玩家 ${currentVotingPlayer.id}，请选择你要投票的玩家`;
            }
        } else {
            votingPlayerInfo.textContent = '所有玩家都已淘汰！';
        }
    }
    
    elements.votingPlayersGrid.innerHTML = '';
    
    // 显示所有玩家，包括死亡玩家
    gameState.players.forEach(player => {
        const playerItem = document.createElement('div');
        playerItem.className = `player-item ${player.isAlive ? '' : 'eliminated'}`;
        playerItem.dataset.playerId = player.id;
        
        playerItem.innerHTML = `
            <div class="player-number">${player.id}</div>
            <div class="player-status">${player.isAlive ? '存活' : '已淘汰'}</div>
        `;
        
        // 如果是当前投票玩家，添加特殊样式
        if (player.isAlive && alivePlayers[gameState.currentVotingPlayerIndex] && player.id === alivePlayers[gameState.currentVotingPlayerIndex].id) {
            playerItem.classList.add('highlight');
        }
        
        // 如果是二次投票，只有平票玩家可以被选为投票对象
        let canBeVoted = false;
        if (gameState.isRevoting) {
            // 检查是否是平票玩家
            const isTiedPlayer = gameState.tiedPlayers.some(tiedPlayer => tiedPlayer.id === player.id);
            if (player.isAlive && isTiedPlayer) {
                canBeVoted = true;
                playerItem.classList.add('tied-player'); // 添加平票玩家样式
            }
        } else {
            // 普通投票，所有存活玩家都可以被选为投票对象
            canBeVoted = player.isAlive;
        }
        
        if (canBeVoted) {
            playerItem.addEventListener('click', () => {
                // 移除其他选中状态
                document.querySelectorAll('.player-item').forEach(item => {
                    item.classList.remove('selected');
                });
                // 添加当前选中状态
                playerItem.classList.add('selected');
            });
        }
        
        elements.votingPlayersGrid.appendChild(playerItem);
    });
}

// 确认投票
function confirmVote() {
    // 获取存活玩家列表
    const alivePlayers = gameState.players.filter(player => player.isAlive);
    
    // 检查是否还有存活玩家
    if (alivePlayers.length === 0) {
        showNotification('所有玩家都已淘汰，游戏结束！');
        switchPage('result-page');
        renderFinalResult();
        return;
    }
    
    const selectedPlayerItem = document.querySelector('.player-item.selected');
    
    if (selectedPlayerItem) {
        const selectedPlayerId = parseInt(selectedPlayerItem.dataset.playerId);
        
        if (gameState.isRevoting) {
            // 二次投票处理
            // 记录当前玩家的二次投票
            gameState.reVotes[gameState.currentVotingPlayerIndex] = selectedPlayerId;
            gameState.hasReVoted[gameState.currentVotingPlayerIndex] = true;
        } else {
            // 普通投票处理
            // 记录当前玩家的投票
            gameState.votes[gameState.currentVotingPlayerIndex] = selectedPlayerId;
            gameState.hasVoted[gameState.currentVotingPlayerIndex] = true;
        }
        
        // 更新被投票玩家的票数
        gameState.players.forEach(player => {
            if (player.id === selectedPlayerId) {
                player.votesReceived++;
            }
        });
        
        // 进入下一位存活玩家投票
        gameState.currentVotingPlayerIndex++;
        
        if (gameState.currentVotingPlayerIndex >= alivePlayers.length) {
            if (gameState.isRevoting) {
                // 二次投票结束，处理二次投票结果
                gameState.currentPhase = "reVoteResult";
                processReVoteResults();
            } else {
                // 普通投票结束，进入投票结果页面
                gameState.currentPhase = "voteResult";
                switchPage('vote-result-page');
                renderVoteResults();
            }
        } else {
            // 还有存活玩家未投票，进入下一位玩家投票
            renderVotingPlayers();
        }
    } else {
        showNotification('请选择要投票的玩家！');
    }
}

// 渲染投票结果
function renderVoteResults() {
    elements.voteResults.innerHTML = '';
    
    // 获取存活玩家列表
    const alivePlayers = gameState.players.filter(player => player.isAlive);
    
    // 如果没有存活玩家，直接结束游戏
    if (alivePlayers.length === 0) {
        switchPage('result-page');
        renderFinalResult();
        return;
    }
    
    // 按票数排序玩家
    const sortedPlayers = [...alivePlayers]
        .sort((a, b) => b.votesReceived - a.votesReceived);
    
    // 找出得票最多的玩家
    const maxVotes = sortedPlayers[0].votesReceived;
    const tiedPlayers = sortedPlayers.filter(player => player.votesReceived === maxVotes);
    
    // 渲染每个玩家的投票结果
    sortedPlayers.forEach(player => {
        const resultItem = document.createElement('div');
        resultItem.className = 'vote-result-item';
        
        // 如果是平票玩家，添加高亮样式
        if (tiedPlayers.includes(player)) {
            resultItem.classList.add('highlighted');
        }
        
        resultItem.innerHTML = `
            <div>
                <strong>玩家 ${player.id}</strong>
            </div>
            <div class="vote-count">${player.votesReceived} 票</div>
        `;
        
        elements.voteResults.appendChild(resultItem);
    });
    
    // 检查是否出现平票
    if (tiedPlayers.length > 1) {
        // 平票情况，进入二次投票
        gameState.tiedPlayers = tiedPlayers;
        gameState.isRevoting = true;
        gameState.currentPhase = "reVoting";
        
        // 重置二次投票状态
        gameState.reVotes = [];
        gameState.hasReVoted = [];
        gameState.currentVotingPlayerIndex = 0;
        
        // 在投票结果页面添加二次投票提示
        const reVotePrompt = document.createElement('div');
        reVotePrompt.className = 're-vote-prompt';
        reVotePrompt.innerHTML = `
            <h3>出现平票！</h3>
            <p>需要进行二次投票，仅可从以下玩家中选择：${tiedPlayers.map(p => p.id).join(', ')}]</p>
        `;
        elements.voteResults.appendChild(reVotePrompt);
        
        // 添加二次投票按钮
        const reVoteBtn = document.createElement('button');
        reVoteBtn.className = 'btn btn-primary';
        reVoteBtn.textContent = '进入二次投票';
        reVoteBtn.addEventListener('click', startReVoting);
        elements.voteResults.appendChild(reVoteBtn);
    } else {
        // 没有平票，直接淘汰得票最多的玩家
        const eliminatedPlayer = tiedPlayers[0];
        eliminatedPlayer.isAlive = false;
        if (!gameState.eliminatedPlayers.includes(eliminatedPlayer)) {
            gameState.eliminatedPlayers.push(eliminatedPlayer);
        }
        
        // 重置所有玩家的票数
        gameState.players.forEach(player => {
            player.votesReceived = 0;
        });
        
        // 清空投票记录
    gameState.votes = [];
    
    // 根据游戏是否结束，更新继续游戏按钮文本
    if (checkGameEnd()) {
        elements.continueGameBtn.textContent = '查看胜负';
    } else {
        elements.continueGameBtn.textContent = '继续游戏';
    }
}
    
    // 根据游戏是否结束，更新继续游戏按钮文本
    if (checkGameEnd()) {
        elements.continueGameBtn.textContent = '查看胜负';
    } else {
        elements.continueGameBtn.textContent = '继续游戏';
    }
}

// 开始二次投票
function startReVoting() {
    gameState.currentPhase = "reVoting";
    switchPage('voting-page');
    renderVotingPlayers();
}

// 处理二次投票结果
function processReVoteResults() {
    // 切换到投票结果页面
    switchPage('vote-result-page');
    elements.voteResults.innerHTML = '';
    
    // 获取平票玩家列表
    const tiedPlayers = gameState.tiedPlayers;
    
    // 按二次投票票数排序平票玩家
    const reVotedPlayers = tiedPlayers.map(player => {
        const reVotesCount = gameState.reVotes.filter(vote => vote === player.id).length;
        return {
            ...player,
            reVotesCount: reVotesCount
        };
    }).sort((a, b) => b.reVotesCount - a.reVotesCount);
    
    // 找出二次投票得票最多的玩家
    const maxReVotes = reVotedPlayers[0].reVotesCount;
    const finallyEliminatedPlayers = reVotedPlayers.filter(player => player.reVotesCount === maxReVotes);
    
    // 渲染二次投票结果
    const reVoteResultHeader = document.createElement('div');
    reVoteResultHeader.innerHTML = '<h3>二次投票结果</h3>';
    elements.voteResults.appendChild(reVoteResultHeader);
    
    reVotedPlayers.forEach(player => {
        const resultItem = document.createElement('div');
        resultItem.className = 'vote-result-item';
        
        if (finallyEliminatedPlayers.includes(player)) {
            resultItem.classList.add('eliminated');
            resultItem.classList.add('highlighted');
        }
        
        resultItem.innerHTML = `
            <div>
                <strong>玩家 ${player.id}</strong>
            </div>
            <div class="vote-count">${player.reVotesCount} 票</div>
        `;
        
        elements.voteResults.appendChild(resultItem);
    });
    
    // 淘汰二次投票得票最多的玩家
    finallyEliminatedPlayers.forEach(player => {
        player.isAlive = false;
        if (!gameState.eliminatedPlayers.includes(player)) {
            gameState.eliminatedPlayers.push(player);
        }
    });
    
    // 重置二次投票状态
    gameState.isRevoting = false;
    gameState.tiedPlayers = [];
    gameState.reVotes = [];
    gameState.hasReVoted = [];
    
    // 重置所有玩家的票数
    gameState.players.forEach(player => {
        player.votesReceived = 0;
    });
    
    // 清空投票记录
    gameState.votes = [];
    
    // 根据游戏是否结束，更新继续游戏按钮文本
    if (checkGameEnd()) {
        elements.continueGameBtn.textContent = '查看胜负';
    } else {
        elements.continueGameBtn.textContent = '继续游戏';
    }
}

// 继续游戏
function continueGame() {
    // 判断游戏是否结束
    if (checkGameEnd()) {
        switchPage('result-page');
        renderFinalResult();
    } else {
        // 获取存活玩家列表
        const alivePlayers = gameState.players.filter(player => player.isAlive);
        
        // 如果没有存活玩家，直接结束游戏
        if (alivePlayers.length === 0) {
            switchPage('result-page');
            renderFinalResult();
            return;
        }
        
        // 重置投票状态
        gameState.currentPhase = "voting";
        gameState.currentVotingPlayerIndex = 0;
        gameState.votes = [];
        gameState.hasVoted = [];
        gameState.hasReVoted = [];
        gameState.isRevoting = false;
        gameState.tiedPlayers = [];
        gameState.reVotes = [];
        // 重置所有玩家票数
        gameState.players.forEach(player => {
            player.votesReceived = 0;
        });
        switchPage('voting-page');
        renderVotingPlayers();
    }
}

// 查看最终结果
function showFinalResult() {
    switchPage('result-page');
    renderFinalResult();
}

// 检查游戏是否结束
function checkGameEnd() {
    const alivePlayers = gameState.players.filter(player => player.isAlive);
    const aliveUndercovers = alivePlayers.filter(player => player.role === 'undercover');
    const aliveCivilians = alivePlayers.filter(player => player.role === 'civilian');
    
    // 游戏结束条件
    // 1. 所有卧底被淘汰 → 平民胜利
    if (aliveUndercovers.length === 0) {
        return true;
    }
    
    // 2. 存活玩家数量 ≤ 3 且有卧底存活 → 卧底胜利
    if (alivePlayers.length <= 3 && aliveUndercovers.length > 0) {
        return true;
    }
    
    // 3. 卧底数量大于等于平民数量 → 卧底胜利
    if (aliveUndercovers.length >= aliveCivilians.length) {
        return true;
    }
    
    return false;
}

// 渲染最终结果
function renderFinalResult() {
    const alivePlayers = gameState.players.filter(player => player.isAlive);
    const aliveUndercovers = alivePlayers.filter(player => player.role === 'undercover');
    const aliveCivilians = alivePlayers.filter(player => player.role === 'civilian');
    
    // 判定胜负
    let resultText = "";
    let resultReason = "";
    
    // 1. 所有卧底被淘汰 → 平民胜利
    if (aliveUndercovers.length === 0) {
        resultText = "🎉 平民胜利！";
        resultReason = "所有卧底都被找出了！";
    }
    // 2. 存活玩家数量 ≤ 3 且有卧底存活 → 卧底胜利
    else if (alivePlayers.length <= 3 && aliveUndercovers.length > 0) {
        resultText = "🎭 卧底胜利！";
        resultReason = `游戏只剩${alivePlayers.length}名玩家，卧底存活到最后！`;
    }
    // 3. 卧底数量大于等于平民数量 → 卧底胜利
    else if (aliveUndercovers.length >= aliveCivilians.length) {
        resultText = "🎭 卧底胜利！";
        resultReason = "卧底数量超过平民！";
    }
    
    elements.finalResult.innerHTML = `${resultText}<br><small style="color: #b0b0b0; font-size: 1rem;">${resultReason}</small>`;
    
    // 渲染所有玩家身份
    elements.allPlayersResult.innerHTML = '';
    
    gameState.players.forEach(player => {
        const resultPlayer = document.createElement('div');
        resultPlayer.className = `result-player ${player.role} ${player.isAlive ? '' : 'eliminated'}`;
        
        resultPlayer.innerHTML = `
            <div class="player-id">玩家 ${player.id}</div>
            <div class="player-role">
                ${player.role === 'civilian' ? '👤 平民' : '🎭 卧底'}
            </div>
            <div class="player-word">${player.word}</div>
            <div class="player-status">
                ${player.isAlive ? '存活' : '已淘汰'}
            </div>
        `;
        
        elements.allPlayersResult.appendChild(resultPlayer);
    });
}

// 重新开始游戏
function restartGame() {
    // 重置游戏状态
    gameState = {
        playerCount: 8,
        theme: {
            name: "默认主题",
            undercoverWord: "",
            civilianWord: "",
            isCustom: false
        },
        players: [],
        currentPhase: "setup",
        currentPlayerIndex: 0,
        selectedTheme: null,
        votes: [],
        eliminatedPlayers: []
    };
    
    // 重置UI
    elements.playerSlider.value = 8;
    updatePlayerCountDisplay();
    elements.civilianWordInput.value = '';
    elements.undercoverWordInput.value = '';
    elements.randomThemePreview.classList.remove('show');
    
    // 切换到首页
    switchPage('setup-page');
}

// 返回首页
function backToHome() {
    restartGame();
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', initGame);