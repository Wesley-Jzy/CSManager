import { useState, useEffect } from 'react';
import { simulateFullMatch } from './MatchUtils';

// 比赛相关常量
const MATCH_STATES = {
  PREPARING: 'preparing',
  SIMULATING: 'simulating',
  COMPLETED: 'completed'
};

const PLAYBACK_SPEEDS = {
  SLOW: 1,
  MEDIUM: 2,
  FAST: 3
};

const DELAY_BY_SPEED = {
  [PLAYBACK_SPEEDS.SLOW]: 1500,
  [PLAYBACK_SPEEDS.MEDIUM]: 800,
  [PLAYBACK_SPEEDS.FAST]: 300
};

const MATCH_PHASES = {
  FIRST_HALF_END: 12,
  TOTAL_ROUNDS: 24
};

const SIDES = {
  T: 'T',
  CT: 'CT'
};

const TEAMS = {
  HOME: 'A',
  AWAY: 'B'
};

const MATCH_POINTS = {
  T_SIDE: 12,
  CT_SIDE: 11
};

const OVERTIME = {
  ROUNDS_PER_HALF: 3,
  WIN_THRESHOLD: 4
};

const REPUTATION_CHANGE = {
  WIN: 5,
  LOSS: -3
};

/**
 * 比赛模拟与结果展示组件
 * 负责显示比赛进程和最终结果
 */
function MatchSimulation({ 
  teamData, 
  opponentData, 
  mapKey, 
  tacticsSetup, 
  facilities, 
  onMatchComplete,
  onRestart
}) {
  // 比赛状态
  const [matchState, setMatchState] = useState(MATCH_STATES.PREPARING);
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState({ [TEAMS.HOME]: 0, [TEAMS.AWAY]: 0 });
  const [matchResult, setMatchResult] = useState(null);
  const [showingHighlight, setShowingHighlight] = useState(null);
  
  // 自动播放设置
  const [autoPlay, setAutoPlay] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(PLAYBACK_SPEEDS.SLOW);
  
  // 开始比赛
  useEffect(() => {
    if (matchState === MATCH_STATES.PREPARING) {
      // 短暂延迟后开始比赛
      const timer = setTimeout(() => {
        setMatchState(MATCH_STATES.SIMULATING);
        
        // 准备比赛数据
        const teamA = {
          players: teamData.players,
          tactics: tacticsSetup.tactics,
          roles: tacticsSetup.roles
        };
        
        try {
          // 模拟完整比赛
          console.log('Starting match simulation with:', teamA, opponentData, mapKey, facilities);
          const result = simulateFullMatch(teamA, opponentData, mapKey, facilities);
          console.log('Match simulation result:', result);
          setMatchResult(result);
          
          // 如果自动播放关闭，则立即完成模拟
          if (!autoPlay) {
            setMatchState(MATCH_STATES.COMPLETED);
            setScore({ 
              [TEAMS.HOME]: result.scoreA, 
              [TEAMS.AWAY]: result.scoreB 
            });
            setCurrentRound(result.rounds.length);
          }
        } catch (error) {
          console.error('Error during match simulation:', error);
          // 出错时显示一个基本的结果，避免白屏
          setMatchResult({
            scoreA: 16,
            scoreB: 10,
            winner: TEAMS.HOME,
            rounds: Array(MATCH_PHASES.TOTAL_ROUNDS + 2).fill().map((_, i) => ({
              winner: i < 16 ? TEAMS.HOME : TEAMS.AWAY,
              side: i < MATCH_PHASES.FIRST_HALF_END ? 
                { [TEAMS.HOME]: SIDES.T, [TEAMS.AWAY]: SIDES.CT } : 
                { [TEAMS.HOME]: SIDES.CT, [TEAMS.AWAY]: SIDES.T }
            })),
            overtimeRounds: [],
            highlights: [],
            mvp: teamData.players[0],
            facilityBonus: {
              teamWorkBonus: 5,
              prepBonus: 3,
              intelBonus: 5,
              totalBonus: 8
            }
          });
          setMatchState(MATCH_STATES.COMPLETED);
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [matchState, teamData, opponentData, mapKey, tacticsSetup, facilities, autoPlay]);
  
  // 处理比赛回合播放
  useEffect(() => {
    if (matchState === MATCH_STATES.SIMULATING && matchResult && autoPlay) {
      // 如果还有回合要播放
      if (currentRound < matchResult.rounds.length) {
        // 根据播放速度设置延迟
        const delay = DELAY_BY_SPEED[playbackSpeed];
        
        const timer = setTimeout(() => {
          const nextRound = currentRound + 1;
          setCurrentRound(nextRound);
          
          // 更新比分
          const roundsCompleted = matchResult.rounds.slice(0, nextRound);
          const scoreA = roundsCompleted.filter(r => r.winner === TEAMS.HOME).length;
          const scoreB = roundsCompleted.filter(r => r.winner === TEAMS.AWAY).length;
          setScore({ [TEAMS.HOME]: scoreA, [TEAMS.AWAY]: scoreB });
          
          // 显示回合亮点（如果有）
          const currentRoundData = matchResult.rounds[currentRound];
          if (currentRoundData && currentRoundData.highlight) {
            setShowingHighlight(currentRoundData.highlight);
            
            // 亮点显示一段时间后清除
            setTimeout(() => {
              setShowingHighlight(null);
            }, 2000);
          }
          
        }, delay);
        
        return () => clearTimeout(timer);
      } else if (matchResult.overtimeRounds && matchResult.overtimeRounds.length > 0) {
        // 处理加时赛回合
        const overtimeRoundIndex = currentRound - matchResult.rounds.length;
        
        if (overtimeRoundIndex < matchResult.overtimeRounds.length) {
          const delay = DELAY_BY_SPEED[playbackSpeed];
          
          const timer = setTimeout(() => {
            const nextOvertimeRound = overtimeRoundIndex + 1;
            setCurrentRound(matchResult.rounds.length + nextOvertimeRound);
            
            // 更新比分
            const normalRoundsScore = {
              [TEAMS.HOME]: matchResult.rounds.filter(r => r.winner === TEAMS.HOME).length,
              [TEAMS.AWAY]: matchResult.rounds.filter(r => r.winner === TEAMS.AWAY).length
            };
            
            const overtimeRoundsCompleted = matchResult.overtimeRounds.slice(0, nextOvertimeRound);
            const overtimeScoreA = overtimeRoundsCompleted.filter(r => r.winner === TEAMS.HOME).length;
            const overtimeScoreB = overtimeRoundsCompleted.filter(r => r.winner === TEAMS.AWAY).length;
            
            setScore({ 
              [TEAMS.HOME]: normalRoundsScore[TEAMS.HOME] + overtimeScoreA, 
              [TEAMS.AWAY]: normalRoundsScore[TEAMS.AWAY] + overtimeScoreB 
            });
            
            // 显示回合亮点（如果有）
            const currentOvertimeRound = matchResult.overtimeRounds[overtimeRoundIndex];
            if (currentOvertimeRound && currentOvertimeRound.highlight) {
              setShowingHighlight(currentOvertimeRound.highlight);
              
              // 亮点显示一段时间后清除
              setTimeout(() => {
                setShowingHighlight(null);
              }, 2000);
            }
            
          }, delay);
          
          return () => clearTimeout(timer);
        } else {
          // 所有回合都播放完成
          setMatchState(MATCH_STATES.COMPLETED);
          if (onMatchComplete) onMatchComplete(matchResult);
        }
      } else {
        // 所有回合都播放完成
        setMatchState(MATCH_STATES.COMPLETED);
        if (onMatchComplete) onMatchComplete(matchResult);
      }
    }
  }, [matchState, matchResult, currentRound, autoPlay, playbackSpeed, onMatchComplete]);
  
  // 切换自动播放状态
  const toggleAutoPlay = () => {
    if (!autoPlay && matchState === MATCH_STATES.SIMULATING) {
      // 重新开始自动播放
      setAutoPlay(true);
    } else {
      setAutoPlay(!autoPlay);
    }
  };
  
  // 跳过动画直接显示结果
  const skipToResult = () => {
    if (matchResult) {
      setMatchState(MATCH_STATES.COMPLETED);
      setScore({ [TEAMS.HOME]: matchResult.scoreA, [TEAMS.AWAY]: matchResult.scoreB });
      setCurrentRound(matchResult.rounds.length + (matchResult.overtimeRounds?.length || 0));
      if (onMatchComplete) onMatchComplete(matchResult);
    }
  };
  
  // 获取当前回合阶段描述
  const getRoundPhaseText = () => {
    if (!matchResult) return '';
    
    if (currentRound === 0) {
      return '准备开始比赛';
    } else if (currentRound < MATCH_PHASES.FIRST_HALF_END) {
      return '上半场';
    } else if (currentRound === MATCH_PHASES.FIRST_HALF_END) {
      return '上半场结束';
    } else if (currentRound <= MATCH_PHASES.TOTAL_ROUNDS) {
      return '下半场';
    } else if (matchResult.overtimeRounds && matchResult.overtimeRounds.length > 0) {
      const overtimeRound = currentRound - matchResult.rounds.length;
      if (overtimeRound >= 0 && overtimeRound < matchResult.overtimeRounds.length) {
        const overtimeHalf = Math.floor(overtimeRound / OVERTIME.ROUNDS_PER_HALF) + 1;
        const roundInHalf = overtimeRound % OVERTIME.ROUNDS_PER_HALF + 1;
        return `加时赛 ${overtimeHalf} - 第 ${roundInHalf} 回合`;
      }
    }
    
    return '比赛结束';
  };
  
  // 找出回合的关键点描述
  const getRoundDescription = (roundIndex) => {
    if (!matchResult || roundIndex >= matchResult.rounds.length) return '';
    
    const round = matchResult.rounds[roundIndex];
    if (!round || !round.side) return '';
    
    const side = round.side;
    
    // 特殊回合描述
    if (roundIndex === 0 || roundIndex === MATCH_PHASES.FIRST_HALF_END) {
      return '手枪局';
    }
    
    // 赛点描述
    if ((score[TEAMS.HOME] === MATCH_POINTS.T_SIDE && side[TEAMS.HOME] === SIDES.T) || 
        (score[TEAMS.HOME] === MATCH_POINTS.CT_SIDE && side[TEAMS.HOME] === SIDES.CT)) {
      return '赛点局！';
    }
    
    if ((score[TEAMS.AWAY] === MATCH_POINTS.T_SIDE && side[TEAMS.AWAY] === SIDES.T) || 
        (score[TEAMS.AWAY] === MATCH_POINTS.CT_SIDE && side[TEAMS.AWAY] === SIDES.CT)) {
      return '保命局！';
    }
    
    return '';
  };
  
  // 根据比赛阶段渲染不同内容
  const renderByMatchState = () => {
    if (matchState === MATCH_STATES.PREPARING) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-xl font-semibold mb-4">正在准备比赛...</div>
            <div className="animate-pulse text-gray-600">加载地图 {mapKey}</div>
          </div>
        </div>
      );
    } else if (matchState === MATCH_STATES.SIMULATING) {
      return (
        <div className="space-y-6">
          {/* 比分和回合信息 */}
          <div className="grid grid-cols-3 gap-4 items-center">
            <div className="text-center">
              <div className="text-lg font-medium">{teamData.name}</div>
              <div className="text-4xl font-bold mt-2">{score[TEAMS.HOME]}</div>
              <div className="text-sm text-gray-600 mt-1">
                {currentRound <= MATCH_PHASES.FIRST_HALF_END ? SIDES.T : SIDES.CT}
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <div className="text-sm font-medium text-gray-600">
                {getRoundPhaseText()}
              </div>
              <div className="text-xl font-bold my-1">
                回合 {currentRound}
              </div>
              <div className="text-sm font-medium text-red-600">
                {getRoundDescription(currentRound - 1)}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-medium">{opponentData.name}</div>
              <div className="text-4xl font-bold mt-2">{score[TEAMS.AWAY]}</div>
              <div className="text-sm text-gray-600 mt-1">
                {currentRound <= MATCH_PHASES.FIRST_HALF_END ? SIDES.CT : SIDES.T}
              </div>
            </div>
          </div>
          
          {/* 回合进度条 */}
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div 
              className="h-2 bg-blue-600 rounded-full transition-all duration-200"
              style={{ 
                width: `${Math.min(currentRound / MATCH_PHASES.TOTAL_ROUNDS, 1) * 100}%` 
              }}
            />
          </div>
          
          {/* 回合亮点 */}
          {showingHighlight && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg animate-pulse">
              <div className="font-medium">回合亮点</div>
              <div className="mt-1">{showingHighlight.situation}</div>
            </div>
          )}
          
          {/* 回合历史记录 */}
          <div className="border rounded-lg bg-white p-4">
            <h3 className="font-medium mb-3">回合记录</h3>
            <div className="flex overflow-x-auto pb-2">
              {matchResult && matchResult.rounds.slice(0, currentRound).map((round, index) => (
                <div 
                  key={index}
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mx-1 ${
                    round.winner === TEAMS.HOME 
                      ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                      : 'bg-red-100 text-red-700 border border-red-300'
                  }`}
                  title={`第 ${index + 1} 回合: ${round.winner === TEAMS.HOME ? teamData.name : opponentData.name} 胜`}
                >
                  {round.winner}
                </div>
              ))}
            </div>
          </div>
          
          {/* 控制按钮 */}
          <div className="flex justify-between items-center border-t pt-4">
            <div className="flex items-center space-x-3">
              <button
                className="px-3 py-1 border rounded text-sm"
                onClick={toggleAutoPlay}
              >
                {autoPlay ? '⏸️ 暂停' : '▶️ 继续'}
              </button>
              
              <div className="flex items-center space-x-1 text-sm">
                <span>速度:</span>
                {[PLAYBACK_SPEEDS.SLOW, PLAYBACK_SPEEDS.MEDIUM, PLAYBACK_SPEEDS.FAST].map(speed => (
                  <button
                    key={speed}
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      playbackSpeed === speed 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                    onClick={() => setPlaybackSpeed(speed)}
                  >
                    {speed}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              className="px-3 py-1 border rounded text-sm"
              onClick={skipToResult}
            >
              跳过 ≫
            </button>
          </div>
        </div>
      );
    } else if (matchState === MATCH_STATES.COMPLETED) {
      return renderMatchResult();
    }
  };
  
  // 渲染比赛结果
  const renderMatchResult = () => {
    if (!matchResult) return null;
    
    const isWinner = matchResult.winner === TEAMS.HOME;
    const mvpPlayer = matchResult.mvp || { name: '未知选手' };
    
    return (
      <div className="space-y-6">
        {/* 比赛结果 */}
        <div className={`p-6 rounded-lg ${
          isWinner ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="text-center mb-4">
            <div className="text-xl font-bold">
              {isWinner ? '恭喜！你赢得了比赛' : '很遗憾，你输掉了比赛'}
            </div>
            <div className="text-gray-600">
              在 {mapKey} 地图上的 BO1 比赛
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 items-center mb-4">
            <div className="text-center">
              <div className="text-lg font-medium">{teamData.name}</div>
              <div className={`text-5xl font-bold mt-2 ${isWinner ? 'text-green-600' : ''}`}>
                {matchResult.scoreA}
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="text-3xl font-bold">VS</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-medium">{opponentData.name}</div>
              <div className={`text-5xl font-bold mt-2 ${!isWinner ? 'text-green-600' : ''}`}>
                {matchResult.scoreB}
              </div>
            </div>
          </div>
          
          {/* 比赛奖励信息 */}
          <div className="flex justify-center space-x-4">
            <div className="px-4 py-2 bg-white rounded-lg shadow-sm text-center">
              <div className="text-sm text-gray-600">奖金</div>
              <div className="font-medium">
                {isWinner ? `+$${opponentData.prize?.toLocaleString() || 5000}` : '$0'}
              </div>
            </div>
            
            <div className="px-4 py-2 bg-white rounded-lg shadow-sm text-center">
              <div className="text-sm text-gray-600">声誉变化</div>
              <div className={`font-medium ${isWinner ? 'text-green-600' : 'text-red-600'}`}>
                {isWinner ? `+${REPUTATION_CHANGE.WIN}` : REPUTATION_CHANGE.LOSS}
              </div>
            </div>
            
            <div className="px-4 py-2 bg-white rounded-lg shadow-sm text-center">
              <div className="text-sm text-gray-600">比赛MVP</div>
              <div className="font-medium">
                {mvpPlayer ? mvpPlayer.name : '无'}
              </div>
            </div>
          </div>
        </div>
        
        {/* 比赛亮点 */}
        {matchResult.highlights && matchResult.highlights.length > 0 && (
          <div className="border rounded-lg bg-white p-4">
            <h3 className="font-medium mb-3">比赛亮点</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {matchResult.highlights.map((highlight, index) => (
                <div key={index} className="p-2 border rounded">
                  <div className="flex justify-between">
                    <span className="font-medium">第 {highlight.round} 回合</span>
                    <span className={highlight.team === TEAMS.HOME ? 'text-blue-600' : 'text-red-600'}>
                      {highlight.team === TEAMS.HOME ? teamData.name : opponentData.name}
                    </span>
                  </div>
                  <div className="text-sm mt-1">{highlight.situation}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 设施加成统计 */}
        <div className="border rounded-lg bg-white p-4">
          <h3 className="font-medium mb-3">团队加成</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-2 bg-gray-50 rounded border">
              <div className="text-xs text-gray-600">团队默契度</div>
              <div className="font-medium">+{matchResult.facilityBonus.teamWorkBonus}%</div>
            </div>
            <div className="p-2 bg-gray-50 rounded border">
              <div className="text-xs text-gray-600">比赛准备</div>
              <div className="font-medium">+{matchResult.facilityBonus.prepBonus}%</div>
            </div>
            <div className="p-2 bg-gray-50 rounded border">
              <div className="text-xs text-gray-600">对手情报</div>
              <div className="font-medium">+{matchResult.facilityBonus.intelBonus}%</div>
            </div>
            <div className="p-2 bg-blue-50 rounded border border-blue-200">
              <div className="text-xs text-gray-800">总体加成</div>
              <div className="font-medium text-blue-700">+{matchResult.facilityBonus.totalBonus}%</div>
            </div>
          </div>
        </div>
        
        {/* 操作按钮 */}
        <div className="flex justify-center pt-4 space-x-4">
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded"
            onClick={onRestart}
          >
            再进行一场比赛
          </button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">比赛进行中</h2>
      {renderByMatchState()}
    </div>
  );
}

export default MatchSimulation; 