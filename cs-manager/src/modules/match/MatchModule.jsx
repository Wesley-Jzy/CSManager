import { useState } from 'react'

// 比赛噪声函数，为比赛加入随机因素
function randomNoise() {
  return Math.random() * 10 - 5
}

// 比赛模拟函数，基于团队实力和随机因素计算比赛结果
function simulateMatch(teamA, teamB, format = 'bo3') {
  let winsA = 0, winsB = 0
  const requiredWins = format === 'bo1' ? 1 : format === 'bo3' ? 2 : format === 'bo5' ? 3 : 16

  // 计算团队实力
  const baseA = teamA.reduce((sum, p) => sum + p.aim + p.awareness + p.reflex, 0)
  const baseB = teamB.reduce((sum, p) => sum + p.aim + p.awareness + p.reflex, 0)

  // 比赛循环，直到一方达到所需的胜利场次
  while (winsA < requiredWins && winsB < requiredWins) {
    const scoreA = baseA + randomNoise()
    const scoreB = baseB + randomNoise()
    scoreA > scoreB ? winsA++ : winsB++
  }

  return { 
    teamAWins: winsA, 
    teamBWins: winsB,
    winner: winsA > winsB ? 'teamA' : 'teamB'
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
      
      const result = simulateMatch(myTeam, selectedOpponent.players, matchFormat)
      
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
                  className="w-full p-2 border rounded"
                  value={matchFormat}
                  onChange={e => setMatchFormat(e.target.value)}
                >
                  <option value="bo1">BO1 (先赢1局)</option>
                  <option value="bo3">BO3 (先赢2局)</option>
                  <option value="bo5">BO5 (先赢3局)</option>
                </select>
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