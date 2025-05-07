import { useState, useEffect } from 'react';
import { TACTICS, ROLES } from './MatchUtils';

/**
 * 战术和角色设置组件
 * 允许用户为比赛设置战术倾向和分配选手角色
 */
function TacticsSetup({ 
  players, 
  selectedMap, 
  onTacticsConfirmed, 
  analyticsLevel = 0,
  opponentInfo 
}) {
  // T和CT两方的战术
  const [tactics, setTactics] = useState({
    T: 'balanced',  // 默认平衡战术
    CT: 'balanced'
  });
  
  // 选手角色分配
  const [playerRoles, setPlayerRoles] = useState(
    players.map((_, index) => 
      index === 0 ? 'awper' : 
      index === 1 ? 'entry' : 
      index === 2 ? 'support' : 
      index === 3 ? 'igl' : 'lurker'
    )
  );
  
  // 显示的对手信息（受分析办公室等级影响）
  const [visibleOpponentInfo, setVisibleOpponentInfo] = useState({
    preferredTactics: '未知',
    strongRoles: [],
    weakRoles: []
  });
  
  // 根据分析办公室等级显示对手信息
  useEffect(() => {
    if (opponentInfo && analyticsLevel > 0) {
      const revealedInfo = { ...visibleOpponentInfo };
      
      // 分析等级1：显示偏好战术
      if (analyticsLevel >= 1) {
        revealedInfo.preferredTactics = opponentInfo.preferredTactics;
      }
      
      // 分析等级2：显示一个强势角色
      if (analyticsLevel >= 2 && opponentInfo.strongRoles.length > 0) {
        revealedInfo.strongRoles = [opponentInfo.strongRoles[0]];
      }
      
      // 分析等级3：显示所有强势角色和一个弱势角色
      if (analyticsLevel >= 3) {
        revealedInfo.strongRoles = [...opponentInfo.strongRoles];
        if (opponentInfo.weakRoles.length > 0) {
          revealedInfo.weakRoles = [opponentInfo.weakRoles[0]];
        }
      }
      
      // 分析等级5：显示所有信息
      if (analyticsLevel >= 5) {
        revealedInfo.weakRoles = [...opponentInfo.weakRoles];
      }
      
      setVisibleOpponentInfo(revealedInfo);
    }
  }, [opponentInfo, analyticsLevel]);
  
  // 更新战术设置
  const updateTactic = (side, tactic) => {
    setTactics(prev => ({
      ...prev,
      [side]: tactic
    }));
  };
  
  // 更新选手角色
  const updatePlayerRole = (index, role) => {
    const newRoles = [...playerRoles];
    
    // 检查是否有其他选手已经分配了这个角色
    const existingIndex = newRoles.findIndex(r => r === role);
    
    // 如果找到了使用该角色的其他选手，交换他们的角色
    if (existingIndex !== -1 && existingIndex !== index) {
      const oldRole = newRoles[index];
      newRoles[existingIndex] = oldRole;
    }
    
    // 分配新角色
    newRoles[index] = role;
    setPlayerRoles(newRoles);
  };
  
  // 角色是否已被分配
  const isRoleAssigned = (role) => {
    return playerRoles.includes(role);
  };
  
  // 检查是否所有玩家都分配了角色
  const areAllRolesAssigned = () => {
    // 确保每个玩家都有一个角色
    return playerRoles.length === players.length;
  };
  
  // 提交战术和角色设置
  const confirmTactics = () => {
    if (areAllRolesAssigned()) {
      onTacticsConfirmed({
        tactics: tactics,
        roles: playerRoles
      });
    }
  };
  
  // 自动分配角色
  const autoAssignRoles = () => {
    // 获取所有可用角色
    const availableRoles = Object.keys(ROLES);
    // 创建新的角色分配数组
    const newRoles = [...players.map(() => '')];
    
    // 为每个选手找到最适合的角色
    players.forEach((player, index) => {
      let bestRole = '';
      
      // 根据选手属性匹配最佳角色
      if (player.aim > player.awareness && player.aim > player.reflex) {
        // 高瞄准 -> 主狙
        bestRole = 'awper';
      } else if (player.reflex > player.aim && player.reflex > player.awareness) {
        // 高反应 -> 突破手
        bestRole = 'entry';
      } else if (player.awareness > player.aim && player.awareness > player.reflex) {
        // 高意识 -> 指挥或支援
        bestRole = Math.random() > 0.5 ? 'igl' : 'support';
      } else {
        // 平衡型 -> 潜伏者
        bestRole = 'lurker';
      }
      
      // 暂存最佳角色
      newRoles[index] = bestRole;
    });
    
    // 检查角色分配冲突
    const usedRoles = new Set();
    const unassignedIndices = [];
    
    // 先尝试分配没有冲突的角色
    newRoles.forEach((role, index) => {
      if (!usedRoles.has(role)) {
        usedRoles.add(role);
      } else {
        // 冲突角色，标记为待分配
        newRoles[index] = '';
        unassignedIndices.push(index);
      }
    });
    
    // 为未分配到角色的选手分配剩余角色
    unassignedIndices.forEach(index => {
      // 寻找未使用的角色
      for (const role of availableRoles) {
        if (!usedRoles.has(role)) {
          newRoles[index] = role;
          usedRoles.add(role);
          break;
        }
      }
    });
    
    // 确保所有角色都已分配
    const missingRoles = availableRoles.filter(role => !usedRoles.has(role));
    if (missingRoles.length > 0 && unassignedIndices.length === 0) {
      // 如果有未使用的角色但所有选手已分配，随机替换一些角色
      missingRoles.forEach(role => {
        const randomIndex = Math.floor(Math.random() * newRoles.length);
        newRoles[randomIndex] = role;
      });
    }
    
    // 更新角色分配
    setPlayerRoles(newRoles);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">战术设置</h2>
        <div className="text-sm text-gray-600">
          在 {selectedMap.name} 地图上的战术部署
        </div>
      </div>
      
      {/* 战术选择部分 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* T方战术 */}
        <div className="border rounded-lg p-4 bg-white">
          <h3 className="font-medium mb-3">T方战术倾向</h3>
          <div className="space-y-3">
            {Object.keys(TACTICS).map(tactic => (
              <div 
                key={`T-${tactic}`}
                className={`p-3 border rounded cursor-pointer ${
                  tactics.T === tactic ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => updateTactic('T', tactic)}
              >
                <div className="flex-1 p-3 border rounded">
                  <h4 className="font-medium">{TACTICS[tactic].name}</h4>
                  <div className="text-sm mt-1 text-gray-600">
                    {TACTICS[tactic].description}
                  </div>
                  <div className="mt-2 text-xs flex items-center">
                    <span className={`rounded-full w-2 h-2 ${
                      tactic === 'aggressive' ? 'bg-red-500' : 
                      tactic === 'balanced' ? 'bg-yellow-500' : 'bg-green-500'
                    } mr-1`}></span>
                    <span>风险等级: {TACTICS[tactic].riskLevel}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-center">
                    <div className={`p-1 rounded ${TACTICS[tactic].aimMultiplier > 1 ? 'bg-green-100' : TACTICS[tactic].aimMultiplier < 1 ? 'bg-red-100' : 'bg-gray-100'}`}>
                      瞄准: {TACTICS[tactic].aimMultiplier > 1 ? '+' : ''}{Math.round((TACTICS[tactic].aimMultiplier - 1) * 100)}%
                    </div>
                    <div className={`p-1 rounded ${TACTICS[tactic].awarenessMultiplier > 1 ? 'bg-green-100' : TACTICS[tactic].awarenessMultiplier < 1 ? 'bg-red-100' : 'bg-gray-100'}`}>
                      意识: {TACTICS[tactic].awarenessMultiplier > 1 ? '+' : ''}{Math.round((TACTICS[tactic].awarenessMultiplier - 1) * 100)}%
                    </div>
                    <div className={`p-1 rounded ${TACTICS[tactic].reflexMultiplier > 1 ? 'bg-green-100' : TACTICS[tactic].reflexMultiplier < 1 ? 'bg-red-100' : 'bg-gray-100'}`}>
                      反应: {TACTICS[tactic].reflexMultiplier > 1 ? '+' : ''}{Math.round((TACTICS[tactic].reflexMultiplier - 1) * 100)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* CT方战术 */}
        <div className="border rounded-lg p-4 bg-white">
          <h3 className="font-medium mb-3">CT方战术倾向</h3>
          <div className="space-y-3">
            {Object.keys(TACTICS).map(tactic => (
              <div 
                key={`CT-${tactic}`}
                className={`p-3 border rounded cursor-pointer ${
                  tactics.CT === tactic ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => updateTactic('CT', tactic)}
              >
                <div className="flex-1 p-3 border rounded">
                  <h4 className="font-medium">{TACTICS[tactic].name}</h4>
                  <div className="text-sm mt-1 text-gray-600">
                    {TACTICS[tactic].description}
                  </div>
                  <div className="mt-2 text-xs flex items-center">
                    <span className={`rounded-full w-2 h-2 ${
                      tactic === 'aggressive' ? 'bg-red-500' : 
                      tactic === 'balanced' ? 'bg-yellow-500' : 'bg-green-500'
                    } mr-1`}></span>
                    <span>风险等级: {TACTICS[tactic].riskLevel}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-center">
                    <div className={`p-1 rounded ${TACTICS[tactic].aimMultiplier > 1 ? 'bg-green-100' : TACTICS[tactic].aimMultiplier < 1 ? 'bg-red-100' : 'bg-gray-100'}`}>
                      瞄准: {TACTICS[tactic].aimMultiplier > 1 ? '+' : ''}{Math.round((TACTICS[tactic].aimMultiplier - 1) * 100)}%
                    </div>
                    <div className={`p-1 rounded ${TACTICS[tactic].awarenessMultiplier > 1 ? 'bg-green-100' : TACTICS[tactic].awarenessMultiplier < 1 ? 'bg-red-100' : 'bg-gray-100'}`}>
                      意识: {TACTICS[tactic].awarenessMultiplier > 1 ? '+' : ''}{Math.round((TACTICS[tactic].awarenessMultiplier - 1) * 100)}%
                    </div>
                    <div className={`p-1 rounded ${TACTICS[tactic].reflexMultiplier > 1 ? 'bg-green-100' : TACTICS[tactic].reflexMultiplier < 1 ? 'bg-red-100' : 'bg-gray-100'}`}>
                      反应: {TACTICS[tactic].reflexMultiplier > 1 ? '+' : ''}{Math.round((TACTICS[tactic].reflexMultiplier - 1) * 100)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* 对手情报信息（如果有） */}
      {opponentInfo && analyticsLevel > 0 && (
        <div className="border rounded-lg p-4 bg-blue-50">
          <h3 className="font-medium mb-2">对手情报信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-2 bg-white rounded border">
              <div className="text-sm text-gray-600">偏好战术:</div>
              <div className="font-medium">{visibleOpponentInfo.preferredTactics}</div>
            </div>
            <div className="p-2 bg-white rounded border">
              <div className="text-sm text-gray-600">强势角色:</div>
              <div className="font-medium">
                {visibleOpponentInfo.strongRoles.length > 0 
                  ? visibleOpponentInfo.strongRoles.map(role => ROLES[role]?.name).join(', ')
                  : '未知'}
              </div>
            </div>
            <div className="p-2 bg-white rounded border">
              <div className="text-sm text-gray-600">弱势角色:</div>
              <div className="font-medium">
                {visibleOpponentInfo.weakRoles.length > 0 
                  ? visibleOpponentInfo.weakRoles.map(role => ROLES[role]?.name).join(', ')
                  : '未知'}
              </div>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-600">
            基于分析办公室等级 {analyticsLevel} 的情报。提升分析办公室以获取更多对手信息。
          </div>
        </div>
      )}
      
      {/* 角色分配部分 */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">选手角色分配</h3>
          <button 
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            onClick={autoAssignRoles}
          >
            自动分配角色
          </button>
        </div>
        
        <div className="border rounded-lg bg-white overflow-hidden">
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
                  角色
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {players.map((player, index) => (
                <tr key={player.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{player.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      瞄准: {player.aim} | 意识: {player.awareness} | 反应: {player.reflex}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select 
                      className="border rounded px-3 py-1 bg-white text-gray-900"
                      value={playerRoles[index] || ''}
                      onChange={(e) => updatePlayerRole(index, e.target.value)}
                    >
                      <option value="">-- 选择角色 --</option>
                      {Object.keys(ROLES).map(roleKey => (
                        <option 
                          key={roleKey} 
                          value={roleKey}
                          disabled={isRoleAssigned(roleKey) && playerRoles[index] !== roleKey}
                        >
                          {ROLES[roleKey].name} - {ROLES[roleKey].specialAbility}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* 确认按钮 */}
      <div className="flex justify-end mt-6">
        <button 
          className={`px-6 py-2 rounded font-medium ${
            areAllRolesAssigned()
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!areAllRolesAssigned()}
          onClick={confirmTactics}
        >
          确认战术设置
        </button>
      </div>
    </div>
  );
}

export default TacticsSetup; 