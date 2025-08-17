import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Coins, Zap, Star, Trophy, Play, Lock } from 'lucide-react'
import NutsAndBolts from './components/games/NutsAndBolts.jsx'
import ColorBlocks from './components/games/ColorBlocks.jsx'
import WaterSort from './components/games/WaterSort.jsx'
import SandFall from './components/games/SandFall.jsx'
import FruitMerge from './components/games/FruitMerge.jsx'
import Snake from './components/games/Snake.jsx'
import TicTacToe from './components/games/TicTacToe.jsx'
import Memory from './components/games/Memory.jsx'
import './App.css'

// Game categories and data
const gameCategories = {
  puzzle: {
    title: "Puzzle Games",
    color: "bg-purple-500",
    games: [
      { id: 'nuts-bolts', name: 'Nuts and Bolts', icon: '🔩', levels: 50, unlocked: true },
      { id: 'color-blocks', name: 'Color Blocks', icon: '🟦', levels: 50, unlocked: true },
      { id: 'block-fill', name: 'Block Fill', icon: '🧩', levels: 50, unlocked: true },
      { id: 'water-sort', name: 'Water Sort', icon: '🧪', levels: 50, unlocked: true },
      { id: 'sand-fall', name: 'Sand Fall', icon: '⏳', levels: 50, unlocked: true },
      { id: 'fruit-merge', name: 'Fruit Merge', icon: '🍉', levels: 50, unlocked: true },
      { id: 'wooden-blocks', name: 'Wooden Blocks', icon: '🪵', levels: 50, unlocked: false },
      { id: 'dots-boxes', name: 'Dots and Boxes', icon: '⚫', levels: 50, unlocked: false },
      { id: 'sliding-puzzle', name: 'Sliding Puzzle', icon: '🔢', levels: 50, unlocked: false },
      { id: 'number-merge', name: 'Number Merge', icon: '🔢', levels: 50, unlocked: false },
      { id: 'cross-sums', name: 'Cross Sums', icon: '➕', levels: 50, unlocked: false },
      { id: 'number-connect', name: 'Number Connect', icon: '🔗', levels: 50, unlocked: false },
      { id: 'color-connect', name: 'Color Connect', icon: '🌈', levels: 50, unlocked: false },
      { id: 'number-puzzle', name: 'Number Puzzle', icon: '🔢', levels: 50, unlocked: false }
    ]
  },
  classic: {
    title: "Classic Games",
    color: "bg-blue-500",
    games: [
      { id: 'chess', name: 'Chess', icon: '♛', levels: 50, unlocked: false },
      { id: 'chess-puzzles', name: 'Chess Puzzles', icon: '♞', levels: 50, unlocked: false },
      { id: 'checkers', name: 'Checkers', icon: '⚫', levels: 50, unlocked: false },
      { id: 'backgammon', name: 'Backgammon', icon: '🎲', levels: 50, unlocked: false },
      { id: 'ludo', name: 'Ludo', icon: '🎯', levels: 50, unlocked: false },
      { id: 'solitaire', name: 'Solitaire', icon: '🃏', levels: 50, unlocked: false },
      { id: 'sudoku', name: 'Sudoku', icon: '🔢', levels: 50, unlocked: false },
      { id: 'hearts', name: 'Hearts', icon: '♥️', levels: 50, unlocked: false },
      { id: 'reversi', name: 'Reversi', icon: '⚪', levels: 50, unlocked: false },
      { id: 'spiderette', name: 'Spiderette', icon: '🕷️', levels: 50, unlocked: false },
      { id: 'spider-solitaire', name: 'Spider Solitaire', icon: '🕸️', levels: 50, unlocked: false },
      { id: 'freecell', name: 'Freecell', icon: '🃁', levels: 50, unlocked: false }
    ]
  },
  word: {
    title: "Word & Memory Games",
    color: "bg-green-500",
    games: [
      { id: 'word-guess', name: 'Word Guess', icon: '📝', levels: 50, unlocked: false },
      { id: 'hangman', name: 'Hangman', icon: '🎪', levels: 50, unlocked: false },
      { id: 'word-finder', name: 'Word Finder', icon: '🔍', levels: 50, unlocked: false },
      { id: 'memory', name: 'Memory', icon: '🧠', levels: 50, unlocked: true },
      { id: 'sound-memory', name: 'Sound Memory', icon: '🔊', levels: 50, unlocked: false },
      { id: 'minesweeper', name: 'Minesweeper', icon: '💣', levels: 50, unlocked: false }
    ]
  },
  action: {
    title: "Action & Arcade Games",
    color: "bg-red-500",
    games: [
      { id: 'ping-pong', name: 'Ping Pong', icon: '🏓', levels: 50, unlocked: false },
      { id: 'pool', name: 'Pool', icon: '🎱', levels: 50, unlocked: false },
      { id: 'soccer-pool', name: 'Soccer Pool', icon: '⚽', levels: 50, unlocked: false },
      { id: 'snake', name: 'Snake', icon: '🐍', levels: 50, unlocked: true },
      { id: 'flappy-jump', name: 'Flappy Jump', icon: '🏀', levels: 50, unlocked: false },
      { id: 'archery', name: 'Archery', icon: '🏹', levels: 50, unlocked: false },
      { id: 'darts', name: 'Darts', icon: '🎯', levels: 50, unlocked: false }
    ]
  },
  simple: {
    title: "Simple & Logic Games",
    color: "bg-yellow-500",
    games: [
      { id: 'tic-tac-toe', name: 'Tic Tac Toe', icon: '❌', levels: 50, unlocked: true },
      { id: '4-in-row', name: '4 in a Row', icon: '🔴', levels: 50, unlocked: false },
      { id: 'tap-match', name: 'Tap Match', icon: '🍓', levels: 50, unlocked: false },
      { id: 'number-slide', name: 'Number Slide', icon: '🔢', levels: 50, unlocked: false },
      { id: 'mancala', name: 'Mancala', icon: '🪨', levels: 50, unlocked: false },
      { id: 'yatzy', name: 'Yatzy', icon: '🎲', levels: 50, unlocked: false },
      { id: 'sea-battle', name: 'Sea Battle', icon: '🚢', levels: 50, unlocked: false },
      { id: 'color-cards', name: 'Color Cards', icon: '🃏', levels: 50, unlocked: false }
    ]
  }
}

// Mock user data
const initialUserData = {
  coins: 100,
  energy: 5,
  level: 1,
  experience: 0,
  unlockedGames: ['nuts-bolts', 'color-blocks', 'block-fill', 'water-sort'],
  gameProgress: {},
  dailyRewards: {
    lastClaimed: null,
    streak: 0,
    available: true
  },
  achievements: []
}

function GameCard({ game, category, onPlay, userCoins }) {
  const isUnlocked = game.unlocked
  const unlockCost = 50

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
      isUnlocked ? 'cursor-pointer' : 'opacity-60'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-2xl">{game.icon}</div>
          {!isUnlocked && <Lock className="w-4 h-4 text-gray-400" />}
        </div>
        
        <h3 className="font-semibold text-sm mb-1">{game.name}</h3>
        <p className="text-xs text-gray-600 mb-2">{game.levels} levels</p>
        
        <div className="flex items-center justify-between">
          {isUnlocked ? (
            <Button 
              size="sm" 
              className="w-full"
              onClick={() => onPlay(game.id, category)}
            >
              <Play className="w-3 h-3 mr-1" />
              Play
            </Button>
          ) : (
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full"
              disabled={userCoins < unlockCost}
            >
              <Coins className="w-3 h-3 mr-1" />
              {unlockCost}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function GameCategory({ category, categoryData, onPlay, userCoins }) {
  return (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        <div className={`w-4 h-4 rounded-full ${categoryData.color} mr-3`}></div>
        <h2 className="text-xl font-bold">{categoryData.title}</h2>
        <Badge variant="secondary" className="ml-2">
          {categoryData.games.length} games
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {categoryData.games.map((game) => (
          <GameCard 
            key={game.id}
            game={game}
            category={category}
            onPlay={onPlay}
            userCoins={userCoins}
          />
        ))}
      </div>
    </div>
  )
}

function Header({ userData, onWatchAd, onDailyReward }) {
  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-lg mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Puzzle Games Collection</h1>
          <p className="text-purple-200">Play & Earn Rewards!</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Coins className="w-5 h-5 mr-1" />
            <span className="font-bold">{userData.coins}</span>
          </div>
          
          <div className="flex items-center">
            <Zap className="w-5 h-5 mr-1" />
            <span className="font-bold">{userData.energy}/5</span>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={onWatchAd}
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              <Star className="w-4 h-4 mr-1" />
              Watch Ad
            </Button>
            
            {userData.dailyRewards.available && (
              <Button 
                variant="secondary" 
                size="sm"
                onClick={onDailyReward}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <Trophy className="w-4 h-4 mr-1" />
                Daily
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {userData.dailyRewards.streak > 0 && (
        <div className="mt-2 text-sm text-purple-200">
          🔥 Daily streak: {userData.dailyRewards.streak} days
        </div>
      )}
    </div>
  )
}

function GameScreen({ gameId, category, onBack }) {
  const [currentLevel, setCurrentLevel] = useState(1)

  const handleGameComplete = (nextLevel, score) => {
    setCurrentLevel(nextLevel)
    // Here you could save progress, award coins, etc.
  }

  const renderGame = () => {
    switch (gameId) {
      case 'nuts-bolts':
        return (
          <NutsAndBolts 
            level={currentLevel} 
            onLevelComplete={handleGameComplete}
            onBack={onBack}
          />
        )
      case 'color-blocks':
        return (
          <ColorBlocks 
            level={currentLevel} 
            onLevelComplete={handleGameComplete}
            onBack={onBack}
          />
        )
      case 'water-sort':
        return (
          <WaterSort 
            level={currentLevel} 
            onLevelComplete={handleGameComplete}
            onBack={onBack}
          />
        )
      case 'sand-fall':
        return (
          <SandFall 
            level={currentLevel} 
            onLevelComplete={handleGameComplete}
            onBack={onBack}
          />
        )
      case 'fruit-merge':
        return (
          <FruitMerge 
            level={currentLevel} 
            onLevelComplete={handleGameComplete}
            onBack={onBack}
          />
        )
      case 'snake':
        return (
          <Snake 
            level={currentLevel} 
            onLevelComplete={handleGameComplete}
            onBack={onBack}
          />
        )
      case 'tic-tac-toe':
        return (
          <TicTacToe 
            level={currentLevel} 
            onLevelComplete={handleGameComplete}
            onBack={onBack}
          />
        )
      case 'memory':
        return (
          <Memory 
            level={currentLevel} 
            onLevelComplete={handleGameComplete}
            onBack={onBack}
          />
        )
      default:
        return (
          <Card className="p-8">
            <CardContent className="text-center">
              <div className="text-6xl mb-4">🎮</div>
              <h2 className="text-xl font-bold mb-2">Game Coming Soon!</h2>
              <p className="text-gray-600 mb-4">
                This game is currently under development. 
                <br />
                Each game will feature 50+ unique levels with increasing difficulty.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <Trophy className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <h3 className="font-semibold">50+ Levels</h3>
                  <p className="text-sm text-gray-600">Progressive difficulty</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <Coins className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <h3 className="font-semibold">Earn Coins</h3>
                  <p className="text-sm text-gray-600">Complete levels to earn</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <h3 className="font-semibold">Watch Ads</h3>
                  <p className="text-sm text-gray-600">Get extra rewards</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={onBack}>
            ← Back to Games
          </Button>
          <h1 className="text-2xl font-bold capitalize">
            {gameId.replace('-', ' ')}
          </h1>
          <div className="flex items-center space-x-2">
            <Coins className="w-5 h-5" />
            <span>100</span>
          </div>
        </div>
        
        {renderGame()}
      </div>
    </div>
  )
}

function App() {
  const [userData, setUserData] = useState(initialUserData)
  const [currentGame, setCurrentGame] = useState(null)
  const [currentCategory, setCurrentCategory] = useState(null)

  const handlePlayGame = (gameId, category) => {
    setCurrentGame(gameId)
    setCurrentCategory(category)
  }

  const handleBackToGames = () => {
    setCurrentGame(null)
    setCurrentCategory(null)
  }

  const handleWatchAd = () => {
    // Simulate watching an ad and earning coins
    setUserData(prev => ({
      ...prev,
      coins: prev.coins + 25,
      energy: Math.min(prev.energy + 1, 5)
    }))
    
    // Show a simple alert (in real app, this would be a proper modal)
    alert('🎉 Ad watched! You earned 25 coins and 1 energy!')
  }

  const handleDailyReward = () => {
    const today = new Date().toDateString()
    const lastClaimed = userData.dailyRewards.lastClaimed
    const isNewDay = !lastClaimed || lastClaimed !== today
    
    if (isNewDay) {
      const newStreak = lastClaimed === new Date(Date.now() - 86400000).toDateString() 
        ? userData.dailyRewards.streak + 1 
        : 1
      
      const rewardAmount = Math.min(50 + (newStreak * 10), 200)
      
      setUserData(prev => ({
        ...prev,
        coins: prev.coins + rewardAmount,
        energy: 5,
        dailyRewards: {
          lastClaimed: today,
          streak: newStreak,
          available: false
        }
      }))
      
      alert(`🎁 Daily reward claimed! You earned ${rewardAmount} coins and full energy! Streak: ${newStreak} days`)
    }
  }

  const unlockGame = (gameId) => {
    const unlockCost = 50
    if (userData.coins >= unlockCost) {
      setUserData(prev => ({
        ...prev,
        coins: prev.coins - unlockCost,
        unlockedGames: [...prev.unlockedGames, gameId]
      }))
      
      // Update game data
      Object.keys(gameCategories).forEach(category => {
        const game = gameCategories[category].games.find(g => g.id === gameId)
        if (game) {
          game.unlocked = true
        }
      })
    }
  }

  if (currentGame) {
    return (
      <GameScreen 
        gameId={currentGame}
        category={currentCategory}
        onBack={handleBackToGames}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <Header userData={userData} onWatchAd={handleWatchAd} onDailyReward={handleDailyReward} />
        
        <div className="space-y-8">
          {Object.entries(gameCategories).map(([category, categoryData]) => (
            <GameCategory
              key={category}
              category={category}
              categoryData={categoryData}
              onPlay={handlePlayGame}
              userCoins={userData.coins}
            />
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50">
            <CardContent>
              <h3 className="text-xl font-bold mb-2">🎮 40+ Games Available!</h3>
              <p className="text-gray-600 mb-4">
                Each game features 50+ levels with progressive difficulty.
                <br />
                Earn coins by completing levels and watch ads for bonus rewards!
              </p>
              <div className="flex justify-center space-x-6 text-sm">
                <div className="flex items-center">
                  <Trophy className="w-4 h-4 mr-1 text-yellow-500" />
                  <span>2000+ Total Levels</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1 text-purple-500" />
                  <span>Ad Rewards</span>
                </div>
                <div className="flex items-center">
                  <Coins className="w-4 h-4 mr-1 text-green-500" />
                  <span>Earning System</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default App

