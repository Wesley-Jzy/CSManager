import { useState, useEffect } from 'react';
import { 
  MAPS, 
  TACTICS, 
  ROLES, 
  calculateTeamStrength, 
  calculateMatchupDetails,
  FACILITY_BONUSES, 
  TEAMS, 
  SIDES, 
  GAME_RULES,
  RANDOM_FACTORS
} from './MatchUtils';

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
  DECIMAL_PLACES: 1,
  PERCENT_DECIMAL_PLACES: 1,
  COLLAPSED_SECTIONS_DEFAULT: ['randomFactors', 'formula', 'playerDetails']
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
  const [matchupDetails, setMatchupDetails] = useState(null);
  const [collapsedSections, setCollapsedSections] = useState(UI_CONSTANTS.COLLAPSED_SECTIONS_DEFAULT);
  
  // 使用新的calculateMatchupDetails函数计算详细的比赛数据
  useEffect(() => {
    console.log("MatchConfirmation useEffect triggered with:", {
      teamData: teamData ? "present" : "missing",
      opponentData: opponentData ? "present" : "missing",
      mapKey: mapKey || "missing",
      tacticsSetup: tacticsSetup ? `present with ${tacticsSetup.roles?.length || 0} roles` : "missing",
      facilities: facilities ? `present with levels ${JSON.stringify(facilities)}` : "missing"
    });
    
    if (!teamData || !opponentData || !mapKey || !tacticsSetup) {
      console.error("Missing required data for MatchConfirmation", {
        teamData: !!teamData,
        opponentData: !!opponentData,
        mapKey,
        tacticsSetup: !!tacticsSetup
      });
      return;
    }
    
    // 确保数据结构正确
    if (!tacticsSetup.tactics || !tacticsSetup.roles) {
      console.error("Invalid tacticsSetup structure:", tacticsSetup);
      return;
    }
    
    // 确保地图存在
    if (!MAPS[mapKey]) {
      console.error(`Invalid map key: ${mapKey}. Available maps:`, Object.keys(MAPS));
      return;
    }
    
    const teamAData = {
      players: teamData.players,
      roles: tacticsSetup.roles,
      tactics: tacticsSetup.tactics
    };
    
    const teamBData = {
      players: opponentData.players,
      roles: opponentData.roles,
      tactics: opponentData.tactics
    };
    
    try {
      console.log("Calling calculateMatchupDetails with:", {
        teamAData: `${teamAData.players.length} players, ${teamAData.roles.length} roles`,
        teamBData: `${teamBData.players.length} players, ${teamBData.roles.length} roles`,
        mapKey,
        facilities
      });
      
      const details = calculateMatchupDetails(teamAData, teamBData, mapKey, facilities);
      console.log("Matchup details calculated successfully:", Object.keys(details));
      setMatchupDetails(details);
    } catch (error) {
      console.error("Error calculating matchup details:", error);
      // 尝试创建一个基本的回退对象，以防计算失败
      const fallbackMap = MAPS[mapKey] || Object.values(MAPS)[0];
      setMatchupDetails({
        map: fallbackMap,
        winProbability: { simulated: 0.5 },
        baseStrength: { tSide: { A: 0, B: 0 }, ctSide: { A: 0, B: 0 } },
        modifiedStrength: { tSide: { A: 0, B: 0 }, ctSide: { A: 0, B: 0 } },
        facilityBonus: { teamWorkBonus: 0, prepBonus: 0, intelBonus: 0, totalBonus: 0 },
        roundWinProbability: { tSide: { adjusted: 0.5 }, ctSide: { adjusted: 0.5 } },
        expectedScores: {
          firstHalf: { A: 6, B: 6 }, 
          secondHalf: { A: 6, B: 6 },
          total: { A: 12, B: 12 }
        }
      });
    }
    
  }, [teamData, opponentData, mapKey, tacticsSetup, facilities]);
  
  // 切换折叠部分
  const toggleSection = (section) => {
    setCollapsedSections(prev => 
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };
  
  // 判断部分是否被折叠
  const isSectionCollapsed = (section) => {
    return collapsedSections.includes(section);
  };
  
  // 格式化百分比
  const formatPercent = (value, decimalPlaces = UI_CONSTANTS.PERCENT_DECIMAL_PLACES) => {
    return `${(value * 100).toFixed(decimalPlaces)}%`;
  };
  
  // 格式化数字
  const formatNumber = (value, decimalPlaces = UI_CONSTANTS.DECIMAL_PLACES) => {
    return value.toFixed(decimalPlaces);
  };
  
  // 格式化差距百分比
  const formatDifference = (valueA, valueB) => {
    const ratio = valueA / valueB;
    return formatPercent(ratio - 1);
  };
  
  // 开始比赛
  const handleStartMatch = () => {
    onConfirm();
  };
  
  // 返回重新设置战术
  const handleBack = () => {
    onBack();
  };
  
  if (!matchupDetails) {
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
            <div className="font-medium">{matchupDetails.map.name}</div>
            <div className="text-xs text-gray-500 mt-1">
              {matchupDetails.map.ctSided > 1 
                ? `CT倾向性 +${formatPercent(matchupDetails.map.ctSided - 1)}`
                : `T倾向性 +${formatPercent(2 - matchupDetails.map.ctSided - 1)}`}
            </div>
          </div>
        </div>
        
        <div className="flex justify-center mb-4">
          <div className="w-full max-w-md bg-gray-200 rounded-full h-4">
            <div 
              className={`h-4 rounded-full ${matchupDetails.winProbability.simulated > PROBABILITY_CONSTANTS.BASE_PROBABILITY ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ width: `${Math.max(PROBABILITY_CONSTANTS.PROGRESS_BAR_MIN_WIDTH, Math.min(PROBABILITY_CONSTANTS.PROGRESS_BAR_MAX_WIDTH, matchupDetails.winProbability.simulated * 100))}%` }}
            ></div>
          </div>
        </div>
        
        <div className="text-center mb-4">
          <div className="text-sm text-gray-600">预估胜率</div>
          <div className={`text-2xl font-bold ${matchupDetails.winProbability.simulated > PROBABILITY_CONSTANTS.BASE_PROBABILITY ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercent(matchupDetails.winProbability.simulated, 1)}
          </div>
        </div>
      </div>
      
      {/* 实力对比 */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
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
                <td className="p-2">T方基础实力</td>
                <td className="p-2 text-center">{formatNumber(matchupDetails.baseStrength.tSide.A)}</td>
                <td className="p-2 text-center">{formatNumber(matchupDetails.baseStrength.tSide.B)}</td>
                <td className={`p-2 text-center ${matchupDetails.baseStrength.tSide.A > matchupDetails.baseStrength.tSide.B ? 'text-green-600' : 'text-red-600'}`}>
                  {formatDifference(matchupDetails.baseStrength.tSide.A, matchupDetails.baseStrength.tSide.B)}
                </td>
              </tr>
              <tr className="border-b">
                <td className="p-2">CT方基础实力</td>
                <td className="p-2 text-center">{formatNumber(matchupDetails.baseStrength.ctSide.A)}</td>
                <td className="p-2 text-center">{formatNumber(matchupDetails.baseStrength.ctSide.B)}</td>
                <td className={`p-2 text-center ${matchupDetails.baseStrength.ctSide.A > matchupDetails.baseStrength.ctSide.B ? 'text-green-600' : 'text-red-600'}`}>
                  {formatDifference(matchupDetails.baseStrength.ctSide.A, matchupDetails.baseStrength.ctSide.B)}
                </td>
              </tr>
              <tr className="border-b">
                <td className="p-2">设施加成后T方实力</td>
                <td className="p-2 text-center">{formatNumber(matchupDetails.modifiedStrength.tSide.A)}</td>
                <td className="p-2 text-center">{formatNumber(matchupDetails.modifiedStrength.tSide.B)}</td>
                <td className={`p-2 text-center ${matchupDetails.modifiedStrength.tSide.A > matchupDetails.modifiedStrength.tSide.B ? 'text-green-600' : 'text-red-600'}`}>
                  {formatDifference(matchupDetails.modifiedStrength.tSide.A, matchupDetails.modifiedStrength.tSide.B)}
                </td>
              </tr>
              <tr className="border-b">
                <td className="p-2">设施加成后CT方实力</td>
                <td className="p-2 text-center">{formatNumber(matchupDetails.modifiedStrength.ctSide.A)}</td>
                <td className="p-2 text-center">{formatNumber(matchupDetails.modifiedStrength.ctSide.B)}</td>
                <td className={`p-2 text-center ${matchupDetails.modifiedStrength.ctSide.A > matchupDetails.modifiedStrength.ctSide.B ? 'text-green-600' : 'text-red-600'}`}>
                  {formatDifference(matchupDetails.modifiedStrength.ctSide.A, matchupDetails.modifiedStrength.ctSide.B)}
                </td>
              </tr>
              <tr className="border-b">
                <td className="p-2">T方回合胜率</td>
                <td className="p-2 text-center">{formatPercent(matchupDetails.roundWinProbability.tSide.adjusted)}</td>
                <td className="p-2 text-center">{formatPercent(1 - matchupDetails.roundWinProbability.tSide.adjusted)}</td>
                <td className={`p-2 text-center ${matchupDetails.roundWinProbability.tSide.adjusted > 0.5 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatDifference(matchupDetails.roundWinProbability.tSide.adjusted, 1 - matchupDetails.roundWinProbability.tSide.adjusted)}
                </td>
              </tr>
              <tr>
                <td className="p-2">CT方回合胜率</td>
                <td className="p-2 text-center">{formatPercent(matchupDetails.roundWinProbability.ctSide.adjusted)}</td>
                <td className="p-2 text-center">{formatPercent(1 - matchupDetails.roundWinProbability.ctSide.adjusted)}</td>
                <td className={`p-2 text-center ${matchupDetails.roundWinProbability.ctSide.adjusted > 0.5 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatDifference(matchupDetails.roundWinProbability.ctSide.adjusted, 1 - matchupDetails.roundWinProbability.ctSide.adjusted)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* 公式与随机因素 */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center cursor-pointer"
             onClick={() => toggleSection('formula')}>
          <h3 className="font-medium">回合胜负计算公式与随机因素</h3>
          <div>{isSectionCollapsed('formula') ? '展开 ▼' : '收起 ▲'}</div>
        </div>
        
        {!isSectionCollapsed('formula') && (
          <div className="p-4">
            <div className="mb-4">
              <div className="text-sm font-medium mb-1">回合胜负决定公式:</div>
              <div className="p-3 bg-gray-50 rounded border text-sm font-mono">
                胜者 = (A队基础实力 × 设施加成 × A队随机因子) &gt; (B队基础实力 × B队随机因子) ? A队 : B队
              </div>
              <div className="mt-2 text-xs text-gray-600">
                • 随机因子范围: {RANDOM_FACTORS.MIN} ~ {RANDOM_FACTORS.MAX}<br />
                • 设施加成: +{matchupDetails.facilityBonus.totalBonus}%<br />
                • 情报加成效果: 抑制对手正面爆发至最多 {formatPercent(1 - RANDOM_FACTORS.INTEL_MIN_REDUCTION)}
              </div>
            </div>
            
            <div className="mb-4">
              <div className="text-sm font-medium mb-1">随机因子影响估计:</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded border">
                  <div className="text-sm font-medium">T方回合</div>
                  <div className="text-xs mt-1">
                    • 基础胜率: {formatPercent(matchupDetails.roundWinProbability.tSide.base)}<br />
                    • 随机因子影响: ×{formatNumber(matchupDetails.randomFactors.impact.tSide, 2)}<br />
                    • 最终回合胜率: {formatPercent(matchupDetails.roundWinProbability.tSide.adjusted)}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded border">
                  <div className="text-sm font-medium">CT方回合</div>
                  <div className="text-xs mt-1">
                    • 基础胜率: {formatPercent(matchupDetails.roundWinProbability.ctSide.base)}<br />
                    • 随机因子影响: ×{formatNumber(matchupDetails.randomFactors.impact.ctSide, 2)}<br />
                    • 最终回合胜率: {formatPercent(matchupDetails.roundWinProbability.ctSide.adjusted)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-xs text-gray-600 mt-3">
              注意: 上述数据是基于数学期望估算的，实际比赛中每回合的随机因子会有所不同，可能导致比赛结果有较大波动。
            </div>
          </div>
        )}
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
                <th className="p-2 text-center">领先方</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2">上半场 (您为T方)</td>
                <td className="p-2 text-center font-medium">{formatNumber(matchupDetails.expectedScores.firstHalf.A)}</td>
                <td className="p-2 text-center font-medium">{formatNumber(matchupDetails.expectedScores.firstHalf.B)}</td>
                <td className="p-2 text-center font-medium">
                  {matchupDetails.expectedScores.firstHalf.A > matchupDetails.expectedScores.firstHalf.B 
                    ? <span className="text-green-600">您 (+{formatNumber(matchupDetails.expectedScores.firstHalf.A - matchupDetails.expectedScores.firstHalf.B)})</span>
                    : matchupDetails.expectedScores.firstHalf.A < matchupDetails.expectedScores.firstHalf.B
                      ? <span className="text-red-600">对手 (+{formatNumber(matchupDetails.expectedScores.firstHalf.B - matchupDetails.expectedScores.firstHalf.A)})</span>
                      : <span className="text-gray-600">平</span>
                  }
                </td>
              </tr>
              <tr className="border-b">
                <td className="p-2">下半场 (您为CT方)</td>
                <td className="p-2 text-center font-medium">{formatNumber(matchupDetails.expectedScores.secondHalf.A)}</td>
                <td className="p-2 text-center font-medium">{formatNumber(matchupDetails.expectedScores.secondHalf.B)}</td>
                <td className="p-2 text-center font-medium">
                  {matchupDetails.expectedScores.secondHalf.A > matchupDetails.expectedScores.secondHalf.B 
                    ? <span className="text-green-600">您 (+{formatNumber(matchupDetails.expectedScores.secondHalf.A - matchupDetails.expectedScores.secondHalf.B)})</span>
                    : matchupDetails.expectedScores.secondHalf.A < matchupDetails.expectedScores.secondHalf.B
                      ? <span className="text-red-600">对手 (+{formatNumber(matchupDetails.expectedScores.secondHalf.B - matchupDetails.expectedScores.secondHalf.A)})</span>
                      : <span className="text-gray-600">平</span>
                  }
                </td>
              </tr>
              <tr>
                <td className="p-2 font-medium">总比分</td>
                <td className={`p-2 text-center font-bold ${matchupDetails.expectedScores.total.A > matchupDetails.expectedScores.total.B ? 'text-green-600' : 'text-red-600'}`}>
                  {formatNumber(matchupDetails.expectedScores.total.A)}
                </td>
                <td className={`p-2 text-center font-bold ${matchupDetails.expectedScores.total.B > matchupDetails.expectedScores.total.A ? 'text-green-600' : 'text-red-600'}`}>
                  {formatNumber(matchupDetails.expectedScores.total.B)}
                </td>
                <td className="p-2 text-center font-medium">
                  {matchupDetails.expectedScores.total.A > matchupDetails.expectedScores.total.B 
                    ? <span className="text-green-600">您 (+{formatNumber(matchupDetails.expectedScores.total.A - matchupDetails.expectedScores.total.B)})</span>
                    : matchupDetails.expectedScores.total.A < matchupDetails.expectedScores.total.B
                      ? <span className="text-red-600">对手 (+{formatNumber(matchupDetails.expectedScores.total.B - matchupDetails.expectedScores.total.A)})</span>
                      : <span className="text-gray-600">平</span>
                  }
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
            <div className="font-medium text-blue-600">+{matchupDetails.facilityBonus.teamWorkBonus}%</div>
            <div className="text-xs mt-1">游戏之家 LV.{facilities.gamingHouse}</div>
          </div>
          <div className="p-2 bg-blue-50 border rounded text-center">
            <div className="text-sm text-gray-600">比赛准备</div>
            <div className="font-medium text-blue-600">+{matchupDetails.facilityBonus.prepBonus}%</div>
            <div className="text-xs mt-1">分析办公室 LV.{facilities.analyticsOffice}</div>
          </div>
          <div className="p-2 bg-blue-50 border rounded text-center">
            <div className="text-sm text-gray-600">情报优势</div>
            <div className="font-medium text-blue-600">+{matchupDetails.facilityBonus.intelBonus}%</div>
            <div className="text-xs mt-1">分析办公室 LV.{facilities.analyticsOffice}</div>
          </div>
          <div className="p-2 bg-green-50 border border-green-200 rounded text-center">
            <div className="text-sm text-gray-600">总设施加成</div>
            <div className="font-medium text-green-600">+{matchupDetails.facilityBonus.totalBonus}%</div>
            <div className="text-xs mt-1">应用于总体实力</div>
          </div>
        </div>
      </div>
      
      {/* 选手属性详情 */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center cursor-pointer"
             onClick={() => toggleSection('playerDetails')}>
          <h3 className="font-medium">选手角色和有效属性</h3>
          <div>{isSectionCollapsed('playerDetails') ? '展开 ▼' : '收起 ▲'}</div>
        </div>
        
        {!isSectionCollapsed('playerDetails') && (
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
                {matchupDetails.playerDetails.map((stats, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{stats.player.name}</td>
                    <td className="p-2">{ROLES[stats.role].name}</td>
                    <td className="p-2 text-center">
                      <span className={`px-1 rounded ${stats.effectiveStats[SIDES.T].aim > stats.baseStats.aim ? 'bg-green-100' : stats.effectiveStats[SIDES.T].aim < stats.baseStats.aim ? 'bg-red-100' : ''}`}>
                        {formatNumber(stats.effectiveStats[SIDES.T].aim)}
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <span className={`px-1 rounded ${stats.effectiveStats[SIDES.T].awareness > stats.baseStats.awareness ? 'bg-green-100' : stats.effectiveStats[SIDES.T].awareness < stats.baseStats.awareness ? 'bg-red-100' : ''}`}>
                        {formatNumber(stats.effectiveStats[SIDES.T].awareness)}
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <span className={`px-1 rounded ${stats.effectiveStats[SIDES.T].reflex > stats.baseStats.reflex ? 'bg-green-100' : stats.effectiveStats[SIDES.T].reflex < stats.baseStats.reflex ? 'bg-red-100' : ''}`}>
                        {formatNumber(stats.effectiveStats[SIDES.T].reflex)}
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <span className={`px-1 rounded ${stats.effectiveStats[SIDES.CT].aim > stats.baseStats.aim ? 'bg-green-100' : stats.effectiveStats[SIDES.CT].aim < stats.baseStats.aim ? 'bg-red-100' : ''}`}>
                        {formatNumber(stats.effectiveStats[SIDES.CT].aim)}
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <span className={`px-1 rounded ${stats.effectiveStats[SIDES.CT].awareness > stats.baseStats.awareness ? 'bg-green-100' : stats.effectiveStats[SIDES.CT].awareness < stats.baseStats.awareness ? 'bg-red-100' : ''}`}>
                        {formatNumber(stats.effectiveStats[SIDES.CT].awareness)}
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <span className={`px-1 rounded ${stats.effectiveStats[SIDES.CT].reflex > stats.baseStats.reflex ? 'bg-green-100' : stats.effectiveStats[SIDES.CT].reflex < stats.baseStats.reflex ? 'bg-red-100' : ''}`}>
                        {formatNumber(stats.effectiveStats[SIDES.CT].reflex)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          
            <div className="p-3 text-xs text-gray-500 bg-gray-50 border-t">
              <div className="mb-1">属性计算公式: 基础属性 × 角色系数 × 战术系数 = 实际属性</div>
              <div>
                • 绿色表示属性提升 • 红色表示属性降低
              </div>
            </div>
          </div>
        )}
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