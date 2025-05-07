import { useState } from 'react';
import { MAPS } from './MatchUtils';

/**
 * 地图选择组件
 * 允许用户从可用地图池中选择比赛地图
 */
function MapSelection({ onMapSelected, previousMapPerformance = {} }) {
  const [selectedMap, setSelectedMap] = useState(null);
  const [hoveredMap, setHoveredMap] = useState(null);
  
  // 获取所有可用地图
  const availableMaps = Object.keys(MAPS);
  
  // 处理地图选择
  const handleMapSelect = (mapKey) => {
    setSelectedMap(mapKey);
  };
  
  // 确认选择并前往下一步
  const confirmSelection = () => {
    if (selectedMap) {
      onMapSelected(selectedMap);
    }
  };
  
  // 渲染单个地图卡片
  const renderMapCard = (mapKey) => {
    const map = MAPS[mapKey];
    const isSelected = selectedMap === mapKey;
    const isHovered = hoveredMap === mapKey;
    const teamPerformance = previousMapPerformance[mapKey] || { winRate: '未知', playedCount: 0 };
    
    return (
      <div 
        key={mapKey}
        className={`border rounded-lg overflow-hidden cursor-pointer transition-all transform ${
          isSelected 
            ? 'border-blue-500 shadow-lg scale-105' 
            : isHovered 
              ? 'border-gray-400 shadow-md scale-102' 
              : 'border-gray-300 hover:shadow'
        }`}
        onClick={() => handleMapSelect(mapKey)}
        onMouseEnter={() => setHoveredMap(mapKey)}
        onMouseLeave={() => setHoveredMap(null)}
      >
        <div className="relative h-40 bg-gray-200 overflow-hidden">
          {/* 地图图片 */}
          <img 
            src={`/images/maps/${map.image}`} 
            alt={map.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/maps/placeholder.jpg';
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <span className="text-2xl font-bold text-white drop-shadow-lg">{map.name}</span>
          </div>
        </div>
        
        <div className="p-3 bg-white">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">{map.name}</h3>
            {teamPerformance.playedCount > 0 && (
              <span className={`text-sm font-medium ${
                teamPerformance.winRate > 50 ? 'text-green-600' : 'text-red-600'
              }`}>
                胜率: {teamPerformance.winRate}%
              </span>
            )}
          </div>
          
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">狙击手友好度:</span>
              <RatingBar value={(map.sniperFriendly - 0.8) * 5} />
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">突破手友好度:</span>
              <RatingBar value={(map.entryFriendly - 0.8) * 5} />
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">战术复杂度:</span>
              <RatingBar value={(map.tacticalComplexity - 0.8) * 5} />
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">CT方倾向性:</span>
              <RatingBar value={(map.ctSided - 0.8) * 3.3} /> {/* 缩放到合适范围 */}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // 评分条组件
  const RatingBar = ({ value }) => {
    // 确保值在0-5之间
    const normalizedValue = Math.max(0, Math.min(5, value));
    
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map(i => (
          <div 
            key={i}
            className={`w-2 h-2 rounded-full mx-0.5 ${
              i <= normalizedValue ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">选择比赛地图</h2>
        <div className="text-sm text-gray-600">
          地图特性将影响比赛进程和选手表现
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableMaps.map(mapKey => renderMapCard(mapKey))}
      </div>
      
      {selectedMap && (
        <div className="p-4 border-t mt-4">
          <div className="flex flex-col md:flex-row items-start justify-between">
            <div className="mb-4 md:mb-0 md:mr-4 flex-grow">
              <h3 className="font-semibold">已选择: {MAPS[selectedMap].name}</h3>
              <p className="text-sm text-gray-600 mt-1">{MAPS[selectedMap].description}</p>
              
              <div className="mt-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
                <h4 className="font-medium text-blue-800 mb-2">地图战术影响:</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-2 rounded border">
                    <div className="text-sm font-medium">狙击手友好度: {Math.round((MAPS[selectedMap].sniperFriendly - 1) * 100)}%</div>
                    <div className="text-xs text-gray-600">
                      使用主狙角色的选手属性将被调整 {MAPS[selectedMap].sniperFriendly > 1 ? "提升" : "降低"}
                    </div>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <div className="text-sm font-medium">突破手友好度: {Math.round((MAPS[selectedMap].entryFriendly - 1) * 100)}%</div>
                    <div className="text-xs text-gray-600">
                      激进战术效果将被调整 {MAPS[selectedMap].entryFriendly > 1 ? "提升" : "降低"}
                    </div>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <div className="text-sm font-medium">战术复杂度: {Math.round((MAPS[selectedMap].tacticalComplexity - 1) * 100)}%</div>
                    <div className="text-xs text-gray-600">
                      指挥角色的影响被调整 {MAPS[selectedMap].tacticalComplexity > 1 ? "提升" : "降低"}
                    </div>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <div className="text-sm font-medium">CT方倾向性: {Math.round((MAPS[selectedMap].ctSided - 1) * 100)}%</div>
                    <div className="text-xs text-gray-600">
                      CT方实力乘以 {MAPS[selectedMap].ctSided.toFixed(2)}，T方实力乘以 {(2 - MAPS[selectedMap].ctSided).toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 text-xs text-gray-500">
                  注: 地图特性会影响比赛的进攻防守双方，正确的战术选择和角色分配可以克服地图不利因素
                </div>
              </div>
            </div>
            <button 
              className="px-6 py-2 bg-blue-600 text-white rounded font-medium"
              onClick={confirmSelection}
            >
              确认并继续
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapSelection; 