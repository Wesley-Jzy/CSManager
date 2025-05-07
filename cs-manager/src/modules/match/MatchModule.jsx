import { useState } from 'react'

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
  const [selectedPlayers, setSelectedPlayers] = useState([])
  const [opponents, setOpponents] = useState([
    {
      id: 'opponent1',
      name: 'Challenger Team',
      players: [
        { name: 'Opponent1', aim: 65, awareness: 65, reflex: 65 },
        { name: 'Opponent2', aim: 65, awareness: 65, reflex: 65 },
        { name: 'Opponent3', aim: 65, awareness: 65, reflex: 65 },
        { name: 'Opponent4', aim: 65, awareness: 65, reflex: 65 },
        { name: 'Opponent5', aim: 65, awareness: 65, reflex: 65 }
      ],
      strength: 'medium',
      prize: 5000
    },
    {
      id: 'opponent2',
      name: 'Pro Team',
      players: [
        { name: 'Pro1', aim: 80, awareness: 80, reflex: 80 },
        { name: 'Pro2', aim: 80, awareness: 80, reflex: 80 },
        { name: 'Pro3', aim: 80, awareness: 80, reflex: 80 },
        { name: 'Pro4', aim: 80, awareness: 80, reflex: 80 },
        { name: 'Pro5', aim: 80, awareness: 80, reflex: 80 }
      ],
      strength: 'high',
      prize: 15000
    }
  ])
  const [selectedOpponent, setSelectedOpponent] = useState(null)
  const [matchFormat, setMatchFormat] = useState('bo3')
  const [matchResult, setMatchResult] = useState(null)
  const [isMatchInProgress, setIsMatchInProgress] = useState(false)
  const [showFacilityBonus, setShowFacilityBonus] = useState(false)
  
  // 选择选手参与比赛
  const togglePlayerSelection = (playerId) => {
    setSelectedPlayers(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId)
      } else {
        if (prev.length < 5) {
          return [...prev, playerId]
        }
        return prev
      }
    })
  }

  // 开始比赛
  const startMatch = () => {
    if (selectedPlayers.length !== 5 || !selectedOpponent) return

    setIsMatchInProgress(true)
    
    // 延迟模拟比赛进行中的状态
    setTimeout(() => {
      const myTeam = selectedPlayers.map(id => 
        teamData.players.find(player => player.id === id)
      )
      
      // 传递设施信息给比赛模拟函数
      const result = simulateMatch(
        myTeam, 
        selectedOpponent.players, 
        matchFormat,
        teamData.facilities
      )
      
      // 更新比赛结果
      setMatchResult(result)
      
      // 比赛结算
      if (result.winner === 'teamA') {
        // 赢得比赛，获得奖金和声誉
        setTeamData(prev => ({
          ...prev,
          funds: prev.funds + selectedOpponent.prize,
          reputation: Math.min(100, prev.reputation + 5)
        }))
      } else {
        // 输掉比赛，声誉下降
        setTeamData(prev => ({
          ...prev,
          reputation: Math.max(0, prev.reputation - 3)
        }))
      }
      
      setIsMatchInProgress(false)
    }, 2000)
  }

  // 重置比赛数据
  const resetMatch = () => {
    setMatchResult(null)
    setSelectedOpponent(null)
    setShowFacilityBonus(false)
  }

  // 显示或隐藏设施加成详情
  const toggleFacilityBonus = () => {
    setShowFacilityBonus(!showFacilityBonus)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">比赛模块</h2>
      
      {!matchResult ? (
        <>
          {/* 比赛准备区 */}
          <div className="grid grid-cols-2 gap-6">
            <div className="border rounded-lg p-4 bg-white shadow">
              <h3 className="text-lg font-semibold mb-3">选择参赛选手 ({selectedPlayers.length}/5)</h3>
              <div className="space-y-2">
                {teamData.players.map(player => (
                  <div 
                    key={player.id}
                    className={`p-2 border rounded flex justify-between items-center cursor-pointer ${
                      selectedPlayers.includes(player.id) ? 'bg-blue-100 border-blue-500' : ''
                    }`}
                    onClick={() => togglePlayerSelection(player.id)}
                  >
                    <span>{player.name}</span>
                    <div className="text-sm text-gray-600">
                      瞄准: {player.aim} | 意识: {player.awareness} | 反应: {player.reflex}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border rounded-lg p-4 bg-white shadow">
              <h3 className="text-lg font-semibold mb-3">选择对手</h3>
              <div className="space-y-3">
                {opponents.map(opponent => (
                  <div 
                    key={opponent.id}
                    className={`p-3 border rounded cursor-pointer ${
                      selectedOpponent?.id === opponent.id ? 'bg-blue-100 border-blue-500' : ''
                    }`}
                    onClick={() => setSelectedOpponent(opponent)}
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{opponent.name}</span>
                      <span className="text-green-600">奖金: ${opponent.prize}</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      难度: {opponent.strength === 'high' ? '高' : opponent.strength === 'medium' ? '中' : '低'}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">比赛格式</h3>
                <select 
                  className="w-full p-2 border rounded bg-white text-gray-900"
                  value={matchFormat}
                  onChange={e => setMatchFormat(e.target.value)}
                >
                  <option value="bo1">BO1 (先赢1局)</option>
                  <option value="bo3">BO3 (先赢2局)</option>
                  <option value="bo5">BO5 (先赢3局)</option>
                </select>
              </div>
              
              {/* 显示当前设施等级加成 */}
              <div className="mt-4 p-3 bg-gray-50 rounded border">
                <h3 className="text-sm font-medium mb-2">设施加成</h3>
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span>团队默契度:</span>
                    <span>+{teamData.facilities.gamingHouse * 5}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>比赛准备:</span>
                    <span>+{teamData.facilities.analyticsOffice * 3}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>对手情报:</span>
                    <span>+{teamData.facilities.analyticsOffice * 5}%</span>
                  </div>
                  <div className="flex justify-between font-medium mt-1 pt-1 border-t">
                    <span>总设施加成:</span>
                    <span>+{teamData.facilities.gamingHouse * 5 + teamData.facilities.analyticsOffice * 3}%</span>
                  </div>
                </div>
              </div>
              
              <button 
                className={`mt-4 w-full py-2 px-4 rounded font-medium ${
                  selectedPlayers.length === 5 && selectedOpponent 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={selectedPlayers.length !== 5 || !selectedOpponent || isMatchInProgress}
                onClick={startMatch}
              >
                {isMatchInProgress ? '比赛进行中...' : '开始比赛'}
              </button>
            </div>
          </div>
        </>
      ) : (
        /* 比赛结果区 */
        <div className="border rounded-lg p-6 bg-white shadow">
          <h3 className="text-xl font-bold mb-4">比赛结果</h3>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-lg font-medium">{teamData.name}</div>
              <div className="text-3xl font-bold mt-2">{matchResult.teamAWins}</div>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="text-2xl font-bold">VS</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-medium">{selectedOpponent?.name}</div>
              <div className="text-3xl font-bold mt-2">{matchResult.teamBWins}</div>
            </div>
          </div>
          
          <div className="p-4 rounded text-center text-lg font-bold mb-4 bg-gray-100">
            {matchResult.winner === 'teamA' 
              ? `恭喜! 你的战队赢得了比赛和 $${selectedOpponent?.prize} 奖金!` 
              : '很遗憾，你的战队输掉了这场比赛。再接再厉!'}
          </div>
          
          {/* 设施加成详情 */}
          <div className="mb-4">
            <button 
              className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded font-medium text-gray-700 flex justify-between items-center"
              onClick={toggleFacilityBonus}
            >
              <span>设施加成详情</span>
              <span>{showFacilityBonus ? '▲' : '▼'}</span>
            </button>
            
            {showFacilityBonus && (
              <div className="mt-2 p-4 border rounded bg-gray-50">
                <div className="grid grid-cols-2 gap-3">
                  <div className="border rounded p-2">
                    <div className="text-sm text-gray-600">团队默契度加成</div>
                    <div className="font-medium">+{matchResult.facilityBonus.teamWorkBonus}%</div>
                  </div>
                  <div className="border rounded p-2">
                    <div className="text-sm text-gray-600">比赛准备加成</div>
                    <div className="font-medium">+{matchResult.facilityBonus.prepBonus}%</div>
                  </div>
                  <div className="border rounded p-2">
                    <div className="text-sm text-gray-600">对手情报准确度</div>
                    <div className="font-medium">+{matchResult.facilityBonus.intelBonus}%</div>
                  </div>
                  <div className="border rounded p-2 bg-blue-50">
                    <div className="text-sm text-gray-600">总实力提升</div>
                    <div className="font-medium">+{matchResult.facilityBonus.totalBonus}%</div>
                  </div>
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  <p>• 团队默契度和比赛准备提高团队整体实力</p>
                  <p>• 对手情报准确度减少对手的随机性表现</p>
                </div>
              </div>
            )}
          </div>
          
          <button 
            className="w-full py-2 px-4 bg-blue-600 text-white rounded font-medium"
            onClick={resetMatch}
          >
            返回
          </button>
        </div>
      )}
    </div>
  )
}

export default MatchModule 