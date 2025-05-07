import { useState } from 'react'

function RecruitmentModule({ teamData, setTeamData }) {
  const [marketPlayers, setMarketPlayers] = useState([
    { id: 101, name: 'Rookie1', aim: 60, awareness: 55, reflex: 65, salary: 3000, price: 15000 },
    { id: 102, name: 'Veteran1', aim: 75, awareness: 72, reflex: 70, salary: 8000, price: 40000 },
    { id: 103, name: 'Talent1', aim: 68, awareness: 65, reflex: 70, salary: 5000, price: 25000 },
    { id: 104, name: 'Star1', aim: 85, awareness: 80, reflex: 82, salary: 12000, price: 60000 },
    { id: 105, name: 'Prodigy1', aim: 72, awareness: 70, reflex: 75, salary: 7000, price: 35000 },
  ])
  const [selectedTab, setSelectedTab] = useState('market')
  const [recruitmentResult, setRecruitmentResult] = useState(null)
  const [draftPlayers, setDraftPlayers] = useState(generateDraftPlayers())
  const [isRecruiting, setIsRecruiting] = useState(false)
  
  // 生成随机草案球员
  function generateDraftPlayers() {
    const newPlayers = []
    const firstNames = ['Alex', 'Max', 'Sam', 'Nick', 'Tim', 'Jake', 'Leo', 'Mike', 'Chris', 'Tom']
    const lastNames = ['Smith', 'Johnson', 'Lee', 'Wang', 'Brown', 'Miller', 'Jones', 'Garcia', 'Taylor', 'Wilson']
    
    for (let i = 0; i < 8; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
      const name = `${firstName} ${lastName}`
      
      // 草案球员属性随机但通常比市场选手略低
      const aim = 40 + Math.floor(Math.random() * 30)
      const awareness = 40 + Math.floor(Math.random() * 30)
      const reflex = 40 + Math.floor(Math.random() * 30)
      const avg = (aim + awareness + reflex) / 3
      
      // 薪水和价格基于平均属性
      const salary = Math.round((avg * 100)) 
      const price = Math.round(salary * 2.5)
      
      newPlayers.push({
        id: 200 + i,
        name,
        aim,
        awareness,
        reflex,
        salary,
        price
      })
    }
    
    return newPlayers
  }
  
  // 刷新草案球员
  const refreshDraft = () => {
    const refreshCost = 5000
    
    if (teamData.funds >= refreshCost) {
      setTeamData({
        ...teamData,
        funds: teamData.funds - refreshCost
      })
      
      setDraftPlayers(generateDraftPlayers())
    }
  }
  
  // 购买选手
  const buyPlayer = (player) => {
    if (teamData.funds < player.price || isRecruiting) return
    
    setIsRecruiting(true)
    
    // 模拟招募过程
    setTimeout(() => {
      // 从原始列表中移除选手
      if (selectedTab === 'market') {
        setMarketPlayers(prev => prev.filter(p => p.id !== player.id))
      } else {
        setDraftPlayers(prev => prev.filter(p => p.id !== player.id))
      }
      
      // 生成新ID以避免冲突
      const newPlayerId = Math.max(...teamData.players.map(p => p.id)) + 1
      
      // 添加到团队
      const newPlayer = { ...player, id: newPlayerId }
      
      setTeamData({
        ...teamData,
        players: [...teamData.players, newPlayer],
        funds: teamData.funds - player.price
      })
      
      setRecruitmentResult({
        success: true,
        player: newPlayer,
        message: `成功招募 ${player.name}！他现在是你战队的一员。`
      })
      
      setIsRecruiting(false)
    }, 1000)
  }
  
  // 尝试免费招募（有较低成功率）
  const tryFreeRecruitment = (player) => {
    if (isRecruiting) return
    
    setIsRecruiting(true)
    
    setTimeout(() => {
      // 基础成功率为20%，随着声誉提高而增加
      const baseSuccessRate = 0.2
      const reputationBonus = teamData.reputation / 500  // 最高额外20%
      const successRate = baseSuccessRate + reputationBonus
      
      const isSuccess = Math.random() < successRate
      
      if (isSuccess) {
        // 从原始列表中移除选手
        if (selectedTab === 'market') {
          setMarketPlayers(prev => prev.filter(p => p.id !== player.id))
        } else {
          setDraftPlayers(prev => prev.filter(p => p.id !== player.id))
        }
        
        // 生成新ID以避免冲突
        const newPlayerId = Math.max(...teamData.players.map(p => p.id)) + 1
        
        // 添加到团队，薪水略高（因为没有支付转会费）
        const newPlayer = { 
          ...player, 
          id: newPlayerId,
          salary: Math.round(player.salary * 1.2)  // 薪水提高20%
        }
        
        setTeamData({
          ...teamData,
          players: [...teamData.players, newPlayer]
        })
        
        setRecruitmentResult({
          success: true,
          player: newPlayer,
          message: `免费招募成功！${player.name} 加入了你的战队，但他要求更高的薪水：$${newPlayer.salary}/月`
        })
      } else {
        setRecruitmentResult({
          success: false,
          message: `招募失败。${player.name} 拒绝了你的免费签约提议。`
        })
      }
      
      setIsRecruiting(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">选手招募</h2>
      
      {/* 招募结果通知 */}
      {recruitmentResult && (
        <div className={`p-4 rounded ${
          recruitmentResult.success 
            ? 'bg-green-100 border border-green-300' 
            : 'bg-red-100 border border-red-300'
        }`}>
          {recruitmentResult.message}
          <button 
            className="ml-2 text-gray-600 hover:text-gray-800"
            onClick={() => setRecruitmentResult(null)}
          >
            ✕
          </button>
        </div>
      )}
      
      {/* 标签切换 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'market' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setSelectedTab('market')}
          >
            转会市场
          </button>
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'draft' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setSelectedTab('draft')}
          >
            选手草案
          </button>
        </nav>
      </div>
      
      {/* 转会市场 */}
      {selectedTab === 'market' && (
        <div className="border rounded-lg bg-white shadow">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">转会市场 - 可用选手</h3>
            <p className="text-sm text-gray-600">你的资金: ${teamData.funds.toLocaleString()}</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    选手
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    属性
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    薪水
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    转会费
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {marketPlayers.map(player => (
                  <tr key={player.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{player.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        瞄准: {player.aim} | 意识: {player.awareness} | 反应: {player.reflex}
                      </div>
                      <div className="text-sm text-gray-500">
                        平均: {Math.round((player.aim + player.awareness + player.reflex) / 3)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${player.salary}/月
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${player.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className={`mr-2 px-3 py-1 rounded ${
                          teamData.funds >= player.price && !isRecruiting
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        disabled={teamData.funds < player.price || isRecruiting}
                        onClick={() => buyPlayer(player)}
                      >
                        购买
                      </button>
                      <button
                        className={`px-3 py-1 rounded border ${
                          !isRecruiting
                            ? 'border-blue-500 text-blue-500 hover:bg-blue-50'
                            : 'border-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        disabled={isRecruiting}
                        onClick={() => tryFreeRecruitment(player)}
                      >
                        尝试免费签约
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* 选手草案 */}
      {selectedTab === 'draft' && (
        <div className="border rounded-lg bg-white shadow">
          <div className="p-4 border-b flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">选手草案 - 新秀和未签约选手</h3>
              <p className="text-sm text-gray-600">你的资金: ${teamData.funds.toLocaleString()}</p>
            </div>
            <button
              className={`px-4 py-2 rounded ${
                teamData.funds >= 5000
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={teamData.funds < 5000}
              onClick={refreshDraft}
            >
              刷新草案 ($5,000)
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
            {draftPlayers.map(player => (
              <div key={player.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="font-medium text-lg mb-2">{player.name}</div>
                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">瞄准:</span>
                    <span>{player.aim}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">意识:</span>
                    <span>{player.awareness}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">反应:</span>
                    <span>{player.reflex}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">月薪:</span>
                    <span>${player.salary}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span>价格:</span>
                    <span>${player.price}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    className={`flex-1 px-2 py-1 text-sm rounded ${
                      teamData.funds >= player.price && !isRecruiting
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={teamData.funds < player.price || isRecruiting}
                    onClick={() => buyPlayer(player)}
                  >
                    签约
                  </button>
                  <button
                    className={`flex-1 px-2 py-1 text-sm rounded border ${
                      !isRecruiting
                        ? 'border-blue-500 text-blue-500 hover:bg-blue-50'
                        : 'border-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={isRecruiting}
                    onClick={() => tryFreeRecruitment(player)}
                  >
                    试训
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default RecruitmentModule 