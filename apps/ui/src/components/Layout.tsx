import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export default function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const navigate = useNavigate();

  const handleTabClick = (tab: string) => {
    if (setActiveTab) {
      setActiveTab(tab);
    }
    navigate(`/${tab}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Fantasy Command Center
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => handleTabClick('research-players')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'research-players'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🧠 Research Players
            </button>
            <button
              onClick={() => handleTabClick('nfl-schedule')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'nfl-schedule'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🏈 NFL Schedule
            </button>
            <button
              onClick={() => handleTabClick('matchups')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'matchups'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🆚 Player Matchups
            </button>
            <button
              onClick={() => handleTabClick('fantasy-pros-admin')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'fantasy-pros-admin'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 FantasyPros Admin
            </button>
            <button
              onClick={() => handleTabClick('load-my-team')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'load-my-team'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🧍‍♂️ Load My Team
            </button>
            <button
              onClick={() => handleTabClick('league')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'league'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ⚙️ League Settings
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
} 