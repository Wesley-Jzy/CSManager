/**
 * Match Module Utilities
 * 包含比赛模拟的核心算法和工具函数
 */

// 游戏规则相关常量
const GAME_RULES = {
  ROUNDS_FIRST_HALF: 12,
  TOTAL_NORMAL_ROUNDS: 24,
  WIN_ROUNDS_NORMAL: 13,
  TIE_SCORE: 12,
  OVERTIME_ROUNDS_HALF: 3,
  OVERTIME_WIN_THRESHOLD: 4,
  MAX_OVERTIME_CYCLES: 10, // 最大加时赛循环次数，仅作为安全机制
  MAX_OVERTIME_ROUNDS: 60  // 最大加时赛回合数，仅作为安全机制
};

// 比赛方相关常量
const TEAMS = {
  HOME: 'A',
  AWAY: 'B'
};

// 游戏中的阵营
const SIDES = {
  T: 'T',
  CT: 'CT'
};

// 设施加成相关常量
const FACILITY_BONUSES = {
  GAMING_HOUSE_TEAMWORK: 0.05, // 5%/级
  ANALYTICS_PREP: 0.03, // 3%/级
  ANALYTICS_INTEL: 0.05 // 5%/级
};

// 特殊加成常量
const SPECIAL_BONUSES = {
  IGL_TEAM_BONUS: 1.1, // 指挥加成10%
  HIGHLIGHT_CHANCE: 0.2, // 亮点生成20%概率
  HIGHLIGHT_THRESHOLD: 0.3, // 分差亮点阈值30%
  MVP_RANDOM_PLAYER_COUNT: 5
};

// 随机因子相关常量
const RANDOM_FACTORS = {
  MIN: 0.7,
  MAX: 1.3,
  RANGE: 0.6,
  INTEL_MIN_REDUCTION: 0.2 // 最小保留20%的爆发可能
};

// 动画相关时间常量
const ANIMATION_TIMING = {
  HIGHLIGHT_DISPLAY: 2000 // 亮点显示时间(ms)
};

// 地图数据
export const MAPS = {
  dust2: {
    name: "Dust II",
    image: "dust2.jpg",
    sniperFriendly: 1.2,
    entryFriendly: 1.0,
    tacticalComplexity: 0.8,
    ctSided: 1.0,
    description: "经典地图，狙击手天堂，战术复杂度较低，对攻防双方都相对平衡。"
  },
  mirage: {
    name: "Mirage",
    image: "mirage.jpg",
    sniperFriendly: 1.0,
    entryFriendly: 1.2,
    tacticalComplexity: 1.0,
    ctSided: 0.9,
    description: "适合突破手的地图，中等战术复杂度，略微有利于T方。"
  },
  inferno: {
    name: "Inferno",
    image: "inferno.jpg",
    sniperFriendly: 0.8,
    entryFriendly: 0.8,
    tacticalComplexity: 1.2,
    ctSided: 1.1,
    description: "高战术复杂度地图，对狙击手和突破手均不够友好，略微偏向CT方。"
  },
  nuke: {
    name: "Nuke",
    image: "nuke.jpg",
    sniperFriendly: 1.0,
    entryFriendly: 0.8,
    tacticalComplexity: 1.2,
    ctSided: 1.3,
    description: "垂直结构的地图，高战术复杂度，明显偏向CT方。"
  },
  overpass: {
    name: "Overpass",
    image: "overpass.jpg",
    sniperFriendly: 1.0,
    entryFriendly: 1.0,
    tacticalComplexity: 1.2,
    ctSided: 1.1,
    description: "多层次地图，较高战术复杂度，略微偏向CT方。"
  }
};

// 战术风格数据
export const TACTICS = {
  aggressive: {
    name: "激进",
    aimMultiplier: 1.3,
    awarenessMultiplier: 0.8,
    reflexMultiplier: 1.2,
    riskLevel: "高",
    description: "瞄准+30%, 反应+20%, 意识-20%. 高风险高回报，依赖选手的瞄准和反应能力。"
  },
  balanced: {
    name: "平衡",
    aimMultiplier: 1.0,
    awarenessMultiplier: 1.0,
    reflexMultiplier: 1.0,
    riskLevel: "中",
    description: "所有属性保持不变. 均衡的战术风格，适合全面型队伍。"
  },
  conservative: {
    name: "保守",
    aimMultiplier: 0.8,
    awarenessMultiplier: 1.3,
    reflexMultiplier: 0.9,
    riskLevel: "低",
    description: "意识+30%, 瞄准-20%, 反应-10%. 低风险战术，依赖信息收集和团队协作。"
  }
};

// 选手角色数据
export const ROLES = {
  awper: {
    name: "主狙",
    aimMultiplier: 1.3,
    awarenessMultiplier: 1.0,
    reflexMultiplier: 1.1,
    specialAbility: "瞄准+30%, 反应+10%",
    description: "队伍中的狙击手，负责控制长距离战场和开局击杀。"
  },
  entry: {
    name: "突破手",
    aimMultiplier: 1.2,
    awarenessMultiplier: 0.9,
    reflexMultiplier: 1.3,
    specialAbility: "瞄准+20%, 反应+30%, 意识-10%",
    description: "第一个进入点位的选手，需要出色的反应能力和瞄准技术。"
  },
  support: {
    name: "支援",
    aimMultiplier: 0.9,
    awarenessMultiplier: 1.3,
    reflexMultiplier: 1.0,
    specialAbility: "意识+30%, 瞄准-10%",
    description: "负责道具支援和补枪的选手，提升整个团队的表现。"
  },
  igl: {
    name: "指挥",
    aimMultiplier: 1.0,
    awarenessMultiplier: 1.4,
    reflexMultiplier: 0.9,
    specialAbility: "意识+40%, 反应-10%, 团队整体+10%",
    description: "队内指挥，负责战术调度和决策，对意识要求极高。"
  },
  lurker: {
    name: "潜伏者",
    aimMultiplier: 1.1,
    awarenessMultiplier: 1.1,
    reflexMultiplier: 1.1,
    specialAbility: "全属性+10%",
    description: "在敌人侧翼或后方活动的选手，擅长抓时机和补枪。"
  }
};

/**
 * 生成随机因子用于回合模拟
 * @returns {number} 随机因子，0.7-1.3之间
 */
const generateRandomFactor = () => {
  return RANDOM_FACTORS.MIN + Math.random() * RANDOM_FACTORS.RANGE;
};

/**
 * 计算选手在特定角色和战术下的有效属性值
 * @param {Object} player - 选手对象，包含aim、awareness和reflex属性
 * @param {string} role - 选手角色
 * @param {string} tactic - 选队战术
 * @returns {Object} - 返回选手有效属性值
 */
export const calculateEffectivePlayerStats = (player, role, tactic) => {
  const roleData = ROLES[role];
  const tacticData = TACTICS[tactic];
  
  return {
    aim: player.aim * roleData.aimMultiplier * tacticData.aimMultiplier,
    awareness: player.awareness * roleData.awarenessMultiplier * tacticData.awarenessMultiplier,
    reflex: player.reflex * roleData.reflexMultiplier * tacticData.reflexMultiplier,
    role: role,
    specialAbility: roleData.specialAbility
  };
};

/**
 * 计算团队在特定地图、战术和角色分配下的总体实力
 * @param {Array} players - 团队选手数组
 * @param {Array} roles - 对应角色数组
 * @param {string} tactic - 团队战术
 * @param {string} mapKey - 地图键值
 * @param {string} side - 'T'或'CT'
 * @returns {number} - 返回团队有效实力值
 */
export const calculateTeamStrength = (players, roles, tactic, mapKey, side) => {
  const map = MAPS[mapKey];
  
  // 计算基础团队实力
  let teamStrength = 0;
  
  players.forEach((player, index) => {
    const effectiveStats = calculateEffectivePlayerStats(player, roles[index], tactic);
    teamStrength += effectiveStats.aim + effectiveStats.awareness + effectiveStats.reflex;
  });
  
  // 应用地图修正
  if (tactic === 'aggressive') {
    teamStrength *= map.entryFriendly;
  }
  
  // 应用特殊角色加成
  const hasIGL = roles.includes('igl');
  if (hasIGL) {
    teamStrength *= SPECIAL_BONUSES.IGL_TEAM_BONUS; // 有指挥加成10%
  }
  
  // 应用CT/T方地图倾向性
  if (side === SIDES.CT) {
    teamStrength *= map.ctSided;
  } else {
    teamStrength *= (2 - map.ctSided); // T方倾向性与CT方相反
  }
  
  return teamStrength;
};

/**
 * 模拟单个回合
 * @param {Object} teamA - A队数据（选手、角色、战术等）
 * @param {Object} teamB - B队数据
 * @param {string} mapKey - 地图键值
 * @param {number} roundNumber - 回合编号
 * @param {Object} facilities - 设施等级
 * @param {boolean} isOvertime - 是否是加时赛回合
 * @returns {Object} - 返回回合结果
 */
export const simulateRound = (teamA, teamB, mapKey, roundNumber, facilities, isOvertime = false) => {
  // 确定当前回合双方的进攻防守方
  const side = roundNumber <= GAME_RULES.ROUNDS_FIRST_HALF ? 
    { [TEAMS.HOME]: SIDES.T, [TEAMS.AWAY]: SIDES.CT } : 
    { [TEAMS.HOME]: SIDES.CT, [TEAMS.AWAY]: SIDES.T };
  
  // 计算双方实力
  const strengthA = calculateTeamStrength(
    teamA.players, 
    teamA.roles, 
    teamA.tactics[side[TEAMS.HOME]], 
    mapKey, 
    side[TEAMS.HOME]
  );
  
  const strengthB = calculateTeamStrength(
    teamB.players, 
    teamB.roles, 
    teamB.tactics[side[TEAMS.AWAY]], 
    mapKey, 
    side[TEAMS.AWAY]
  );
  
  // 应用设施加成
  const teamWorkBonus = facilities.gamingHouse * FACILITY_BONUSES.GAMING_HOUSE_TEAMWORK;
  const prepBonus = facilities.analyticsOffice * FACILITY_BONUSES.ANALYTICS_PREP;
  const facilityMultiplier = 1 + teamWorkBonus + prepBonus;
  
  // 修正A队实力
  const modifiedStrengthA = strengthA * facilityMultiplier;
  
  // 应用随机因素
  const randomFactorA = generateRandomFactor();
  let randomFactorB = generateRandomFactor();
  
  // 应用情报优势，仅抑制对手的正面爆发
  const intelBonus = facilities.analyticsOffice * FACILITY_BONUSES.ANALYTICS_INTEL;
  if (randomFactorB > 1) {
    // 如果是正面爆发，根据情报准确度降低
    randomFactorB = 1 + (randomFactorB - 1) * Math.max(RANDOM_FACTORS.INTEL_MIN_REDUCTION, 1 - intelBonus);
  } else if (randomFactorB < 1) {
    // 如果是负面表现，适当增强
    randomFactorB = 1 - (1 - randomFactorB) * (1 + intelBonus * 0.5);
  }
  
  // 计算最终回合分数
  const scoreA = modifiedStrengthA * randomFactorA;
  const scoreB = strengthB * randomFactorB;
  
  // 确定回合赢家
  const winner = scoreA > scoreB ? TEAMS.HOME : TEAMS.AWAY;
  
  // 生成回合亮点
  let highlight = null;
  
  // 如果分差很大，或者随机出特殊情况
  if (Math.abs(scoreA - scoreB) > (strengthA + strengthB) * SPECIAL_BONUSES.HIGHLIGHT_THRESHOLD || Math.random() < SPECIAL_BONUSES.HIGHLIGHT_CHANCE) {
    const mvpPlayerIndex = Math.floor(Math.random() * SPECIAL_BONUSES.MVP_RANDOM_PLAYER_COUNT);
    const mvpPlayer = winner === TEAMS.HOME 
      ? teamA.players[mvpPlayerIndex] 
      : teamB.players[mvpPlayerIndex];
    
    const situations = [
      `${mvpPlayer.name} 完成了一次精彩的4杀`,
      `${mvpPlayer.name} 使用狙击枪连续击倒两名敌人`,
      `${mvpPlayer.name} 在1v2情况下成功保存武器`,
      `${mvpPlayer.name} 成功完成地图控制，为团队赢得回合`,
      `${mvpPlayer.name} 用手枪击败了全副武装的对手`
    ];
    
    highlight = {
      player: mvpPlayer.name,
      situation: situations[Math.floor(Math.random() * situations.length)],
      team: winner
    };
  }
  
  return {
    winner,
    round: roundNumber,
    side,
    scoreA,
    scoreB,
    highlight
  };
};

/**
 * 模拟完整比赛
 * @param {Object} teamA - A队数据
 * @param {Object} teamB - B队数据
 * @param {string} mapKey - 地图键值
 * @param {Object} facilities - 设施等级
 * @returns {Object} - 返回比赛结果
 */
export const simulateFullMatch = (teamA, teamB, mapKey, facilities) => {
  let scoreA = 0;
  let scoreB = 0;
  const rounds = [];
  const highlights = [];
  
  // 模拟常规24回合 (CS2最新赛制)
  for (let round = 1; round <= GAME_RULES.TOTAL_NORMAL_ROUNDS; round++) {
    // 判断是否需要继续比赛（如果已经有队伍赢得13回合）
    if (scoreA >= GAME_RULES.WIN_ROUNDS_NORMAL || scoreB >= GAME_RULES.WIN_ROUNDS_NORMAL) {
      break;
    }
    
    // 确定当前回合双方的进攻防守方 (12回合换边)
    const side = round <= GAME_RULES.ROUNDS_FIRST_HALF ? 
      { [TEAMS.HOME]: SIDES.T, [TEAMS.AWAY]: SIDES.CT } : 
      { [TEAMS.HOME]: SIDES.CT, [TEAMS.AWAY]: SIDES.T };
    
    const roundResult = simulateRound(teamA, teamB, mapKey, round, facilities);
    // 更新回合的边
    roundResult.side = side;
    
    rounds.push(roundResult);
    
    // 更新比分
    if (roundResult.winner === TEAMS.HOME) {
      scoreA++;
    } else {
      scoreB++;
    }
    
    // 保存亮点
    if (roundResult.highlight) {
      highlights.push({
        ...roundResult.highlight,
        round
      });
    }
  }
  
  // 判断是否需要加时赛 (12-12平局)
  let overtimeRounds = [];
  if (scoreA === GAME_RULES.TIE_SCORE && scoreB === GAME_RULES.TIE_SCORE) {
    let overtimeScoreA = 0;
    let overtimeScoreB = 0;
    
    // 模拟加时赛
    let overtimeRound = 1;
    let overtimeCycle = 1;
    
    // 每个加时赛周期的分数
    let currentCycleScoreA = 0;
    let currentCycleScoreB = 0;
    
    // 加时赛可以无限进行，直到分出胜负
    while (true) {
      // 确定加时赛回合的进攻防守方（每3回合交换）
      const roundsInCycle = (overtimeRound - 1) % (GAME_RULES.OVERTIME_ROUNDS_HALF * 2) + 1;
      const isFirstSide = roundsInCycle <= GAME_RULES.OVERTIME_ROUNDS_HALF;
      
      const overtimeSide = isFirstSide ? 
        { [TEAMS.HOME]: SIDES.T, [TEAMS.AWAY]: SIDES.CT } : 
        { [TEAMS.HOME]: SIDES.CT, [TEAMS.AWAY]: SIDES.T };
      
      // 模拟加时赛回合
      const roundResult = simulateRound(
        teamA, 
        teamB, 
        mapKey, 
        GAME_RULES.TOTAL_NORMAL_ROUNDS + overtimeRound, 
        facilities,
        true
      );
      
      // 更新加时赛回合的边
      roundResult.side = overtimeSide;
      
      overtimeRounds.push(roundResult);
      
      // 更新加时赛总比分
      if (roundResult.winner === TEAMS.HOME) {
        overtimeScoreA++;
        currentCycleScoreA++;
      } else {
        overtimeScoreB++;
        currentCycleScoreB++;
      }
      
      // 保存亮点
      if (roundResult.highlight) {
        highlights.push({
          ...roundResult.highlight,
          round: GAME_RULES.TOTAL_NORMAL_ROUNDS + overtimeRound
        });
      }
      
      // 检查是否一方在当前加时赛周期中获胜
      // 1. 如果一方已经获得4分且领先，则获胜
      // 2. 如果完成了整个6回合周期仍未分出胜负，则继续新的周期
      if (currentCycleScoreA >= GAME_RULES.OVERTIME_WIN_THRESHOLD && currentCycleScoreA > currentCycleScoreB) {
        console.log(`A队在加时赛第${overtimeCycle}周期获胜，比分 ${currentCycleScoreA}-${currentCycleScoreB}`);
        break; // A队赢了加时赛
      }
      
      if (currentCycleScoreB >= GAME_RULES.OVERTIME_WIN_THRESHOLD && currentCycleScoreB > currentCycleScoreA) {
        console.log(`B队在加时赛第${overtimeCycle}周期获胜，比分 ${currentCycleScoreB}-${currentCycleScoreA}`);
        break; // B队赢了加时赛
      }
      
      // 如果完成了整个周期（6回合）但未分出胜负，开始新周期
      if (roundsInCycle === GAME_RULES.OVERTIME_ROUNDS_HALF * 2) {
        console.log(`加时赛第${overtimeCycle}周期结束，未分出胜负，比分 ${currentCycleScoreA}-${currentCycleScoreB}`);
        overtimeCycle++;
        currentCycleScoreA = 0;
        currentCycleScoreB = 0;
      }
      
      overtimeRound++;
      
      // 安全机制：防止无限循环
      if (overtimeRound > GAME_RULES.MAX_OVERTIME_ROUNDS || overtimeCycle > GAME_RULES.MAX_OVERTIME_CYCLES) {
        console.warn(`加时赛达到安全限制: ${overtimeRound}回合, ${overtimeCycle}个周期`);
        break;
      }
    }
    
    // 更新总比分
    scoreA += overtimeScoreA;
    scoreB += overtimeScoreB;
  }
  
  // 找出MVP
  const mvpPlayer = findMVP(teamA, rounds, TEAMS.HOME);
  
  // 设施加成统计
  const facilityBonus = {
    teamWorkBonus: Math.round(facilities.gamingHouse * (FACILITY_BONUSES.GAMING_HOUSE_TEAMWORK * 100)),
    prepBonus: Math.round(facilities.analyticsOffice * (FACILITY_BONUSES.ANALYTICS_PREP * 100)),
    intelBonus: Math.round(facilities.analyticsOffice * (FACILITY_BONUSES.ANALYTICS_INTEL * 100)),
    totalBonus: Math.round((facilities.gamingHouse * FACILITY_BONUSES.GAMING_HOUSE_TEAMWORK + 
                            facilities.analyticsOffice * FACILITY_BONUSES.ANALYTICS_PREP) * 100)
  };
  
  return {
    scoreA,
    scoreB,
    winner: scoreA > scoreB ? TEAMS.HOME : TEAMS.AWAY,
    rounds,
    overtimeRounds,
    highlights,
    mvp: mvpPlayer,
    facilityBonus
  };
};

/**
 * 计算比赛MVP
 * @param {Object} teamA - A队数据
 * @param {Object} teamB - B队数据
 * @param {Array} rounds - 回合结果
 * @returns {Object} - MVP选手信息
 */
export const calculateMVP = (teamA, teamB, rounds) => {
  // 计算每个选手在亮点中出现的次数
  const playerHighlightCounts = {};
  
  rounds.forEach(round => {
    if (round.highlight) {
      const player = round.highlight.player;
      playerHighlightCounts[player] = (playerHighlightCounts[player] || 0) + 1;
    }
  });
  
  // 找出亮点最多的选手
  let mvpPlayer = null;
  let maxHighlights = 0;
  
  Object.keys(playerHighlightCounts).forEach(playerName => {
    if (playerHighlightCounts[playerName] > maxHighlights) {
      maxHighlights = playerHighlightCounts[playerName];
      
      // 找出这个选手属于哪个队伍
      let player = teamA.players.find(p => p.name === playerName);
      let team = 'A';
      
      if (!player) {
        player = teamB.players.find(p => p.name === playerName);
        team = 'B';
      }
      
      mvpPlayer = {
        name: playerName,
        highlights: maxHighlights,
        team
      };
    }
  });
  
  // 如果没有找到MVP（可能没有亮点），随机选一个
  if (!mvpPlayer) {
    const winningTeam = rounds.filter(r => r.winner === 'A').length > 
                        rounds.filter(r => r.winner === 'B').length ? 'A' : 'B';
    const team = winningTeam === 'A' ? teamA : teamB;
    const randomPlayer = team.players[Math.floor(Math.random() * team.players.length)];
    
    mvpPlayer = {
      name: randomPlayer.name,
      highlights: 0,
      team: winningTeam
    };
  }
  
  return mvpPlayer;
};

/**
 * 根据比赛表现找出MVP选手
 * @param {Object} team - 球队数据
 * @param {Array} rounds - 所有回合数据
 * @param {string} teamSide - 'A'或'B'
 * @returns {Object} MVP选手数据
 */
const findMVP = (team, rounds, teamSide) => {
  // 简化的MVP逻辑：随机选择一名队员作为MVP
  // 在实际游戏中，这里应该基于选手在回合中的表现计算
  const randomIndex = Math.floor(Math.random() * team.players.length);
  return team.players[randomIndex];
}; 