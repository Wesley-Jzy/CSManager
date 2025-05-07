import { useState } from 'react'

function TeamManagementModule({ teamData, setTeamData }) {
  const [activeTab, setActiveTab] = useState('info')
  const [teamName, setTeamName] = useState(teamData.name)
  const [isEditing, setIsEditing] = useState(false)
  const [availableSponsors, setAvailableSponsors] = useState([
    { id: 's1', name: 'GamingGear', reputation: 20, payment: 5000, contractLength: 3 },
    { id: 's2', name: 'TechCorp', reputation: 40, payment: 10000, contractLength: 6 },
    { id: 's3', name: 'ESportsDrink', reputation: 60, payment: 20000, contractLength: 6 },
    { id: 's4', name: 'ProGaming', reputation: 80, payment: 40000, contractLength: 12 }
  ])
  
  // 更新战队名称
  const updateTeamName = () => {
    if (teamName.trim() !== '') {
      setTeamData({
        ...teamData,
        name: teamName
      })
      setIsEditing(false)
    }
  }
  
  // 取消编辑
  const cancelEdit = () => {
    setTeamName(teamData.name)
    setIsEditing(false)
  }
  
  // 升级设施
  const upgradeFacility = (facility) => {
    const costMultiplier = {
      trainingCenter: 15000,
      gamingHouse: 20000,
      analyticsOffice: 25000
    }
    
    const currentLevel = teamData.facilities[facility]
    const upgradeCost = costMultiplier[facility] * (currentLevel + 1)
    
    if (teamData.funds >= upgradeCost) {
      setTeamData({
        ...teamData,
        facilities: {
          ...teamData.facilities,
          [facility]: currentLevel + 1
        },
        funds: teamData.funds - upgradeCost
      })
    }
  }
  
  // 签约赞助商
  const signSponsor = (sponsor) => {
    if (teamData.reputation >= sponsor.reputation) {
      // 添加赞助商到团队
      setTeamData({
        ...teamData,
        sponsors: [...teamData.sponsors, {
          ...sponsor,
          remainingMonths: sponsor.contractLength,
          // 记录签约时间，方便后续检查合同到期
          signedAt: new Date().toISOString()
        }],
        // 获得首次赞助金
        funds: teamData.funds + sponsor.payment
      })
      
      // 从可用赞助商中移除
      setAvailableSponsors(prev => 
        prev.filter(s => s.id !== sponsor.id)
      )
    }
  }
  
  // 收取赞助金
  const collectSponsorPayments = () => {
    // 筛选有效的赞助商并计算总收入
    const updatedSponsors = []
    let totalPayment = 0
    
    teamData.sponsors.forEach(sponsor => {
      if (sponsor.remainingMonths > 1) {
        // 更新剩余月份
        updatedSponsors.push({
          ...sponsor,
          remainingMonths: sponsor.remainingMonths - 1
        })
        
        // 添加付款到总额
        totalPayment += sponsor.payment
      } else {
        // 合同到期，添加回可用赞助商
        setAvailableSponsors(prev => [...prev, {
          id: sponsor.id,
          name: sponsor.name,
          reputation: sponsor.reputation,
          payment: sponsor.payment,
          contractLength: sponsor.contractLength
        }])
      }
    })
    
    // 更新团队数据
    setTeamData({
      ...teamData,
      sponsors: updatedSponsors,
      funds: teamData.funds + totalPayment
    })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">战队管理</h2>
      
      {/* 标签导航 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'info' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('info')}
          >
            战队信息
          </button>
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'facilities' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('facilities')}
          >
            设施管理
          </button>
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sponsors' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('sponsors')}
          >
            赞助商
          </button>
        </nav>
      </div>
      
      {/* 战队信息内容 */}
      {activeTab === 'info' && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">战队名称</h3>
              {isEditing ? (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="border rounded px-3 py-2 w-full bg-white text-gray-900"
                  />
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded"
                    onClick={updateTeamName}
                  >
                    保存
                  </button>
                  <button
                    className="px-4 py-2 border border-gray-300 rounded bg-white text-gray-900"
                    onClick={cancelEdit}
                  >
                    取消
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold">{teamData.name}</div>
                  <button
                    className="px-3 py-1 text-sm text-blue-600 border border-blue-500 rounded hover:bg-blue-50"
                    onClick={() => setIsEditing(true)}
                  >
                    编辑
                  </button>
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">战队概览</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded p-4">
                  <div className="text-sm text-gray-500">资金</div>
                  <div className="text-2xl font-bold">${teamData.funds.toLocaleString()}</div>
                </div>
                <div className="border rounded p-4">
                  <div className="text-sm text-gray-500">队员数量</div>
                  <div className="text-2xl font-bold">{teamData.players.length}</div>
                </div>
                <div className="border rounded p-4">
                  <div className="text-sm text-gray-500">声誉</div>
                  <div className="text-2xl font-bold">{teamData.reputation}/100</div>
                </div>
                <div className="border rounded p-4">
                  <div className="text-sm text-gray-500">平均选手评分</div>
                  <div className="text-2xl font-bold">
                    {Math.round(teamData.players.reduce((sum, p) => 
                      sum + (p.aim + p.awareness + p.reflex) / 3, 0
                    ) / teamData.players.length)}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">月度财务</h3>
              <div className="border rounded p-4">
                <div className="flex justify-between py-2 border-b">
                  <span>选手薪水支出</span>
                  <span className="text-red-600">
                    -${teamData.players.reduce((sum, p) => sum + p.salary, 0).toLocaleString()}/月
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>赞助商收入</span>
                  <span className="text-green-600">
                    +${teamData.sponsors.reduce((sum, s) => sum + s.payment, 0).toLocaleString()}/月
                  </span>
                </div>
                <div className="flex justify-between py-2 font-medium">
                  <span>月度净收入</span>
                  <span className={
                    teamData.sponsors.reduce((sum, s) => sum + s.payment, 0) > 
                    teamData.players.reduce((sum, p) => sum + p.salary, 0)
                      ? 'text-green-600'
                      : 'text-red-600'
                  }>
                    ${(teamData.sponsors.reduce((sum, s) => sum + s.payment, 0) - 
                       teamData.players.reduce((sum, p) => sum + p.salary, 0)).toLocaleString()}/月
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 设施管理内容 */}
      {activeTab === 'facilities' && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium">设施管理</h3>
            <p className="text-sm text-gray-600">
              升级你的设施以获得更好的团队表现。升级费用随等级增加而增加。
            </p>
          </div>
          
          <div className="space-y-6">
            {/* 训练中心 */}
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">训练中心</h4>
                  <p className="text-sm text-gray-600">提高选手训练效果和成功率</p>
                </div>
                <div className="text-right">
                  <div className="font-bold">等级 {teamData.facilities.trainingCenter}</div>
                  <div className="text-sm text-gray-600">
                    升级费用: ${(15000 * (teamData.facilities.trainingCenter + 1)).toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${teamData.facilities.trainingCenter * 10}%` }}
                ></div>
              </div>
              
              <div className="text-sm mb-3">
                <div>• 训练属性提升: +{1 + teamData.facilities.trainingCenter * 0.2} 点</div>
                <div>• 训练成功率: {Math.round((0.7 + teamData.facilities.trainingCenter * 0.05) * 100)}%</div>
              </div>
              
              <button 
                className={`w-full py-2 rounded ${
                  teamData.funds >= 15000 * (teamData.facilities.trainingCenter + 1)
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={teamData.funds < 15000 * (teamData.facilities.trainingCenter + 1)}
                onClick={() => upgradeFacility('trainingCenter')}
              >
                升级
              </button>
            </div>
            
            {/* 游戏之家 */}
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">游戏之家</h4>
                  <p className="text-sm text-gray-600">提高选手日常表现和团队凝聚力</p>
                </div>
                <div className="text-right">
                  <div className="font-bold">等级 {teamData.facilities.gamingHouse}</div>
                  <div className="text-sm text-gray-600">
                    升级费用: ${(20000 * (teamData.facilities.gamingHouse + 1)).toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                <div 
                  className="bg-green-600 h-2.5 rounded-full" 
                  style={{ width: `${teamData.facilities.gamingHouse * 10}%` }}
                ></div>
              </div>
              
              <div className="text-sm mb-3">
                <div>• 团队默契度: +{teamData.facilities.gamingHouse * 5}%</div>
                <div>• 休息恢复效率: +{teamData.facilities.gamingHouse * 10}%</div>
              </div>
              
              <button 
                className={`w-full py-2 rounded ${
                  teamData.funds >= 20000 * (teamData.facilities.gamingHouse + 1)
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={teamData.funds < 20000 * (teamData.facilities.gamingHouse + 1)}
                onClick={() => upgradeFacility('gamingHouse')}
              >
                升级
              </button>
            </div>
            
            {/* 分析办公室 */}
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">分析办公室</h4>
                  <p className="text-sm text-gray-600">提高战术准备和对手分析能力</p>
                </div>
                <div className="text-right">
                  <div className="font-bold">等级 {teamData.facilities.analyticsOffice}</div>
                  <div className="text-sm text-gray-600">
                    升级费用: ${(25000 * (teamData.facilities.analyticsOffice + 1)).toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                <div 
                  className="bg-purple-600 h-2.5 rounded-full" 
                  style={{ width: `${teamData.facilities.analyticsOffice * 10}%` }}
                ></div>
              </div>
              
              <div className="text-sm mb-3">
                <div>• 比赛准备加成: +{teamData.facilities.analyticsOffice * 3}%</div>
                <div>• 对手情报准确度: +{teamData.facilities.analyticsOffice * 5}%</div>
              </div>
              
              <button 
                className={`w-full py-2 rounded ${
                  teamData.funds >= 25000 * (teamData.facilities.analyticsOffice + 1)
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={teamData.funds < 25000 * (teamData.facilities.analyticsOffice + 1)}
                onClick={() => upgradeFacility('analyticsOffice')}
              >
                升级
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 赞助商内容 */}
      {activeTab === 'sponsors' && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-medium">赞助商管理</h3>
              <p className="text-sm text-gray-600">
                签约赞助商可以获得每月固定收入，但需要足够的团队声誉。
              </p>
            </div>
            
            {teamData.sponsors.length > 0 && (
              <button 
                className="px-4 py-2 bg-green-600 text-white rounded"
                onClick={collectSponsorPayments}
              >
                收取赞助金
              </button>
            )}
          </div>
          
          {/* 当前赞助商 */}
          <div className="mb-6">
            <h4 className="font-medium mb-2">当前赞助商</h4>
            
            {teamData.sponsors.length > 0 ? (
              <div className="space-y-4">
                {teamData.sponsors.map(sponsor => (
                  <div key={sponsor.id} className="border rounded p-4 flex justify-between items-center">
                    <div>
                      <div className="font-medium">{sponsor.name}</div>
                      <div className="text-sm text-gray-600">
                        每月付款: ${sponsor.payment.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">
                        剩余合同: <span className="font-medium">{sponsor.remainingMonths}</span> 个月
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border rounded p-6 text-center text-gray-500">
                目前没有活跃的赞助商。签约一些赞助商来获得额外收入！
              </div>
            )}
          </div>
          
          {/* 可用赞助商 */}
          <div>
            <h4 className="font-medium mb-2">可用赞助商</h4>
            <div className="text-sm text-gray-600 mb-3">
              你的团队声誉: <span className="font-medium">{teamData.reputation}</span>/100
            </div>
            
            {availableSponsors.length > 0 ? (
              <div className="space-y-4">
                {availableSponsors.map(sponsor => (
                  <div key={sponsor.id} className="border rounded p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">{sponsor.name}</div>
                        <div className="text-sm text-gray-600">
                          每月付款: ${sponsor.payment.toLocaleString()} | 合同期: {sponsor.contractLength} 个月
                        </div>
                      </div>
                      <button
                        className={`px-4 py-2 rounded ${
                          teamData.reputation >= sponsor.reputation
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        disabled={teamData.reputation < sponsor.reputation}
                        onClick={() => signSponsor(sponsor)}
                      >
                        签约
                      </button>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="text-sm mr-2">所需声誉:</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            teamData.reputation >= sponsor.reputation
                              ? 'bg-green-600'
                              : 'bg-red-600'
                          }`} 
                          style={{ width: `${sponsor.reputation}%` }}
                        ></div>
                      </div>
                      <div className="text-sm ml-2">{sponsor.reputation}/100</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border rounded p-6 text-center text-gray-500">
                没有可用的赞助商。等待当前合同到期或提高团队声誉来吸引新赞助商。
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TeamManagementModule 