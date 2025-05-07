import { useState } from 'react'

function PlayerManagementModule({ teamData, setTeamData }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [trainingInProgress, setTrainingInProgress] = useState(false)
  const [trainingResult, setTrainingResult] = useState(null)
  
  // 选择选手查看详情
  const selectPlayer = (player) => {
    setSelectedPlayer(player)
    setTrainingResult(null)
  }
  
  // 训练选手，提升指定属性
  const trainPlayer = (attribute) => {
    if (!selectedPlayer || trainingInProgress) return
    
    setTrainingInProgress(true)
    
    // 模拟训练时间
    setTimeout(() => {
      // 根据训练设施等级计算培训效果
      const trainingCenterLevel = teamData.facilities.trainingCenter
      const baseImprovement = 1
      const facilityBonus = trainingCenterLevel * 0.2
      const improvement = baseImprovement + facilityBonus
      
      // 训练成功的概率 (0.7 + 设施加成)
      const successRate = 0.7 + (trainingCenterLevel * 0.05)
      const isSuccess = Math.random() < successRate
      
      // 更新训练结果
      if (isSuccess) {
        // 更新选手属性
        const updatedPlayers = teamData.players.map(p => {
          if (p.id === selectedPlayer.id) {
            const updatedPlayer = { 
              ...p, 
              [attribute]: Math.min(100, p[attribute] + improvement) 
            }
            setSelectedPlayer(updatedPlayer)
            return updatedPlayer
          }
          return p
        })
        
        setTeamData({
          ...teamData,
          players: updatedPlayers,
          // 训练消耗资金
          funds: teamData.funds - 1000
        })
        
        setTrainingResult({
          success: true,
          attribute,
          improvement,
          message: `训练成功！${selectedPlayer.name} 的${
            attribute === 'aim' ? '瞄准' : 
            attribute === 'awareness' ? '意识' : '反应'
          }提升了 ${improvement.toFixed(1)} 点。`
        })
      } else {
        // 训练失败
        setTeamData({
          ...teamData,
          // 训练仍然消耗资金
          funds: teamData.funds - 1000
        })
        
        setTrainingResult({
          success: false,
          attribute,
          message: `训练失败！${selectedPlayer.name} 似乎状态不佳，没有提升。`
        })
      }
      
      setTrainingInProgress(false)
    }, 1500)
  }

  // 支付选手薪水
  const payAllSalaries = () => {
    const totalSalary = teamData.players.reduce((sum, player) => sum + player.salary, 0)
    
    setTeamData({
      ...teamData,
      funds: teamData.funds - totalSalary
    })
    
    // 这里可以添加更多逻辑，例如选手满意度变化等
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">选手管理</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            月薪总支出: ${teamData.players.reduce((sum, p) => sum + p.salary, 0).toLocaleString()}
          </span>
          <button 
            className="px-3 py-1 bg-green-600 text-white text-sm rounded"
            onClick={payAllSalaries}
          >
            支付薪水
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        {/* 选手列表 */}
        <div className="col-span-1 border rounded-lg p-4 bg-white shadow max-h-[600px] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-3">选手列表</h3>
          <div className="space-y-2">
            {teamData.players.map(player => (
              <div 
                key={player.id}
                className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                  selectedPlayer?.id === player.id ? 'bg-blue-100 border-blue-500' : ''
                }`}
                onClick={() => selectPlayer(player)}
              >
                <div className="font-medium">{player.name}</div>
                <div className="text-sm text-gray-600">
                  薪资: ${player.salary} / 月
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>瞄准: {player.aim}</span>
                  <span>意识: {player.awareness}</span>
                  <span>反应: {player.reflex}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* 选手详情和训练 */}
        <div className="col-span-2">
          {selectedPlayer ? (
            <div className="border rounded-lg p-4 bg-white shadow">
              <h3 className="text-xl font-semibold mb-4">{selectedPlayer.name} - 详细信息</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-sm text-gray-600">ID</div>
                  <div className="font-medium">{selectedPlayer.id}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-sm text-gray-600">月薪</div>
                  <div className="font-medium">${selectedPlayer.salary}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-sm text-gray-600">瞄准</div>
                  <div className="font-medium flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${selectedPlayer.aim}%` }}></div>
                    </div>
                    {selectedPlayer.aim}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-sm text-gray-600">意识</div>
                  <div className="font-medium flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                      <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${selectedPlayer.awareness}%` }}></div>
                    </div>
                    {selectedPlayer.awareness}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-sm text-gray-600">反应</div>
                  <div className="font-medium flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                      <div className="bg-yellow-600 h-2.5 rounded-full" style={{ width: `${selectedPlayer.reflex}%` }}></div>
                    </div>
                    {selectedPlayer.reflex}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-sm text-gray-600">综合评分</div>
                  <div className="font-medium">
                    {Math.round((selectedPlayer.aim + selectedPlayer.awareness + selectedPlayer.reflex) / 3)}
                  </div>
                </div>
              </div>
              
              {/* 训练选项 */}
              <div className="mb-4">
                <h4 className="font-semibold mb-2">训练 (每次花费: $1,000)</h4>
                <div className="flex space-x-2">
                  <button 
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded font-medium disabled:bg-gray-300 disabled:text-gray-500"
                    disabled={trainingInProgress || teamData.funds < 1000}
                    onClick={() => trainPlayer('aim')}
                  >
                    训练瞄准
                  </button>
                  <button 
                    className="flex-1 py-2 px-4 bg-green-600 text-white rounded font-medium disabled:bg-gray-300 disabled:text-gray-500"
                    disabled={trainingInProgress || teamData.funds < 1000}
                    onClick={() => trainPlayer('awareness')}
                  >
                    训练意识
                  </button>
                  <button 
                    className="flex-1 py-2 px-4 bg-yellow-600 text-white rounded font-medium disabled:bg-gray-300 disabled:text-gray-500"
                    disabled={trainingInProgress || teamData.funds < 1000}
                    onClick={() => trainPlayer('reflex')}
                  >
                    训练反应
                  </button>
                </div>
              </div>
              
              {/* 训练结果 */}
              {trainingResult && (
                <div className={`p-3 rounded ${
                  trainingResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {trainingResult.message}
                </div>
              )}
            </div>
          ) : (
            <div className="border rounded-lg p-6 bg-white shadow flex items-center justify-center h-full">
              <p className="text-gray-500">请从左侧选择一名选手查看详情和进行训练</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PlayerManagementModule 