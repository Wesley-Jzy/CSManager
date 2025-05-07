import { useState } from 'react'
import MapSelection from './MapSelection'
import TacticsSetup from './TacticsSetup'
import MatchSimulation from './MatchSimulation'
import MatchConfirmation from './MatchConfirmation'
import { MAPS } from './MatchUtils'

// 比赛噪声函数，为比赛加入随机因素
function randomNoise() {
  return Math.random() * 10 - 5
}

// 改进的比赛模拟函数，考虑设施升级效果
function simulateMatch(teamA, teamB, format = 'bo3', facilities = { trainingCenter: 1, gamingHouse: 1, analyticsOffice: 1 }) {
  let winsA = 0, winsB = 0
  const requiredWins = format === 'bo1' ? 1 : format === 'bo3' ? 2 : format === 'bo5' ? 3 : 16

  // 计算团队实力基础值
  const baseA = teamA.reduce((sum, p) => sum + p.aim + p.awareness + p.reflex, 0)
  const baseB = teamB.reduce((sum, p) => sum + p.aim + p.awareness + p.reflex, 0)
  
  // 应用设施加成
  const teamWorkBonus = facilities.gamingHouse * 5 / 100; // 游戏之家提供5%/级的团队默契度
  const prepBonus = facilities.analyticsOffice * 3 / 100; // 分析办公室提供3%/级的比赛准备加成
  const intelBonus = facilities.analyticsOffice * 5 / 100; // 分析办公室提供5%/级的对手情报准确度
  
  // 计算总加成
  const facilityMultiplier = 1 + teamWorkBonus + prepBonus;
  
  // 比赛循环，直到一方达到所需的胜利场次
  while (winsA < requiredWins && winsB < requiredWins) {
    // 应用设施加成到己方分数
    const scoreA = baseA * facilityMultiplier + randomNoise()
    
    // 应用情报优势，仅抑制对手的正面爆发，不影响负面表现
    let opponentNoise = randomNoise()
    // 如果对手随机噪声为正值(爆发情况)，则根据情报优势降低其效果
    if (opponentNoise > 0) {
      opponentNoise = opponentNoise * Math.max(0.2, 1 - intelBonus);
    }
    // 如果是负值，保持原样，甚至可以稍微增强负面效果(对手被针对)
    else {
      opponentNoise = opponentNoise * (1 + intelBonus * 0.5);
    }
    
    const scoreB = baseB + opponentNoise
    
    scoreA > scoreB ? winsA++ : winsB++
  }

  return { 
    teamAWins: winsA, 
    teamBWins: winsB,
    winner: winsA > winsB ? 'teamA' : 'teamB',
    // 返回额外信息用于显示
    facilityBonus: {
      teamWorkBonus: Math.round(teamWorkBonus * 100),
      prepBonus: Math.round(prepBonus * 100),
      intelBonus: Math.round(intelBonus * 100),
      totalBonus: Math.round((facilityMultiplier - 1) * 100)
    }
  }
}

function MatchModule({ teamData, setTeamData }) {
  // 比赛流程阶段: 'selection'(选择对手) -> 'map'(地图选择) -> 'tactics'(战术设置) -> 'confirmation'(确认信息) -> 'match'(比赛进行)
  const [matchStage, setMatchStage] = useState('selection')
  
  // 选择的对手
  const [selectedOpponent, setSelectedOpponent] = useState(null)
  
  // 选择的地图
  const [selectedMap, setSelectedMap] = useState(null)
  
  // 设置的战术和角色
  const [tacticsSetup, setTacticsSetup] = useState(null)
  
  // 预定义的对手
  const [opponents, setOpponents] = useState([
    {
      id: 'opponent1',
      name: 'Challenger Team',
      players: [
        { id: 'op1', name: 'Opponent1', aim: 65, awareness: 65, reflex: 65 },
        { id: 'op2', name: 'Opponent2', aim: 65, awareness: 65, reflex: 65 },
        { id: 'op3', name: 'Opponent3', aim: 65, awareness: 65, reflex: 65 },
        { id: 'op4', name: 'Opponent4', aim: 65, awareness: 65, reflex: 65 },
        { id: 'op5', name: 'Opponent5', aim: 65, awareness: 65, reflex: 65 }
      ],
      tactics: {
        T: 'balanced',
        CT: 'balanced'
      },
      roles: ['awper', 'entry', 'support', 'igl', 'lurker'],
      strength: 'medium',
      prize: 5000,
      // 情报信息，受分析办公室等级影响可见性
      info: {
        preferredTactics: '平衡',
        strongRoles: ['entry', 'support'],
        weakRoles: ['igl', 'lurker']
      }
    },
    {
      id: 'opponent2',
      name: 'Pro Team',
      players: [
        { id: 'pro1', name: 'Pro1', aim: 80, awareness: 80, reflex: 80 },
        { id: 'pro2', name: 'Pro2', aim: 80, awareness: 80, reflex: 80 },
        { id: 'pro3', name: 'Pro3', aim: 80, awareness: 80, reflex: 80 },
        { id: 'pro4', name: 'Pro4', aim: 80, awareness: 80, reflex: 80 },
        { id: 'pro5', name: 'Pro5', aim: 80, awareness: 80, reflex: 80 }
      ],
      tactics: {
        T: 'aggressive',
        CT: 'conservative'
      },
      roles: ['awper', 'entry', 'support', 'igl', 'lurker'],
      strength: 'high',
      prize: 15000,
      info: {
        preferredTactics: '激进(T)/保守(CT)',
        strongRoles: ['awper', 'entry'],
        weakRoles: ['support']
      }
    }
  ])
  
  // 历史地图表现数据
  const [mapPerformance, setMapPerformance] = useState({
    dust2: { winRate: 57, playedCount: 14 },
    mirage: { winRate: 62, playedCount: 8 },
    inferno: { winRate: 43, playedCount: 7 },
    // 其他地图没有记录
  })
  
  // 选择对手
  const handleOpponentSelect = (opponent) => {
    setSelectedOpponent(opponent)
    setMatchStage('map')
  }
  
  // 选择地图
  const handleMapSelect = (mapKey) => {
    setSelectedMap(mapKey)
    setMatchStage('tactics')
  }
  
  // 确认战术和角色设置
  const handleTacticsConfirmed = (tactics) => {
    setTacticsSetup(tactics)
    setMatchStage('confirmation')
  }
  
  // 确认比赛信息，开始比赛
  const handleConfirmMatch = () => {
    setMatchStage('match')
  }
  
  // 返回战术设置
  const handleBackToTactics = () => {
    setMatchStage('tactics')
  }
  
  // 比赛完成处理
  const handleMatchComplete = (result) => {
    console.log('Match completed with result:', result);
    // 更新团队资金和声誉
    const fundsChange = result.winner === 'A' ? selectedOpponent.prize : 0;
    const reputationChange = result.winner === 'A' ? 5 : -3;
    
    setTeamData(prev => ({
      ...prev,
      funds: prev.funds + fundsChange,
      reputation: Math.max(0, Math.min(100, prev.reputation + reputationChange))
    }));
    
    // 更新地图战绩
    if (selectedMap) {
      const currentMapStats = mapPerformance[selectedMap] || { winRate: 0, playedCount: 0 };
      const newWins = currentMapStats.winRate * currentMapStats.playedCount / 100 + (result.winner === 'A' ? 1 : 0);
      const newPlayedCount = currentMapStats.playedCount + 1;
      const newWinRate = Math.round(newWins / newPlayedCount * 100);
      
      setMapPerformance(prev => ({
        ...prev,
        [selectedMap]: {
          winRate: newWinRate,
          playedCount: newPlayedCount
        }
      }));
    }
  };
  
  // 重新开始比赛流程
  const resetMatch = () => {
    setMatchStage('selection')
    setSelectedOpponent(null)
    setSelectedMap(null)
    setTacticsSetup(null)
  }
  
  // 根据阶段渲染不同内容
  const renderByStage = () => {
    switch (matchStage) {
      case 'selection':
        return renderOpponentSelection()
      case 'map':
        return <MapSelection 
          onMapSelected={handleMapSelect} 
          previousMapPerformance={mapPerformance}
        />
      case 'tactics':
        return <TacticsSetup 
          players={teamData.players}
          selectedMap={MAPS[selectedMap]}
          onTacticsConfirmed={handleTacticsConfirmed}
          analyticsLevel={teamData.facilities.analyticsOffice}
          opponentInfo={selectedOpponent.info}
        />
      case 'confirmation':
        return <MatchConfirmation
          teamData={teamData}
          opponentData={{
            ...selectedOpponent,
            players: selectedOpponent.players,
            tactics: selectedOpponent.tactics,
            roles: selectedOpponent.roles,
            name: selectedOpponent.name
          }}
          mapKey={selectedMap}
          tacticsSetup={tacticsSetup}
          facilities={teamData.facilities}
          onConfirm={handleConfirmMatch}
          onBack={handleBackToTactics}
        />
      case 'match':
        return <MatchSimulation 
          teamData={teamData}
          opponentData={{
            players: selectedOpponent.players,
            tactics: selectedOpponent.tactics,
            roles: selectedOpponent.roles,
            name: selectedOpponent.name,
            prize: selectedOpponent.prize
          }}
          mapKey={selectedMap}
          tacticsSetup={tacticsSetup}
          facilities={teamData.facilities}
          onMatchComplete={handleMatchComplete}
          onRestart={resetMatch}
        />
      default:
        return <div>未知阶段</div>
    }
  }
  
  // 渲染对手选择
  const renderOpponentSelection = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">选择对手</h2>
          <div className="text-sm text-gray-600">
            资金: ${teamData.funds.toLocaleString()} | 声誉: {teamData.reputation}/100
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {opponents.map(opponent => (
            <div 
              key={opponent.id}
              className="border rounded-lg p-4 bg-white shadow hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleOpponentSelect(opponent)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium">{opponent.name}</h3>
                  <div className="text-sm text-gray-600 mt-1">
                    难度: {opponent.strength === 'high' ? '高' : opponent.strength === 'medium' ? '中' : '低'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    奖金: ${opponent.prize.toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-3">
                <div className="text-sm font-medium mb-2">队伍成员:</div>
                <div className="grid grid-cols-5 gap-2">
                  {opponent.players.map((player, idx) => (
                    <div key={idx} className="text-center">
                      <div className="mb-1">{player.name}</div>
                      <div className="text-xs text-gray-600">
                        平均: {Math.round((player.aim + player.awareness + player.reflex) / 3)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded font-medium"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleOpponentSelect(opponent)
                  }}
                >
                  选择对手
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* 导航路径 */}
      {matchStage !== 'selection' && (
        <div className="text-sm breadcrumbs">
          <ul className="flex items-center space-x-2">
            <li 
              className="cursor-pointer text-blue-500 hover:underline"
              onClick={resetMatch}
            >
              选择对手
            </li>
            
            {matchStage !== 'selection' && (
              <>
                <li className="text-gray-500">&gt;</li>
                <li className={matchStage === 'map' ? 'text-gray-800 font-medium' : 'text-blue-500 hover:underline cursor-pointer'}
                    onClick={() => matchStage !== 'map' && setMatchStage('map')}>
                  选择地图
                </li>
              </>
            )}
            
            {(matchStage === 'tactics' || matchStage === 'confirmation' || matchStage === 'match') && (
              <>
                <li className="text-gray-500">&gt;</li>
                <li className={matchStage === 'tactics' ? 'text-gray-800 font-medium' : 'text-blue-500 hover:underline cursor-pointer'}
                    onClick={() => (matchStage === 'confirmation' || matchStage === 'match') && setMatchStage('tactics')}>
                  战术设置
                </li>
              </>
            )}
            
            {(matchStage === 'confirmation' || matchStage === 'match') && (
              <>
                <li className="text-gray-500">&gt;</li>
                <li className={matchStage === 'confirmation' ? 'text-gray-800 font-medium' : 'text-blue-500 hover:underline cursor-pointer'}
                    onClick={() => matchStage === 'match' && setMatchStage('confirmation')}>
                  比赛确认
                </li>
              </>
            )}
            
            {matchStage === 'match' && (
              <>
                <li className="text-gray-500">&gt;</li>
                <li className="text-gray-800 font-medium">比赛进行</li>
              </>
            )}
          </ul>
        </div>
      )}
      
      {/* 当前阶段内容 */}
      {renderByStage()}
    </div>
  )
}

export default MatchModule 