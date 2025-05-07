import { useState, useEffect } from 'react';
import { MAPS, TACTICS, ROLES, calculateTeamStrength, FACILITY_BONUSES, TEAMS, SIDES, GAME_RULES } from './MatchUtils';

// 胜率计算相关常量
const PROBABILITY_CONSTANTS = {
  MAX_WIN_PROBABILITY: 0.9,
  MIN_WIN_PROBABILITY: 0.1,
  BASE_PROBABILITY: 0.5,
  SCORE_IMPACT_FACTOR: 0.05,
  PROGRESS_BAR_MIN_WIDTH: 10,
  PROGRESS_BAR_MAX_WIDTH: 90
};

// 界面显示相关常量
const UI_CONSTANTS = {
  DECIMAL_PLACES: 1
};

/**
 * 比赛确认组件
 * 显示详细的比赛胜负模拟和计算过程
 */
function MatchConfirmation({ 
  teamData, 
  opponentData, 
  mapKey, 
  tacticsSetup, 
  facilities,
  onConfirm,
  onBack
}) {
  const [winProbability, setWinProbability] = useState(0);
  const [calculationDetails, setCalculationDetails] = useState(null);
  
  // 计算双方的实力和胜率
  useEffect(() => {
    if (!teamData || !opponentData || !mapKey || !tacticsSetup) return;
    
    // 计算T方和CT方的实力
    const tSideStrengthA = calculateTeamStrength(
      teamData.players,
      tacticsSetup.roles,
      tacticsSetup.tactics[SIDES.T],
      mapKey,
      SIDES.T
    );
    
    const ctSideStrengthA = calculateTeamStrength(
      teamData.players,
      tacticsSetup.roles,
      tacticsSetup.tactics[SIDES.CT],
      mapKey,
      SIDES.CT
    );
    
    const tSideStrengthB = calculateTeamStrength(
      opponentData.players,
      opponentData.roles,
      opponentData.tactics[SIDES.T],
      mapKey,
      SIDES.T
    );
    
    const ctSideStrengthB = calculateTeamStrength(
      opponentData.players,
      opponentData.roles,
      opponentData.tactics[SIDES.CT],
      mapKey,
      SIDES.CT
    );
    
    // 应用设施加成
    const teamWorkBonus = facilities.gamingHouse * FACILITY_BONUSES.GAMING_HOUSE_TEAMWORK;
    const prepBonus = facilities.analyticsOffice * FACILITY_BONUSES.ANALYTICS_PREP;
    const intelBonus = facilities.analyticsOffice * FACILITY_BONUSES.ANALYTICS_INTEL;
    
    const facilityMultiplier = 1 + teamWorkBonus + prepBonus;
    
    // 应用设施加成
    const modifiedTSideStrengthA = tSideStrengthA * facilityMultiplier;
    const modifiedCTSideStrengthA = ctSideStrengthA * facilityMultiplier;
    
    // 模拟计算T方和CT方的预期得分
    const tSideExpectedScoreA = modifiedTSideStrengthA / (modifiedTSideStrengthA + ctSideStrengthB);
    const ctSideExpectedScoreA = modifiedCTSideStrengthA / (modifiedCTSideStrengthA + tSideStrengthB);
    
    // 估算12回合后的半场比分（期望值）
    const firstHalfScoreA = GAME_RULES.ROUNDS_FIRST_HALF * tSideExpectedScoreA;
    const firstHalfScoreB = GAME_RULES.ROUNDS_FIRST_HALF - firstHalfScoreA;
    
    const secondHalfScoreA = GAME_RULES.ROUNDS_FIRST_HALF * ctSideExpectedScoreA;
    const secondHalfScoreB = GAME_RULES.ROUNDS_FIRST_HALF - secondHalfScoreA;
    
    // 总比分（期望值）
    const totalScoreA = firstHalfScoreA + secondHalfScoreA;
    const totalScoreB = firstHalfScoreB + secondHalfScoreB;
    
    // 胜率估计
    const winProbability = totalScoreA > totalScoreB 
      ? Math.min(
          PROBABILITY_CONSTANTS.MAX_WIN_PROBABILITY, 
          PROBABILITY_CONSTANTS.BASE_PROBABILITY + (totalScoreA - totalScoreB) * PROBABILITY_CONSTANTS.SCORE_IMPACT_FACTOR
        )
      : Math.max(
          PROBABILITY_CONSTANTS.MIN_WIN_PROBABILITY, 
          PROBABILITY_CONSTANTS.BASE_PROBABILITY - (totalScoreB - totalScoreA) * PROBABILITY_CONSTANTS.SCORE_IMPACT_FACTOR
        );
    
    setWinProbability(winProbability);
    
    // 计算各个选手的有效属性
    const playerEffectiveStats = teamData.players.map((player, index) => {
      const role = tacticsSetup.roles[index];
      const roleData = ROLES[role];
      
      // T方属性
      const tTacticData = TACTICS[tacticsSetup.tactics[SIDES.T]];
      const tAim = player.aim * roleData.aimMultiplier * tTacticData.aimMultiplier;
      const tAwareness = player.awareness * roleData.awarenessMultiplier * tTacticData.awarenessMultiplier;
      const tReflex = player.reflex * roleData.reflexMultiplier * tTacticData.reflexMultiplier;
      
      // CT方属性
      const ctTacticData = TACTICS[tacticsSetup.tactics[SIDES.CT]];
      const ctAim = player.aim * roleData.aimMultiplier * ctTacticData.aimMultiplier;
      const ctAwareness = player.awareness * roleData.awarenessMultiplier * ctTacticData.awarenessMultiplier;
      const ctReflex = player.reflex * roleData.reflexMultiplier * ctTacticData.reflexMultiplier;
      
      return {
        player,
        role,
        [SIDES.T]: { aim: tAim, awareness: tAwareness, reflex: tReflex },
        [SIDES.CT]: { aim: ctAim, awareness: ctAwareness, reflex: ctReflex },
      };
    });
    
    // 保存详细计算过程
    setCalculationDetails({
      map: MAPS[mapKey],
      tSideStrengthA,
      ctSideStrengthA,
      tSideStrengthB,
      ctSideStrengthB,
      facilityBonus: {
        teamWorkBonus: Math.round(teamWorkBonus * 100),
        prepBonus: Math.round(prepBonus * 100),
        intelBonus: Math.round(intelBonus * 100),
        totalBonus: Math.round((teamWorkBonus + prepBonus) * 100)
      },
      modifiedTSideStrengthA,
      modifiedCTSideStrengthA,
      expectedScores: {
        firstHalf: { A: firstHalfScoreA, B: firstHalfScoreB },
        secondHalf: { A: secondHalfScoreA, B: secondHalfScoreB },
        total: { A: totalScoreA, B: totalScoreB }
      },
      playerEffectiveStats
    });
    
  }, [teamData, opponentData, mapKey, tacticsSetup, facilities]);
  
  // 格式化百分比
  const formatPercent = (value) => {
    return `${Math.round(value * 100)}%`;
  };
  
  // 格式化数字
  const formatNumber = (value) => {
    return value.toFixed(UI_CONSTANTS.DECIMAL_PLACES);
  };
  
  // 开始比赛
  const handleStartMatch = () => {
    onConfirm();
  };
  
  // 返回重新设置战术
  const handleBack = () => {
    onBack();
  };
  
  if (!calculationDetails) {
    return <div className="p-6 text-center">正在计算对战信息...</div>;
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">比赛确认</h2>
      
      {/* 对阵信息 */}
      <div className="p-4 border rounded-lg bg-white">
        <div className="flex justify-between items-center mb-4">
          <div className="text-center">
            <div className="text-lg font-medium">{teamData.name}</div>
            <div className="text-sm text-gray-600">您的战队</div>
          </div>
          <div className="text-xl font-bold">VS</div>
          <div className="text-center">
            <div className="text-lg font-medium">{opponentData.name}</div>
            <div className="text-sm text-gray-600">{opponentData.strength === 'high' ? '强队' : opponentData.strength === 'medium' ? '中等队伍' : '弱队'}</div>
          </div>
        </div>
        
        <div className="flex justify-center items-center mb-4">
          <div className="text-center px-4 py-2 bg-blue-100 rounded">
            <div className="text-sm text-gray-600">地图</div>
            <div className="font-medium">{calculationDetails.map.name}</div>
          </div>
        </div>
        
        <div className="flex justify-center mb-4">
          <div className="w-full max-w-md bg-gray-200 rounded-full h-4">
            <div 
              className={`h-4 rounded-full ${winProbability > PROBABILITY_CONSTANTS.BASE_PROBABILITY ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ width: `${Math.max(PROBABILITY_CONSTANTS.PROGRESS_BAR_MIN_WIDTH, Math.min(PROBABILITY_CONSTANTS.PROGRESS_BAR_MAX_WIDTH, winProbability * 100))}%` }}
            ></div>
          </div>
        </div>
        
        <div className="text-center mb-4">
          <div className="text-sm text-gray-600">预估胜率</div>
          <div className={`text-2xl font-bold ${winProbability > PROBABILITY_CONSTANTS.BASE_PROBABILITY ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercent(winProbability)}
          </div>
        </div>
      </div>
      
      {/* 实力对比 */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b">
          <h3 className="font-medium">双方实力对比</h3>
        </div>
        
        <div className="p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">方面</th>
                <th className="p-2 text-center">{teamData.name}</th>
                <th className="p-2 text-center">{opponentData.name}</th>
                <th className="p-2 text-center">差距</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2">T方实力</td>
                <td className="p-2 text-center">{formatNumber(calculationDetails.tSideStrengthA)}</td>
                <td className="p-2 text-center">{formatNumber(calculationDetails.tSideStrengthB)}</td>
                <td className={`p-2 text-center ${calculationDetails.tSideStrengthA > calculationDetails.tSideStrengthB ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercent((calculationDetails.tSideStrengthA / calculationDetails.tSideStrengthB) - 1)}
                </td>
              </tr>
              <tr className="border-b">
                <td className="p-2">CT方实力</td>
                <td className="p-2 text-center">{formatNumber(calculationDetails.ctSideStrengthA)}</td>
                <td className="p-2 text-center">{formatNumber(calculationDetails.ctSideStrengthB)}</td>
                <td className={`p-2 text-center ${calculationDetails.ctSideStrengthA > calculationDetails.ctSideStrengthB ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercent((calculationDetails.ctSideStrengthA / calculationDetails.ctSideStrengthB) - 1)}
                </td>
              </tr>
              <tr className="border-b">
                <td className="p-2">加成后T方实力</td>
                <td className="p-2 text-center">{formatNumber(calculationDetails.modifiedTSideStrengthA)}</td>
                <td className="p-2 text-center">{formatNumber(calculationDetails.tSideStrengthB)}</td>
                <td className={`p-2 text-center ${calculationDetails.modifiedTSideStrengthA > calculationDetails.tSideStrengthB ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercent((calculationDetails.modifiedTSideStrengthA / calculationDetails.tSideStrengthB) - 1)}
                </td>
              </tr>
              <tr>
                <td className="p-2">加成后CT方实力</td>
                <td className="p-2 text-center">{formatNumber(calculationDetails.modifiedCTSideStrengthA)}</td>
                <td className="p-2 text-center">{formatNumber(calculationDetails.ctSideStrengthB)}</td>
                <td className={`p-2 text-center ${calculationDetails.modifiedCTSideStrengthA > calculationDetails.ctSideStrengthB ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercent((calculationDetails.modifiedCTSideStrengthA / calculationDetails.ctSideStrengthB) - 1)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* 预期比分 */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b">
          <h3 className="font-medium">预期比分 (理论值)</h3>
        </div>
        
        <div className="p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">阶段</th>
                <th className="p-2 text-center">{teamData.name}</th>
                <th className="p-2 text-center">{opponentData.name}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2">上半场 (您为T方)</td>
                <td className="p-2 text-center font-medium">{formatNumber(calculationDetails.expectedScores.firstHalf.A)}</td>
                <td className="p-2 text-center font-medium">{formatNumber(calculationDetails.expectedScores.firstHalf.B)}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">下半场 (您为CT方)</td>
                <td className="p-2 text-center font-medium">{formatNumber(calculationDetails.expectedScores.secondHalf.A)}</td>
                <td className="p-2 text-center font-medium">{formatNumber(calculationDetails.expectedScores.secondHalf.B)}</td>
              </tr>
              <tr>
                <td className="p-2 font-medium">总比分</td>
                <td className={`p-2 text-center font-bold ${calculationDetails.expectedScores.total.A > calculationDetails.expectedScores.total.B ? 'text-green-600' : 'text-red-600'}`}>
                  {formatNumber(calculationDetails.expectedScores.total.A)}
                </td>
                <td className={`p-2 text-center font-bold ${calculationDetails.expectedScores.total.B > calculationDetails.expectedScores.total.A ? 'text-green-600' : 'text-red-600'}`}>
                  {formatNumber(calculationDetails.expectedScores.total.B)}
                </td>
              </tr>
            </tbody>
          </table>
          
          <div className="text-xs text-gray-500 mt-2">
            注：实际比赛中每回合胜负还受随机因素影响，上述为理论期望值
          </div>
        </div>
      </div>
      
      {/* 设施加成 */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b">
          <h3 className="font-medium">您的设施加成</h3>
        </div>
        
        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-2 bg-blue-50 border rounded text-center">
            <div className="text-sm text-gray-600">团队默契度</div>
            <div className="font-medium text-blue-600">+{calculationDetails.facilityBonus.teamWorkBonus}%</div>
            <div className="text-xs mt-1">游戏之家 LV.{facilities.gamingHouse}</div>
          </div>
          <div className="p-2 bg-blue-50 border rounded text-center">
            <div className="text-sm text-gray-600">比赛准备</div>
            <div className="font-medium text-blue-600">+{calculationDetails.facilityBonus.prepBonus}%</div>
            <div className="text-xs mt-1">分析办公室 LV.{facilities.analyticsOffice}</div>
          </div>
          <div className="p-2 bg-blue-50 border rounded text-center">
            <div className="text-sm text-gray-600">情报优势</div>
            <div className="font-medium text-blue-600">+{calculationDetails.facilityBonus.intelBonus}%</div>
            <div className="text-xs mt-1">分析办公室 LV.{facilities.analyticsOffice}</div>
          </div>
          <div className="p-2 bg-green-50 border border-green-200 rounded text-center">
            <div className="text-sm text-gray-600">总设施加成</div>
            <div className="font-medium text-green-600">+{calculationDetails.facilityBonus.totalBonus}%</div>
            <div className="text-xs mt-1">应用于总体实力</div>
          </div>
        </div>
      </div>
      
      {/* 选手属性详情 */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b">
          <h3 className="font-medium">选手角色和有效属性</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">选手</th>
                <th className="p-2 text-left">角色</th>
                <th className="p-2 text-center" colSpan="3">T方属性</th>
                <th className="p-2 text-center" colSpan="3">CT方属性</th>
              </tr>
              <tr className="bg-gray-50">
                <th className="p-2"></th>
                <th className="p-2"></th>
                <th className="p-2 text-center">瞄准</th>
                <th className="p-2 text-center">意识</th>
                <th className="p-2 text-center">反应</th>
                <th className="p-2 text-center">瞄准</th>
                <th className="p-2 text-center">意识</th>
                <th className="p-2 text-center">反应</th>
              </tr>
            </thead>
            <tbody>
              {calculationDetails.playerEffectiveStats.map((stats, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">{stats.player.name}</td>
                  <td className="p-2">{ROLES[stats.role].name}</td>
                  <td className="p-2 text-center">
                    <span className={`px-1 rounded ${stats[SIDES.T].aim > stats.player.aim ? 'bg-green-100' : stats[SIDES.T].aim < stats.player.aim ? 'bg-red-100' : ''}`}>
                      {formatNumber(stats[SIDES.T].aim)}
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    <span className={`px-1 rounded ${stats[SIDES.T].awareness > stats.player.awareness ? 'bg-green-100' : stats[SIDES.T].awareness < stats.player.awareness ? 'bg-red-100' : ''}`}>
                      {formatNumber(stats[SIDES.T].awareness)}
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    <span className={`px-1 rounded ${stats[SIDES.T].reflex > stats.player.reflex ? 'bg-green-100' : stats[SIDES.T].reflex < stats.player.reflex ? 'bg-red-100' : ''}`}>
                      {formatNumber(stats[SIDES.T].reflex)}
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    <span className={`px-1 rounded ${stats[SIDES.CT].aim > stats.player.aim ? 'bg-green-100' : stats[SIDES.CT].aim < stats.player.aim ? 'bg-red-100' : ''}`}>
                      {formatNumber(stats[SIDES.CT].aim)}
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    <span className={`px-1 rounded ${stats[SIDES.CT].awareness > stats.player.awareness ? 'bg-green-100' : stats[SIDES.CT].awareness < stats.player.awareness ? 'bg-red-100' : ''}`}>
                      {formatNumber(stats[SIDES.CT].awareness)}
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    <span className={`px-1 rounded ${stats[SIDES.CT].reflex > stats.player.reflex ? 'bg-green-100' : stats[SIDES.CT].reflex < stats.player.reflex ? 'bg-red-100' : ''}`}>
                      {formatNumber(stats[SIDES.CT].reflex)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-3 text-xs text-gray-500 bg-gray-50 border-t">
          说明：选手属性会根据所选角色和战术风格被调整，绿色背景表示加成，红色背景表示减益
        </div>
      </div>
      
      {/* 确认按钮 */}
      <div className="flex justify-between space-x-4 pt-4">
        <button 
          className="px-4 py-2 border border-gray-300 rounded font-medium hover:bg-gray-50"
          onClick={handleBack}
        >
          返回修改战术
        </button>
        
        <button 
          className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700"
          onClick={handleStartMatch}
        >
          开始比赛
        </button>
      </div>
    </div>
  );
}

export default MatchConfirmation; 