import { useState, useEffect } from 'react'
import './App.css'
import MatchModule from './modules/match/MatchModule'
import PlayerManagementModule from './modules/player/PlayerManagementModule'
import RecruitmentModule from './modules/recruitment/RecruitmentModule'
import TeamManagementModule from './modules/team/TeamManagementModule'

function App() {
  console.log("App component initializing...");
  
  const [activeModule, setActiveModule] = useState('dashboard')
  const [isDarkMode, setIsDarkMode] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  )
  const [teamData, setTeamData] = useState({
    name: "DefaultTeam",
    funds: 100000,
    players: [
      { id: 1, name: 'Player1', aim: 70, awareness: 65, reflex: 60, salary: 5000 },
      { id: 2, name: 'Player2', aim: 68, awareness: 60, reflex: 62, salary: 4500 },
      { id: 3, name: 'Player3', aim: 65, awareness: 70, reflex: 58, salary: 4800 },
      { id: 4, name: 'Player4', aim: 72, awareness: 63, reflex: 61, salary: 5200 },
      { id: 5, name: 'Player5', aim: 66, awareness: 67, reflex: 59, salary: 4600 },
    ],
    facilities: {
      trainingCenter: 1,
      gamingHouse: 1,
      analyticsOffice: 1
    },
    sponsors: [],
    reputation: 50
  })

  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setIsDarkMode(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // 切换主题
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('light-mode', !isDarkMode);
  };

  // 应用主题
  useEffect(() => {
    document.documentElement.classList.toggle('light-mode', !isDarkMode);
  }, [isDarkMode]);

  // 渲染当前活跃的模块
  const renderActiveModule = () => {
    try {
      switch(activeModule) {
        case 'match':
          console.log("Rendering MatchModule with teamData:", teamData);
          return <MatchModule teamData={teamData} setTeamData={setTeamData} />
        case 'player':
          return <PlayerManagementModule teamData={teamData} setTeamData={setTeamData} />
        case 'recruitment':
          return <RecruitmentModule teamData={teamData} setTeamData={setTeamData} />
        case 'team':
          return <TeamManagementModule teamData={teamData} setTeamData={setTeamData} />
        default:
          return <Dashboard teamData={teamData} />
      }
    } catch (error) {
      console.error("Error rendering module:", error);
      return (
        <div className="p-4 border border-red-500 bg-red-100 rounded-lg">
          <h2 className="text-xl font-bold text-red-700 mb-2">模块加载出错</h2>
          <p className="mb-4">渲染模块时发生错误，请尝试重新加载或者选择其他模块。</p>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => setActiveModule('dashboard')}
          >
            返回仪表盘
          </button>
        </div>
      );
    }
  }

  // 简单的仪表盘组件，显示团队概览信息
  const Dashboard = ({ teamData }) => (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-4">团队概览</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-white rounded shadow">
          <h3 className="font-bold">团队名称</h3>
          <p>{teamData.name}</p>
        </div>
        <div className="p-3 bg-white rounded shadow">
          <h3 className="font-bold">资金</h3>
          <p>${teamData.funds.toLocaleString()}</p>
        </div>
        <div className="p-3 bg-white rounded shadow">
          <h3 className="font-bold">选手数量</h3>
          <p>{teamData.players.length}</p>
        </div>
        <div className="p-3 bg-white rounded shadow">
          <h3 className="font-bold">声誉</h3>
          <p>{teamData.reputation}/100</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-gray-800 text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">CS 电竞经理</h1>
          <div className="flex space-x-3 items-center">
            <button
              className="p-2 rounded-full bg-gray-700 hover:bg-gray-600"
              onClick={toggleTheme}
              title={isDarkMode ? "切换到浅色模式" : "切换到深色模式"}
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"/>
                </svg>
              )}
            </button>
            <span className="bg-green-600 px-3 py-1 rounded">
              ${teamData.funds.toLocaleString()}
            </span>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 侧边导航栏 */}
        <nav className="w-56 bg-gray-700 text-white p-4">
          <ul className="space-y-2">
            <li>
              <button 
                className={`w-full text-left p-2 rounded ${activeModule === 'dashboard' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
                onClick={() => setActiveModule('dashboard')}
              >
                仪表盘
              </button>
            </li>
            <li>
              <button 
                className={`w-full text-left p-2 rounded ${activeModule === 'match' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
                onClick={() => setActiveModule('match')}
              >
                比赛模块
              </button>
            </li>
            <li>
              <button 
                className={`w-full text-left p-2 rounded ${activeModule === 'player' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
                onClick={() => setActiveModule('player')}
              >
                选手管理
              </button>
            </li>
            <li>
              <button 
                className={`w-full text-left p-2 rounded ${activeModule === 'recruitment' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
                onClick={() => setActiveModule('recruitment')}
              >
                选手招募
              </button>
            </li>
            <li>
              <button 
                className={`w-full text-left p-2 rounded ${activeModule === 'team' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
                onClick={() => setActiveModule('team')}
              >
                战队管理
              </button>
            </li>
          </ul>
        </nav>

        {/* 内容区域 */}
        <main className="flex-1 p-6 overflow-auto">
          {renderActiveModule()}
        </main>
      </div>
    </div>
  )
}

export default App
